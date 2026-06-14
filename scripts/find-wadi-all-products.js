const https = require('https');
const fs = require('fs');
const path = require('path');

const agent = new https.Agent({ rejectUnauthorized: false });

function fetch(url) {
  return new Promise((resolve) => {
    const req = https.get(url, { agent, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0' }, timeout: 15000 }, (res) => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', (e) => resolve({ error: e.message, body: '' }));
    req.on('timeout', () => { req.destroy(); resolve({ error: 'timeout', body: '' }); });
  });
}

function extractStorageImages(html) {
  const imgs = new Set();
  const re = /(https?:\/\/www\.wadi-food\.com\/storage\/(?:products|categories|product)[^\s"'<>]+\.(jpg|png|webp))/gi;
  let m;
  while ((m = re.exec(html)) !== null) imgs.add(m[1]);
  return [...imgs];
}

function extractProductLinks(html) {
  const links = new Set();
  const re = /href=["'](\/en\/products\/[^"'#?]+)["']/gi;
  let m;
  while ((m = re.exec(html)) !== null) links.add('https://www.wadi-food.com' + m[1]);
  return [...links];
}

async function main() {
  const visited = new Set();
  const allProductImages = new Set();

  // First, get all product links from the main products page
  const mainRes = await fetch('https://www.wadi-food.com/en/products');
  const mainLinks = extractProductLinks(mainRes.body);
  console.log('Product links from /en/products:', mainLinks);

  // Also try the home page for product links
  const homeRes = await fetch('https://www.wadi-food.com/en');
  const homeLinks = extractProductLinks(homeRes.body);
  console.log('Product links from homepage:', homeLinks.length);

  // Combine all product page URLs to try
  const allLinks = [...new Set([
    ...mainLinks,
    ...homeLinks,
    // Try common product category URLs
    'https://www.wadi-food.com/en/products/tomato-and-co',
    'https://www.wadi-food.com/en/products/whole-frozen-chicken',
    'https://www.wadi-food.com/en/products/olive-oil',
    'https://www.wadi-food.com/en/products/olives-and-pickles',
    'https://www.wadi-food.com/en/products/vinegar',
    'https://www.wadi-food.com/en/products/beans',
    'https://www.wadi-food.com/en/products/pickles',
    'https://www.wadi-food.com/en/products/ketchup',
    'https://www.wadi-food.com/en/products/speciality',
  ])];

  console.log('\nFetching', allLinks.length, 'product category pages...');

  for (const url of allLinks) {
    if (visited.has(url)) continue;
    visited.add(url);

    const res = await fetch(url);
    const imgs = extractStorageImages(res.body);
    imgs.forEach(i => allProductImages.add(i));

    // Also extract sub-product links
    const subLinks = extractProductLinks(res.body);
    for (const sl of subLinks) {
      if (!visited.has(sl)) allLinks.push(sl);
    }

    console.log(`  ${url.split('/en/products/')[1] || url} → ${res.status} | ${imgs.length} product imgs | total: ${allProductImages.size}`);
  }

  console.log('\n=== ALL WADIFOOD PRODUCT IMAGES ===');
  console.log('Total:', allProductImages.size);
  [...allProductImages].forEach(img => console.log(img));

  // Save to file
  fs.writeFileSync(
    path.join(__dirname, 'wadi-product-images.json'),
    JSON.stringify([...allProductImages], null, 2)
  );
}

main().catch(console.error);
