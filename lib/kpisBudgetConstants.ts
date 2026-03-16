export const KPI_MONTH_OPTIONS = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Oct',
  'Nov',
  'Dic'
] as const;

export const KPI_EXERCISE_OPTIONS = ['Budget', 'Ejecutado'] as const;
export const KPI_EXCHANGE_RATE = 3.7;

export type KpiMonth = (typeof KPI_MONTH_OPTIONS)[number];
export type KpiExercise = (typeof KPI_EXERCISE_OPTIONS)[number];

export interface KpiCatalogSubgroup {
  name: string;
  activities: string[];
}

export interface KpiCatalogSite {
  name: string;
  subgroups: KpiCatalogSubgroup[];
}

export interface KpiCatalogData {
  sites: KpiCatalogSite[];
  years: number[];
  sourceFileName: string;
  exchangeRate: number;
}

export interface KpiDetailRow {
  ejercicio: KpiExercise;
  subgrupo: string;
  mes: KpiMonth;
  year: number;
  site: string;
  actividad: string;
  montoUsd: number;
  montoSoles: number;
}
