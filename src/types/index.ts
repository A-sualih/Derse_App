export interface DriveFile {
    id: string;
    name: string;
    type: 'audio' | 'pdf';
    url: string;
}

export interface FileStatus {
    downloaded: boolean;
    localUri: string | null;
}
