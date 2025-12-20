import React from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import Pdf from 'react-native-pdf';

interface NativePdfProps {
    url: string;
    page: number;
    onLoadComplete: (numberOfPages: number) => void;
    onPageChanged: (page: number) => void;
}

const NativePdf: React.FC<NativePdfProps> = ({ url, page, onLoadComplete, onPageChanged }) => {
    return (
        <Pdf
            source={{ uri: url, cache: true }}
            page={page}
            onLoadComplete={onLoadComplete}
            onPageChanged={onPageChanged}
            onError={(error) => {
                console.log('PDF Error:', error);
            }}
            style={styles.pdf}
        />
    );
};

const styles = StyleSheet.create({
    pdf: {
        flex: 1,
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
});

export default NativePdf;
