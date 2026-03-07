import * as XLSX from 'xlsx';

// Valores permitidos en la columna de accesos (valores REALES del archivo)
const ALLOWED_ACCESS_VALUES = [
  "0207-1-01 PEPIS PV1 - Molinete- Entrada Vehicular Personal - IN",
  "0207-1-03 PEPIS PV1 - Molinete PA03 - IN",
  "0207-1-05 PEPIS PV1 - Molinete PA02 - IN",
  "0207-1-07 PEPIS PV1 - Molinete PA04 - IN"
];

interface ExcelRow {
  fecha: string;
  hora: string;
  condicion: string;
  cuid: string;
  accesos: string;
  dni: string;
  apellidos: string;
  nombres: string;
  empresa: string;
  [key: string]: any;
}

export function processExcelFile(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
        // Obtener la primera hoja
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convertir a JSON desde la fila 1 (fila 1 está vacía, fila 2 tiene headers parciales, datos desde fila 3)
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1,
          defval: '',
          raw: false 
        });

        // Paso 1: Eliminar columnas S(18), Q(16), O(14), K(10), J(9), I(8), H(7), G(6), C(2)
        // Se mantiene D que es la condición correcta (PLUSPETROL PISCO, CONTRATISTA, etc.)
        // Ordenar en orden descendente para no afectar los índices al eliminar
        const columnsToDelete = [18, 16, 14, 10, 9, 8, 7, 6, 2].sort((a, b) => b - a);
        
        const processedData = jsonData.map((row: any[]) => {
          const newRow = [...row];
          columnsToDelete.forEach(colIndex => {
            newRow.splice(colIndex, 1);
          });
          return newRow;
        });

        // Paso 2: Nombrar headers en la fila 2 (índice 1)
        // Después de eliminar C, G, H, I, J, K, O, Q, S
        // Quedan: A(0), B(1), D(2), E(3), F(4), L(5), M(6), N(7), P(8), R(9)
        // Mapeamos: A=fecha, B=hora, D=condición, E=cuid, F=accesos, L=dni, M=apellidos, N=nombres, P=empresa
        if (processedData.length > 1) {
          processedData[1] = [
            'fecha',      // A (0)
            'hora',       // B (1)
            'condicion',  // D (2) - PLUSPETROL PISCO, CONTRATISTA, etc.
            'cuid',       // E (3)
            'accesos',    // F (4)
            'dni',        // L (5)
            'apellidos',  // M (6)
            'nombres',    // N (7)
            'empresa'     // P (8) - nombre de la empresa
          ];
        }

        // Convertir a objetos con headers (empezar desde fila 3, índice 2)
        const headers = processedData[1] as string[];
        const dataRows = processedData.slice(2).map((row: any[]) => {
          const obj: any = {};
          headers.forEach((header, index) => {
            obj[header] = row[index] || '';
          });
          return obj as ExcelRow;
        });

        // Paso 3: Filtrar por columna accesos - solo mantener valores permitidos
        let filteredData = dataRows.filter((row) => 
          ALLOWED_ACCESS_VALUES.includes(row.accesos)
        );

        // Paso 4: Eliminar filas donde la columna nombres esté vacía
        filteredData = filteredData.filter((row) => 
          row.nombres && row.nombres.trim() !== ''
        );

        // Paso 5: Ordenar de menor a mayor por HORA
        filteredData.sort((a, b) => {
          const horaA = a.hora || '';
          const horaB = b.hora || '';
          return horaA.localeCompare(horaB);
        });

        // Paso 6: Eliminar duplicados por DNI (mantener la primera ocurrencia = registro más antiguo)
        const seenDNI = new Set<string>();
        filteredData = filteredData.filter((row) => {
          if (seenDNI.has(row.dni)) {
            return false;
          }
          seenDNI.add(row.dni);
          return true;
        });

        // Convertir de vuelta a formato de array para exportar
        const finalData = [
          headers,
          ...filteredData.map(row => headers.map(header => row[header]))
        ];

        // Crear nuevo workbook
        const newWorkbook = XLSX.utils.book_new();
        const newWorksheet = XLSX.utils.aoa_to_sheet(finalData);
        
        // Ajustar ancho de columnas
        const columnWidths = headers.map(() => ({ wch: 20 }));
        newWorksheet['!cols'] = columnWidths;

        XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Datos Procesados');

        // Exportar a archivo
        const excelBuffer = XLSX.write(newWorkbook, { 
          bookType: 'xlsx', 
          type: 'array' 
        });
        
        const blob = new Blob([excelBuffer], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
        
        resolve(blob);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
}
