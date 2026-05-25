import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const svgPath = path.resolve('src/assets/clashgram-logo.svg');
  const svgContent = await fs.readFile(svgPath, 'utf-8');

  const mipmaps = [
    { name: 'mdpi', iconSize: 48, foreSize: 108 },
    { name: 'hdpi', iconSize: 72, foreSize: 162 },
    { name: 'xhdpi', iconSize: 96, foreSize: 216 },
    { name: 'xxhdpi', iconSize: 144, foreSize: 324 },
    { name: 'xxxhdpi', iconSize: 192, foreSize: 432 }
  ];

  for (const mipmap of mipmaps) {
    const dirPath = path.resolve(`android/app/src/main/res/mipmap-${mipmap.name}`);
    await fs.mkdir(dirPath, { recursive: true });

    // 1. Generate ic_launcher.png and ic_launcher_round.png (standard full icon size)
    const size = mipmap.iconSize;
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              margin: 0;
              background: transparent;
              overflow: hidden;
              width: ${size}px;
              height: ${size}px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            svg {
              width: ${size}px;
              height: ${size}px;
            }
          </style>
        </head>
        <body>
          ${svgContent}
        </body>
      </html>
    `);

    const iconPath = path.join(dirPath, 'ic_launcher.png');
    const roundPath = path.join(dirPath, 'ic_launcher_round.png');

    await page.screenshot({ path: iconPath, omitBackground: true });
    await page.screenshot({ path: roundPath, omitBackground: true });
    console.log(`Generated standard icons for mipmap-${mipmap.name} (${size}x${size})`);

    // 2. Generate ic_launcher_foreground.png (padded for adaptive icon safe zone)
    const foreSize = mipmap.foreSize;
    const svgSize = Math.round(foreSize * 0.72); // 72% safe zone padding
    await page.setViewportSize({ width: foreSize, height: foreSize });
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              margin: 0;
              background: transparent;
              overflow: hidden;
              width: ${foreSize}px;
              height: ${foreSize}px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            svg {
              width: ${svgSize}px;
              height: ${svgSize}px;
            }
          </style>
        </head>
        <body>
          ${svgContent}
        </body>
      </html>
    `);

    const forePath = path.join(dirPath, 'ic_launcher_foreground.png');
    await page.screenshot({ path: forePath, omitBackground: true });
    console.log(`Generated foreground icon for mipmap-${mipmap.name} (${foreSize}x${foreSize})`);
  }

  await browser.close();
  console.log('All launcher icons generated successfully!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
