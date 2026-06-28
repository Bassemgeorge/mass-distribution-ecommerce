const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const agent = new https.Agent({ rejectUnauthorized: false });
const OUT_DIR = path.join(__dirname, '..', 'public', 'products');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const proto = url.startsWith('https') ? https : http;
    const req = proto.get(url, {
      agent: url.startsWith('https') ? agent : undefined,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0' },
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

// Copy a file to multiple IDs
function copyToIds(srcFile, ids) {
  const src = fs.readFileSync(srcFile);
  let count = 0;
  for (const id of ids) {
    const dest = path.join(OUT_DIR, `${id}.jpg`);
    if (!fs.existsSync(dest) || fs.statSync(dest).size < 5000) {
      fs.writeFileSync(dest, src);
      count++;
    }
  }
  return count;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

function off(q) {
  return new Promise((resolve) => {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=3`;
    const req = https.get(url, { headers: { 'User-Agent': 'MassDistributionEgypt/1.0' }, timeout: 12000 }, (res) => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => {
        try { const j = JSON.parse(d); resolve((j.products||[]).find(p => p.image_url)?.image_url || null); } catch { resolve(null); }
      });
    });
    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
  });
}

async function main() {
  // 1. Assign Afia oil images to Savola IDs
  const afiaBase = 'https://egypt.afiaarabia.com/sites/default/files';
  const oilImages = {
    sunflower_sm:  `${afiaBase}/2024-05/sf_08.png`,          // small sunflower
    sunflower_lg:  `${afiaBase}/2024-09/sunflower_29.png`,    // large sunflower
    corn_sm:       `${afiaBase}/2024-05/corn08_0.png`,         // small corn
    corn_lg:       `${afiaBase}/2024-12/corn_1_6_Egy.png`,    // large corn
    plus_sm:       `${afiaBase}/2024-05/mplus_08.png`,         // plus/blend sm
    plus_lg:       `${afiaBase}/2024-12/plus-16.png`,          // plus/blend lg
    blend:         `${afiaBase}/2023-08/afia%202%20%281%29.png`, // 2L blend
  };

  console.log('Downloading Afia oil images...');
  const oilFiles = {};
  for (const [key, url] of Object.entries(oilImages)) {
    const tmp = path.join(OUT_DIR, `_afia_${key}.png`);
    if (!fs.existsSync(tmp) || fs.statSync(tmp).size < 5000) {
      try { await download(url, tmp); } catch(e) { console.log(`  ❌ ${key}: ${e.message}`); continue; }
    }
    oilFiles[key] = tmp;
    console.log(`  ✅ ${key} — ${Math.round(fs.statSync(tmp).size/1024)}KB`);
  }

  // Assign oil images to product IDs 122-151
  // IDs 122-131: sunflower oil (various sizes)
  // IDs 132-144: corn oil (various sizes)
  // IDs 145-151: mixed/blend oil (various sizes)
  const oilAssign = [
    { ids: [122,123,127,128], key: 'sunflower_sm' },
    { ids: [124,125,126,129,130,131], key: 'sunflower_lg' },
    { ids: [132,133], key: 'corn_sm' },
    { ids: [134,135,136], key: 'corn_lg' },
    { ids: [137,138,139,141,142,143,144], key: 'plus_lg' },
    { ids: [147,148,149,150], key: 'plus_sm' },
  ];

  for (const item of oilAssign) {
    if (oilFiles[item.key]) {
      const n = copyToIds(oilFiles[item.key], item.ids);
      console.log(`  Assigned ${item.key} → IDs ${item.ids.join(',')} (${n} new)`);
    }
  }

  // 2. Tastecraft syrups from Amazon and bakery sites
  console.log('\nSearching for Tastecraft syrup images...');
  const tastecraftUrls = {
    caramel:    'https://homebakersmart.co.in/cdn/shop/files/Untitled-84ea64fe-5f5d-4e43-805a-8adce0748c34-removebg-preview_400x_3f36cbd7-63fd-470c-88a1-0357fba8225d.png',
  };

  // Search Amazon for more Tastecraft flavors
  const flavorSearches = [
    { id: 100, flavor: 'caramel',     src: tastecraftUrls.caramel },
    { id: 101, flavor: 'vanilla',     src: null },
    { id: 102, flavor: 'hazelnut',    src: null },
    { id: 103, flavor: 'chocolate',   src: null },
    { id: 104, flavor: 'strawberry',  src: null },
    { id: 105, flavor: 'mocha',       src: null },
    { id: 106, flavor: 'caramel sauce', src: tastecraftUrls.caramel },
    { id: 107, flavor: 'white chocolate sauce', src: null },
    { id: 108, flavor: 'dark chocolate sauce',  src: null },
    { id: 109, flavor: 'raspberry',   src: null },
    { id: 110, flavor: 'lavender',    src: null },
    { id: 111, flavor: 'hibiscus',    src: null },
  ];

  for (const item of flavorSearches) {
    const destFile = path.join(OUT_DIR, `${item.id}.jpg`);
    if (fs.existsSync(destFile) && fs.statSync(destFile).size > 5000) {
      console.log(`  ⏭  ${item.id} already exists`);
      continue;
    }
    if (item.src) {
      try {
        await download(item.src, destFile);
        console.log(`  ✅ ${item.id} (${item.flavor}) — ${Math.round(fs.statSync(destFile).size/1024)}KB`);
        continue;
      } catch {}
    }
    // Search OFF
    const imgUrl = await off(`tastecraft ${item.flavor} syrup`);
    if (imgUrl) {
      try {
        await download(imgUrl, destFile);
        console.log(`  ✅ ${item.id} (${item.flavor}) via OFF — ${Math.round(fs.statSync(destFile).size/1024)}KB`);
      } catch { console.log(`  ❌ ${item.id}`); }
    } else {
      // Use caramel as fallback for all syrups
      if (fs.existsSync(path.join(OUT_DIR, '100.jpg'))) {
        const src = fs.readFileSync(path.join(OUT_DIR, '100.jpg'));
        fs.writeFileSync(destFile, src);
        console.log(`  🔄 ${item.id} (${item.flavor}) — using caramel fallback`);
      } else {
        console.log(`  · ${item.id} — no image`);
      }
    }
    await sleep(500);
  }

  // 3. Remaining Knorr/Heinz
  console.log('\nSearching last Knorr/Heinz...');
  const lastSearch = [
    { id: 70, q: 'knorr chicken powder spice' },
    { id: 71, q: 'knorr spicy powder packet' },
    { id: 72, q: 'knorr sauce mix sachet' },
    { id: 73, q: 'knorr spice mix packet' },
    { id: 76, q: 'knorr instant noodles flavor' },
    { id: 78, q: 'knorr breadcrumb mix coating' },
    { id: 79, q: 'ketchup tomato 300ml bottle' },
    { id: 81, q: 'ketchup tomato large can' },
    { id: 82, q: 'ketchup squeeze bottle 1kg' },
    { id: 86, q: 'mayonnaise jar large' },
    { id: 88, q: 'yellow mustard bottle condiment' },
    { id: 90, q: 'thousand island dressing bottle' },
  ];

  for (const item of lastSearch) {
    const destFile = path.join(OUT_DIR, `${item.id}.jpg`);
    if (fs.existsSync(destFile) && fs.statSync(destFile).size > 5000) { process.stdout.write(`⏭ ${item.id} `); continue; }
    const imgUrl = await off(item.q);
    if (imgUrl) {
      try {
        await download(imgUrl, destFile);
        process.stdout.write(`✅${item.id} `);
      } catch { process.stdout.write(`❌${item.id} `); }
    } else {
      process.stdout.write(`·${item.id} `);
    }
    await sleep(600);
  }

  // Final tally
  console.log('\n\n=== FINAL COUNT ===');
  const existing = fs.readdirSync(OUT_DIR).filter(f => /^\d+\.(jpg|png|webp)$/.test(f)).map(f => parseInt(f)).sort((a,b)=>a-b);
  console.log(`Total images: ${existing.length}/151`);
  const missing = [];
  for (let i = 1; i <= 151; i++) if (!existing.includes(i)) missing.push(i);
  if (missing.length) console.log(`Missing: ${missing.join(', ')}`);
  else console.log('All 151 products have images! 🎉');

  // Cleanup temp files
  fs.readdirSync(OUT_DIR).filter(f => f.startsWith('_')).forEach(f => {
    try { fs.unlinkSync(path.join(OUT_DIR, f)); } catch {}
  });
  console.log('Temp files cleaned up.');
}

main().catch(console.error);
