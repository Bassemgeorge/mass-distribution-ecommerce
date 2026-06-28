const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const agent = new https.Agent({ rejectUnauthorized: false });
const OUT_DIR = path.join(__dirname, '..', 'public', 'products');
const sleep = ms => new Promise(r => setTimeout(r, ms));

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const proto = url.startsWith('https') ? https : http;
    const req = proto.get(url, {
      agent: url.startsWith('https') ? agent : undefined,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0', 'Referer': 'https://world.openfoodfacts.org' },
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

function off(q) {
  return new Promise((resolve) => {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=5`;
    const req = https.get(url, { headers: { 'User-Agent': 'MassDistributionEgypt/1.0' }, timeout: 12000 }, (res) => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => {
        try { const j = JSON.parse(d); resolve((j.products||[]).find(p => p.image_url)?.image_url || null); }
        catch { resolve(null); }
      });
    });
    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
  });
}

function fetchHtml(url) {
  return new Promise((resolve) => {
    const req = https.get(url, { agent, headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 15000 }, (res) => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(d));
    });
    req.on('error', () => resolve(''));
    req.on('timeout', () => { req.destroy(); resolve(''); });
  });
}

async function downloadToId(id, url) {
  const dest = path.join(OUT_DIR, `${id}.jpg`);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 5000) return 'skip';
  if (!url) return 'no-url';
  try {
    await download(url, dest);
    return Math.round(fs.statSync(dest).size / 1024) + 'KB';
  } catch (e) {
    return 'err:' + e.message.slice(0, 30);
  }
}

async function main() {
  // ─── Heinz ketchup (try different OFF queries) ──────────────────
  const heinzKetchup = [
    { id: 79,  q: 'heinz ketchup 300' },
    { id: 80,  q: 'heinz tomato ketchup bottle' },
    { id: 81,  q: 'heinz tomato ketchup 800' },
    { id: 82,  q: 'heinz ketchup squeeze' },
    { id: 83,  q: 'heinz chilli sauce sweet' },
    { id: 86,  q: 'heinz mayonnaise large' },
    { id: 88,  q: 'heinz mustard yellow' },
    { id: 90,  q: 'heinz thousand island' },
  ];
  console.log('Heinz ketchup searches:');
  for (const item of heinzKetchup) {
    const url = await off(item.q);
    const r = await downloadToId(item.id, url);
    console.log(`  ${item.id}: ${r} (${item.q})`);
    await sleep(600);
  }

  // ─── Knorr (broader queries) ─────────────────────────────────────
  const knorr = [
    { id: 64, q: 'knorr chicken bouillon cubes' },
    { id: 70, q: 'knorr seasoning sachet' },
    { id: 71, q: 'knorr hot spice' },
    { id: 72, q: 'knorr bechamel' },
    { id: 73, q: 'knorr meat mix spice' },
    { id: 76, q: 'knorr noodles beef' },
    { id: 78, q: 'knorr coating crispy' },
  ];
  console.log('\nKnorr broader searches:');
  for (const item of knorr) {
    const url = await off(item.q);
    const r = await downloadToId(item.id, url);
    console.log(`  ${item.id}: ${r} (${item.q})`);
    await sleep(600);
  }

  // ─── Tastecraft barista syrups → use Torani/Monin as stand-in ────
  const syrups = [
    { id: 100, q: 'caramel syrup coffee barista 750ml' },
    { id: 101, q: 'vanilla syrup coffee bottle' },
    { id: 102, q: 'hazelnut syrup coffee' },
    { id: 103, q: 'chocolate sauce coffee syrup' },
    { id: 104, q: 'strawberry syrup coffee drink' },
    { id: 105, q: 'mocha coffee syrup bottle' },
    { id: 106, q: 'caramel sauce thick bottle' },
    { id: 107, q: 'white chocolate sauce bottle' },
    { id: 108, q: 'dark chocolate sauce coffee' },
    { id: 109, q: 'raspberry syrup bottle coffee' },
    { id: 110, q: 'lavender syrup drink bottle' },
    { id: 111, q: 'hibiscus syrup drink bottle' },
  ];
  console.log('\nTastecraft syrup searches:');
  for (const item of syrups) {
    const url = await off(item.q);
    const r = await downloadToId(item.id, url);
    console.log(`  ${item.id}: ${r}`);
    await sleep(600);
  }

  // ─── Savola oil — try Afia and generic oil searches ──────────────
  const oilItems = [
    { id: 122, q: 'afia sunflower oil 750ml egypt' },
    { id: 123, q: 'afia cooking oil 1.5L' },
    { id: 124, q: 'afia oil 2L bottle egypt' },
    { id: 125, q: 'vegetable cooking oil 3L bottle' },
    { id: 126, q: 'vegetable oil 4L' },
    { id: 127, q: 'sunflower oil 750ml bottle' },
    { id: 128, q: 'sunflower oil 1.5L bottle' },
    { id: 129, q: 'sunflower oil 2L bottle' },
    { id: 130, q: 'sunflower oil 3L bottle' },
    { id: 131, q: 'sunflower oil 4L' },
    { id: 132, q: 'corn oil 750ml' },
    { id: 133, q: 'corn oil 1.5L bottle' },
    { id: 134, q: 'corn oil 2L' },
    { id: 135, q: 'corn oil 3L bottle' },
    { id: 136, q: 'corn oil 4L' },
    { id: 137, q: 'sunflower oil 5L' },
    { id: 138, q: 'cooking oil 10L container' },
    { id: 139, q: 'vegetable oil bulk' },
    { id: 141, q: 'frying oil deep' },
    { id: 142, q: 'cooking oil large drum' },
    { id: 143, q: 'sunflower oil 5L jug' },
    { id: 144, q: 'corn oil 5L' },
    { id: 145, q: 'premium sunflower oil' },
    { id: 146, q: 'extra light cooking oil' },
    { id: 147, q: 'cooking oil large gallon' },
    { id: 148, q: 'vegetable oil 4L bottle' },
    { id: 149, q: 'cooking oil 2L' },
    { id: 150, q: 'sunflower cooking oil 750ml' },
  ];
  console.log('\nSavola oil searches:');
  for (const item of oilItems) {
    const url = await off(item.q);
    const r = await downloadToId(item.id, url);
    process.stdout.write(`${item.id}:${r} `);
    await sleep(600);
  }

  // Final count
  console.log('\n\nFinal count:');
  const existing = fs.readdirSync(OUT_DIR).filter(f => /^\d+\.(jpg|png|webp)$/.test(f));
  console.log(`Total: ${existing.length}/151`);
  const missing = [];
  for (let i = 1; i <= 151; i++) {
    const found = existing.find(f => f.startsWith(i + '.'));
    if (!found) missing.push(i);
  }
  if (missing.length) console.log('Still missing:', missing.join(', '));
}

main().catch(console.error);
