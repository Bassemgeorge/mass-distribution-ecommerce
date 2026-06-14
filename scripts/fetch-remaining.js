const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const agent = new https.Agent({ rejectUnauthorized: false });
const OUT_DIR = path.join(__dirname, '..', 'public', 'products');

function fetchHtml(url) {
  return new Promise((resolve) => {
    const proto = url.startsWith('https') ? https : http;
    const req = proto.get(url, {
      agent: url.startsWith('https') ? agent : undefined,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0' },
      timeout: 15000
    }, (res) => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(d));
    });
    req.on('error', () => resolve(''));
    req.on('timeout', () => { req.destroy(); resolve(''); });
  });
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const proto = url.startsWith('https') ? https : http;
    const req = proto.get(url, {
      agent: url.startsWith('https') ? agent : undefined,
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 15000
    }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close(); try { fs.unlinkSync(dest); } catch {}
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) { file.close(); try { fs.unlinkSync(dest); } catch {}; return reject(new Error('HTTP ' + res.statusCode)); }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    });
    req.on('error', (e) => { file.close(); try { fs.unlinkSync(dest); } catch {}; reject(e); });
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function extractWadiImages(html) {
  const imgs = [];
  const re = /(https?:\/\/www\.wadi-food\.com\/storage\/products\/[^\s"'<>]+\.(jpg|png|webp))/gi;
  let m;
  while ((m = re.exec(html)) !== null) imgs.push(m[1]);
  return [...new Set(imgs)];
}

async function assignAndDownload(imageUrls, productIds, label) {
  console.log(`\n${label}: ${imageUrls.length} images → ${productIds.length} products`);
  const uniqueImages = [...new Set(imageUrls)];

  for (let i = 0; i < productIds.length; i++) {
    const id = productIds[i];
    const url = uniqueImages[Math.min(i, uniqueImages.length - 1)];
    if (!url) { console.log(`  ⚠️  ${id} — no image available`); continue; }

    const dest = path.join(OUT_DIR, `${id}.jpg`);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 5000) {
      console.log(`  ⏭  ${id} already exists`);
      continue;
    }

    try {
      await download(url, dest);
      const size = fs.statSync(dest).size;
      console.log(`  ✅ ${id} — ${Math.round(size/1024)}KB`);
    } catch (e) {
      console.log(`  ❌ ${id} — ${e.message}`);
    }
  }
}

async function main() {
  // 1. Wadifood Vinegar (IDs 14-18)
  console.log('Fetching Wadifood vinegar page...');
  const vinegarHtml = await fetchHtml('https://www.wadi-food.com/en/products/vinegars');
  const vinegarImgs = extractWadiImages(vinegarHtml);
  console.log('Vinegar images found:', vinegarImgs.length, vinegarImgs.map(u => u.split('/').pop().slice(0,20)));
  await assignAndDownload(vinegarImgs, [14, 15, 16, 17, 18], 'Vinegar');

  // 2. Wadifood Olives (IDs 35-51)
  console.log('\nFetching Wadifood olives pages...');
  const olivePages = [
    'https://www.wadi-food.com/en/products/green-olives',
    'https://www.wadi-food.com/en/products/black-olives',
    'https://www.wadi-food.com/en/products/kalamata-olives',
    'https://www.wadi-food.com/en/products/olives',
    'https://www.wadi-food.com/en/products/table-olives',
    'https://www.wadi-food.com/en/products/olives-and-pickles',
  ];
  const oliveImgs = new Set();
  for (const url of olivePages) {
    const html = await fetchHtml(url);
    extractWadiImages(html).forEach(i => oliveImgs.add(i));
    if (html.length > 5000) console.log(`  ${url.split('/').pop()} → ${html.length}b, total: ${oliveImgs.size} imgs`);
  }
  await assignAndDownload([...oliveImgs], [35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51], 'Olives');

  // 3. Spinneys Egypt for Savola pasta
  console.log('\nFetching Savola pasta from Spinneys...');
  const spinneysHtml = await fetchHtml('https://spinneys-egypt.com/en/378304');
  const spinneysImgs = [...spinneysHtml.matchAll(/(https?:\/\/[^\s"'<>]+\.(jpg|png|webp))/gi)]
    .map(m => m[1])
    .filter(u => u.includes('cdn') || u.includes('product') || u.includes('image') || u.includes('upload'))
    .slice(0, 5);
  console.log('Spinneys images:', spinneysImgs);
  if (spinneysImgs.length) {
    // Use for all pasta products
    await assignAndDownload(spinneysImgs, [113,114,115,116,117,118,119,120,121], 'Savola Pasta');
  }

  // 4. Open Food Facts broader searches for remaining Knorr/Heinz
  const offSearch = (q) => new Promise((resolve) => {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=3`;
    const req = https.get(url, { headers: { 'User-Agent': 'MassDistributionEgypt/1.0' }, timeout: 12000 }, (res) => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => {
        try { const j = JSON.parse(d); resolve((j.products||[]).find(p => p.image_url)?.image_url || null); }
        catch { resolve(null); }
      });
    });
    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
  });

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  const remaining = [
    // Vinegar (if not found above)
    { id: 14, q: 'balsamic vinegar bottle' },
    { id: 15, q: 'apple cider vinegar bottle 250ml' },
    { id: 16, q: 'apple vinegar 500ml' },
    { id: 17, q: 'white vinegar 1L' },
    { id: 18, q: 'natural vinegar 500ml' },
    // Knorr missing
    { id: 64, q: 'knorr chicken stock cubes 8 pack' },
    { id: 65, q: 'knorr beef stock cubes' },
    { id: 69, q: 'knorr cream of mushroom soup' },
    { id: 70, q: 'knorr vegetar seasoning powder' },
    { id: 71, q: 'knorr spicy chicken powder' },
    { id: 72, q: 'knorr bechamel sauce mix' },
    { id: 73, q: 'knorr hawawshi spice mix' },
    { id: 74, q: 'knorr pasta sauce bolognese' },
    { id: 75, q: 'knorr instant noodles chicken' },
    { id: 76, q: 'knorr noodles beef flavor' },
    { id: 78, q: 'knorr crispy coating breadcrumbs' },
    // Heinz missing
    { id: 79, q: 'heinz tomato ketchup 300g' },
    { id: 80, q: 'heinz ketchup bottle 570ml' },
    { id: 81, q: 'heinz ketchup 800g tin' },
    { id: 82, q: 'heinz ketchup squeezable 1kg' },
    { id: 83, q: 'heinz sweet chilli sauce bottle' },
    { id: 86, q: 'heinz mayonnaise 800ml jar' },
    { id: 87, q: 'heinz light mayonnaise' },
    { id: 88, q: 'heinz yellow mustard bottle' },
    { id: 89, q: 'heinz salad cream' },
    { id: 90, q: 'heinz thousand island dressing' },
    // Savola oil
    { id: 122, q: 'savola vegetable oil 750ml' },
    { id: 123, q: 'savola cooking oil 1.5L bottle' },
    { id: 124, q: 'cooking oil 1.8L bottle' },
    { id: 125, q: 'sunflower oil 3L bottle' },
    { id: 126, q: 'cooking oil 4L jug' },
    { id: 127, q: 'sunflower oil 750ml' },
    { id: 128, q: 'sunflower oil 1.5L' },
    { id: 129, q: 'sunflower cooking oil 1.8L' },
    { id: 130, q: 'sunflower oil 3L' },
    { id: 131, q: 'sunflower oil 4L' },
    { id: 132, q: 'corn oil 750ml bottle' },
    { id: 133, q: 'corn oil 1.5L' },
    { id: 134, q: 'corn cooking oil 2L' },
    { id: 135, q: 'corn oil 3L' },
    { id: 136, q: 'corn oil 4L' },
    { id: 137, q: 'cooking oil 5L gallon' },
    { id: 138, q: 'cooking oil 10L container' },
    { id: 139, q: 'vegetable oil 16L bulk' },
    { id: 140, q: 'mixed vegetable oil blend' },
    { id: 141, q: 'deep frying oil' },
    { id: 142, q: 'cooking oil 20L drum' },
    { id: 143, q: 'sunflower oil 5L gallon' },
    { id: 144, q: 'corn oil 5L' },
    { id: 145, q: 'premium vegetable oil' },
    { id: 146, q: 'extra refined oil cooking' },
    { id: 147, q: 'cooking oil gallon' },
    { id: 148, q: 'vegetable cooking oil 4L' },
    { id: 149, q: 'cooking oil 2L bottle' },
    { id: 150, q: 'cooking oil 750ml' },
    { id: 151, q: 'refined vegetable oil' },
  ];

  console.log('\nSearching Open Food Facts for remaining products...');
  for (const item of remaining) {
    const dest = path.join(OUT_DIR, `${item.id}.jpg`);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 5000) {
      process.stdout.write(`⏭  ${item.id} `);
      continue;
    }
    const imgUrl = await offSearch(item.q);
    if (imgUrl) {
      try {
        await download(imgUrl, dest);
        const size = fs.statSync(dest).size;
        process.stdout.write(`✅${item.id}(${Math.round(size/1024)}k) `);
      } catch { process.stdout.write(`❌${item.id} `); }
    } else {
      process.stdout.write(`·${item.id} `);
    }
    await sleep(700);
  }

  console.log('\n\nDone!');

  // Final count
  const existing = fs.readdirSync(OUT_DIR).filter(f => /^\d+\.(jpg|png|webp)$/.test(f));
  console.log(`Total product images: ${existing.length}/151`);
}

main().catch(console.error);
