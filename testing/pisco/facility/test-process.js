const XLSX = require('xlsx');
const fs = require('fs');

// Valores permitidos en la columna de accesos
const ALLOWED_ACCESS_VALUES = [
  "0207-1-01 PEPIS PV1 - Molinete- Entrada Vehicular Personal - IN",
  "0207-1-03 PEPIS PV1 - Molinete PA03 - IN",
  "0207-1-05 PEPIS PV1 - Molinete PA02 - IN",
  "0207-1-07 PEPIS PV1 - Molinete PA04 - IN"
];

// Leer archivo
const workbook = XLSX.readFile('asda.xls');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Convertir a JSON
const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
  header: 1,
  defval: '',
  raw: false 
});

console.log('=== INICIANDO PROCESAMIENTO ===\n');
console.log('Total de filas originales:', jsonData.length);

// Eliminar columnas S(18), Q(16), O(14), K(10), J(9), I(8), H(7), G(6), C(2)
const columnsToDelete = [18, 16, 14, 10, 9, 8, 7, 6, 2].sort((a, b) => b - a);

const processedData = jsonData.map((row) => {
  const newRow = [...row];
  columnsToDelete.forEach(colIndex => {
    newRow.splice(colIndex, 1);
  });
  return newRow;
});

console.log('Columnas después de eliminar:', processedData[2].length);

// Nombrar headers en fila 2
if (processedData.length > 1) {
  processedData[1] = ['fecha', 'hora', 'condicion', 'cuid', 'accesos', 'dni', 'apellidos', 'nombres', 'empresa'];
}

console.log('\n=== HEADERS ===');
console.log(processedData[1].join(' | '));

// Convertir a objetos
const headers = processedData[1];
const dataRows = processedData.slice(2).map((row) => {
  const obj = {};
  headers.forEach((header, index) => {
    obj[header] = row[index] || '';
  });
  return obj;
});

console.log('\n=== MUESTRA DE DATOS (primeras 3 filas) ===');
dataRows.slice(0, 3).forEach((row, i) => {
  console.log(`\nFila ${i + 1}:`);
  console.log(JSON.stringify(row, null, 2));
});

// Filtrar por accesos
let filteredData = dataRows.filter((row) => 
  ALLOWED_ACCESS_VALUES.includes(row.accesos)
);

console.log(`\n=== DESPUÉS DE FILTRAR POR ACCESOS ===`);
console.log(`Filas que cumplen con accesos permitidos: ${filteredData.length}`);

// Eliminar nombres vacíos
const beforeNameFilter = filteredData.length;
filteredData = filteredData.filter((row) => 
  row.nombres && row.nombres.trim() !== ''
);
console.log(`Filas después de eliminar nombres vacíos: ${filteredData.length} (eliminadas: ${beforeNameFilter - filteredData.length})`);

// Ordenar por hora (menor a mayor)
filteredData.sort((a, b) => {
  const horaA = a.hora || '';
  const horaB = b.hora || '';
  return horaA.localeCompare(horaB);
});

console.log('\n=== ORDENADO POR HORA (menor a mayor) - Primeras 3 ===');
filteredData.slice(0, 3).forEach((row, i) => {
  console.log(`${i + 1}. ${row.fecha} ${row.hora} - ${row.nombres} ${row.apellidos} (DNI: ${row.dni}) - Empresa: ${row.empresa}`);
});

// Eliminar duplicados por DNI (mantiene primer registro = más antiguo)
const beforeDuplicates = filteredData.length;
const seenDNI = new Set();
filteredData = filteredData.filter((row) => {
  if (seenDNI.has(row.dni)) {
    return false;
  }
  seenDNI.add(row.dni);
  return true;
});
console.log(`\n=== DESPUÉS DE ELIMINAR DUPLICADOS POR DNI ===`);
console.log(`Filas únicas: ${filteredData.length} (duplicados eliminados: ${beforeDuplicates - filteredData.length})`);

console.log('\n=== ORDENADO POR HORA (menor a mayor) - Primeras 5 ===');
filteredData.slice(0, 5).forEach((row, i) => {
  console.log(`${i + 1}. ${row.fecha} ${row.hora} - ${row.nombres} ${row.apellidos} (DNI: ${row.dni}) - Empresa: ${row.empresa}`);
});

console.log('\n=== RESULTADO FINAL ===');
console.log(`Total de filas en archivo procesado: ${filteredData.length}`);

// Guardar resultado
const finalData = [
  headers,
  ...filteredData.map(row => headers.map(header => row[header]))
];

const newWorkbook = XLSX.utils.book_new();
const newWorksheet = XLSX.utils.aoa_to_sheet(finalData);
const columnWidths = headers.map(() => ({ wch: 25 }));
newWorksheet['!cols'] = columnWidths;
XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Datos Procesados');
XLSX.writeFile(newWorkbook, 'test-result.xlsx');

console.log('\n✓ Archivo generado: test-result.xlsx');
