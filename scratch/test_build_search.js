import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const bundlePath = path.join(__dirname, '..', 'dist', 'assets', 'index-jlAU90KQ.js');
if (!fs.existsSync(bundlePath)) {
  console.log('Bundle file does not exist at:', bundlePath);
  process.exit(1);
}

const content = fs.readFileSync(bundlePath, 'utf8');

const targets = ['plumbing', 'needPlumber', 'Сантехника', 'Ремонт и строительство'];

targets.forEach(target => {
  const index = content.indexOf(target);
  if (index !== -1) {
    console.log(`Found "${target}" at index ${index}. Match context:`);
    console.log(content.slice(Math.max(0, index - 50), Math.min(content.length, index + 100)));
  } else {
    console.log(`"${target}" NOT found in the bundle file.`);
  }
});
