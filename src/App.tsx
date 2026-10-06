import React, { useState, useMemo } from 'react';
import { PlateItem, WorkshopConfig } from './types/production';
import {
  INITIAL_PLATES,
  DEFAULT_CONFIG,
  computeProductionSummary,
  generateWhatsAppReport,
  formatMinutesToHoursMinutes,
} from './utils/productionCalculations';
import { TopBar } from './components/TopBar';
import { KpiMetrics } from './components/KpiMetrics';
import { GlobalTimeEditor } from './components/GlobalTimeEditor';
import { PlatesTable } from './components/PlatesTable';
import { GanttSchedule } from './components/GanttSchedule';
import { CapacityPlanner } from './components/CapacityPlanner';
import { ShopFloorControl } from './components/ShopFloorControl';
import { DeploymentGuide } from './components/DeploymentGuide';
import { PrintOrderModal } from './components/PrintOrderModal';
import { AlertTriangle, Clock, Layers, Sparkles, Check, ArrowRight } from 'lucide-react';

export default function App() {
  const [plates, setPlates] = useState<PlateItem[]>(INITIAL_PLATES);
  const [config, setConfig] = useState<WorkshopConfig>(DEFAULT_CONFIG);
  const [activeTab, setActiveTab] = useState<'overview' | 'gantt' | 'capacity' | 'shopfloor' | 'deployment'>('overview');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Re-compute all production stats & Gantt simulation whenever plates or config change
  const { summary, ganttBlocks } = useMemo(() => {
    return computeProductionSummary(plates, config);
  }, [plates, config]);

  const handleReset = () => {
    setPlates(JSON.parse(JSON.stringify(INITIAL_PLATES)));
    setConfig({ ...DEFAULT_CONFIG, startDateTime: new Date().toISOString() });
  };

  const handleCopyReport = async () => {
    const text = generateWhatsAppReport(plates, config, summary);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Bar following Top Bar Contract */}
      <TopBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onReset={handleReset}
        onOpenPrintModal={() => setIsPrintModalOpen(true)}
        onCopyReport={handleCopyReport}
        copied={copied}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* KPI Metrics Summary (always visible across views) */}
        <KpiMetrics summary={summary} config={config} />

        {/* View Content depending on active tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Global Rapid Time Editor (Minutes + Seconds, Presets, Steppers) */}
            <GlobalTimeEditor plates={plates} setPlates={setPlates} />

            {/* Individual Plates Table */}
            <PlatesTable plates={plates} setPlates={setPlates} config={config} />

            {/* Quick Bottleneck and Operational Analysis Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2 text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                  <h3 className="text-sm font-semibold text-white">Diagnóstico del Cuello de Botella</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  El <strong>Router CNC</strong> requiere <strong>{formatMinutesToHoursMinutes(summary.totalCutMinutesNet)}</strong> de trabajo continuo, lo que representa el <strong>{summary.bottleneckRatio}%</strong> del esfuerzo total. En contraste, la <strong>Impresora Digital</strong> solo necesita <strong>{formatMinutesToHoursMinutes(summary.totalPrintMinutesNet)}</strong> (terminará {((summary.totalCutMinutesNet - summary.totalPrintMinutesNet) / 60).toFixed(1)} horas antes).
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <button
                    onClick={() => setActiveTab('gantt')}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
                  >
                    Ver diagrama de flujo <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-slate-600">·</span>
                  <button
                    onClick={() => setActiveTab('capacity')}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
                  >
                    Simular con 2 Routers <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-cyan-400">
                    <Clock className="w-4 h-4" />
                    <h3 className="text-sm font-semibold text-white">Estrategia de Fabricación Recomendada</h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Dado que las <strong>Placas 3, 4 y 5 son SOLO CORTE</strong>, deben cargarse en el Router CNC desde el <strong>minuto 0</strong>. Mientras tanto, la Impresora produce las Placas 1 y 2. Así se elimina cualquier tiempo muerto y el taller funciona al 100% de ocupación.
                  </p>
                </div>
                <div className="mt-3 text-[11px] text-slate-400 font-mono">
                  505 placas totales · 707 operaciones de máquina
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'gantt' && (
          <GanttSchedule
            blocks={ganttBlocks}
            summary={summary}
            config={config}
            setConfig={setConfig}
          />
        )}

        {activeTab === 'capacity' && (
          <CapacityPlanner
            config={config}
            setConfig={setConfig}
            summary={summary}
          />
        )}

        {activeTab === 'shopfloor' && (
          <ShopFloorControl
            plates={plates}
            setPlates={setPlates}
            config={config}
          />
        )}

        {activeTab === 'deployment' && (
          <DeploymentGuide />
        )}

      </main>

      {/* Footer following Anti-Slop Guidelines (Quiet, simple copyright and info) */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 text-xs text-slate-400 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">Planificador de Taller</span>
            <span aria-hidden="true">·</span>
            <span>Impresión Digital (3,5m) & Router CNC (5,0m)</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Cálculo industrial en tiempo real</span>
            <span aria-hidden="true">·</span>
            <span>Lote de 5 Placas</span>
          </div>
        </div>
      </footer>

      {/* Printable Work Order Modal */}
      <PrintOrderModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        plates={plates}
        config={config}
        summary={summary}
      />

    </div>
  );
}
