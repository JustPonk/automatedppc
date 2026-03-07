const XLSX = require('xlsx');
const fs = require('fs');

// Leer el archivo
const workbook = XLSX.readFile('asda.xls');

// Obtener la primera hoja
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

console.log('=== ANÁLISIS DEL ARCHIVO EXCEL ===\n');
console.log('Nombre de la hoja:', sheetName);
console.log('\n=== RANGO DE DATOS ===');
console.log('Rango:', worksheet['!ref']);

// Convertir a JSON para ver la estructura
const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
  header: 1,
  defval: '',
  raw: false 
});

console.log('\n=== PRIMERAS 5 FILAS (estructura original) ===');
jsonData.slice(0, 5).forEach((row, index) => {
  console.log(`\nFila ${index + 1} (tiene ${row.length} columnas):`);
  row.forEach((cell, colIndex) => {
    const colLetter = String.fromCharCode(65 + colIndex);
    if (cell) console.log(`  ${colLetter}: ${cell}`);
  });
});

console.log('\n=== TODAS LAS COLUMNAS EN FILA 1 ===');
if (jsonData[0]) {
  jsonData[0].forEach((cell, index) => {
    const colLetter = String.fromCharCode(65 + index);
    console.log(`${colLetter} (${index}): ${cell || '(vacío)'}`);
  });
}

console.log('\n=== TODAS LAS COLUMNAS EN FILA 2 ===');
if (jsonData[1]) {
  jsonData[1].forEach((cell, index) => {
    const colLetter = String.fromCharCode(65 + index);
    console.log(`${colLetter} (${index}): ${cell || '(vacío)'}`);
  });
}

console.log('\n=== MUESTRA DE COLUMNA DE ACCESOS (columna F antes de borrar) ===');
// Después de borrar columnas, necesito ver qué columna es "accesos"
console.log('Primeras 10 filas con todas las columnas:');
jsonData.slice(0, 10).forEach((row, index) => {
  console.log(`\nFila ${index + 1}:`);
  console.log('  Todas las celdas:', JSON.stringify(row.slice(0, 20)));
});

console.log('\n=== TOTAL DE FILAS ===');
console.log('Total de filas:', jsonData.length);
