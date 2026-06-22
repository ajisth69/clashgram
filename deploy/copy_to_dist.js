import fs from 'fs';
import path from 'path';

const targetDir = process.argv[2] || 'dist';

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

// Copy contents of public
if (fs.existsSync('./public')) {
  fs.readdirSync('./public').forEach((item) => {
    copyRecursiveSync(path.join('./public', item), path.join(targetDir, item));
  });
}

// Copy other libraries/modules
const filesToCopy = [
  ['./src/lib/rlottie/rlottie-wasm.wasm', path.join(targetDir, 'rlottie-wasm.wasm')],
  ['./node_modules/opus-recorder/dist/decoderWorker.min.wasm', path.join(targetDir, 'decoderWorker.min.wasm')],
  ['./node_modules/emoji-data-ios/img-apple-64', path.join(targetDir, 'img-apple-64')],
  ['./node_modules/emoji-data-ios/img-apple-160', path.join(targetDir, 'img-apple-160')],
];

filesToCopy.forEach(([src, dest]) => {
  if (fs.existsSync(src)) {
    copyRecursiveSync(src, dest);
  } else {
    console.warn(`Source not found for copy: ${src}`);
  }
});

console.log(`Successfully copied assets to "${targetDir}"`);
