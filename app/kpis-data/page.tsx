import KpisDataForm from '@/components/KpisDataForm';
import { getKpisBudgetCatalog } from '@/lib/kpisBudgetCatalog';

export const dynamic = 'force-dynamic';

export default async function KpisDataPage() {
  const catalog = await getKpisBudgetCatalog();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-100 pt-16 dark:from-gray-950 dark:via-gray-900 dark:to-amber-950/40">
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 text-6xl">📊</div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              KPIS data
            </h1>
            <p className="mt-3 max-w-3xl text-lg text-gray-600 dark:text-gray-400">
              Genera registros KPI por site usando el consolidado como catalogo y exporta una sola hoja en formato XLSX.
            </p>
          </div>

          <div className="grid gap-3 rounded-3xl border border-amber-200 bg-white/70 p-5 text-sm shadow-lg backdrop-blur dark:border-amber-900/40 dark:bg-gray-900/80">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Sites disponibles</p>
              <p className="text-gray-600 dark:text-gray-400">{catalog.sites.map((site) => site.name).join(' · ')}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Tipo de cambio</p>
              <p className="text-gray-600 dark:text-gray-400">{catalog.exchangeRate}</p>
            </div>
          </div>
        </div>

        <KpisDataForm catalog={catalog} />
      </main>
    </div>
  );
}
