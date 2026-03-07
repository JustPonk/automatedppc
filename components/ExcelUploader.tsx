'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { processExcelFile } from '@/lib/excelProcessor';
import { saveAs } from 'file-saver';

export default function ExcelUploader() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setIsProcessing(true);
    setError(null);
    setSuccess(false);

    try {
      // Procesar el archivo Excel
      const processedBlob = await processExcelFile(file);

      // Generar nombre de archivo con fecha
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `procesado_${timestamp}.xlsx`;

      // Descargar el archivo procesado
      saveAs(processedBlob, fileName);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error('Error procesando el archivo:', err);
      setError('Error al procesar el archivo. Verifica que el formato sea correcto.');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1,
    multiple: false
  });

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Procesador de Excel Automatizado</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Sube tu archivo Excel y se procesará automáticamente según las reglas establecidas
        </p>
      </div>

      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
          transition-colors duration-200 ease-in-out
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
            : 'border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600'
          }
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} disabled={isProcessing} />
        
        <div className="flex flex-col items-center gap-4">
          <svg 
            className="w-16 h-16 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
            />
          </svg>
          
          {isProcessing ? (
            <div className="space-y-2">
              <p className="text-lg font-medium">Procesando archivo...</p>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            </div>
          ) : isDragActive ? (
            <p className="text-lg font-medium text-blue-600 dark:text-blue-400">
              Suelta el archivo aquí
            </p>
          ) : (
            <div className="space-y-2">
              <p className="text-lg font-medium">
                Arrastra un archivo Excel aquí o haz clic para seleccionar
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Formatos soportados: .xlsx, .xls
              </p>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200 font-medium">Error</p>
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-green-800 dark:text-green-200 font-medium">¡Éxito!</p>
          <p className="text-green-600 dark:text-green-400 text-sm">
            El archivo se ha procesado y descargado correctamente
          </p>
        </div>
      )}

      <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <h2 className="text-lg font-semibold mb-3">Procesamiento automático incluye:</h2>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✓</span>
            <span>Eliminación de columnas innecesarias (S, Q, O, K, J, I, H, G, C)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✓</span>
            <span>Renombrado de headers: fecha, hora, condición, cuid, accesos, dni, apellidos, nombres, empresa</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✓</span>
            <span>Filtrado de accesos permitidos (01, 03, 05, 07 PEPIS PV1 Molinetes)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✓</span>
            <span>Eliminación de filas con nombres vacíos</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✓</span>
            <span>Eliminación de duplicados por DNI</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✓</span>
            <span>Ordenamiento por hora (menor a mayor)</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
