import { Category, DriveFile } from '../types';

// Helper to convert Google Drive view links to direct download links
const getDirectLink = (id: string) => `https://drive.google.com/uc?export=download&id=${id}`;

const HAMUWIYA_FILES: DriveFile[] = [
    {
        id: 'pdf-0',
        name: 'الحموية لابن تيمية.pdf',
        type: 'pdf',
        url: getDirectLink('1BfYQQGtAF9Xs1ZxGzeJ17zn8jRjTYYc1'),
    },
    {
        id: 'audio-1',
        name: 'الحموية لابن تيمية ደርስ 1',
        type: 'audio',
        url: getDirectLink('1I9Ujp0wUSPSOLm_kp7z6IST08IEZLE1T'),
    },
    {
        id: 'audio-2',
        name: 'الحموية لابن تيمية ደርስ 2',
        type: 'audio',
        url: getDirectLink('11RScojtVQYSRLZCQ9RIOxJJ496XRSdEV'),
    },
    {
        id: 'audio-3',
        name: 'الحموية لابن تيمية ደርስ 3',
        type: 'audio',
        url: getDirectLink('1ay7Y4eCDbPiV5QY-eF-graeIwrNfAgm8'),
    },
    {
        id: 'audio-5',
        name: 'الحموية لابن تيمية ደርስ 5',
        type: 'audio',
        url: getDirectLink('1p1i8k-6UlOJKBWpld_2LbiND84PL1Dam'),
    },
    {
        id: 'audio-6',
        name: 'الحموية لابن تيمية ደርስ 6',
        type: 'audio',
        url: getDirectLink('1tzEPMMC8bEkUDJ92hBaUnDW3N53Lvi1h'),
    },
    {
        id: 'audio-7',
        name: 'الحموية لابن تيمية ደርስ 7',
        type: 'audio',
        url: getDirectLink('1F8jN8oR3xX1ZvRPZndW1sd7oF77U6br_'),
    },
    {
        id: 'audio-8',
        name: 'الحموية لابن تيمية ደርስ 8',
        type: 'audio',
        url: getDirectLink('1HsDgTGiSgQOP41jsj6ZNLJI3hbeIdPip'),
    },
    {
        id: 'audio-9',
        name: 'الحموية لابن تيمية ደርስ 9',
        type: 'audio',
        url: getDirectLink('1lZ-fl8xN9TXWLqM4sMnYgP5A_YmtEwF7'),
    },
    {
        id: 'audio-10',
        name: 'الحموية لابن تيمية ደርስ 10',
        type: 'audio',
        url: getDirectLink('152KIBLAOituAthORlNbEytp-XEkG2cmy'),
    },
    {
        id: 'audio-11',
        name: 'الحموية لابن تيمية ደርስ 11',
        type: 'audio',
        url: getDirectLink('1k0vlHrXUDZOXbwvX8viwQiydAbwF3z4L'),
    },
    {
        id: 'audio-12',
        name: 'الحموية لابن تيمية ደርስ 12',
        type: 'audio',
        url: getDirectLink('1qNCVV5Ca1HUHEybLY0Ft33zo50k6fU2j'),
    },
    {
        id: 'audio-13',
        name: 'الحموية لابن تيمية ደርስ 13',
        type: 'audio',
        url: getDirectLink('15N7gf7R-mGA6X2Gp7WwO3NA5vk4_AFUs'),
    },
    {
        id: 'audio-14',
        name: 'الحموية لابن تيمية ደርስ 14',
        type: 'audio',
        url: getDirectLink('15N7gf7R-mGA6X2Gp7WwO3NA5vk4_AFUs'),
    },
    {
        id: 'audio-15',
        name: 'الحموية لابن تيمية ደርስ 15',
        type: 'audio',
        url: getDirectLink('1Vw2lT_cthcbZkL_9D4J-vXEPG3iVzpyM'),
    },
    {
        id: 'audio-16',
        name: 'الحموية لابن تيمية ደርስ 16',
        type: 'audio',
        url: getDirectLink('1coK9Xq-0E2f4L959OqV1EPBe9jhvintV'),
    },
    {
        id: 'audio-17',
        name: 'الحموية لابن تيمية ደርስ 17',
        type: 'audio',
        url: getDirectLink('160s7-OhSA8N1z0PQ7zzqaWwWjWI4NzN6'),
    },
    {
        id: 'audio-18',
        name: 'الحموية لابن تيمية ደርስ 18',
        type: 'audio',
        url: getDirectLink('1JTkKe6ewtPqvdys3IPNX90RIU-FtHGzi'),
    },
    {
        id: 'audio-19',
        name: 'الحموية لابن تيمية ደርስ 19',
        type: 'audio',
        url: getDirectLink('1vvOVSSlXguOAa7-47xlhQKMPmWlpG4GT'),
    },
    {
        id: 'audio-20',
        name: 'الحموية لابن تيمية ደርስ 20',
        type: 'audio',
        url: getDirectLink('15ml_c5Rph5d9hwAJVRPajAxbCRzj06Z2'),
    },
];

export const CATEGORIES: Category[] = [
    {
        id: 'hamuwiya',
        title: 'الحموية لابن تيمية',
        description: 'በ ሸህ አቡ ኒብራስ ሙስጠፋ የቀረበ',
        files: HAMUWIYA_FILES,
    },
    {
        id: 'future',
        title: 'ሌላ ደርስ (ምሳሌ)',
        description: 'ተጨማሪ ትምህርቶች እዚህ ይጨመራሉ',
        files: [],
    }
];

// For backward compatibility while refactoring other components
export const DRIVE_FILES = HAMUWIYA_FILES;
export const ALL_FILES = HAMUWIYA_FILES;
