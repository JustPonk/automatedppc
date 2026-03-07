import * as XLSX from 'xlsx';

interface OnGuardRow {
  hora: string;
  acceso: string;
  codigo: string;
  nombre: string;
  [key: string]: any;
}

export function processOnGuardFile(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });

        // Obtener la primera hoja
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convertir a array de arrays
        const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1,
          defval: '',
          raw: false 
        });

        // Paso 1: Eliminar las primeras 13 filas
        let processedData = jsonData.slice(13);

        // Paso 2: Buscar "Total Events..." en columna A y eliminar desde ahí hacia abajo
        let totalEventsIndex = -1;
        for (let i = 0; i < processedData.length; i++) {
          const cellValue = processedData[i][0] || '';
          if (cellValue.toString().includes('Total Events')) {
            totalEventsIndex = i;
            break;
          }
        }

        if (totalEventsIndex > -1) {
          processedData = processedData.slice(0, totalEventsIndex);
        }

        // Paso 3: Seleccionar solo columnas B(1), D(3), J(9), L(11)
        const selectedColumns = processedData.map(row => [
          row[1] || '',  // Columna B
          row[3] || '',  // Columna D
          row[9] || '',  // Columna J
          row[11] || ''  // Columna L
        ]);

        // Paso 4: Identificar donde empiezan los datos (saltar headers si existen)
        let dataStartIndex = 0;

        for (let i = 0; i < selectedColumns.length; i++) {
          const row = selectedColumns[i];
          const hasContent = row.some(cell => cell && cell.toString().trim() !== '');
          if (hasContent) {
            dataStartIndex = i + 1; // Saltar la primera fila con contenido (header original)
            break;
          }
        }

        // Usar headers específicos para la tabla
        const headers = ['hora', 'acceso', 'codigo', 'nombre'];
        const dataRows = selectedColumns.slice(dataStartIndex);

        // Paso 5: Convertir a objetos y filtrar filas vacías
        let dataObjects: OnGuardRow[] = dataRows
          .map(row => ({
            hora: (row[0] || '').toString().trim(),
            acceso: (row[1] || '').toString().trim(),
            codigo: (row[2] || '').toString().trim(),
            nombre: (row[3] || '').toString().trim()
          }))
          .filter(row => row.hora || row.acceso || row.codigo || row.nombre);

        // Función para convertir hora a minutos desde medianoche para comparación
        const timeToMinutes = (timeStr: string): number => {
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

        // Paso 6: Ordenar de menor a mayor por hora
        dataObjects.sort((a, b) => {
          const timeA = timeToMinutes(a.hora);
          const timeB = timeToMinutes(b.hora);
          return timeA - timeB;
        });

        // Paso 7: Eliminar duplicados por codigo (conserva el primero = hora más temprana)
        const seenCodigo = new Set<string>();
        dataObjects = dataObjects.filter(row => {
          const key = row.codigo;
          if (!key || seenCodigo.has(key)) {
            return false;
          }
          seenCodigo.add(key);
          return true;
        });

        // Convertir de vuelta a formato de array para exportar
        const finalData = [
          headers,
          ...dataObjects.map(row => [row.hora, row.acceso, row.codigo, row.nombre])
        ];

        // Crear nuevo workbook
        const newWorkbook = XLSX.utils.book_new();
        const newWorksheet = XLSX.utils.aoa_to_sheet(finalData);
        
        // Ajustar anchos de columna
        const columnWidths = headers.map(() => ({ wch: 20 }));
        newWorksheet['!cols'] = columnWidths;

        XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'OnGuard Procesado');

        // Convertir a blob
        const wbout = XLSX.write(newWorkbook, { 
          bookType: 'xlsx', 
          type: 'array' 
        });
        
        const blob = new Blob([wbout], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });

        resolve(blob);
      } catch (error) {
        console.error('Error procesando archivo OnGuard:', error);
        reject(error);
      }
    };

    reader.onerror = (error) => {
      console.error('Error leyendo archivo:', error);
      reject(error);
    };

    reader.readAsBinaryString(file);
  });
}
