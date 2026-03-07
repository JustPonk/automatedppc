import PiscoAutomated from "@/components/PiscoAutomated";
import Link from "next/link";

export default function PiscoAutomatePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-blue-950 pt-16">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link 
            href="/pisco" 
            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
          >
            <span>←</span>
            Volver a Pisco Operations
          </Link>
        </div>

        {/* Main Content */}
        <div className="flex items-center justify-center">
          <PiscoAutomated />
        </div>
      </main>
    </div>
  );
}
