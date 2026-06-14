const https = require('https');
const fs = require('fs');
const path = require('path');

const agent = new https.Agent({ rejectUnauthorized: false });

function fetch(url) {
  return new Promise((resolve) => {
    const req = https.get(url, { agent, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0' }, timeout: 15000 }, (res) => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(d));
    });
    req.on('error', () => resolve(''));
    req.on('timeout', () => { req.destroy(); resolve(''); });
  });
}

// Extract all product image + name pairs from an HTML page
function extractProducts(html) {
  const products = [];
  // Look for product blocks — typically an img with a nearby title/h2/h3/p
  // Match storage image URLs and grab ~500 chars around them
  const re = /(https?:\/\/www\.wadi-food\.com\/storage\/products\/[^\s"'<>]+\.(jpg|png|webp))/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const start = Math.max(0, m.index - 400);
    const end = Math.min(html.length, m.index + 400);
    const context = html.slice(start, end);
    // Extract text content from tags
    const texts = [...context.matchAll(/>([^<]{3,60})</g)]
      .map(t => t[1].trim())
      .filter(t => t.length > 3 && t.length < 80 && !/^(src|alt|class|style|href)/.test(t))
      .slice(0, 5);
    products.push({ url: m[1], texts });
  }
  return products;
}

// Category pages and corresponding product ID ranges
const categories = [
  { url: 'https://www.wadi-food.com/en/products/olive-oil', name: 'olive-oil', ids: [1,2,3,4,5,6,7,8,9,10,11,12,13] },
  { url: 'https://www.wadi-food.com/en/products/tomato-and-co', name: 'tomato', ids: [19,20,21,22,23,24,25,26,27,28,29] },
  { url: 'https://www.wadi-food.com/en/products/beans', name: 'beans', ids: [30,31,32,33,34] },
  { url: 'https://www.wadi-food.com/en/products/pickles', name: 'pickles', ids: [52,53,54,55,56,57,58,59,60,61,62,63] },
];

async function main() {
  const assignments = {}; // id → imageUrl

  for (const cat of categories) {
    console.log(`\nFetching ${cat.name}...`);
    const html = await fetch(cat.url);
    const prods = extractProducts(html);

    console.log(`  Found ${prods.length} product images`);
    prods.forEach((p, i) => {
      const id = cat.ids[i];
      if (id) {
        assignments[id] = p.url;
        const name = p.texts.find(t => /[a-zA-Z؀-ۿ]{4,}/.test(t)) || '';
        console.log(`  ${id} → ${p.url.split('/').pop().slice(0,20)}... | "${name}"`);
      }
    });
  }

  // Save assignment map
  fs.writeFileSync(
    path.join(__dirname, 'wadi-assignments.json'),
    JSON.stringify(assignments, null, 2)
  );

  console.log('\nAssignment map saved. Total:', Object.keys(assignments).length, 'products');
  return assignments;
}

main().catch(console.error);
