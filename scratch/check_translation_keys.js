import fs from 'fs';
import path from 'path';

const ruPath = './src/locales/ru/translation.json';
const ru = JSON.parse(fs.readFileSync(ruPath, 'utf8'));

console.log('RU Translation Root Keys:', Object.keys(ru));
if (ru.dashboard) console.log('RU dashboard keys:', Object.keys(ru.dashboard));
if (ru.myAds) console.log('RU myAds keys:', Object.keys(ru.myAds));
if (ru.createListing) console.log('RU createListing keys:', Object.keys(ru.createListing));
