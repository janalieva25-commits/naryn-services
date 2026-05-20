import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read OrdersPage.jsx
const filePath = path.join(__dirname, '..', 'src', 'pages', 'OrdersPage.jsx');
const content = fs.readFileSync(filePath, 'utf8');

// Extract categoryKeys definition
const match = content.match(/const categoryKeys = \{([\s\S]*?)\}/);
if (!match) {
  console.log('Could not find categoryKeys definition');
  process.exit(1);
}

console.log('Found categoryKeys definition:');
console.log(match[0]);

// Parse it in JS
const categoryKeysStr = match[1];
const categoryKeys = {};
categoryKeysStr.split('\n').forEach(line => {
  const cleanLine = line.trim();
  if (!cleanLine || cleanLine.startsWith('//')) return;
  const parts = cleanLine.split(':');
  if (parts.length >= 2) {
    const key = parts[0].trim().replace(/['"]/g, '');
    const val = parts[1].trim().replace(/['",]/g, '');
    categoryKeys[key] = val;
  }
});

console.log('\nParsed categoryKeys keys:');
console.log(Object.keys(categoryKeys));
console.log('\nNumber of keys:', Object.keys(categoryKeys).length);
