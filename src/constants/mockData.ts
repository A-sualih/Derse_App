import { DriveFile } from '../types';

// Helper to convert Google Drive view links to direct download links
const getDirectLink = (id: string) => `https://drive.google.com/uc?export=download&id=${id}`;

export const DRIVE_FILES: DriveFile[] = [
    {
        id: '1',
        name: 'ሙምቲዕ.pdf',
        type: 'pdf',
        url: getDirectLink('1bXCa2qS_Lq8NpCA1NDFArMU79D2kM1Pi'),
    },
    {
        id: '137',
        name: 'ሙምቲዕ ደርስ 137.mp3',
        type: 'audio',
        url: getDirectLink('1yl7g5X85VqjUhSKBdKhdAsBXLgHMcruD'),
    },
    {
        id: '138',
        name: 'ሙምቲዕ ደርስ 138.mp3',
        type: 'audio',
        url: getDirectLink('1wDFBHYdZCwSP1aRgnFAcw849Iaxv2Teq'),
    },
    {
        id: '139',
        name: 'ሙምቲዕ ደርስ 139.mp3',
        type: 'audio',
        url: getDirectLink('1ZmkGHM_3aCsitKFe30_SA50Qye0rvnJ9'),
    },
    {
        id: '140',
        name: 'ሙምቲዕ ደርስ 140.mp3',
        type: 'audio',
        url: getDirectLink('1f_nDKEzMv2pRa_SYEzVvVJnyDYXQh6V9'),
    },
    {
        id: '141',
        name: 'ሙምቲዕ ደርስ 141.mp3',
        type: 'audio',
        url: getDirectLink('1ia7bSMf7cy6HRRx8Tv1rKPCka5m2oxj2'),
    },
    {
        id: '142',
        name: 'ሙምቲዕ ደርስ 142.mp3',
        type: 'audio',
        url: getDirectLink('1pnHI5iHvaE4_c34IZEtoGOtpUO9udF9R'),
    },
    {
        id: '143',
        name: 'ሙምቲዕ ደርስ 143.mp3',
        type: 'audio',
        url: getDirectLink('1GsQbGdfeGwXUG7TgIpuClJQUTrrCCGPJ'),
    },
    {
        id: '144',
        name: 'ሙምቲዕ ደርስ 144.mp3',
        type: 'audio',
        url: getDirectLink('1KqaGmjpNHCGYF3VykOGrXoN_12X6bl5I'),
    },
    {
        id: '145',
        name: 'ሙምቲዕ ደርስ 145.mp3',
        type: 'audio',
        url: getDirectLink('10rfXnMIENaAzn2tkuNl-j7VXcyoKJQb6'),
    },
    {
        id: '146',
        name: 'ሙምቲዕ ደርስ 146.mp3',
        type: 'audio',
        url: getDirectLink('1Rts0M1_otBVqF_unQHqbI6vQKfyIdYH-'),
    },
    {
        id: '147',
        name: 'ሙምቲዕ ደርስ 147.mp3',
        type: 'audio',
        url: getDirectLink('14LK9fhkSvWsY8zBs0XSBAhM6-lzgIThZ'),
    },
    {
        id: '148',
        name: 'ሙምቲዕ ደርስ 148.mp3',
        type: 'audio',
        url: getDirectLink('1XcnkJyDb3PhtOGxnArA6xVPTwm3IboW7'),
    },
    {
        id: '149',
        name: 'ሙምቲዕ ደርስ 149.mp3',
        type: 'audio',
        url: getDirectLink('1OUK3GflSDjVOtDGNnHu7L3svfsTF_kgz'),
    },
    {
        id: '150',
        name: 'ሙምቲዕ ደርስ 150.mp3',
        type: 'audio',
        url: getDirectLink('1I-LFIGx1TnWGwvkj-eKe6soAfIrb76KN'),
    }
];

