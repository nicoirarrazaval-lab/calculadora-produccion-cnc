import React from 'react';
import { Printer, Scissors, Calendar, Clock, RotateCcw, Share2, Printer as PrintIcon, Globe } from 'lucide-react';

interface TopBarProps {
  activeTab: 'overview' | 'gantt' | 'capacity' | 'shopfloor' | 'deployment';
  setActiveTab: (tab: 'overview' | 'gantt' | 'capacity' | 'shopfloor' | 'deployment') => void;
  onReset: () => void;
  onOpenPrintModal: () => void;
  onCopyReport: () => void;
  copied: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  setActiveTab,
  onReset,
  onOpenPrintModal,
  onCopyReport,
  copied,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Zone 1: Single text wordmark */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base sm:text-lg font-bold tracking-tight text-white block leading-none">
              PLANIFICADOR CNC & IMPRESIÓN
            </span>
            <span className="text-[11px] text-slate-400 font-mono tracking-wider block mt-0.5">
              CÁLCULO DE TIEMPOS DE PRODUCCIÓN
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation tabs with functional buttons */}
        <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Detalle de Placas
          </button>
          <button
            onClick={() => setActiveTab('gantt')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'gantt'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Cronograma de Flujo
          </button>
          <button
            onClick={() => setActiveTab('capacity')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'capacity'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Capacidad & Turnos
          </button>
          <button
            onClick={() => setActiveTab('shopfloor')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'shopfloor'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Control en Planta
          </button>
          <button
            onClick={() => setActiveTab('deployment')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'deployment'
                ? 'bg-emerald-500/20 text-emerald-300 shadow-sm border border-emerald-500/40'
                : 'text-emerald-400/80 hover:text-emerald-300'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Vercel & GitHub</span>
          </button>
        </nav>

        {/* Zone 3: Primary actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onCopyReport}
            title="Copiar reporte resumen para WhatsApp"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">{copied ? '¡Copiado!' : 'Compartir'}</span>
          </button>

          <button
            onClick={onOpenPrintModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors whitespace-nowrap shadow-sm shadow-cyan-950"
          >
            <PrintIcon className="w-3.5 h-3.5" />
            <span className="font-semibold">Hoja de Ruta</span>
          </button>

          <button
            onClick={onReset}
            title="Restablecer pedido original (5 placas x 101 unidades)"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Mobile navigation row */}
      <div className="md:hidden flex items-center justify-between border-t border-slate-800/80 px-4 py-2 bg-slate-950 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-1 text-xs font-medium rounded whitespace-nowrap ${
            activeTab === 'overview' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400'
          }`}
        >
          Placas
        </button>
        <button
          onClick={() => setActiveTab('gantt')}
          className={`px-3 py-1 text-xs font-medium rounded whitespace-nowrap ${
            activeTab === 'gantt' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400'
          }`}
        >
          Cronograma
        </button>
        <button
          onClick={() => setActiveTab('capacity')}
          className={`px-3 py-1 text-xs font-medium rounded whitespace-nowrap ${
            activeTab === 'capacity' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400'
          }`}
        >
          Turnos
        </button>
        <button
          onClick={() => setActiveTab('shopfloor')}
          className={`px-3 py-1 text-xs font-medium rounded whitespace-nowrap ${
            activeTab === 'shopfloor' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400'
          }`}
        >
          Planta
        </button>
        <button
          onClick={() => setActiveTab('deployment')}
          className={`px-3 py-1 text-xs font-medium rounded whitespace-nowrap ${
            activeTab === 'deployment' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'text-emerald-400/70'
          }`}
        >
          Vercel & GitHub
        </button>
      </div>
    </header>
  );
};

