import { Unit, UnitType } from './types';

export const INITIAL_UNITS: Unit[] = [
    {
        id: 'u1',
        name: 'Daire 1',
        residentName: 'Nihat Acet',
        phone: '+90 532 480 21 85',
        type: UnitType.RESIDENCE,
        ownerName: 'Nihat Acet (Muayenehane)'
    },
    {
        id: 'u2',
        name: 'Daire 2',
        residentName: 'Cihangir Eker',
        phone: '538 745 45 30',
        type: UnitType.RESIDENCE,
        ownerName: 'Kamuran Simavlıoğlu'
    },
    {
        id: 'u3',
        name: 'Daire 3 (Dubleks)',
        residentName: 'Ali Çırak',
        phone: '+90 530 633 45 05',
        type: UnitType.RESIDENCE,
        ownerName: 'Gılmen Simavlıoğlu'
    },
    {
        id: 'u4',
        name: 'Dükkan',
        residentName: 'Özinanlar',
        phone: '-',
        type: UnitType.SHOP,
        ownerName: 'Özinanlar'
    }
];

export const INITIAL_CLEANING_QUEUE = ['u2', 'u1', 'u3']; // Current logic: Last done u3, next u2

export const DEFAULT_PASSWORD = "9527";

export const STORAGE_KEY = "melahat_simavlioglu_data_v1";