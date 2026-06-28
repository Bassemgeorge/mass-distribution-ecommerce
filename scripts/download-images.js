/**
 * Download product images for Mass Distribution website
 * Uses Open Food Facts API + Bing Image Search as fallback
 */

const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");

const OUT_DIR = path.join(__dirname, "..", "public", "products");
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// Full product list: id, brand, nameEn
const products = [
  // Wadifood — Olive Oil
  { id: "1",  brand: "Wadi Food", q: "wadi food extra virgin olive oil 250ml dorica" },
  { id: "2",  brand: "Wadi Food", q: "wadi food extra virgin olive oil 500ml dorica" },
  { id: "3",  brand: "Wadi Food", q: "wadi food pure olive oil 250ml plastic" },
  { id: "4",  brand: "Wadi Food", q: "wadi food extra pure olive oil 250ml plastic" },
  { id: "5",  brand: "Wadi Food", q: "wadi food pure olive oil 500ml plastic" },
  { id: "6",  brand: "Wadi Food", q: "wadi food extra pure olive oil 500ml plastic" },
  { id: "7",  brand: "Wadi Food", q: "wadi food pure olive oil 1L plastic" },
  { id: "8",  brand: "Wadi Food", q: "wadi food extra pure olive oil 1L plastic" },
  { id: "9",  brand: "Wadi Food", q: "wadi food pure olive oil 2L" },
  { id: "10", brand: "Wadi Food", q: "wadi food extra pure olive oil 2L" },
  { id: "11", brand: "Wadi Food", q: "wadi food natron extra virgin olive oil 500ml amphora" },
  { id: "12", brand: "Wadi Food", q: "wadi food pure olive oil 5L" },
  { id: "13", brand: "Wadi Food", q: "wadi food extra pure olive oil 5L" },
  // Wadifood — Vinegar
  { id: "14", brand: "Wadi Food", q: "wadi food balsamic vinegar 250ml" },
  { id: "15", brand: "Wadi Food", q: "wadi food apple vinegar 250ml" },
  { id: "16", brand: "Wadi Food", q: "wadi food apple vinegar 500ml" },
  { id: "17", brand: "Wadi Food", q: "wadi food natural vinegar 1L" },
  { id: "18", brand: "Wadi Food", q: "wadi food natural vinegar 500ml" },
  // Wadifood — Tomato Paste
  { id: "19", brand: "Wadi Food", q: "wadi food tomato sauce 320g jar" },
  { id: "20", brand: "Wadi Food", q: "wadi food tomato sauce 360g jar" },
  { id: "21", brand: "Wadi Food", q: "wadi food tomato paste 3kg" },
  { id: "22", brand: "Wadi Food", q: "wadi food tomato sauce 250g jar" },
  { id: "23", brand: "Wadi Food", q: "wadi food tomato sauce sachet" },
  // Wadifood — Ketchup
  { id: "24", brand: "Wadi Food", q: "wadi food healthy ketchup 300g bottle" },
  // Wadifood — Speciality
  { id: "25", brand: "Wadi Food", q: "wadi food sundried tomatoes 325g" },
  { id: "26", brand: "Wadi Food", q: "wadi food chopped black olives plain 300g jar" },
  { id: "27", brand: "Wadi Food", q: "wadi food chopped black olives thyme 300g jar" },
  { id: "28", brand: "Wadi Food", q: "wadi food sliced black olives 300g jar" },
  { id: "29", brand: "Wadi Food", q: "wadi food chopped black olives chilli 300g" },
  // Wadifood — Beans
  { id: "30", brand: "Wadi Food", q: "wadi food fava beans 400g can" },
  { id: "31", brand: "Wadi Food", q: "wadi food fava beans 800g can" },
  { id: "32", brand: "Wadi Food", q: "wadi food fava beans 2.5kg can" },
  { id: "33", brand: "Wadi Food", q: "wadi food chickpeas 400g can" },
  { id: "34", brand: "Wadi Food", q: "wadi food chickpeas 800g can" },
  // Wadifood — Olives
  { id: "35", brand: "Wadi Food", q: "wadi food green olives 350g jar" },
  { id: "36", brand: "Wadi Food", q: "wadi food pitted green olives 350g jar" },
  { id: "37", brand: "Wadi Food", q: "wadi food green olives stuffed pepper 350g" },
  { id: "38", brand: "Wadi Food", q: "wadi food green olives 650g jar" },
  { id: "39", brand: "Wadi Food", q: "wadi food pitted green olives 650g jar" },
  { id: "40", brand: "Wadi Food", q: "wadi food green olives stuffed 650g jar" },
  { id: "41", brand: "Wadi Food", q: "wadi food black olives 350g jar" },
  { id: "42", brand: "Wadi Food", q: "wadi food black olives 650g jar" },
  { id: "43", brand: "Wadi Food", q: "wadi food kalamata olives 350g jar" },
  { id: "44", brand: "Wadi Food", q: "wadi food kalamata olives pitted 350g jar" },
  { id: "45", brand: "Wadi Food", q: "wadi food kalamata olives 650g jar" },
  { id: "46", brand: "Wadi Food", q: "wadi food mixed olives 350g jar" },
  { id: "47", brand: "Wadi Food", q: "wadi food mixed olives 650g jar" },
  { id: "48", brand: "Wadi Food", q: "wadi food green olives 2.9kg can" },
  { id: "49", brand: "Wadi Food", q: "wadi food pitted green olives 2.9kg can" },
  { id: "50", brand: "Wadi Food", q: "wadi food black olives 2.9kg can" },
  { id: "51", brand: "Wadi Food", q: "wadi food kalamata olives 2.9kg can" },
  // Wadifood — Pickles
  { id: "52", brand: "Wadi Food", q: "wadi food pickled cucumbers 600g jar" },
  { id: "53", brand: "Wadi Food", q: "wadi food pickled cucumbers sliced 600g" },
  { id: "54", brand: "Wadi Food", q: "wadi food pickled gherkins 600g" },
  { id: "55", brand: "Wadi Food", q: "wadi food pickled turnips 600g" },
  { id: "56", brand: "Wadi Food", q: "wadi food pickled peppers 600g" },
  { id: "57", brand: "Wadi Food", q: "wadi food pickled chilli 600g" },
  { id: "58", brand: "Wadi Food", q: "wadi food mixed pickles 600g jar" },
  { id: "59", brand: "Wadi Food", q: "wadi food pickled jalapeno 600g" },
  { id: "60", brand: "Wadi Food", q: "wadi food pickled cucumbers 2.9kg" },
  { id: "61", brand: "Wadi Food", q: "wadi food pickled mixed 2.9kg can" },
  { id: "62", brand: "Wadi Food", q: "wadi food pickled peppers 2.9kg" },
  { id: "63", brand: "Wadi Food", q: "wadi food pickled gherkins 2.9kg" },
  // Knorr
  { id: "64", brand: "Knorr", q: "knorr chicken stock cubes 72g 8 cubes" },
  { id: "65", brand: "Knorr", q: "knorr beef stock cubes 72g" },
  { id: "66", brand: "Knorr", q: "knorr vegetable stock cubes" },
  { id: "67", brand: "Knorr", q: "knorr chicken broth powder" },
  { id: "68", brand: "Knorr", q: "knorr tomato soup powder" },
  { id: "69", brand: "Knorr", q: "knorr mushroom soup powder" },
  { id: "70", brand: "Knorr", q: "knorr vegetar seasoning 35g" },
  { id: "71", brand: "Knorr", q: "knorr vegetar hot seasoning 35g" },
  { id: "72", brand: "Knorr", q: "knorr bechamel mix 70g" },
  { id: "73", brand: "Knorr", q: "knorr hawawshi mix 30g" },
  { id: "74", brand: "Knorr", q: "knorr pasta sauce tomato" },
  { id: "75", brand: "Knorr", q: "knorr noodles chicken 70g" },
  { id: "76", brand: "Knorr", q: "knorr noodles beef 70g" },
  { id: "77", brand: "Knorr", q: "knorr seasoning mix" },
  { id: "78", brand: "Knorr", q: "knorr extra crispy vegetar 55g" },
  // Heinz
  { id: "79", brand: "Heinz", q: "heinz tomato ketchup 300ml bottle" },
  { id: "80", brand: "Heinz", q: "heinz tomato ketchup 570ml bottle" },
  { id: "81", brand: "Heinz", q: "heinz tomato ketchup 800g" },
  { id: "82", brand: "Heinz", q: "heinz tomato ketchup 1kg squeezable" },
  { id: "83", brand: "Heinz", q: "heinz sweet chilli sauce" },
  { id: "84", brand: "Heinz", q: "heinz bbq sauce smoky" },
  { id: "85", brand: "Heinz", q: "heinz mayonnaise 400ml" },
  { id: "86", brand: "Heinz", q: "heinz mayonnaise 800ml" },
  { id: "87", brand: "Heinz", q: "heinz mayonnaise light" },
  { id: "88", brand: "Heinz", q: "heinz mustard classic yellow" },
  { id: "89", brand: "Heinz", q: "heinz salad cream 285ml" },
  { id: "90", brand: "Heinz", q: "heinz thousand island dressing" },
  { id: "91", brand: "Heinz", q: "heinz caesar salad dressing" },
  { id: "92", brand: "Heinz", q: "heinz chilli sauce hot" },
  { id: "93", brand: "Heinz", q: "heinz worcestershire sauce" },
  // Juhaynna
  { id: "94",  brand: "Juhayna", q: "juhayna full cream milk 1L" },
  { id: "95",  brand: "Juhayna", q: "juhayna skimmed milk 1L" },
  { id: "96",  brand: "Juhayna", q: "juhayna semi skimmed milk 1L" },
  { id: "97",  brand: "Juhayna", q: "juhayna full cream milk 200ml carton" },
  { id: "98",  brand: "Juhayna", q: "juhayna juice orange" },
  { id: "99",  brand: "Juhayna", q: "juhayna yogurt plain" },
  // Tastecraft
  { id: "100", brand: "Tastecraft", q: "caramel syrup coffee 750ml" },
  { id: "101", brand: "Tastecraft", q: "vanilla syrup coffee 750ml" },
  { id: "102", brand: "Tastecraft", q: "hazelnut syrup coffee 750ml" },
  { id: "103", brand: "Tastecraft", q: "chocolate syrup cafe 750ml" },
  { id: "104", brand: "Tastecraft", q: "strawberry syrup cafe 750ml" },
  { id: "105", brand: "Tastecraft", q: "mocha syrup coffee 750ml" },
  { id: "106", brand: "Tastecraft", q: "caramel sauce thick 750ml" },
  { id: "107", brand: "Tastecraft", q: "white chocolate sauce 750ml" },
  { id: "108", brand: "Tastecraft", q: "dark chocolate sauce 750ml" },
  { id: "109", brand: "Tastecraft", q: "raspberry syrup barista 750ml" },
  { id: "110", brand: "Tastecraft", q: "lavender syrup barista 750ml" },
  { id: "111", brand: "Tastecraft", q: "hibiscus syrup barista 750ml" },
  // lamar
  { id: "112", brand: "Lamar", q: "lamar full cream milk uht 1L egypt" },
  // savola pasta
  { id: "113", brand: "savola", q: "savola pasta spaghetti 400g" },
  { id: "114", brand: "savola", q: "savola pasta penne 400g" },
  { id: "115", brand: "savola", q: "savola pasta fusilli 400g" },
  { id: "116", brand: "savola", q: "savola pasta farfalle 400g" },
  { id: "117", brand: "savola", q: "savola pasta macaroni 400g" },
  { id: "118", brand: "savola", q: "savola pasta vermicelli 400g" },
  { id: "119", brand: "savola", q: "savola pasta rigatoni 400g" },
  { id: "120", brand: "savola", q: "savola pasta angel hair 400g" },
  { id: "121", brand: "savola", q: "savola pasta lasagne sheets" },
  // savola cooking oil
  { id: "122", brand: "savola", q: "savola cooking oil 750ml" },
  { id: "123", brand: "savola", q: "savola cooking oil 1.5L" },
  { id: "124", brand: "savola", q: "savola cooking oil 1.8L" },
  { id: "125", brand: "savola", q: "savola cooking oil 2.9L" },
  { id: "126", brand: "savola", q: "savola cooking oil 3.78L" },
  { id: "127", brand: "savola", q: "savola sunflower oil 750ml" },
  { id: "128", brand: "savola", q: "savola sunflower oil 1.5L" },
  { id: "129", brand: "savola", q: "savola sunflower oil 1.8L" },
  { id: "130", brand: "savola", q: "savola sunflower oil 2.9L" },
  { id: "131", brand: "savola", q: "savola sunflower oil 3.78L" },
  { id: "132", brand: "savola", q: "savola corn oil 750ml" },
  { id: "133", brand: "savola", q: "savola corn oil 1.5L" },
  { id: "134", brand: "savola", q: "savola corn oil 1.8L" },
  { id: "135", brand: "savola", q: "savola corn oil 2.9L" },
  { id: "136", brand: "savola", q: "savola corn oil 3.78L" },
  { id: "137", brand: "savola", q: "savola oil 5L" },
  { id: "138", brand: "savola", q: "savola oil 10L" },
  { id: "139", brand: "savola", q: "savola oil 16L" },
  { id: "140", brand: "savola", q: "savola oil blend" },
  { id: "141", brand: "savola", q: "savola frying oil" },
  { id: "142", brand: "savola", q: "savola oil 20L" },
  { id: "143", brand: "savola", q: "savola sunflower oil 5L" },
  { id: "144", brand: "savola", q: "savola corn oil 5L" },
  { id: "145", brand: "savola", q: "savola premium oil" },
  { id: "146", brand: "savola", q: "savola extra oil" },
  { id: "147", brand: "savola", q: "savola oil gallon" },
  { id: "148", brand: "savola", q: "savola cooking oil 4L" },
  { id: "149", brand: "savola", q: "savola cooking oil 2L" },
  { id: "150", brand: "savola", q: "savola oil 0.75L bottle" },
  { id: "151", brand: "savola", q: "savola refined oil" },
];

