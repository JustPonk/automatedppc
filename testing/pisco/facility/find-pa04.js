const XLSX = require('xlsx');

const workbook = XLSX.readFile('asda.xls');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
  header: 1,
  defval: '',
  raw: false 
});

console.log('Buscando PA04 - IN...\n');

const pa04Values = [];
jsonData.slice(2).forEach((row, index) => {
  if (row[5] && row[5].includes('PA04')) {
    pa04Values.push({
      fila: index + 3,
      valor: row[5]
    });
  }
});

console.log(`Encontrados ${pa04Values.length} registros con PA04:`);
pa04Values.slice(0, 10).forEach(item => {
  console.log(`Fila ${item.fila}: ${item.valor}`);
});

// Ver todos los valores únicos de PEPIS PV1
console.log('\n=== TODOS LOS VALORES ÚNICOS DE PEPIS PV1 ===');
const pv1Set = new Set();
jsonData.slice(2).forEach(row => {
  if (row[5] && row[5].includes('PEPIS PV1')) {
    pv1Set.add(row[5]);
  }
});

Array.from(pv1Set).sort().forEach(val => {
  console.log(val);
});
