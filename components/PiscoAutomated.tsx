'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { processExcelFile } from '@/lib/excelProcessor';
import { processOnGuardFile } from '@/lib/excelProcessorOnGuard';
import { saveAs } from 'file-saver';

type ProcessType = 'facility' | 'onguard';

export default function PiscoAutomated() {
  const [isProcessingFacility, setIsProcessingFacility] = useState(false);
  const [isProcessingOnGuard, setIsProcessingOnGuard] = useState(false);
  const [errorFacility, setErrorFacility] = useState<string | null>(null);
  const [errorOnGuard, setErrorOnGuard] = useState<string | null>(null);
  const [successFacility, setSuccessFacility] = useState(false);
  const [successOnGuard, setSuccessOnGuard] = useState(false);

  const onDropFacility = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setIsProcessingFacility(true);
    setErrorFacility(null);
    setSuccessFacility(false);

    try {
      // Procesar el archivo Excel
      const processedBlob = await processExcelFile(file);

      // Generar nombre de archivo con fecha
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `pisco_facility_${timestamp}.xlsx`;

      // Descargar el archivo procesado
      saveAs(processedBlob, fileName);

      setSuccessFacility(true);
      setTimeout(() => setSuccessFacility(false), 5000);
    } catch (err) {
      console.error('Error procesando el archivo:', err);
      setErrorFacility('Error al procesar el archivo. Verifica que el formato sea correcto.');
    } finally {
      setIsProcessingFacility(false);
    }
  }, []);

  const onDropOnGuard = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setIsProcessingOnGuard(true);
    setErrorOnGuard(null);
    setSuccessOnGuard(false);

    try {
      // Procesar el archivo Excel de OnGuard
      const processedBlob = await processOnGuardFile(file);

      // Generar nombre de archivo con fecha
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `pisco_onguard_${timestamp}.xlsx`;

      // Descargar el archivo procesado
      saveAs(processedBlob, fileName);
      
      setSuccessOnGuard(true);
      setTimeout(() => setSuccessOnGuard(false), 5000);
    } catch (err) {
      console.error('Error procesando el archivo:', err);
      setErrorOnGuard('Error al procesar el archivo. Verifica que el formato sea correcto.');
    } finally {
      setIsProcessingOnGuard(false);
    }
  }, []);

  const facilityDropzone = useDropzone({
    onDrop: onDropFacility,
    accept: {
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1,
    multiple: false
  });

  const onguardDropzone = useDropzone({
    onDrop: onDropOnGuard,
    accept: {
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1,
    multiple: false
  });

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="text-4xl">⚙️</div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Pisco Automated
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Procesamiento automático de archivos de accesos PEPIS PV1
        </p>
      </div>

      {/* Grid de dos columnas para Facility y OnGuard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        
        {/* Dropzone Facility */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white text-center">
            Facility
          </h2>
          
          <div
            {...facilityDropzone.getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
              transition-colors duration-200 ease-in-out
              ${facilityDropzone.isDragActive 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
                : 'border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600'
              }
              ${isProcessingFacility ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input {...facilityDropzone.getInputProps()} disabled={isProcessingFacility} />
            
            <div className="flex flex-col items-center gap-3">
              <svg 
                className="w-12 h-12 text-gray-400" 
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
              
              {isProcessingFacility ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Procesando...</p>
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  </div>
                </div>
              ) : facilityDropzone.isDragActive ? (
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  Suelta el archivo aquí
                </p>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    Arrastra archivo aquí
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    .xlsx, .xls
                  </p>
                </div>
              )}
            </div>
          </div>

          {errorFacility && (
            <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-200 font-medium text-sm">Error</p>
              <p className="text-red-600 dark:text-red-400 text-xs">{errorFacility}</p>
            </div>
          )}

          {successFacility && (
            <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-green-800 dark:text-green-200 font-medium text-sm">¡Éxito!</p>
              <p className="text-green-600 dark:text-green-400 text-xs">
                Archivo procesado y descargado
              </p>
            </div>
          )}
        </div>

        {/* Dropzone OnGuard */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white text-center">
            OnGuard
          </h2>
          
          <div
            {...onguardDropzone.getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
              transition-colors duration-200 ease-in-out
              ${onguardDropzone.isDragActive 
                ? 'border-green-500 bg-green-50 dark:bg-green-950' 
                : 'border-gray-300 dark:border-gray-700 hover:border-green-400 dark:hover:border-green-600'
              }
              ${isProcessingOnGuard ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input {...onguardDropzone.getInputProps()} disabled={isProcessingOnGuard} />
            
            <div className="flex flex-col items-center gap-3">
              <svg 
                className="w-12 h-12 text-gray-400" 
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
              
              {isProcessingOnGuard ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Procesando...</p>
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                  </div>
                </div>
              ) : onguardDropzone.isDragActive ? (
                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                  Suelta el archivo aquí
                </p>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    Arrastra archivo aquí
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    .xlsx, .xls
                  </p>
                </div>
              )}
            </div>
          </div>

          {errorOnGuard && (
            <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-200 font-medium text-sm">Error</p>
              <p className="text-red-600 dark:text-red-400 text-xs">{errorOnGuard}</p>
            </div>
          )}

          {successOnGuard && (
            <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-green-800 dark:text-green-200 font-medium text-sm">¡Éxito!</p>
              <p className="text-green-600 dark:text-green-400 text-xs">
                Archivo procesado y descargado
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-gray-50 dark:from-gray-800 dark:to-blue-900 rounded-lg border border-blue-200 dark:border-blue-800">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
          <span>📋</span>
          Procesamiento Facility incluye:
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✓</span>
            <span className="text-gray-700 dark:text-gray-300">
              Eliminación de columnas innecesarias (S, Q, O, K, J, I, H, G, C)
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✓</span>
            <span className="text-gray-700 dark:text-gray-300">
              Headers: fecha, hora, condición, cuid, accesos, dni, apellidos, nombres, empresa
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✓</span>
            <span className="text-gray-700 dark:text-gray-300">
              Filtrado de accesos PEPIS PV1 (01, 03, 05, 07 Molinetes)
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✓</span>
            <span className="text-gray-700 dark:text-gray-300">
              Eliminación de nombres vacíos
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✓</span>
            <span className="text-gray-700 dark:text-gray-300">
              Eliminación de duplicados por DNI (conserva primer ingreso)
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✓</span>
            <span className="text-gray-700 dark:text-gray-300">
              Ordenamiento por hora (menor a mayor)
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 p-6 bg-gradient-to-br from-green-50 to-gray-50 dark:from-gray-800 dark:to-green-900 rounded-lg border border-green-200 dark:border-green-800">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
          <span>🛡️</span>
          Procesamiento OnGuard incluye:
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✓</span>
            <span className="text-gray-700 dark:text-gray-300">
              Eliminación de las primeras 13 filas
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✓</span>
            <span className="text-gray-700 dark:text-gray-300">
              Eliminación desde "Total Events..." hacia abajo
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✓</span>
            <span className="text-gray-700 dark:text-gray-300">
              Selección de columnas B, D, J, L
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✓</span>
            <span className="text-gray-700 dark:text-gray-300">
              Conversión a tabla: hora, acceso, codigo, nombre
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✓</span>
            <span className="text-gray-700 dark:text-gray-300">
              Ordenamiento por hora (menor a mayor)
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✓</span>
            <span className="text-gray-700 dark:text-gray-300">
              Eliminación de duplicados por código (conserva hora más temprana)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
