const XLSX = require('xlsx');
const wb = XLSX.readFile("C:\\Users\\asus\\OneDrive\\Desktop\\website\\pepsi Price List 1 Jan 26'.xlsx");

const ws = wb.Sheets['Price List'];
const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
console.log('Total rows:', data.length);
data.slice(64).forEach((row, i) => {
  if (row.some(c => c !== '')) console.log(i + 64, JSON.stringify(row.slice(0, 10)));
});
