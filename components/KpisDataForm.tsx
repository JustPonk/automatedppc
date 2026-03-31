'use client';

import { useEffect, useRef, useState } from 'react';
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
import { useAuth } from './auth/AuthProvider';

const STORAGE_CATALOG_KEY = 'kpis_catalog_state_v1';
const STORAGE_ROWS_KEY = 'kpis_rows_v1';
const STORAGE_TUTORIAL_SEEN_KEY = 'kpis_tutorial_seen_v1';

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

interface StoredCatalogState {
  sourceRevision: string;
  catalog: KpiCatalogData;
}

interface KpiTotalsCard {
  totalUsd: number;
  totalSoles: number;
  rows: number;
}

interface KpiSiteTotalRow {
  site: string;
  totalUsd: number;
  totalSoles: number;
  rows: number;
}

interface KpiSiteSubgroupTotalRow {
  site: string;
  subgrupo: string;
  totalUsd: number;
  totalSoles: number;
  rows: number;
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

function cloneCatalog(input: KpiCatalogData): KpiCatalogData {
  return {
    ...input,
    sites: input.sites.map((site) => ({
      name: site.name,
      subgroups: site.subgroups.map((sub) => ({ ...sub, activities: [...sub.activities] })),
    })),
  };
}

function loadStoredCatalog(fallback: KpiCatalogData): KpiCatalogData {
  if (typeof window === 'undefined') return cloneCatalog(fallback);
  try {
    const stored = window.localStorage.getItem(STORAGE_CATALOG_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as StoredCatalogState | KpiCatalogData;

      if ('catalog' in parsed && parsed.catalog?.sites?.length) {
        if (parsed.sourceRevision === fallback.sourceRevision) {
          return parsed.catalog;
        }
        return cloneCatalog(fallback);
      }

      // Compatibilidad con formato anterior sin versionado.
      if ('sites' in parsed && parsed?.sites?.length) {
        return cloneCatalog(fallback);
      }
    }
  } catch (err) {
    console.warn('No se pudo leer catalogo local', err);
  }
  return cloneCatalog(fallback);
}

function loadStoredRows(): KpiDetailRow[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = window.localStorage.getItem(STORAGE_ROWS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed as KpiDetailRow[];
    }
  } catch (err) {
    console.warn('No se pudo leer filas locales', err);
  }
  return [];
}

