const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

function fetch(url) {
  return new Promise((resolve) => {
    const req = https.get(url, {
      agent,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0' },
      timeout: 15000
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d, headers: res.headers }));
    });
    req.on('error', (e) => resolve({ error: e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ error: 'timeout' }); });
  });
}

function extractImages(html) {
  const matches = [];
  const re = /(https?:\/\/www\.wadi-food\.com\/storage\/[^\s"'<>]+\.(jpg|png|webp))/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    matches.push(m[1]);
  }
  return [...new Set(matches)];
}

function extractLinks(html, base) {
  const links = new Set();
  const re = /href=["']([^"']*wadi-food[^"']*)["']/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const url = m[1].startsWith('http') ? m[1] : base + m[1];
    links.add(url);
  }
  // Also try relative /en/ links
  const re2 = /href=["'](\/en\/[^"']*)["']/gi;
  while ((m = re2.exec(html)) !== null) {
    links.add('https://www.wadi-food.com' + m[1]);
  }
  return [...links];
}

async function main() {
  const visited = new Set();
  const allImages = new Set();

  // Start pages to try
  const startUrls = [
    'https://www.wadi-food.com/en',
    'https://www.wadi-food.com/en/products',
    'https://www.wadi-food.com/en/newsfeed',
    'https://www.wadi-food.com/home/products',
  ];

  for (const url of startUrls) {
    if (visited.has(url)) continue;
    visited.add(url);
    console.log('Fetching:', url);
    const res = await fetch(url);
    if (res.error || !res.body) { console.log('  Error:', res.error); continue; }
    console.log('  Status:', res.status, '| Size:', res.body.length);

    const imgs = extractImages(res.body);
    imgs.forEach(i => allImages.add(i));
    console.log('  Images found:', imgs.length);

    const links = extractLinks(res.body, 'https://www.wadi-food.com');
    const productLinks = links.filter(l =>
      l.includes('product') || l.includes('olive') || l.includes('vinegar') ||
      l.includes('tomato') || l.includes('pickle') || l.includes('olive') ||
      l.includes('category') || l.includes('catalog')
    );
    console.log('  Product links:', productLinks.slice(0,10));
  }

  console.log('\nAll unique images:', allImages.size);
  [...allImages].forEach(img => console.log(' ', img));
}

main();
