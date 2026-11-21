const fs = require('node:fs');
const path = require('node:path');

const source = path.join(process.cwd(), 'public', 'favicon.svg');
const outputDirectory = path.join(process.cwd(), 'dist');
const destination = path.join(outputDirectory, 'favicon.svg');

if (!fs.existsSync(source)) {
  throw new Error(`SVG favicon source not found: ${source}`);
}

if (!fs.existsSync(outputDirectory)) {
  throw new Error(`Expo web export directory not found: ${outputDirectory}`);
}

fs.copyFileSync(source, destination);
console.log('Copied original SVG favicon to dist/favicon.svg');
