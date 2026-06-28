const https = require('https');
const fs = require('fs');
const path = require('path');

const agent = new https.Agent({ rejectUnauthorized: false });

const wadiImages = [
  'https://www.wadi-food.com/storage/homepage_products/Rk9DvraSMJguDHTDvVywhn0qDdOTMLqM3mbsrUaV.png',
  'https://www.wadi-food.com/storage/homepage_products/skY21x3tm3P6b188wCILos6viEqNK0wyPJDvOxww.png',
  'https://www.wadi-food.com/storage/homepage_products/25azkSjrM1biPgjS0M0UFr9o7RMHjSmHbeh0UVY8.png',
  'https://www.wadi-food.com/storage/homepage_products/3hjtgOnrB6jZl4an3OaWJG64aR0U3DKyKtI6OaBB.png',
  'https://www.wadi-food.com/storage/homepage_products/fXQFYLlnUPhas3GGGgQsFM51rzSry1GBgpTrxWEk.png',
  'https://www.wadi-food.com/storage/homepage_products/kVP2OiZbE7srwb7IZWsJjhsOcKIccVG1Pqq5vL8R.png',
  'https://www.wadi-food.com/storage/homepage_products/VczdqZBGAdyFs6JuGSTml73tkTUMstECK2eFiycJ.png',
  'https://www.wadi-food.com/storage/homepage_products/ve8FgVUB4k2eBOMCpu4yxeSrCuzZ4NEiZ0jDTvzY.png',
  'https://www.wadi-food.com/storage/homepage_products/WwJ2lz2OWzIesaOM2HeoLXAJKtkbK6Lb5S2GpWwl.png',
  'https://www.wadi-food.com/storage/homepage_products/CnEY2WBpLyG0EOnXEE10SQgqvgFXrOiwCsajsYkZ.png',
  'https://www.wadi-food.com/storage/homepage_products/vDXjTfSo7VTvoolXwjkQqADE6rKQnxOVrPsMBLlU.png',
  'https://www.wadi-food.com/storage/homepage_products/cCWy2QaUM4Zw3fq58qNFZtuR1X7Oa80WAWZpgVX6.png',
  'https://www.wadi-food.com/storage/homepage_products/GT2E0XjjfSR6qDOnvuTcMZ6LtXlZAltWnu9IgkWK.png',
  'https://www.wadi-food.com/storage/homepage_products/xUZQhDkOhASSQdHptnT9SKCZwxAV49Q5i5LyviJW.png',
  'https://www.wadi-food.com/storage/homepage_products/r4sNSI6PssyfBbYL3KkXT0aelH4d2d2IEQzdaUbG.png',
  'https://www.wadi-food.com/storage/homepage_products/UpwyR5NTZ8FDYxJXKOHBnZ0bhrflx3iXfuFAZTAm.png',
  'https://www.wadi-food.com/storage/homepage_products/g3aj1uI4hovsvW4z35y3fL7JLjBcEgzWhCm1xDDd.png',
  'https://www.wadi-food.com/storage/homepage_products/1gzY8g0ZHyZi43Thk1FhFjq19epZSO2VE8QPtvpm.png',
];

// Also try their product category pages
const categoryPages = [
  'https://www.wadi-food.com/en/products/tomato-and-co',
  'https://www.wadi-food.com/en/products/whole-frozen-chicken',
  'https://www.wadi-food.com/en/olive-oil',
  'https://www.wadi-food.com/en/olives',
  'https://www.wadi-food.com/en/vinegar',
  'https://www.wadi-food.com/en/beans',
  'https://www.wadi-food.com/en/pickles',
];

const OUT_DIR = path.join(__dirname, '..', 'public', 'products', 'wadi-review');
fs.mkdirSync(OUT_DIR, { recursive: true });

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const req = https.get(url, { agent, headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 15000 }, (res) => {
      if (res.statusCode !== 200) { file.close(); try { fs.unlinkSync(dest); } catch {} return reject(new Error(`HTTP ${res.statusCode}`)); }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    });
    req.on('error', (e) => { file.close(); try { fs.unlinkSync(dest); } catch {} reject(e); });
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

async function main() {
  console.log('Downloading', wadiImages.length, 'Wadifood homepage product images...');
  for (let i = 0; i < wadiImages.length; i++) {
    const url = wadiImages[i];
    const ext = url.endsWith('.png') ? '.png' : '.jpg';
    const dest = path.join(OUT_DIR, `wadi-${String(i+1).padStart(2,'0')}${ext}`);
    try {
      await download(url, dest);
      const size = fs.statSync(dest).size;
      console.log(`✅ wadi-${String(i+1).padStart(2,'0')} — ${Math.round(size/1024)}KB — ${url.split('/').pop()}`);
    } catch (e) {
      console.log(`❌ wadi-${i+1} — ${e.message}`);
    }
  }

  // Try category pages
  const fetch = (url) => new Promise((resolve) => {
    const req = https.get(url, { agent, headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 12000 }, (res) => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(d));
    });
    req.on('error', () => resolve(''));
    req.on('timeout', () => { req.destroy(); resolve(''); });
  });

  console.log('\nChecking category pages for more product images...');
  const extraImages = new Set();
  for (const url of categoryPages) {
    const html = await fetch(url);
    const re = /(https?:\/\/www\.wadi-food\.com\/storage\/(?:products|categories)[^\s"'<>]+\.(jpg|png|webp))/gi;
    let m;
    while ((m = re.exec(html)) !== null) extraImages.add(m[1]);
    if (html.length > 1000) console.log(`  ${url} → ${html.length} bytes, ${extraImages.size} imgs found`);
    else console.log(`  ${url} → empty/404`);
  }

  if (extraImages.size) {
    console.log('\nExtra product images:');
    [...extraImages].forEach(u => console.log(' ', u));
  }
}

main().catch(console.error);
