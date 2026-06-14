const https = require('https');
const fs = require('fs');
const path = require('path');

const agent = new https.Agent({ rejectUnauthorized: false });
const OUT_DIR = path.join(__dirname, '..', 'public', 'products');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const proto = url.startsWith('https') ? https : require('http');
    const req = proto.get(url, { agent, headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 15000 }, (res) => {
      if (res.statusCode !== 200) { file.close(); try { fs.unlinkSync(dest); } catch {} return reject(new Error('HTTP ' + res.statusCode)); }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    });
    req.on('error', (e) => { file.close(); try { fs.unlinkSync(dest); } catch {} reject(e); });
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

// Best-effort image assignment based on product category and size
// Each image URL maps to one or more product IDs
const assignments = [
  // ─── OLIVE OIL (IDs 1-13) ─────────────────────
  // Tl1ur9 = 250ml Glass Dorica bottle → IDs 1, 2
  { ids: [1, 2],     url: 'https://www.wadi-food.com/storage/products/Tl1ur90uXGrC8KEfJbswKV7198TJq2Mfs0jA2fSW.jpg' },
  // CW2tQ4 = 250ml Plastic → IDs 3, 4
  { ids: [3, 4],     url: 'https://www.wadi-food.com/storage/products/CW2tQ4PZFANP5JSynkeKHQyLQg1LHxE3FKF8Uot3.jpg' },
  // JCmy8u = 500ml Plastic → IDs 5, 6
  { ids: [5, 6],     url: 'https://www.wadi-food.com/storage/products/JCmy8uZTQD4mDiyU2HjCLOPDWJdt3Z1ZseK81BuZ.jpg' },
  // dzgRa2 = 1L → IDs 7, 8
  { ids: [7, 8],     url: 'https://www.wadi-food.com/storage/products/dzgRa2CI4rd6G4O4Ba8IyM3qd7m5TSIyIFlk7iFu.jpg' },
  // 3N7rrZ = 2L → IDs 9, 10
  { ids: [9, 10],    url: 'https://www.wadi-food.com/storage/products/3N7rrZvBkM3V7MJqCGb1bo1POHLkeGdqB5cS7D1L.jpg' },
  // rh20kq5 = Domaine Natroun 500ml Amphora → ID 11
  { ids: [11],       url: 'https://www.wadi-food.com/storage/products/rh20kq5mDcQevIKpWN5TXING1O3lNdBH7TLCUAMR.png' },
  // l7lNRS = 5L → IDs 12, 13
  { ids: [12, 13],   url: 'https://www.wadi-food.com/storage/products/l7lNRSFhd7InLjwZohV0gprvjE96q8RrMjr69G35.jpg' },

  // ─── TOMATO & KETCHUP (IDs 19-29) ─────────────
  // IqDWJt = sachet/small → IDs 22, 23
  { ids: [22, 23],   url: 'https://www.wadi-food.com/storage/products/IqDWJtyXAxthICtyhLPCrD2WzeSpuxn55ORWeEoO.png' },
  // R0nQev = 360g jar → IDs 19, 20
  { ids: [19, 20],   url: 'https://www.wadi-food.com/storage/products/R0nQev3j57J2QrfiXjsF14KmjXQSE9Z2nliPNoVi.png' },
  // 6zLNrh = 3kg tin → ID 21
  { ids: [21],       url: 'https://www.wadi-food.com/storage/products/6zLNrhEXLSTnRtPhHCQze8rKM3GsPK7QX6CIqp40.png' },
  // 1JHhF8 = ketchup → IDs 24, 25, 26, 27, 28, 29
  { ids: [24, 25, 26, 27, 28, 29], url: 'https://www.wadi-food.com/storage/products/1JHhF8mXrpDRHt7Cghcw3uvl2CQIkoEDexKCYnl8.jpg' },

  // ─── BEANS (IDs 30-34) ─────────────────────────
  // EctkzR = chickpeas → IDs 33, 34
  { ids: [33, 34],   url: 'https://www.wadi-food.com/storage/products/EctkzRsfXfrfdltB6B7i6cJMGMzwI12Q6RSvh9HC.jpg' },
  // BPlqcD = fava beans 400g → IDs 30, 31
  { ids: [30, 31],   url: 'https://www.wadi-food.com/storage/products/BPlqcDWZCxyRMsmUKGMo5c8u0UDFUkC1P6XOVVKG.jpg' },
  // yMAnWM = large can → ID 32
  { ids: [32],       url: 'https://www.wadi-food.com/storage/products/yMAnWMlB9w1FYtMXqCshAwHlpW1Ic5wIxmZRbAhk.png' },

  // ─── PICKLES (IDs 52-63) ───────────────────────
  // MSPcIs = pickled onions jar → IDs 52, 53
  { ids: [52, 53],   url: 'https://www.wadi-food.com/storage/products/MSPcIs0BnP375mVcyDQN4L9oVdVkrjyjm5rVGrdG.png' },
  // NAMQjk = mixed pickles 1kg → IDs 54, 55
  { ids: [54, 55],   url: 'https://www.wadi-food.com/storage/products/NAMQjkl8ztGF98PBdkGI8UE7wSctXy6zf6vvs2im.png' },
  // QS5yIO = mixed pickles jar → IDs 56, 57, 58
  { ids: [56, 57, 58], url: 'https://www.wadi-food.com/storage/products/QS5yIOyf817U3KUyYv4Dq6sndl0gSKyWec1FGXhD.png' },
  // VgXRSp = hot peppers → IDs 59, 60
  { ids: [59, 60],   url: 'https://www.wadi-food.com/storage/products/VgXRSpnTR0q41sJ4WvrJavJJsKakb8KNmeH3WoaC.png' },
  // dBTFCy = jalapeno → IDs 61, 62
  { ids: [61, 62],   url: 'https://www.wadi-food.com/storage/products/dBTFCyzLB5RSAl4tkPbP2rzv4M3jeASC6LB95uzt.png' },
  // zt6iZc = pickled lemons → ID 63
  { ids: [63],       url: 'https://www.wadi-food.com/storage/products/zt6iZcKsKnqeRuauUZWWOr4BVsMuGZgkv2VQuU3m.png' },
];

async function main() {
  let downloaded = 0, skipped = 0, failed = 0;

  for (const item of assignments) {
    // Download the image once
    const ext = item.url.endsWith('.png') ? '.png' : '.jpg';
    let imageData = null;

    try {
      const tmpFile = path.join(OUT_DIR, `_tmp${ext}`);
      await download(item.url, tmpFile);
      imageData = fs.readFileSync(tmpFile);
      fs.unlinkSync(tmpFile);
    } catch (e) {
      console.log(`❌ Failed to download ${item.url.split('/').pop().slice(0,20)}: ${e.message}`);
      failed += item.ids.length;
      continue;
    }

    // Save to all assigned IDs
    for (const id of item.ids) {
      const dest = path.join(OUT_DIR, `${id}.jpg`);
      if (fs.existsSync(dest) && fs.statSync(dest).size > 10000) {
        console.log(`⏭  ${id} — already exists`);
        skipped++;
        continue;
      }
      fs.writeFileSync(dest, imageData);
      downloaded++;
      console.log(`✅ ${id} — ${Math.round(imageData.length/1024)}KB`);
    }
  }

  console.log(`\nDone: ${downloaded} downloaded, ${skipped} skipped, ${failed} failed`);
}

main().catch(console.error);