// Download a file from a URL
function download(url, dest) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;
    const file = fs.createWriteStream(dest);
    const req = protocol.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "image/*,*/*",
      },
      timeout: 15000,
    }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        fs.unlinkSync(dest);
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest);
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      res.pipe(file);
      file.on("finish", () => { file.close(); resolve(); });
    });
    req.on("error", (e) => { file.close(); try { fs.unlinkSync(dest); } catch {} reject(e); });
    req.on("timeout", () => { req.destroy(); reject(new Error("timeout")); });
  });
}

// Search Open Food Facts
async function searchOFF(query) {
  return new Promise((resolve) => {
    const encoded = encodeURIComponent(query);
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encoded}&search_simple=1&action=process&json=1&page_size=3`;
    const req = https.get(url, {
      headers: { "User-Agent": "MassDistributionEgypt/1.0 contact@mass-dis.com" },
      timeout: 12000,
    }, (res) => {
      let data = "";
      res.on("data", (chunk) => data += chunk);
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          const products = (json.products || []).filter(p => p.image_url);
          resolve(products[0]?.image_url || null);
        } catch { resolve(null); }
      });
    });
    req.on("error", () => resolve(null));
    req.on("timeout", () => { req.destroy(); resolve(null); });
  });
}

// Delay helper
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
  const results = { success: [], failed: [] };

  for (const p of products) {
    const dest = path.join(OUT_DIR, `${p.id}.jpg`);

    // Skip if already downloaded
    if (fs.existsSync(dest) && fs.statSync(dest).size > 5000) {
      console.log(`⏭  ${p.id} already exists`);
      continue;
    }

    process.stdout.write(`🔍 ${p.id} (${p.brand}) — ${p.q.slice(0, 50)}...`);

    const imageUrl = await searchOFF(p.q);

    if (imageUrl) {
      try {
        await download(imageUrl, dest);
        const size = fs.statSync(dest).size;
        if (size < 2000) {
          fs.unlinkSync(dest);
          console.log(` ❌ too small (${size}b)`);
          results.failed.push(p.id);
        } else {
          console.log(` ✅ ${Math.round(size/1024)}KB`);
          results.success.push(p.id);
        }
      } catch (e) {
        console.log(` ❌ download failed: ${e.message}`);
        results.failed.push(p.id);
      }
    } else {
      console.log(` ❌ not found in OpenFoodFacts`);
      results.failed.push(p.id);
    }

    await sleep(800); // Be polite to the API
  }

  console.log("\n════════════════════════════════");
  console.log(`✅ Success: ${results.success.length}`);
  console.log(`❌ Failed:  ${results.failed.length}`);
  if (results.failed.length) {
    console.log("Failed IDs:", results.failed.join(", "));
  }

  // Save results
  fs.writeFileSync(
    path.join(__dirname, "image-download-results.json"),
    JSON.stringify(results, null, 2)
  );
}

main().catch(console.error);
