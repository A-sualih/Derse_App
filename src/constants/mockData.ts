import { DriveFile } from '../types';

// Helper to convert Google Drive view links to direct download links
const getDirectLink = (id: string) => `https://drive.google.com/uc?export=download&id=${id}`;

export const DRIVE_FILES: DriveFile[] = [
    {
        id: '1',
        name: 'Audio Recording 1.mp3',
        type: 'audio',
        // Original: https://drive.google.com/file/d/1XiQoQTCCyUF8rNRUO5yVPDOaH0AHFVL3/view?usp=sharing
        url: getDirectLink('1XiQoQTCCyUF8rNRUO5yVPDOaH0AHFVL3'),
    },
    {
        id: '2',
        name: 'Audio Recording 2.mp3',
        type: 'audio',
        // Original: https://drive.google.com/file/d/1N-zlbWSnHnPwGG7az7JZ3OQMP2wxivRd/view?usp=drive_link
        url: getDirectLink('1N-zlbWSnHnPwGG7az7JZ3OQMP2wxivRd'),
    },
    {
        id: '3',
        name: 'Document.pdf',
        type: 'pdf',
        // Original: https://drive.google.com/file/d/1gL4OVGrMecBnjwttumDKXglAe3XkdBW4/view?usp=sharing
        url: getDirectLink('1gL4OVGrMecBnjwttumDKXglAe3XkdBW4'),
    },
    {
        id: '4',
        name: 'TEST FILE (Standard MP3)',
        type: 'audio',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Known working file
    }
];
