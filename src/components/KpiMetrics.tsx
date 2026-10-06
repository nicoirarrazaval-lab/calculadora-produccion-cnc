import React from 'react';
import { Printer, Scissors, Clock, AlertTriangle, Calendar, Layers } from 'lucide-react';
import { ProductionSummary, WorkshopConfig } from '../types/production';
import { formatMinutesToHoursMinutes, formatMinutesToDecimalHours } from '../utils/productionCalculations';

interface KpiMetricsProps {
  summary: ProductionSummary;
  config: WorkshopConfig;
}

export const KpiMetrics: React.FC<KpiMetricsProps> = ({ summary, config }) => {
  const formattedDelivery = summary.completionDate.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* KPI 1: Impresión Digital */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">IMPRESIÓN DIGITAL</span>
            <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Printer className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-white tracking-tight">
              {formatMinutesToHoursMinutes(summary.totalPrintMinutesNet)}
            </span>
            <span className="text-xs font-mono text-slate-400">
              ({formatMinutesToDecimalHours(summary.totalPrintMinutesNet)})
            </span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center gap-2 text-xs text-slate-400">
          <span className="font-mono tabular-nums text-sky-400 font-semibold">{summary.totalPrintPlates} placas</span>
          <span aria-hidden="true">·</span>
          <span>Promedio 3,5 min/u</span>
          <span aria-hidden="true">·</span>
          <span className="text-slate-300">P1 & P2</span>
        </div>
      </div>

      {/* KPI 2: Router CNC Corte */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">CORTE ROUTER CNC</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Scissors className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-white tracking-tight">
              {formatMinutesToHoursMinutes(summary.totalCutMinutesNet)}
            </span>
            <span className="text-xs font-mono text-slate-400">
              ({formatMinutesToDecimalHours(summary.totalCutMinutesNet)})
            </span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center gap-2 text-xs text-slate-400">
          <span className="font-mono tabular-nums text-emerald-400 font-semibold">{summary.totalCutPlates} placas</span>
          <span aria-hidden="true">·</span>
          <span>Promedio 5,0 min/u</span>
          <span aria-hidden="true">·</span>
          <span className="text-slate-300">P1 a P5</span>
        </div>
      </div>

      {/* KPI 3: Tiempo Total de Taller (Makespan concurrente) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 flex flex-col justify-between relative overflow-hidden">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">TIEMPO TALLER (CONCURRENTE)</span>
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-cyan-400 tracking-tight">
              {formatMinutesToHoursMinutes(summary.makespanMinutes)}
            </span>
            <span className="text-xs font-mono text-slate-400">
              ({summary.makespanHours.toFixed(1)} h)
            </span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center gap-2 text-xs text-slate-400">
          <span>{config.printerCount} Impresora + {config.routerCount} Router</span>
          <span aria-hidden="true">·</span>
          <span className="text-slate-300 font-mono">
            {summary.estimatedWorkDays.toFixed(1)} días ({config.hoursPerShift * config.shiftsPerDay}h/día)
          </span>
        </div>
      </div>

      {/* KPI 4: Cuello de Botella y Entrega */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">CUELLO DE BOTELLA</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-amber-400">
              {summary.bottleneckMachine}
            </span>
            <span className="text-xs font-mono text-amber-300/80 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
              {summary.bottleneckRatio}% carga
            </span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center gap-2 text-xs text-slate-400">
          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-slate-200">Entrega est.: {formattedDelivery}</span>
        </div>
      </div>

    </div>
  );
};
