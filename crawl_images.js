const fs = require('fs');
const path = require('path');

const stepsDir = 'C:/Users/Admin/.gemini/antigravity-ide/brain/58979d06-5902-41fb-b90f-5917326374bd/.system_generated/steps';
const outputDir = path.join(__dirname, 'web/public/images/crawled');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Read step files
const files = [
  { path: path.join(stepsDir, '7/content.md'), base: 'https://script.google.com' },
  { path: path.join(stepsDir, '11/content.md'), base: 'https://tbs-thoaisonshoes.com' },
  { path: path.join(stepsDir, '15/content.md'), base: 'https://www.tbsgroup.vn' }
];

// Match absolute or relative image references
const imgRegex = /(src|href)="([^"]+\.(jpg|jpeg|png|webp|gif|svg))"/gi;
const imageUrls = new Set();

files.forEach(({ path: filePath, base }) => {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  let match;
  while ((match = imgRegex.exec(content)) !== null) {
    let url = match[2];
    if (url.startsWith('//')) {
      url = 'https:' + url;
    } else if (url.startsWith('/')) {
      url = base + url;
    } else if (!url.startsWith('http')) {
      url = base + '/' + url;
    }
    imageUrls.add(url);
  }
});

console.log(`Found ${imageUrls.size} unique image URLs to crawl.`);

async function downloadImage(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const urlObj = new URL(url);
    let filename = path.basename(urlObj.pathname);
    if (!filename || filename.indexOf('.') === -1) {
      filename = 'image_' + Math.random().toString(36).substring(7) + '.jpg';
    }
    
    const dest = path.join(outputDir, filename);
    fs.writeFileSync(dest, buffer);
    console.log(`Downloaded: ${url} -> ${filename}`);
  } catch (err) {
    console.error(`Failed to download ${url}: ${err.message}`);
  }
}

async function run() {
  for (const url of imageUrls) {
    await downloadImage(url);
  }
  console.log("Crawl completed successfully!");
}

run();
