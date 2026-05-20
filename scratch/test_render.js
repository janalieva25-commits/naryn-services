import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read Russian translation file
const translationPath = path.join(__dirname, '..', 'src', 'locales', 'ru', 'translation.json');
const translation = JSON.parse(fs.readFileSync(translationPath, 'utf8'));

const t = (key) => {
  const parts = key.split('.');
  let obj = translation;
  for (const part of parts) {
    if (obj && part in obj) {
      obj = obj[part];
    } else {
      return key;
    }
  }
  return obj;
};

// Define categoryKeys exactly as in OrdersPage.jsx
const categoryKeys = {
  'Нужен сантехник': 'needPlumber',
  'Нужен электрик': 'needElectrician',
  'Нужна уборка': 'needCleaning',
  'Нужен ремонт и строительство': 'needRepair',
  'Нужна IT помощь': 'needIt',
  'Нужен дизайн': 'needDesign',
  'Нужен маркетинг и реклама': 'needMarketing',
  'Нужна перевозка и доставка': 'needCargo',
  'Нужен репетитор / обучение': 'needTutor',
  'Нужны услуги красоты и здоровья': 'needBeauty',
  'Нужен бытовой ремонт': 'needHandyman',
  'Другое': 'other',
};

const getTranslatedCategory = (cat) => {
  const key = categoryKeys[cat];
  return key ? t(`categories.${key}`) : cat;
};

console.log('Rendering options for select dropdown (RU):');
console.log(`<option value="all">${t('categories.all')}</option>`);
Object.keys(categoryKeys).forEach((catName) => {
  console.log(`<option value="${catName}">${getTranslatedCategory(catName)}</option>`);
});
