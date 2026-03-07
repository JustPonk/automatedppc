const XLSX = require('xlsx');
const fs = require('fs');

// Leer archivo
const workbook = XLSX.readFile('onguard.xls');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

console.log('=== INICIANDO PROCESAMIENTO ONGUARD ===\n');
console.log('Nombre de la hoja:', sheetName);

// Convertir a JSON (todas las filas)
const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
  header: 1,
  defval: '',
  raw: false 
});

console.log('Total de filas originales:', jsonData.length);

// Paso 1: Eliminar las primeras 13 filas
const dataAfterDelete = jsonData.slice(13);
console.log('\n=== DESPUÉS DE ELIMINAR PRIMERAS 13 FILAS ===');
console.log('Filas restantes:', dataAfterDelete.length);
console.log('Primera fila visible:', JSON.stringify(dataAfterDelete[0]));

// Paso 2: Buscar "Total Events..." en columna A (índice 0)
let totalEventsIndex = -1;
for (let i = 0; i < dataAfterDelete.length; i++) {
  const cellValue = dataAfterDelete[i][0] || '';
  if (cellValue.toString().includes('Total Events')) {
    totalEventsIndex = i;
    console.log(`\n=== ENCONTRADO "Total Events..." EN FILA ${i + 1} ===`);
    console.log('Contenido:', cellValue);
    break;
  }
}

// Paso 3: Eliminar desde "Total Events..." hacia abajo
let cleanedData;
if (totalEventsIndex > -1) {
  cleanedData = dataAfterDelete.slice(0, totalEventsIndex);
  console.log(`Filas eliminadas desde Total Events: ${dataAfterDelete.length - totalEventsIndex}`);
} else {
  cleanedData = dataAfterDelete;
  console.log('No se encontró "Total Events...", manteniendo todos los datos');
}

console.log('Filas después de limpiar:', cleanedData.length);

// Paso 4: Seleccionar solo columnas B(1), D(3), J(9), L(11)
const selectedColumns = cleanedData.map(row => {
  return [
    row[1] || '',  // Columna B
    row[3] || '',  // Columna D
    row[9] || '',  // Columna J
    row[11] || ''  // Columna L
  ];
});

console.log('\n=== DESPUÉS DE SELECCIONAR COLUMNAS B, D, J, L ===');
console.log('Primeras 5 filas:');
selectedColumns.slice(0, 5).forEach((row, i) => {
  console.log(`Fila ${i + 1}:`, JSON.stringify(row));
});

// Paso 5: Identificar el header (primera fila no vacía)
let headerRow = null;
let dataStartIndex = 0;

for (let i = 0; i < selectedColumns.length; i++) {
  const row = selectedColumns[i];
  const hasContent = row.some(cell => cell && cell.toString().trim() !== '');
  if (hasContent) {
    headerRow = row;
    dataStartIndex = i + 1;
    console.log('\n=== HEADER IDENTIFICADO EN FILA', i + 1, '===');
    console.log('Headers originales:', JSON.stringify(headerRow));
    break;
  }
}

// Usar headers específicos para la tabla
const headers = ['hora', 'acceso', 'codigo', 'nombre'];
const dataRows = selectedColumns.slice(dataStartIndex);

console.log('\n=== DATOS SIN HEADER ===');
console.log('Total de filas de datos:', dataRows.length);
console.log('Headers de tabla:', JSON.stringify(headers));
console.log('Primeras 3 filas:');
dataRows.slice(0, 3).forEach((row, i) => {
  console.log(`${i + 1}:`, JSON.stringify(row));
});

// Convertir a objetos
const dataObjects = dataRows.map(row => ({
  hora: row[0] || '',
  acceso: row[1] || '',
  codigo: row[2] || '',
  nombre: row[3] || ''
}));

// Filtrar filas vacías
const nonEmptyData = dataObjects.filter(row => 
  row.hora || row.acceso || row.codigo || row.nombre
);

console.log('\n=== DESPUÉS DE ELIMINAR FILAS VACÍAS ===');
console.log('Filas con datos:', nonEmptyData.length);

// Función para convertir hora a minutos desde medianoche para comparación
const timeToMinutes = (timeStr) => {
  try {
    // Intentar extraer hora y minutos del formato HH:MM o HH:MM:SS
    const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
    if (!timeMatch) return 0;
    
    let hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    
    // Manejar formato AM/PM si existe
    if (/PM/i.test(timeStr) && hours < 12) {
      hours += 12;
    } else if (/AM/i.test(timeStr) && hours === 12) {
      hours = 0;
    }
    
    return hours * 60 + minutes;
  } catch {
    return 0;
  }
};

// Paso 6: Ordenar de menor a mayor por hora (numéricamente)
let sortedData = [...nonEmptyData];
sortedData.sort((a, b) => {
  const timeA = timeToMinutes(a.hora || '');
  const timeB = timeToMinutes(b.hora || '');
  return timeA - timeB;
});

console.log('\n=== DESPUÉS DE ORDENAR POR HORA (menor a mayor - NUMÉRICO) ===');
console.log('Primeras 10:');
sortedData.slice(0, 10).forEach((row, i) => {
  const mins = timeToMinutes(row.hora);
  console.log(`${i + 1}.`, row.hora, `(${mins}min)`, '|', row.codigo, '|', row.nombre);
});

// Paso 7: Eliminar duplicados por codigo (conserva el primero = hora más temprana)
const beforeDuplicates = sortedData.length;
const seenCodigo = new Set();
sortedData = sortedData.filter(row => {
  const key = (row.codigo || '').toString().trim();
  if (!key || seenCodigo.has(key)) {
    return false;
  }
  seenCodigo.add(key);
  return true;
});

console.log('\n=== DESPUÉS DE ELIMINAR DUPLICADOS POR CODIGO ===');
console.log(`Filas únicas: ${sortedData.length} (duplicados eliminados: ${beforeDuplicates - sortedData.length})`);
console.log('Primeras 5 filas finales:');
sortedData.slice(0, 5).forEach((row, i) => {
  console.log(`${i + 1}.`, row.hora, '|', row.acceso, '|', row.codigo, '|', row.nombre);
});

// Guardar resultado
const finalData = [
  headers,
  ...sortedData.map(row => [row.hora, row.acceso, row.codigo, row.nombre])
];

const newWorkbook = XLSX.utils.book_new();
const newWorksheet = XLSX.utils.aoa_to_sheet(finalData);
const columnWidths = headers.map(() => ({ wch: 20 }));
newWorksheet['!cols'] = columnWidths;
XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'OnGuard Procesado');
XLSX.writeFile(newWorkbook, 'onguard-result.xlsx');

console.log('\n=== RESULTADO FINAL ===');
console.log(`Total de filas en archivo procesado: ${sortedData.length}`);
console.log('\n✓ Archivo generado: onguard-result.xlsx');
