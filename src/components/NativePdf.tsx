import * as FileSystem from 'expo-file-system/legacy';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { useColorScheme } from '@/hooks/use-color-scheme';

interface NativePdfProps {
    url: string;
    remoteUrl?: string; // Not strictly needed now but kept for compatibility
    targetPage?: number;
    zoom?: number;
    onPageChanged?: (page: number) => void;
}

const NativePdf: React.FC<NativePdfProps> = ({ url, remoteUrl, targetPage = 1, zoom = 1.0, onPageChanged }) => {
    const webViewRef = useRef<WebView>(null);
    const colorScheme = useColorScheme() ?? 'light';
    const [base64, setBase64] = useState<string | null>(null);
    const [isReading, setIsReading] = useState(Platform.OS === 'android');

    useEffect(() => {
        const loadPdf = async () => {
            if (Platform.OS !== 'android') {
                setIsReading(false);
                return;
            }

            try {
                // For Android, we still need base64 for PDF.js local access in many cases,
                // but we do it without blocking the initial WebView render if possible.
                const content = await FileSystem.readAsStringAsync(url, {
                    encoding: FileSystem.EncodingType.Base64
                });
                setBase64(content);
            } catch (e) {
                console.error('Error loading PDF as base64:', e);
            } finally {
                setIsReading(false);
            }
        };
        loadPdf();
    }, [url]);

    if (Platform.OS === 'ios') {
        return (
            <View style={styles.container}>
                <WebView
                    source={{ uri: url }}
                    style={styles.webview}
                    scalesPageToFit={true}
                // iOS supports page navigation via JavaScript if needed, 
                // but for "immediate" loading, native is best.
                />
            </View>
        );
    }

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=yes">
            <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js"></script>
            <style>
                body { margin: 0; padding: 0; background: ${colorScheme === 'dark' ? '#151718' : '#525659'}; overflow-x: auto; -webkit-tap-highlight-color: transparent; }
                #viewer { display: flex; flex-direction: column; align-items: center; }
                .page-container { margin-bottom: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); background: white; width: 100vw; display: flex; justify-content: center; position: relative; }
                canvas { max-width: 100%; height: auto !important; display: block; }
                #loading { color: white; text-align: center; padding: 40px; font-family: sans-serif; font-size: 18px; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1000; }
                .page-label { position: absolute; top: 10px; left: 10px; background: rgba(0,0,0,0.5); color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-family: sans-serif; pointer-events: none; }
            </style>
        </head>
        <body>
            <div id="loading">Initial loading...</div>
            <div id="viewer"></div>
            <script>
                const targetPage = ${targetPage};
                const zoomLevel = ${zoom};
                const isDark = ${colorScheme === 'dark'};
                
                let pdfDoc = null;
                let pageHeight = 0;
                let pageTotalHeight = 0;
                let scale = 1.0;
                let renderedPages = new Set();
                let observer = null;

                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

                async function startRendering(data, url) {
                    if (pdfDoc) return;
                    try {
                        const loadingTask = data 
                            ? pdfjsLib.getDocument({ data: convertData(data) })
                            : pdfjsLib.getDocument(url);
                        
                        pdfDoc = await loadingTask.promise;
                        document.getElementById('loading').style.display = 'none';
                        await setupViewer();
                    } catch (e) {
                        document.getElementById('loading').innerText = 'Error: ' + e.message;
                    }
                }

                function convertData(base64) {
                    const bytes = atob(base64);
                    const arr = new Uint8Array(bytes.length);
                    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
                    return arr;
                }

                async function setupViewer() {
                    const viewer = document.getElementById('viewer');
                    const firstPage = await pdfDoc.getPage(1);
                    const unscaledViewport = firstPage.getViewport({ scale: 1.0 });
                    const baseScale = window.innerWidth / unscaledViewport.width;
                    scale = baseScale * zoomLevel;
                    pageHeight = unscaledViewport.height * scale;
                    pageTotalHeight = pageHeight + 20;

                    // Create light placeholders for all pages
                    for (let i = 1; i <= pdfDoc.numPages; i++) {
                        const container = document.createElement('div');
                        container.className = 'page-container';
                        container.style.height = pageHeight + 'px';
                        container.id = 'page-' + i;
                        if (isDark) container.style.background = '#1a1a1b';
                        
                        // Add page number label for UX
                        const label = document.createElement('div');
                        label.className = 'page-label';
                        label.innerText = 'Page ' + i;
                        container.appendChild(label);
                        
                        viewer.appendChild(container);
                    }

                    // Setup Intersection Observer for lazy rendering
                    observer = new IntersectionObserver((entries) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                const pageNum = parseInt(entry.target.id.split('-')[1]);
                                renderPage(pageNum);
                            }
                        });
                    }, { rootMargin: '500px' }); // Load pages 500px before they come into view

                    document.querySelectorAll('.page-container').forEach(el => observer.observe(el));

                    // Immediate Jump to target
                    const targetY = (targetPage - 1) * pageTotalHeight;
                    window.scrollTo(0, targetY);

                    // Message back on scroll for persistence
                    let lastSentPage = targetPage;
                    window.addEventListener('scroll', () => {
                        const pageIndex = Math.floor((window.scrollY + window.innerHeight/4) / pageTotalHeight) + 1;
                        const bounded = Math.min(Math.max(pageIndex, 1), pdfDoc.numPages);
                        if (bounded !== lastSentPage) {
                            lastSentPage = bounded;
                            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'page', page: bounded }));
                        }
                    }, { passive: true });
                    
                    // Priority render target page
                    renderPage(targetPage);
                }

                async function renderPage(pageNum) {
                    if (renderedPages.has(pageNum)) return;
                    renderedPages.add(pageNum);
                    
                    try {
                        const page = await pdfDoc.getPage(pageNum);
                        const viewport = page.getViewport({ scale: scale });
                        const canvas = document.createElement('canvas');
                        canvas.height = viewport.height;
                        canvas.width = viewport.width;
                        
                        const container = document.getElementById('page-' + pageNum);
                        if (container) {
                            container.appendChild(canvas);
                            await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
                        }
                    } catch (e) {
                        console.error('Render error for page ' + pageNum, e);
                    }
                }

                // Try direct URL if possible (with flags enabled on WebView)
                const initialUrl = "${url}";
                if (initialUrl.startsWith('http') || initialUrl.startsWith('file:///')) {
                    startRendering(null, initialUrl);
                }
            </script>
        </body>
        </html>
    `;

    const handleMessage = (event: any) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'page' && onPageChanged) {
                onPageChanged(data.page);
            }
        } catch (e) { }
    };

    useEffect(() => {
        if (base64 && !isReading && webViewRef.current) {
            webViewRef.current.injectJavaScript(`if(typeof startRendering !== "undefined") startRendering("${base64}", "");`);
        }
    }, [base64, isReading]);

    return (
        <View style={styles.container}>
            <WebView
                ref={webViewRef}
                source={{ html: htmlContent, baseUrl: '' }}
                style={styles.webview}
                onMessage={handleMessage}
                originWhitelist={['*']}
                allowFileAccess={true}
                allowFileAccessFromFileURLs={true}
                allowUniversalAccessFromFileURLs={true}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                renderLoading={() => (
                    <View style={[StyleSheet.absoluteFill, styles.center, { backgroundColor: colorScheme === 'dark' ? '#151718' : '#525659' }]}>
                        <ActivityIndicator size="large" color="#007AFF" />
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    webview: {
        flex: 1,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default NativePdf;
