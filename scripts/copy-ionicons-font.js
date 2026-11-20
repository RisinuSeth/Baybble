const fs = require('node:fs');
const path = require('node:path');

const source = path.join(
  process.cwd(),
  'node_modules',
  '@expo',
  'vector-icons',
  'build',
  'vendor',
  'react-native-vector-icons',
  'Fonts',
  'Ionicons.ttf'
);

const destinationDirectory = path.join(process.cwd(), 'public', 'fonts');
const destination = path.join(destinationDirectory, 'Ionicons.ttf');

if (!fs.existsSync(source)) {
  throw new Error(`Ionicons font not found at: ${source}`);
}

fs.mkdirSync(destinationDirectory, { recursive: true });
fs.copyFileSync(source, destination);
console.log('Copied Ionicons font to public/fonts/Ionicons.ttf');
