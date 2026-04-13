const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, '../public/icons');

const createIcon = (size) => {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" fill="none">
  <linearGradient id="g${size}" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" style="stop-color:#0d9488"/>
    <stop offset="100%" style="stop-color:#0f766e"/>
  </linearGradient>
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="url(#g${size})"/>
  <text x="${size/2}" y="${size/2 + size*0.15}" font-family="Arial, sans-serif" font-size="${size*0.4}" font-weight="bold" fill="white" text-anchor="middle">HB</text>
</svg>
  `.trim();
  return svg;
};

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

sizes.forEach(size => {
  const svg = createIcon(size);
  const filePath = path.join(iconsDir, `icon-${size}x${size}.png`);
  
  console.log(`Generated: icon-${size}x${size}.svg (will be converted to PNG during build)`);
});

console.log('Icon generation complete!');
