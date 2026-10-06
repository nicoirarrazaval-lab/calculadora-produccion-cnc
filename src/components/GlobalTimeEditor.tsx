import React, { useState } from 'react';
import { PlateItem } from '../types/production';
import { minutesToMinSec, minSecToMinutes, formatUnitTimeDisplay } from '../utils/productionCalculations';
import { Printer, Scissors, Check, Sliders, RotateCcw, Zap } from 'lucide-react';

interface GlobalTimeEditorProps {
  plates: PlateItem[];
  setPlates: React.Dispatch<React.SetStateAction<PlateItem[]>>;
}

export const GlobalTimeEditor: React.FC<GlobalTimeEditorProps> = ({ plates, setPlates }) => {
  // Current values based on first plate with each process or default
  const defaultPrint = plates.find((p) => p.hasPrint)?.printTimePerUnit ?? 3.5;
  const defaultCut = plates.find((p) => p.hasCut)?.cutTimePerUnit ?? 5.0;

  const [printMin, setPrintMin] = useState<number>(() => minutesToMinSec(defaultPrint).mins);
  const [printSec, setPrintSec] = useState<number>(() => minutesToMinSec(defaultPrint).secs);

  const [cutMin, setCutMin] = useState<number>(() => minutesToMinSec(defaultCut).mins);
  const [cutSec, setCutSec] = useState<number>(() => minutesToMinSec(defaultCut).secs);

  const [notification, setNotification] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleApplyPrintTime = (newTotalMin?: number) => {
    const timeToApply = typeof newTotalMin === 'number' ? newTotalMin : minSecToMinutes(printMin, printSec);
    setPlates((prev) =>
      prev.map((p) => (p.hasPrint ? { ...p, printTimePerUnit: timeToApply } : p))
    );
    showFeedback(`Tiempo de impresión actualizado a ${formatUnitTimeDisplay(timeToApply)} en todas las placas.`);
  };

  const handleApplyCutTime = (newTotalMin?: number) => {
    const timeToApply = typeof newTotalMin === 'number' ? newTotalMin : minSecToMinutes(cutMin, cutSec);
    setPlates((prev) =>
      prev.map((p) => (p.hasCut ? { ...p, cutTimePerUnit: timeToApply } : p))
    );
    showFeedback(`Tiempo de corte router actualizado a ${formatUnitTimeDisplay(timeToApply)} en todas las placas.`);
  };

  const setPrintPreset = (mins: number) => {
    const { mins: m, secs: s } = minutesToMinSec(mins);
    setPrintMin(m);
    setPrintSec(s);
    handleApplyPrintTime(mins);
  };

  const setCutPreset = (mins: number) => {
    const { mins: m, secs: s } = minutesToMinSec(mins);
    setCutMin(m);
    setCutSec(s);
    handleApplyCutTime(mins);
  };

  const adjustPrint = (deltaSeconds: number) => {
    const current = minSecToMinutes(printMin, printSec);
    const updated = Math.max(0.2, current + deltaSeconds / 60);
    const { mins: m, secs: s } = minutesToMinSec(updated);
    setPrintMin(m);
    setPrintSec(s);
    handleApplyPrintTime(updated);
  };

  const adjustCut = (deltaSeconds: number) => {
    const current = minSecToMinutes(cutMin, cutSec);
    const updated = Math.max(0.2, current + deltaSeconds / 60);
    const { mins: m, secs: s } = minutesToMinSec(updated);
    setCutMin(m);
    setCutSec(s);
    handleApplyCutTime(updated);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 mb-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              Edición Rápida de Tiempos Estándar (Global)
            </h3>
            <p className="text-xs text-slate-400">
              Modifica los tiempos unitarios de impresión y router CNC para recalcular todo el taller al instante
            </p>
          </div>
        </div>

        {notification && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs rounded-lg animate-fade-in">
            <Check className="w-3.5 h-3.5 text-cyan-400" />
            <span>{notification}</span>
          </div>
        )}
      </div>

      {/* Two-Column Editor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        
        {/* Card 1: Tiempo de Impresión */}
        <div className="p-4 bg-slate-950/80 border border-slate-800/80 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-sky-500/10 text-sky-400 flex items-center justify-center">
                  <Printer className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-semibold text-sky-300 uppercase tracking-wider">
                  Tiempo de Impresión por Placa
                </span>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Decimal: {minSecToMinutes(printMin, printSec).toFixed(2)} min
              </span>
            </div>

            {/* Input Inputs (Minutes & Seconds) */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5">
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={printMin}
                  onChange={(e) => setPrintMin(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-12 text-center font-mono font-bold text-white text-base bg-transparent focus:outline-none"
                />
                <span className="text-xs text-slate-400 font-mono">min</span>
                <span className="text-slate-600">:</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  step="5"
                  value={printSec}
                  onChange={(e) => setPrintSec(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-12 text-center font-mono font-bold text-white text-base bg-transparent focus:outline-none"
                />
                <span className="text-xs text-slate-400 font-mono">seg</span>
              </div>

              {/* Stepper buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => adjustPrint(-30)}
                  title="Restar 30 segundos"
                  className="px-2 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-xs font-mono text-slate-300"
                >
                  -30s
                </button>
                <button
                  onClick={() => adjustPrint(30)}
                  title="Sumar 30 segundos"
                  className="px-2 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-xs font-mono text-slate-300"
                >
                  +30s
                </button>
                <button
                  onClick={() => adjustPrint(60)}
                  title="Sumar 1 minuto"
                  className="px-2 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-xs font-mono text-slate-300"
                >
                  +1m
                </button>
              </div>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap items-center gap-1.5 mb-3">
              <span className="text-[11px] text-slate-500 mr-1">Preajustes:</span>
              {[2.0, 2.5, 3.0, 3.5, 4.0, 5.0].map((t) => {
                const isSelected = Math.abs(minSecToMinutes(printMin, printSec) - t) < 0.05;
                return (
                  <button
                    key={t}
                    onClick={() => setPrintPreset(t)}
                    className={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                      isSelected
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-semibold'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {t === 3.5 ? '3,5m (Orig.)' : `${t}m`}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => handleApplyPrintTime()}
            className="w-full mt-2 py-1.5 px-3 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-sky-950"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Aplicar este tiempo a todas las placas que imprimen</span>
          </button>
        </div>

        {/* Card 2: Tiempo de Router CNC */}
        <div className="p-4 bg-slate-950/80 border border-slate-800/80 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Scissors className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
                  Tiempo de Router CNC por Placa
                </span>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Decimal: {minSecToMinutes(cutMin, cutSec).toFixed(2)} min
              </span>
            </div>

            {/* Input Inputs (Minutes & Seconds) */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5">
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={cutMin}
                  onChange={(e) => setCutMin(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-12 text-center font-mono font-bold text-white text-base bg-transparent focus:outline-none"
                />
                <span className="text-xs text-slate-400 font-mono">min</span>
                <span className="text-slate-600">:</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  step="5"
                  value={cutSec}
                  onChange={(e) => setCutSec(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-12 text-center font-mono font-bold text-white text-base bg-transparent focus:outline-none"
                />
                <span className="text-xs text-slate-400 font-mono">seg</span>
              </div>

              {/* Stepper buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => adjustCut(-30)}
                  title="Restar 30 segundos"
                  className="px-2 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-xs font-mono text-slate-300"
                >
                  -30s
                </button>
                <button
                  onClick={() => adjustCut(30)}
                  title="Sumar 30 segundos"
                  className="px-2 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-xs font-mono text-slate-300"
                >
                  +30s
                </button>
                <button
                  onClick={() => adjustCut(60)}
                  title="Sumar 1 minuto"
                  className="px-2 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-xs font-mono text-slate-300"
                >
                  +1m
                </button>
              </div>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap items-center gap-1.5 mb-3">
              <span className="text-[11px] text-slate-500 mr-1">Preajustes:</span>
              {[3.0, 4.0, 5.0, 6.0, 7.5, 10.0].map((t) => {
                const isSelected = Math.abs(minSecToMinutes(cutMin, cutSec) - t) < 0.05;
                return (
                  <button
                    key={t}
                    onClick={() => setCutPreset(t)}
                    className={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {t === 5.0 ? '5,0m (Orig.)' : `${t}m`}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => handleApplyCutTime()}
            className="w-full mt-2 py-1.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-950"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Aplicar este tiempo a todas las placas que cortan</span>
          </button>
        </div>

      </div>

    </div>
  );
};
