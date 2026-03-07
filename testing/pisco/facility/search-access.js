const XLSX = require('xlsx');

const workbook = XLSX.readFile('asda.xls');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
  header: 1,
  defval: '',
  raw: false 
});

console.log('=== BUSCANDO VALORES DE ACCESOS (columna F, índice 5) ===\n');

const valoresBuscados = [
  "01 PEPIS PV1 - Molinete- Entrada Vehicular Personal - IN",
  "03 PEPIS PV1 - Molinete PA03 - IN",
  "05 PEPIS PV1 - Molinete PA02 - IN",
  "07 PEPIS PV1 - Molinete PA04 - IN"
];

// Buscar valores únicos en columna F
const valoresUnicos = new Set();
jsonData.slice(2).forEach(row => {
  if (row[5]) valoresUnicos.add(row[5]);
});

console.log('Total de valores únicos en columna Accesos:', valoresUnicos.size);
console.log('\nPrimeros 20 valores únicos:');
Array.from(valoresUnicos).slice(0, 20).forEach((val, i) => {
  console.log(`${i + 1}. ${val}`);
});

console.log('\n=== BUSCANDO COINCIDENCIAS PARCIALES CON "PEPIS PV1" ===');
const conPV1 = Array.from(valoresUnicos).filter(val => val.includes('PEPIS PV1'));
console.log(`\nEncontrados ${conPV1.length} valores con "PEPIS PV1":`);
conPV1.forEach((val, i) => {
  console.log(`${i + 1}. ${val}`);
});

console.log('\n=== VERIFICANDO VALORES EXACTOS ===');
valoresBuscados.forEach(buscar => {
  const existe = valoresUnicos.has(buscar);
  console.log(`${existe ? '✓' : '✗'} "${buscar}"`);
  
  if (!existe) {
    // Buscar similares
    const similar = Array.from(valoresUnicos).find(val => 
      val.includes(buscar.substring(0, 15))
    );
    if (similar) console.log(`   Similar encontrado: "${similar}"`);
  }
});

console.log('\n=== CONTEO DE FILAS POR TIPO ===');
let countPV1Molinetes = 0;
jsonData.slice(2).forEach(row => {
  if (row[5] && row[5].includes('PEPIS PV1') && row[5].includes('Molinete')) {
    countPV1Molinetes++;
  }
});
console.log(`Filas con "PEPIS PV1" y "Molinete": ${countPV1Molinetes}`);
