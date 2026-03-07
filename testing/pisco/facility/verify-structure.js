const XLSX = require('xlsx');

const workbook = XLSX.readFile('asda.xls');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
  header: 1,
  defval: '',
  raw: false 
});

console.log('=== ESTRUCTURA ORIGINAL (Fila 3) ===\n');
const row3 = jsonData[2];
console.log('A - fecha:', row3[0]);
console.log('B - hora:', row3[1]);
console.log('C:', row3[2]);
console.log('D - condición (debe ser):', row3[3]);
console.log('E - cuid:', row3[4]);
console.log('F - accesos:', row3[5]);
console.log('G:', row3[6]);
console.log('H:', row3[7]);
console.log('I:', row3[8]);
console.log('J:', row3[9]);
console.log('K:', row3[10]);
console.log('L - dni:', row3[11]);
console.log('M - apellidos:', row3[12]);
console.log('N - nombres:', row3[13]);
console.log('O:', row3[14]);
console.log('P:', row3[15]);
console.log('Q:', row3[16]);
console.log('R:', row3[17]);
console.log('S:', row3[18]);

console.log('\n=== DESPUÉS DE ELIMINAR S, Q, O, K, J, I, H, G, C ===');
console.log('Columnas a eliminar: C(2), G(6), H(7), I(8), J(9), K(10), O(14), Q(16), S(18)');

// Simular eliminación
const columnsToDelete = [18, 16, 14, 10, 9, 8, 7, 6, 2].sort((a, b) => b - a);
const newRow = [...row3];
columnsToDelete.forEach(idx => {
  newRow.splice(idx, 1);
});

console.log('\nQuedan', newRow.length, 'columnas:');
console.log('Índice 0 - A (fecha):', newRow[0]);
console.log('Índice 1 - B (hora):', newRow[1]);
console.log('Índice 2 - D (condición):', newRow[2]);
console.log('Índice 3 - E (cuid):', newRow[3]);
console.log('Índice 4 - F (accesos):', newRow[4]);
console.log('Índice 5 - L (dni):', newRow[5]);
console.log('Índice 6 - M (apellidos):', newRow[6]);
console.log('Índice 7 - N (nombres):', newRow[7]);
console.log('Índice 8 - P:', newRow[8]);
console.log('Índice 9 - R:', newRow[9]);

console.log('\n=== VALORES ÚNICOS DE CONDICIÓN (columna D) ===');
const condiciones = new Set();
jsonData.slice(2).forEach(row => {
  if (row[3]) condiciones.add(row[3]);
});
console.log('Total de valores únicos:', condiciones.size);
Array.from(condiciones).sort().forEach(val => {
  console.log('-', val);
});
