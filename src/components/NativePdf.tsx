import React from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

interface WebPdfProps {
    url: string;
}

const WebPdf: React.FC<WebPdfProps> = ({ url }) => {
    // Web handles Google Drive PDFs better via Docs Viewer
    const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;

    return (
        <WebView
            source={{ uri: viewerUrl }}
            style={styles.webview}
        />
    );
};

const styles = StyleSheet.create({
    webview: {
        flex: 1,
    },
});

export default WebPdf;
