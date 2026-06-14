const XLSX = require('xlsx');
const wb = XLSX.readFile("C:\\Users\\asus\\OneDrive\\Desktop\\pricelist\\شحات.xlsx");
const ws = wb.Sheets['Sheet1'];
const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

// Search for El Doha (الضحى / الضحي) products
const eldoha = data.filter((row, i) => i > 0 && row[0] && (row[0].includes('الضح') || row[0].includes('ضحى') || row[0].includes('ضحي')));
console.log('=== El Doha products ===');
eldoha.forEach(r => console.log(`  ${r[0]} | ${r[1]} | ${r[2]} EGP | ${r[3]}`));

// All Nescafe products
const nescafe = data.filter((row, i) => i > 0 && row[0] && (row[0].includes('نسكافيه') || row[0].includes('نسكافيه')));
const unique = [...new Map(nescafe.map(r => [r[1], r])).values()];
console.log('\n=== Nescafe products (unique by barcode) ===');
unique.forEach(r => console.log(`  ${r[0]} | ${r[1]} | ${r[2]} EGP | ${r[3]}`));

// Sugar products
const sugar = data.filter((row, i) => i > 0 && row[0] && row[0].includes('سكر') && !row[0].includes('فانيليا'));
console.log('\n=== Sugar products ===');
sugar.forEach(r => console.log(`  ${r[0]} | ${r[1]} | ${r[2]} EGP | ${r[3]}`));
