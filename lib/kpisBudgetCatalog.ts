import 'server-only';

import { access, readFile } from 'node:fs/promises';
import path from 'path';
import * as XLSX from 'xlsx';
import {
  KPI_EXCHANGE_RATE,
  type KpiCatalogData,
  type KpiCatalogSite,
} from '@/lib/kpisBudgetConstants';

const WORKBOOK_FILE_NAME = 'POWERBI_CONSOLIDADO_BUDGET_EJECUTADO.xlsx';
const WORKBOOK_PATH = path.join(
  process.cwd(),
  'testing',
  'kpisbudget',
  WORKBOOK_FILE_NAME,
);

interface WorkbookRow {
  Site?: string;
  Subgrupo?: string;
  Actividad?: string;
  'Año'?: number | string;
}

function normalizeText(value: unknown) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function getCanonicalKey(value: string) {
  return normalizeText(value).toLocaleLowerCase('es-PE');
}

function toYear(value: WorkbookRow['Año']) {
  const year = Number(value);
  return Number.isFinite(year) ? year : null;
}

export async function getKpisBudgetCatalog(): Promise<KpiCatalogData> {
  try {
    await access(WORKBOOK_PATH);
  } catch {
    throw new Error(`No se pudo acceder al archivo KPI base en ${WORKBOOK_PATH}.`);
  }

  const workbookBuffer = await readFile(WORKBOOK_PATH);
  const workbook = XLSX.read(workbookBuffer, { type: 'buffer' });
  const worksheet = workbook.Sheets['Datos Detallados'];

  if (!worksheet) {
    throw new Error('No se encontró la hoja Datos Detallados en el consolidado KPI.');
  }

  const rows = XLSX.utils.sheet_to_json<WorkbookRow>(worksheet, { defval: '' });
  const years = new Set<number>();
  const sites: KpiCatalogSite[] = [];
  const siteMap = new Map<
    string,
    {
      site: KpiCatalogSite;
      subgroupMap: Map<string, { name: string; activities: string[]; activityKeys: Set<string> }>;
    }
  >();

  rows.forEach((row) => {
    const siteName = normalizeText(row.Site).toUpperCase();
    const subgroupName = normalizeText(row.Subgrupo);
    const activityName = normalizeText(row.Actividad);
    const year = toYear(row['Año']);

    if (year) {
      years.add(year);
    }

    if (!siteName || !subgroupName || !activityName) {
      return;
    }

    const siteKey = getCanonicalKey(siteName);
    const subgroupKey = getCanonicalKey(subgroupName);
    const activityKey = getCanonicalKey(activityName);

    let siteEntry = siteMap.get(siteKey);
    if (!siteEntry) {
      const site: KpiCatalogSite = { name: siteName, subgroups: [] };
      siteEntry = {
        site,
        subgroupMap: new Map(),
      };
      siteMap.set(siteKey, siteEntry);
      sites.push(site);
    }

    let subgroupEntry = siteEntry.subgroupMap.get(subgroupKey);
    if (!subgroupEntry) {
      subgroupEntry = {
        name: subgroupName,
        activities: [],
        activityKeys: new Set(),
      };
      siteEntry.subgroupMap.set(subgroupKey, subgroupEntry);
      siteEntry.site.subgroups.push({
        name: subgroupName,
        activities: subgroupEntry.activities,
      });
    }

    if (!subgroupEntry.activityKeys.has(activityKey)) {
      subgroupEntry.activityKeys.add(activityKey);
      subgroupEntry.activities.push(activityName);
    }
  });

  return {
    sites,
    years: [...years].sort((left, right) => left - right),
    sourceFileName: WORKBOOK_FILE_NAME,
    exchangeRate: KPI_EXCHANGE_RATE,
  };
}
