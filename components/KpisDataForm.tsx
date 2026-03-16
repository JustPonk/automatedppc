'use client';

import { useEffect, useState } from 'react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import {
  KPI_EXERCISE_OPTIONS,
  KPI_MONTH_OPTIONS,
  type KpiCatalogData,
  type KpiDetailRow,
  type KpiExercise,
  type KpiMonth,
} from '@/lib/kpisBudgetConstants';

interface KpisDataFormProps {
  catalog: KpiCatalogData;
}

interface DraftRow {
  ejercicio: KpiExercise;
  mes: KpiMonth;
  year: number;
  site: string;
  subgrupo: string;
  actividad: string;
  montoUsd: string;
}

interface AggregateRow {
  key: string;
  sample: KpiDetailRow;
  count: number;
  totalUsd: number;
  totalSoles: number;
}

function getDefaultMonth(): KpiMonth {
  return KPI_MONTH_OPTIONS[new Date().getMonth()] ?? 'Ene';
}

function roundTo(value: number, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function buildFileName() {
  const today = new Date().toISOString().split('T')[0];
  return `kpis_data_${today}.xlsx`;
}

export default function KpisDataForm({ catalog }: KpisDataFormProps) {
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from(new Set([...catalog.years, currentYear])).sort((left, right) => left - right);
  const defaultSite = catalog.sites[0]?.name ?? '';
  const [draft, setDraft] = useState<DraftRow>({
    ejercicio: 'Budget',
    mes: getDefaultMonth(),
    year: currentYear,
    site: defaultSite,
    subgrupo: '',
    actividad: '',
    montoUsd: '',
  });
  const [rows, setRows] = useState<KpiDetailRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const selectedSite = catalog.sites.find((site) => site.name === draft.site) ?? null;
  const availableSubgroups = selectedSite?.subgroups ?? [];
  const selectedSubgroup = availableSubgroups.find((subgroup) => subgroup.name === draft.subgrupo) ?? null;
  const availableActivities = selectedSubgroup?.activities ?? [];
  const montoUsd = Number(draft.montoUsd);
  const montoSoles = Number.isFinite(montoUsd) ? roundTo(montoUsd * catalog.exchangeRate, 3) : 0;

  useEffect(() => {
    if (!selectedSite) {
      return;
    }

    const nextSubgroup = selectedSite.subgroups[0]?.name ?? '';
    setDraft((currentDraft) => {
      if (currentDraft.site !== selectedSite.name) {
        return currentDraft;
      }

      if (currentDraft.subgrupo && selectedSite.subgroups.some((subgroup) => subgroup.name === currentDraft.subgrupo)) {
        return currentDraft;
      }

      return {
        ...currentDraft,
        subgrupo: nextSubgroup,
        actividad: selectedSite.subgroups[0]?.activities[0] ?? '',
      };
    });
  }, [selectedSite]);

  useEffect(() => {
    if (!selectedSubgroup) {
      return;
    }

    const nextActivity = selectedSubgroup.activities[0] ?? '';
    setDraft((currentDraft) => {
      if (currentDraft.subgrupo !== selectedSubgroup.name) {
        return currentDraft;
      }

      if (currentDraft.actividad && selectedSubgroup.activities.includes(currentDraft.actividad)) {
        return currentDraft;
      }

      return {
        ...currentDraft,
        actividad: nextActivity,
      };
    });
  }, [selectedSubgroup]);

  const handleChange = <Key extends keyof DraftRow>(field: Key, value: DraftRow[Key]) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [field]: value,
    }));

    setError(null);
    setSuccess(null);
  };

  const handleSaveRow = () => {
    if (!draft.site || !draft.subgrupo || !draft.actividad) {
      setError('Completa site, subgrupo y actividad antes de guardar.');
      setSuccess(null);
      return;
    }

    if (!draft.montoUsd || Number.isNaN(montoUsd) || montoUsd < 0) {
      setError('Ingresa un monto USD valido.');
      setSuccess(null);
      return;
    }

    const nextRow: KpiDetailRow = {
      ejercicio: draft.ejercicio,
      subgrupo: draft.subgrupo,
      mes: draft.mes,
      year: draft.year,
      site: draft.site,
      actividad: draft.actividad,
      montoUsd: roundTo(montoUsd, 3),
      montoSoles,
    };

    setRows((currentRows) => [...currentRows, nextRow]);
    setDraft((currentDraft) => ({
      ...currentDraft,
      montoUsd: '',
    }));
    setError(null);
    setSuccess('Fila guardada. Puedes seguir agregando registros.');
  };

  const handleMontoKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSaveRow();
    }
  };

  const handleExport = () => {
    if (rows.length === 0) {
      setError('Guarda al menos una fila antes de generar el XLSX.');
      setSuccess(null);
      return;
    }

    const worksheetData = [
      ['Ejercicio', 'Subgrupo', 'Mes', 'Año', 'Site', 'Actividad', 'Monto_USD', 'Monto_Soles', '', ''],
      ...rows.map((row) => [
        row.ejercicio.toUpperCase(),
        row.subgrupo,
        row.mes,
        row.year,
        row.site,
        row.actividad,
        row.montoUsd,
        row.montoSoles,
        '',
        '',
      ]),
    ];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    worksheet['!cols'] = [
      { wch: 16 },
      { wch: 28 },
      { wch: 10 },
      { wch: 10 },
      { wch: 12 },
      { wch: 48 },
      { wch: 14 },
      { wch: 14 },
      { wch: 4 },
      { wch: 4 },
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos Detallados');

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    saveAs(blob, buildFileName());
    setError(null);
    setSuccess('Archivo XLSX generado correctamente.');
  };

  const handleRemoveRow = (rowIndex: number) => {
    setRows((currentRows) => currentRows.filter((_, index) => index !== rowIndex));
    setError(null);
    setSuccess(null);
  };

  const aggregates: AggregateRow[] = rows.reduce((acc, row) => {
    const aggregateKey = [
      row.site,
      row.subgrupo,
      row.actividad,
      row.ejercicio,
      row.mes,
      row.year,
    ].join('||');

    const existing = acc.find((item) => item.key === aggregateKey);
    if (existing) {
      existing.count += 1;
      existing.totalUsd = roundTo(existing.totalUsd + row.montoUsd, 3);
      existing.totalSoles = roundTo(existing.totalSoles + row.montoSoles, 3);
    } else {
      acc.push({
        key: aggregateKey,
        sample: row,
        count: 1,
        totalUsd: row.montoUsd,
        totalSoles: row.montoSoles,
      });
    }
    return acc;
  }, [] as AggregateRow[]);

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-6 flex flex-col gap-4 border-b border-gray-200 pb-6 dark:border-gray-800 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-600 dark:text-amber-400">
              Formulario detallado
            </p>
            <h2 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
              KPIS data
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-gray-600 dark:text-gray-400">
              Completa los datos de cada fila y genera una hoja XLSX con el formato del consolidado base.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSaveRow}
              className="rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600"
            >
              Guardar fila
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
            >
              Generar XLSX
            </button>
            <button
              type="button"
              disabled
              className="rounded-xl border border-dashed border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-500 opacity-70 dark:border-gray-700 dark:text-gray-400"
            >
              Agregar nueva actividad
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="space-y-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">SITE</span>
            <select
              value={draft.site}
              onChange={(event) => handleChange('site', event.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-amber-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
            >
              {catalog.sites.map((site) => (
                <option key={site.name} value={site.name}>
                  {site.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Subgrupo</span>
            <select
              value={draft.subgrupo}
              onChange={(event) => handleChange('subgrupo', event.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-amber-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
            >
              {availableSubgroups.map((subgroup) => (
                <option key={subgroup.name} value={subgroup.name}>
                  {subgroup.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Actividad</span>
            <select
              value={draft.actividad}
              onChange={(event) => handleChange('actividad', event.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-amber-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
            >
              {availableActivities.map((activity) => (
                <option key={activity} value={activity}>
                  {activity}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Monto USD</span>
            <input
              type="number"
              min="0"
              step="0.001"
              value={draft.montoUsd}
              onChange={(event) => handleChange('montoUsd', event.target.value)}
              onKeyDown={handleMontoKeyDown}
              placeholder="0.000"
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-amber-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Ejercicio</span>
            <select
              value={draft.ejercicio}
              onChange={(event) => handleChange('ejercicio', event.target.value as KpiExercise)}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-amber-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
            >
              {KPI_EXERCISE_OPTIONS.map((exercise) => (
                <option key={exercise} value={exercise}>
                  {exercise}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Mes</span>
            <select
              value={draft.mes}
              onChange={(event) => handleChange('mes', event.target.value as KpiMonth)}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-amber-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
            >
              {KPI_MONTH_OPTIONS.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Año</span>
            <select
              value={draft.year}
              onChange={(event) => handleChange('year', Number(event.target.value))}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-amber-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>

          <div className="space-y-2 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 dark:border-amber-900/60 dark:bg-amber-950/30">
            <span className="text-sm font-medium text-amber-900 dark:text-amber-200">Monto Soles</span>
            <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
              {montoSoles.toLocaleString('en-US', {
                minimumFractionDigits: 3,
                maximumFractionDigits: 3,
              })}
            </p>
            <p className="text-xs text-amber-800/80 dark:text-amber-200/80">
              Calculado automaticamente con TC {catalog.exchangeRate}
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-950">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Origen de catalogo</p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{catalog.sourceFileName}</p>
          </div>
          <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-950">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Subgrupos disponibles</p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{availableSubgroups.length}</p>
          </div>
          <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-950">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Actividades del subgrupo</p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{availableActivities.length}</p>
          </div>
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300">
            {success}
          </div>
        ) : null}
      </section>

      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-2 border-b border-gray-200 pb-4 dark:border-gray-800 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Filas guardadas</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Cada guardado agrega una nueva fila al XLSX final.
            </p>
          </div>
          <div className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            {rows.length} registros
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
            <thead>
              <tr className="text-left text-gray-500 dark:text-gray-400">
                <th className="px-3 py-3 font-medium">Ejercicio</th>
                <th className="px-3 py-3 font-medium">Subgrupo</th>
                <th className="px-3 py-3 font-medium">Mes</th>
                <th className="px-3 py-3 font-medium">Año</th>
                <th className="px-3 py-3 font-medium">SITE</th>
                <th className="px-3 py-3 font-medium">Actividad</th>
                <th className="px-3 py-3 font-medium">Monto USD</th>
                <th className="px-3 py-3 font-medium">Monto Soles</th>
                <th className="px-3 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-3 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    Aun no hay filas guardadas.
                  </td>
                </tr>
              ) : (
                rows.map((row, index) => (
                  <tr key={`${row.site}-${row.subgrupo}-${row.actividad}-${index}`} className="align-top">
                    <td className="px-3 py-3 text-gray-900 dark:text-white">{row.ejercicio}</td>
                    <td className="px-3 py-3 text-gray-600 dark:text-gray-300">{row.subgrupo}</td>
                    <td className="px-3 py-3 text-gray-600 dark:text-gray-300">{row.mes}</td>
                    <td className="px-3 py-3 text-gray-600 dark:text-gray-300">{row.year}</td>
                    <td className="px-3 py-3 text-gray-600 dark:text-gray-300">{row.site}</td>
                    <td className="px-3 py-3 text-gray-600 dark:text-gray-300">{row.actividad}</td>
                    <td className="px-3 py-3 text-gray-600 dark:text-gray-300">
                      {row.montoUsd.toLocaleString('en-US', {
                        minimumFractionDigits: 3,
                        maximumFractionDigits: 3,
                      })}
                    </td>
                    <td className="px-3 py-3 text-gray-600 dark:text-gray-300">
                      {row.montoSoles.toLocaleString('en-US', {
                        minimumFractionDigits: 3,
                        maximumFractionDigits: 3,
                      })}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(index)}
                        className="rounded-lg border border-red-200 px-3 py-1.5 font-medium text-red-600 transition hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/30"
                      >
                        Quitar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {aggregates.length > 0 && (
        <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-xl dark:border-amber-900/50 dark:bg-amber-950/20">
          <div className="flex flex-col gap-2 border-b border-amber-200 pb-4 dark:border-amber-900/40 md:flex-row md:items-end md:justify-between">
            <div>
              <h3 className="text-2xl font-bold text-amber-900 dark:text-amber-100">Repeticiones por actividad</h3>
              <p className="text-sm text-amber-900/80 dark:text-amber-200/80">
                Muestra cuántas veces se ingresó la misma combinación de SITE, Subgrupo, Actividad, Ejercicio, Mes y Año, sumando montos.
              </p>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-amber-200 text-sm dark:divide-amber-900/40">
              <thead>
                <tr className="text-left text-amber-900/80 dark:text-amber-200/80">
                  <th className="px-3 py-3 font-semibold">SITE</th>
                  <th className="px-3 py-3 font-semibold">Subgrupo</th>
                  <th className="px-3 py-3 font-semibold">Actividad</th>
                  <th className="px-3 py-3 font-semibold">Ejercicio</th>
                  <th className="px-3 py-3 font-semibold">Mes</th>
                  <th className="px-3 py-3 font-semibold">Año</th>
                  <th className="px-3 py-3 font-semibold">Veces</th>
                  <th className="px-3 py-3 font-semibold">Total USD</th>
                  <th className="px-3 py-3 font-semibold">Total Soles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100 dark:divide-amber-900/30">
                {aggregates.map((item) => (
                  <tr key={item.key} className="align-top">
                    <td className="px-3 py-3 text-amber-900 dark:text-amber-100">{item.sample.site}</td>
                    <td className="px-3 py-3 text-amber-900 dark:text-amber-100">{item.sample.subgrupo}</td>
                    <td className="px-3 py-3 text-amber-900 dark:text-amber-100">{item.sample.actividad}</td>
                    <td className="px-3 py-3 text-amber-900 dark:text-amber-100">{item.sample.ejercicio}</td>
                    <td className="px-3 py-3 text-amber-900 dark:text-amber-100">{item.sample.mes}</td>
                    <td className="px-3 py-3 text-amber-900 dark:text-amber-100">{item.sample.year}</td>
                    <td className="px-3 py-3 text-amber-900 dark:text-amber-100 font-semibold">{item.count}</td>
                    <td className="px-3 py-3 text-amber-900 dark:text-amber-100 font-semibold">
                      {item.totalUsd.toLocaleString('en-US', {
                        minimumFractionDigits: 3,
                        maximumFractionDigits: 3,
                      })}
                    </td>
                    <td className="px-3 py-3 text-amber-900 dark:text-amber-100">
                      {item.totalSoles.toLocaleString('en-US', {
                        minimumFractionDigits: 3,
                        maximumFractionDigits: 3,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
