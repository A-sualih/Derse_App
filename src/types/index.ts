export interface DriveFile {
    id: string;
    name: string;
    type: 'audio' | 'pdf';
    url: string;
    extension?: string;
}

export interface FileStatus {
    downloaded: boolean;
    localUri: string | null;
}

export interface Category {
    id: string;
    title: string;
    description?: string;
    files: DriveFile[];
}
