const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

function fetch(url) {
  return new Promise((resolve) => {
    const req = https.get(url, { agent, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }, timeout: 12000 }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', (e) => resolve({ error: e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ error: 'timeout' }); });
  });
}

async function main() {
  const urls = [
    'https://www.wadi-food.com/en/olive-oil',
    'https://www.wadi-food.com/en',
    'https://wadi-food.com/en',
  ];

  for (const url of urls) {
    console.log('Trying:', url);
    const res = await fetch(url);
    if (res.error) { console.log('Error:', res.error); continue; }
    console.log('Status:', res.status, '| Body length:', res.body.length);

    // Find jpg/png URLs
    const matches = [];
    const re = /(https?:\/\/[^\s"'<>]+\.(jpg|png|webp))/gi;
    let m;
    while ((m = re.exec(res.body)) !== null) {
      matches.push(m[1]);
    }
    const unique = [...new Set(matches)].slice(0, 20);
    if (unique.length) {
      console.log('Image URLs found:');
      unique.forEach(u => console.log(' ', u));
    } else {
      // Print first 500 chars of body
      console.log('First 500 chars:', res.body.slice(0, 500));
    }
    console.log('---');
  }
}

main();