export default function KpisDataForm({ catalog }: KpisDataFormProps) {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from(new Set([...catalog.years, currentYear])).sort((left, right) => left - right);
  const [catalogState, setCatalogState] = useState<KpiCatalogData>(() => loadStoredCatalog(catalog));
  const defaultSite = catalogState.sites[0]?.name ?? '';
  const [draft, setDraft] = useState<DraftRow>({
    ejercicio: 'Budget',
    mes: getDefaultMonth(),
    year: currentYear,
    site: defaultSite,
    subgrupo: '',
    actividad: '',
    montoUsd: '',
  });
  const [rows, setRows] = useState<KpiDetailRow[]>(() => loadStoredRows());
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showNewActivity, setShowNewActivity] = useState(false);
  const [newSite, setNewSite] = useState(defaultSite);
  const [newSubgrupo, setNewSubgrupo] = useState('');
  const [newActividad, setNewActividad] = useState('');
  const [newSubgrupoName, setNewSubgrupoName] = useState('');
  const [showNewSubgrupoField, setShowNewSubgrupoField] = useState(false);
  const [activityExistsError, setActivityExistsError] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showActivitySuggestions, setShowActivitySuggestions] = useState(false);
  const [activityQuery, setActivityQuery] = useState('');
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showExportConfirm, setShowExportConfirm] = useState(false);
  const activityInputRef = useRef<HTMLInputElement>(null);

  const selectedSite = catalogState.sites.find((site) => site.name === draft.site) ?? null;
  const availableSubgroups = selectedSite?.subgroups ?? [];
  const selectedSubgroup = availableSubgroups.find((subgroup) => subgroup.name === draft.subgrupo) ?? null;
  const availableActivities = selectedSubgroup?.activities ?? [];
  const filteredActivities = availableActivities.filter((activity) =>
    activity.toLowerCase().includes((activityQuery || '').toLowerCase())
  );
  const montoUsd = Number(draft.montoUsd);
  const montoSoles = Number.isFinite(montoUsd) ? roundTo(montoUsd * catalog.exchangeRate, 3) : 0;
  const tutorialSteps = [
    {
      title: 'Selecciona el contexto',
      subtitle: 'SITE, Subgrupo y Actividad',
      description:
        'Inicia el registro eligiendo SITE, Subgrupo y Actividad. Este catalogo sale del consolidado base, asi evitas errores de tipado.',
      chips: ['SITE', 'Subgrupo', 'Actividad'],
      color: 'from-amber-500 to-orange-500',
    },
    {
      title: 'Carga el monto',
      subtitle: 'Monto USD y conversion',
      description:
        'Ingresa Monto USD. El sistema calcula automaticamente Monto Soles con el tipo de cambio configurado.',
      chips: ['Monto USD', `TC ${catalog.exchangeRate}`, 'Monto Soles'],
      color: 'from-emerald-500 to-teal-500',
    },
    {
      title: 'Define el periodo',
      subtitle: 'Ejercicio, Mes y Año',
      description:
        'Define si es Budget o Ejecutado, el mes y el año. Luego presiona Guardar fila para acumular registros.',
      chips: ['Ejercicio', 'Mes', 'Año'],
      color: 'from-sky-500 to-blue-500',
    },
    {
      title: 'Revisa y limpia filas',
      subtitle: 'Control de calidad antes de exportar',
      description:
        'Valida la tabla de filas guardadas. Puedes quitar registros individuales si detectas algun dato incorrecto.',
      chips: ['Tabla', 'Quitar', `${rows.length} registros`],
      color: 'from-fuchsia-500 to-rose-500',
    },
    {
      title: 'Genera el reporte final',
      subtitle: 'Exportar XLSX',
      description:
        'Cuando todo este listo, usa Generar Excel. Se crea una hoja Datos Detallados con el formato requerido, sin editar la estructura.',
      chips: ['Generar Excel', 'Datos Detallados', 'Formato fijo'],
      color: 'from-violet-500 to-indigo-500',
    },
  ] as const;
  const isLastTutorialStep = tutorialStep === tutorialSteps.length - 1;
  const tutorialProgress = ((tutorialStep + 1) / tutorialSteps.length) * 100;
  const activeTutorialStep = tutorialSteps[tutorialStep];

  useEffect(() => {
    setCatalogState(loadStoredCatalog(catalog));
  }, [catalog]);

  // Persistir catalogo y filas en localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const nextStoredState: StoredCatalogState = {
        sourceRevision: catalog.sourceRevision,
        catalog: catalogState,
      };
      window.localStorage.setItem(STORAGE_CATALOG_KEY, JSON.stringify(nextStoredState));
    } catch (err) {
      console.warn('No se pudo guardar catalogo local', err);
    }
  }, [catalog.sourceRevision, catalogState]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_ROWS_KEY, JSON.stringify(rows));
    } catch (err) {
      console.warn('No se pudo guardar filas locales', err);
    }
  }, [rows]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const hasSeenTutorial = window.localStorage.getItem(STORAGE_TUTORIAL_SEEN_KEY);
      if (!hasSeenTutorial) {
        setShowTutorial(true);
      }
    } catch (err) {
      console.warn('No se pudo leer estado del tutorial KPI', err);
    }
  }, []);

  // Asegurar site/subgrupo/actividad validos si cambia catalogo cargado
  useEffect(() => {
    if (!catalogState.sites.length) return;
    setDraft((currentDraft) => {
      const siteExists = catalogState.sites.some((s) => s.name === currentDraft.site);
      const nextSite = siteExists ? currentDraft.site : catalogState.sites[0].name;
      const siteEntry = catalogState.sites.find((s) => s.name === nextSite);
      const subgroupExists = siteEntry?.subgroups.some((sg) => sg.name === currentDraft.subgrupo);
      const nextSub = subgroupExists ? currentDraft.subgrupo : siteEntry?.subgroups[0]?.name ?? '';
      return {
        ...currentDraft,
        site: nextSite,
        subgrupo: nextSub,
      };
    });
  }, [catalogState.sites]);

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
        actividad: '',
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

      if (!currentDraft.actividad) {
        return currentDraft; // mantener vacío por defecto
      }

      if (selectedSubgroup.activities.includes(currentDraft.actividad)) {
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
      autor: user?.email || 'N/A',
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

  const handleActivityInputChange = (value: string) => {
    setActivityQuery(value);
    handleChange('actividad', value);
    setShowActivitySuggestions(true);
  };

  const handleSelectActivity = (value: string) => {
    handleChange('actividad', value);
    setActivityQuery(value);
    setShowActivitySuggestions(false);
  };

  const handleActivityKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && filteredActivities.length > 0) {
      event.preventDefault();
      handleSelectActivity(filteredActivities[0]);
    }
  };

  const handleClearActivityInput = () => {
    handleChange('actividad', '');
    setActivityQuery('');
    setShowActivitySuggestions(false);
    setTimeout(() => {
      activityInputRef.current?.focus();
    }, 0);
  };

  const handleToggleActivitySuggestions = () => {
    if (showActivitySuggestions) {
      setShowActivitySuggestions(false);
      return;
    }

    setActivityQuery('');
    setShowActivitySuggestions(true);
    setTimeout(() => {
      activityInputRef.current?.focus();
    }, 0);
  };

  const handleOpenExportConfirm = () => {
    if (rows.length === 0) {
      setError('Guarda al menos una fila antes de generar el XLSX.');
      setSuccess(null);
      return;
    }

    setShowExportConfirm(true);
    setError(null);
  };

  const handleCloseExportConfirm = () => {
    setShowExportConfirm(false);
  };

  const handleConfirmExport = () => {
    if (rows.length === 0) {
      setShowExportConfirm(false);
      setError('Guarda al menos una fila antes de generar el XLSX.');
      setSuccess(null);
      return;
    }

    const worksheetData = [
      ['Ejercicio', 'Subgrupo', 'Mes', 'Año', 'Site', 'Actividad', 'Monto_USD', 'Monto_Soles', 'Autor', ''],
      ...rows.map((row) => [
        row.ejercicio.toUpperCase(),
        row.subgrupo,
        row.mes,
        row.year,
        row.site,
        row.actividad,
        row.montoUsd,
        row.montoSoles,
        row.autor,
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
      { wch: 24 },
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
    setShowExportConfirm(false);
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

  const totalMontoUsd = rows.reduce((sum, row) => sum + row.montoUsd, 0);
  const totalMontoSoles = rows.reduce((sum, row) => sum + row.montoSoles, 0);
  const totalActividades = new Set(rows.map((row) => row.actividad)).size;
  const totalsByExercise = rows.reduce<Record<KpiExercise, KpiTotalsCard>>(
    (acc, row) => {
      const target = acc[row.ejercicio];
      target.totalUsd = roundTo(target.totalUsd + row.montoUsd, 3);
      target.totalSoles = roundTo(target.totalSoles + row.montoSoles, 3);
      target.rows += 1;
      return acc;
    },
    {
      Budget: { totalUsd: 0, totalSoles: 0, rows: 0 },
      Ejecutado: { totalUsd: 0, totalSoles: 0, rows: 0 },
    }
  );
  const siteTotals = Array.from(
    rows
      .reduce<Map<string, KpiSiteTotalRow>>((acc, row) => {
        const current = acc.get(row.site) ?? {
          site: row.site,
          totalUsd: 0,
          totalSoles: 0,
          rows: 0,
        };

        current.totalUsd = roundTo(current.totalUsd + row.montoUsd, 3);
        current.totalSoles = roundTo(current.totalSoles + row.montoSoles, 3);
        current.rows += 1;
        acc.set(row.site, current);
        return acc;
      }, new Map())
      .values()
  ).sort((left, right) => right.totalUsd - left.totalUsd);
  const siteSubgroupTotals = Array.from(
    rows
      .reduce<Map<string, KpiSiteSubgroupTotalRow>>((acc, row) => {
        const key = `${row.site}||${row.subgrupo}`;
        const current = acc.get(key) ?? {
          site: row.site,
          subgrupo: row.subgrupo,
          totalUsd: 0,
          totalSoles: 0,
          rows: 0,
        };

        current.totalUsd = roundTo(current.totalUsd + row.montoUsd, 3);
        current.totalSoles = roundTo(current.totalSoles + row.montoSoles, 3);
        current.rows += 1;
        acc.set(key, current);
        return acc;
      }, new Map())
      .values()
  ).sort((left, right) => right.totalUsd - left.totalUsd);
  const highestCostActivity = rows.reduce<null | KpiDetailRow>((current, row) => {
    if (!current || row.montoUsd > current.montoUsd) return row;
    return current;
  }, null);

  const handleOpenNewActivity = () => {
    const targetSite = draft.site || catalogState.sites[0]?.name || '';
    const siteEntry = catalogState.sites.find((s) => s.name === targetSite);
    const firstSub = siteEntry?.subgroups[0]?.name ?? '';
    setNewSite(targetSite);
    setNewSubgrupo(firstSub);
    setNewActividad('');
    setNewSubgrupoName('');
    setShowNewSubgrupoField(false);
    setActivityExistsError(false);
    setShowNewActivity(true);
  };

  const handleNewSiteChange = (value: string) => {
    const siteEntry = catalogState.sites.find((s) => s.name === value);
    setNewSite(value);
    setNewSubgrupo(siteEntry?.subgroups[0]?.name ?? '');
    setNewSubgrupoName('');
  };

  const handleCreateSubgrupo = () => {
    if (!newSite || !newSubgrupoName.trim()) {
      setError('Ingresa un nombre para el nuevo subgrupo.');
      setSuccess(null);
      setShowNewSubgrupoField(true);
      return;
    }

    const normalized = newSubgrupoName.trim();

    setCatalogState((current) => {
      const nextSites = current.sites.map((site) => ({
        ...site,
        subgroups: site.subgroups.map((sg) => ({ ...sg, activities: [...sg.activities] })),
      }));

      const siteIdx = nextSites.findIndex((s) => s.name === newSite);
      if (siteIdx === -1) return current;

      const site = nextSites[siteIdx];
      const exists = site.subgroups.some((sg) => sg.name === normalized);
      if (!exists) {
        site.subgroups.push({ name: normalized, activities: [] });
      }

      return { ...current, sites: nextSites };
    });

    setNewSubgrupo(normalized);
    setNewSubgrupoName('');
    setError(null);
    setSuccess('Subgrupo creado y seleccionado. Ahora agrega la actividad.');
  };

  const handleSaveNewActivity = () => {
    if (!newSite || !newSubgrupo || !newActividad) {
      setError('Completa site, subgrupo y actividad para crear la nueva entrada.');
      setSuccess(null);
      setActivityExistsError(false);
      return;
    }

    const siteEntry = catalogState.sites.find((s) => s.name === newSite);
    const subgroupEntry = siteEntry?.subgroups.find((sg) => sg.name === newSubgrupo);
    const exists = subgroupEntry?.activities.some(
      (activity) => activity.toLowerCase() === newActividad.trim().toLowerCase()
    );

    if (exists) {
      setActivityExistsError(true);
      setError('Esta actividad ya existe');
      setSuccess(null);
      return;
    }

    setActivityExistsError(false);

    setCatalogState((current) => {
      const nextSites = current.sites.map((site) => ({
        ...site,
        subgroups: site.subgroups.map((sg) => ({ ...sg, activities: [...sg.activities] })),
      }));
      const siteIdx = nextSites.findIndex((s) => s.name === newSite);
      if (siteIdx === -1) return current;

      const site = nextSites[siteIdx];
      const subgroupIdx = site.subgroups.findIndex((sg) => sg.name === newSubgrupo);

      if (subgroupIdx >= 0) {
        const activities = site.subgroups[subgroupIdx].activities;
        if (!activities.includes(newActividad)) {
          activities.push(newActividad);
        }
      } else {
        site.subgroups.push({ name: newSubgrupo, activities: [newActividad] });
      }

      return { ...current, sites: nextSites };
    });

    // Si el usuario está en el mismo site, setear selección al nuevo subgrupo/actividad
    if (draft.site === newSite) {
      setDraft((currentDraft) => ({
        ...currentDraft,
        subgrupo: newSubgrupo,
        actividad: newActividad,
      }));
    }

    setShowNewActivity(false);
    setError(null);
    setSuccess('Nueva actividad agregada al catálogo.');
  };

  const handleConfirmClearAll = () => {
    const resetCatalog = catalog;
    setRows([]);
    setCatalogState(resetCatalog);
    setDraft((currentDraft) => ({
      ...currentDraft,
      site: resetCatalog.sites[0]?.name || '',
      subgrupo: resetCatalog.sites[0]?.subgroups[0]?.name || '',
      actividad: resetCatalog.sites[0]?.subgroups[0]?.activities[0] || '',
      montoUsd: '',
    }));
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_ROWS_KEY);
      window.localStorage.removeItem(STORAGE_CATALOG_KEY);
    }
    setShowClearConfirm(false);
    setError(null);
    setSuccess('Registros y catálogo local borrados.');
  };

  const handleOpenTutorial = () => {
    setTutorialStep(0);
    setShowTutorial(true);
  };

  const handleCloseTutorial = () => {
    setShowTutorial(false);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_TUTORIAL_SEEN_KEY, '1');
    }
  };

  const handleNextTutorialStep = () => {
    setTutorialStep((currentStep) => Math.min(currentStep + 1, tutorialSteps.length - 1));
  };

  const handlePrevTutorialStep = () => {
    setTutorialStep((currentStep) => Math.max(currentStep - 1, 0));
  };

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
              onClick={handleOpenExportConfirm}
              className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
            >
              Generar Excel
            </button>
            <button
              type="button"
              onClick={handleOpenNewActivity}
              className="rounded-xl border border-dashed border-amber-400 px-4 py-2.5 text-sm font-semibold text-amber-700 transition hover:bg-amber-50 dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-900/40"
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
              {catalogState.sites.map((site) => (
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
            <div className="relative">
              <input
                ref={activityInputRef}
                value={draft.actividad}
                onChange={(event) => handleActivityInputChange(event.target.value)}
                onFocus={() => setShowActivitySuggestions(true)}
                onBlur={() => setTimeout(() => setShowActivitySuggestions(false), 120)}
                onKeyDown={handleActivityKeyDown}
                className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-4 pr-20 text-sm text-gray-900 outline-none transition focus:border-amber-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                placeholder="Escribe para filtrar actividades"
              />

              <div className="absolute inset-y-0 right-2 flex items-center gap-1">
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={handleClearActivityInput}
                  disabled={!draft.actividad}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-300 text-xs font-bold text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  title="Limpiar actividad"
                  aria-label="Limpiar actividad"
                >
                  X
                </button>

                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={handleToggleActivitySuggestions}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-300 text-xs font-bold text-gray-600 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  title="Abrir lista de actividades"
                  aria-label="Abrir lista de actividades"
                >
                  {showActivitySuggestions ? '▴' : '▾'}
                </button>
              </div>

              {showActivitySuggestions && filteredActivities.length > 0 && (
                <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-amber-200 bg-white shadow-lg dark:border-amber-900/40 dark:bg-gray-900">
                  <ul className="max-h-56 overflow-y-auto text-sm">
                    {filteredActivities.map((activity) => (
                      <li key={activity}>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleSelectActivity(activity)}
                          className="flex w-full items-start gap-2 px-4 py-2 text-left text-gray-800 hover:bg-amber-50 dark:text-gray-100 dark:hover:bg-amber-900/30"
                        >
                          {activity}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
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
        <div className="flex flex-col gap-2 border-b border-gray-200 pb-4 dark:border-gray-800 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Filas guardadas</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Cada guardado agrega una nueva fila al XLSX final.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              {rows.length} registros
            </div>
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="rounded-xl border border-red-300 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/40"
            >
              Borrar todos los registros
            </button>
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

        {rows.length > 0 && (
          <div className="mt-6 grid gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100 md:grid-cols-3">
            <div className="rounded-xl bg-white px-4 py-3 shadow-sm dark:bg-gray-900">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Monto total (USD)</p>
              <p className="mt-1 text-2xl font-bold text-amber-700 dark:text-amber-300">
                {totalMontoUsd.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
              </p>
            </div>
            <div className="rounded-xl bg-white px-4 py-3 shadow-sm dark:bg-gray-900">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Total actividades</p>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{totalActividades}</p>
            </div>
            <div className="rounded-xl bg-white px-4 py-3 shadow-sm dark:bg-gray-900">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Actividad con mayor costo</p>
              {highestCostActivity ? (
                <div className="mt-1">
                  <p className="font-semibold text-gray-900 dark:text-white">{highestCostActivity.actividad}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{highestCostActivity.site} · {highestCostActivity.subgrupo}</p>
                  <p className="text-lg font-bold text-amber-700 dark:text-amber-300">
                    {highestCostActivity.montoUsd.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} USD
                  </p>
                </div>
              ) : (
                <p className="mt-1 text-gray-600 dark:text-gray-300">Sin registros</p>
              )}
            </div>
          </div>
        )}
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

      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">¿Eliminar todos los registros?</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Se limpiarán filas guardadas y el catálogo local. No se puede deshacer.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                onClick={() => setShowClearConfirm(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
                onClick={handleConfirmClearAll}
              >
                Sí, borrar todo
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-amber-200 bg-white p-6 shadow-2xl dark:border-amber-900/50 dark:bg-gray-900">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-300">Nueva actividad</p>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white">Agregar al catálogo</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Solo se piden Site, Subgrupo y Actividad. Ejercicio, mes y año vienen del formulario principal.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowNewActivity(false)}
                className="rounded-lg px-3 py-1 text-sm font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cerrar
              </button>
            </div>

            <div className="space-y-4">
              <label className="block space-y-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">SITE</span>
                <select
                  value={newSite}
                  onChange={(e) => handleNewSiteChange(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-amber-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                >
                  {catalogState.sites.map((site) => (
                    <option key={site.name} value={site.name}>
                      {site.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="space-y-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Subgrupo</span>
                {!showNewSubgrupoField ? (
                  <div className="flex gap-2">
                    <select
                      value={newSubgrupo}
                      onChange={(e) => setNewSubgrupo(e.target.value)}
                      className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-amber-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                    >
                      {(catalogState.sites.find((s) => s.name === newSite)?.subgroups ?? []).map((sg) => (
                        <option key={sg.name} value={sg.name}>
                          {sg.name}
                        </option>
                      ))}
                      {newSubgrupo && !catalogState.sites.find((s) => s.name === newSite)?.subgroups.some((sg) => sg.name === newSubgrupo) ? (
                        <option value={newSubgrupo}>{newSubgrupo} (nuevo)</option>
                      ) : null}
                    </select>
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewSubgrupoField(true);
                          setTimeout(() => {
                            const input = document.getElementById('new-subgrupo-name');
                            input?.focus();
                          }, 30);
                        }}
                        className="inline-flex items-center justify-center rounded-xl border border-amber-400 px-3 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-50 dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-900/40"
                        title="Crear nuevo subgrupo"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      id="new-subgrupo-name"
                      value={newSubgrupoName}
                      onChange={(e) => setNewSubgrupoName(e.target.value)}
                      className={`w-full rounded-xl border px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-emerald-500 dark:bg-gray-950 dark:text-white ${newSubgrupoName.trim() ? 'border-emerald-500 dark:border-emerald-400' : 'border-gray-300 dark:border-gray-700'}`}
                      placeholder="Nombre de nuevo subgrupo"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleCreateSubgrupo}
                        className="flex-1 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600"
                      >
                        Guardar subgrupo
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewSubgrupoField(false);
                          setNewSubgrupoName('');
                        }}
                        className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <label className="block space-y-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Nueva actividad</span>
                <input
                  value={newActividad}
                  onChange={(e) => {
                    setNewActividad(e.target.value);
                    setActivityExistsError(false);
                  }}
                  className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition dark:bg-gray-950 dark:text-white ${
                    activityExistsError
                      ? 'border-red-500 shadow-[0_0_0_3px_rgba(248,113,113,0.25)] dark:border-red-400 dark:shadow-[0_0_0_3px_rgba(248,113,113,0.2)]'
                      : 'border-gray-300 focus:border-amber-500 dark:border-gray-700'
                  }`}
                  placeholder="Ingresa el nombre de la actividad"
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowNewActivity(false)}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveNewActivity}
                className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600"
              >
                Guardar actividad
              </button>
            </div>
          </div>
        </div>
      )}

      {showExportConfirm && (
        <div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/70 px-4 py-6">
          <div className="flex h-[88vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-amber-200 bg-white shadow-2xl dark:border-amber-900/50 dark:bg-gray-900">
            <div className="flex items-start justify-between border-b border-gray-200 p-6 dark:border-gray-800">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-300">Confirmación KPI</p>
                <h4 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">Resumen antes de generar Excel</h4>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Revisa todos los indicadores agregados en este reporte y confirma con GO para exportar.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseExportConfirm}
                className="rounded-lg px-3 py-1 text-sm font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cerrar
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900/50 dark:bg-emerald-950/20">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Total Budget</p>
                  <p className="mt-2 text-2xl font-bold text-emerald-800 dark:text-emerald-200">
                    {totalsByExercise.Budget.totalUsd.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} USD
                  </p>
                  <p className="mt-1 text-sm text-emerald-700/90 dark:text-emerald-200/90">
                    {totalsByExercise.Budget.totalSoles.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} Soles · {totalsByExercise.Budget.rows} filas
                  </p>
                </div>

                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-900/50 dark:bg-blue-950/20">
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">Total Ejecutado</p>
                  <p className="mt-2 text-2xl font-bold text-blue-800 dark:text-blue-200">
                    {totalsByExercise.Ejecutado.totalUsd.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} USD
                  </p>
                  <p className="mt-1 text-sm text-blue-700/90 dark:text-blue-200/90">
                    {totalsByExercise.Ejecutado.totalSoles.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} Soles · {totalsByExercise.Ejecutado.rows} filas
                  </p>
                </div>

                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/50 dark:bg-amber-950/20">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">Total Reporte</p>
                  <p className="mt-2 text-2xl font-bold text-amber-800 dark:text-amber-200">
                    {totalMontoUsd.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} USD
                  </p>
                  <p className="mt-1 text-sm text-amber-700/90 dark:text-amber-200/90">
                    {totalMontoSoles.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} Soles · {rows.length} filas
                  </p>
                </div>
              </div>

              <section className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
                <div className="mb-3 flex items-center justify-between">
                  <h5 className="text-lg font-bold text-gray-900 dark:text-white">Total dinero por Site</h5>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Solo se muestran sites con datos en este reporte</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
                    <thead>
                      <tr className="text-left text-gray-500 dark:text-gray-400">
                        <th className="px-3 py-2 font-semibold">Site</th>
                        <th className="px-3 py-2 font-semibold">Filas</th>
                        <th className="px-3 py-2 font-semibold">Total USD</th>
                        <th className="px-3 py-2 font-semibold">Total Soles</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {siteTotals.map((siteRow) => (
                        <tr key={siteRow.site}>
                          <td className="px-3 py-2 text-gray-900 dark:text-white">{siteRow.site}</td>
                          <td className="px-3 py-2 text-gray-600 dark:text-gray-300">{siteRow.rows}</td>
                          <td className="px-3 py-2 font-semibold text-gray-900 dark:text-white">
                            {siteRow.totalUsd.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
                          </td>
                          <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                            {siteRow.totalSoles.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
                <div className="mb-3 flex items-center justify-between">
                  <h5 className="text-lg font-bold text-gray-900 dark:text-white">Total dinero por Site y Subgrupo</h5>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Solo combinaciones agregadas en el reporte actual</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
                    <thead>
                      <tr className="text-left text-gray-500 dark:text-gray-400">
                        <th className="px-3 py-2 font-semibold">Site</th>
                        <th className="px-3 py-2 font-semibold">Subgrupo</th>
                        <th className="px-3 py-2 font-semibold">Filas</th>
                        <th className="px-3 py-2 font-semibold">Total USD</th>
                        <th className="px-3 py-2 font-semibold">Total Soles</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {siteSubgroupTotals.map((entry) => (
                        <tr key={`${entry.site}-${entry.subgrupo}`}>
                          <td className="px-3 py-2 text-gray-900 dark:text-white">{entry.site}</td>
                          <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{entry.subgrupo}</td>
                          <td className="px-3 py-2 text-gray-600 dark:text-gray-300">{entry.rows}</td>
                          <td className="px-3 py-2 font-semibold text-gray-900 dark:text-white">
                            {entry.totalUsd.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
                          </td>
                          <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                            {entry.totalSoles.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            <div className="flex items-center justify-between border-t border-gray-200 p-5 dark:border-gray-800">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Al final de revisar todos los KPI, confirma en la esquina con GO para generar el Excel.
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCloseExportConfirm}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmExport}
                  className="rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
                >
                  GO
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showTutorial && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-3xl rounded-2xl border border-amber-200 bg-white p-6 shadow-2xl dark:border-amber-900/50 dark:bg-gray-900">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-300">Pasarela de uso</p>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white">Tutorial de KPIS data</h4>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Esta guia aparece la primera vez y puedes abrirla luego con el boton Tutorial.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseTutorial}
                className="rounded-lg px-3 py-1 text-sm font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cerrar
              </button>
            </div>

            <div className="mb-5 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
              <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                <span>Paso {tutorialStep + 1} de {tutorialSteps.length}</span>
                <span>{Math.round(tutorialProgress)}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
                  style={{ width: `${tutorialProgress}%` }}
                />
              </div>
              <div className="mt-3 flex items-center gap-2 overflow-x-auto">
                {tutorialSteps.map((step, index) => (
                  <button
                    key={step.title}
                    type="button"
                    onClick={() => setTutorialStep(index)}
                    className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold transition ${
                      index === tutorialStep
                        ? 'border-amber-500 bg-amber-100 text-amber-800 dark:border-amber-400 dark:bg-amber-900/40 dark:text-amber-200'
                        : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950 lg:col-span-3">
                <div className={`mb-3 inline-flex rounded-lg bg-gradient-to-r px-3 py-1 text-xs font-semibold text-white ${activeTutorialStep.color}`}>
                  {activeTutorialStep.subtitle}
                </div>
                <h5 className="text-lg font-bold text-gray-900 dark:text-white">{activeTutorialStep.title}</h5>
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{activeTutorialStep.description}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {activeTutorialStep.chips.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-semibold text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/30 lg:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">Flujo visual</p>
                <div className="mt-3 space-y-2 text-xs font-semibold text-amber-900 dark:text-amber-200">
                  <div className="rounded-lg border border-amber-300/80 bg-white px-3 py-2 dark:border-amber-800 dark:bg-gray-900">1. Contexto</div>
                  <div className="text-center">↓</div>
                  <div className="rounded-lg border border-amber-300/80 bg-white px-3 py-2 dark:border-amber-800 dark:bg-gray-900">2. Montos</div>
                  <div className="text-center">↓</div>
                  <div className="rounded-lg border border-amber-300/80 bg-white px-3 py-2 dark:border-amber-800 dark:bg-gray-900">3. Periodo</div>
                  <div className="text-center">↓</div>
                  <div className="rounded-lg border border-amber-300/80 bg-white px-3 py-2 dark:border-amber-800 dark:bg-gray-900">4. Revisar</div>
                  <div className="text-center">↓</div>
                  <div className="rounded-lg border border-amber-300/80 bg-white px-3 py-2 dark:border-amber-800 dark:bg-gray-900">5. Exportar</div>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
              Nota: el formato de salida no se edita aqui; solo se actualizan y registran datos para el reporte.
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handlePrevTutorialStep}
                disabled={tutorialStep === 0}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Anterior
              </button>

              <div className="flex gap-3">
                {!isLastTutorialStep ? (
                  <button
                    type="button"
                    onClick={handleNextTutorialStep}
                    className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                  >
                    Siguiente
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={handleCloseTutorial}
                  className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600"
                >
                  {isLastTutorialStep ? 'Finalizar' : 'Cerrar'}
                </button>
              </div>
            </div>

            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Tip: si es necesario, usa "Agregar nueva actividad" para ampliar el catalogo antes de exportar.
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleOpenTutorial}
        className="fixed bottom-6 right-6 z-[60] rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-white shadow-xl transition hover:bg-amber-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
      >
        Tutorial
      </button>
    </div>
  );
}
