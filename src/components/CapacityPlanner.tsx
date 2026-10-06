import React from 'react';
import { WorkshopConfig, ProductionSummary } from '../types/production';
import { formatMinutesToHoursMinutes, formatMinutesToDecimalHours } from '../utils/productionCalculations';
import { Settings2, Clock, Calendar, Users, DollarSign, Gauge, ShieldCheck, Zap } from 'lucide-react';

interface CapacityPlannerProps {
  config: WorkshopConfig;
  setConfig: React.Dispatch<React.SetStateAction<WorkshopConfig>>;
  summary: ProductionSummary;
}

export const CapacityPlanner: React.FC<CapacityPlannerProps> = ({
  config,
  setConfig,
  summary,
}) => {
  const updateConfig = (updates: Partial<WorkshopConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  const deliveryFormatted = summary.completionDate.toLocaleString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      
      {/* Column 1: Configuración de Maquinaria y Taller */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Settings2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Parque de Maquinaria</h3>
              <p className="text-xs text-slate-400">Capacidad instalada del taller</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            {/* Printers count */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Impresoras Digitales en Operación
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((num) => (
                  <button
                    key={num}
                    onClick={() => updateConfig({ printerCount: num })}
                    className={`flex-1 py-1.5 rounded-lg border font-mono font-medium transition-colors ${
                      config.printerCount === num
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {num} {num === 1 ? 'Máquina' : 'Máquinas'}
                  </button>
                ))}
              </div>
            </div>

            {/* Routers count */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-medium">
                  Routers CNC en Operación
                </label>
                <span className="text-[11px] text-amber-400 font-mono">
                  {config.routerCount === 1 ? '¡Cuello de botella!' : 'Mitigado'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((num) => (
                  <button
                    key={num}
                    onClick={() => updateConfig({ routerCount: num })}
                    className={`flex-1 py-1.5 rounded-lg border font-mono font-medium transition-colors ${
                      config.routerCount === num
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {num} {num === 1 ? 'Router' : 'Routers'}
                  </button>
                ))}
              </div>
              {config.routerCount === 1 && (
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Consejo: Con 2 routers, el tiempo de corte cae de 42h a ~21h.
                </p>
              )}
            </div>

            {/* Setup / Plate change time */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Tiempo de Carga / Fijación por Placa
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.25"
                  value={config.plateChangeTimeMin}
                  onChange={(e) => updateConfig({ plateChangeTimeMin: parseFloat(e.target.value) })}
                  className="flex-1 accent-cyan-400"
                />
                <span className="w-16 text-right font-mono text-cyan-300">
                  {config.plateChangeTimeMin} min
                </span>
              </div>
              <span className="text-[10px] text-slate-500">
                Alineación óptica, vacío y descarga de viruta
              </span>
            </div>

            {/* Efficiency / OEE */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Factor de Eficiencia / OEE del Taller
              </label>
              <div className="flex items-center gap-2">
                {[100, 90, 80].map((eff) => (
                  <button
                    key={eff}
                    onClick={() => updateConfig({ efficiencyPercent: eff })}
                    className={`flex-1 py-1.5 rounded-lg border font-mono font-medium transition-colors ${
                      config.efficiencyPercent === eff
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {eff}% {eff === 100 ? '(Ideal)' : eff === 90 ? '(Normal)' : '(Holgado)'}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Column 2: Turnos Laborales y Calendario */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Jornadas y Turnos</h3>
              <p className="text-xs text-slate-400">Planificación horaria de entregas</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            {/* Shifts per day */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Turnos de Producción por Día
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => updateConfig({ shiftsPerDay: 1, hoursPerShift: 8 })}
                  className={`py-1.5 rounded-lg border text-center font-mono transition-colors ${
                    config.shiftsPerDay === 1
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="block font-bold">1 Turno</span>
                  <span className="text-[10px] opacity-80">8 h/día</span>
                </button>
                <button
                  onClick={() => updateConfig({ shiftsPerDay: 2, hoursPerShift: 8 })}
                  className={`py-1.5 rounded-lg border text-center font-mono transition-colors ${
                    config.shiftsPerDay === 2
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="block font-bold">2 Turnos</span>
                  <span className="text-[10px] opacity-80">16 h/día</span>
                </button>
                <button
                  onClick={() => updateConfig({ shiftsPerDay: 3, hoursPerShift: 8 })}
                  className={`py-1.5 rounded-lg border text-center font-mono transition-colors ${
                    config.shiftsPerDay === 3
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="block font-bold">3 Turnos</span>
                  <span className="text-[10px] opacity-80">24h continuo</span>
                </button>
              </div>
            </div>

            {/* Days per week */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Días Laborables por Semana
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateConfig({ workDaysPerWeek: 5 })}
                  className={`flex-1 py-1.5 rounded-lg border font-mono font-medium transition-colors ${
                    config.workDaysPerWeek === 5
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  Lun a Vie (5d)
                </button>
                <button
                  onClick={() => updateConfig({ workDaysPerWeek: 6 })}
                  className={`flex-1 py-1.5 rounded-lg border font-mono font-medium transition-colors ${
                    config.workDaysPerWeek === 6
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  Lun a Sáb (6d)
                </button>
                <button
                  onClick={() => updateConfig({ workDaysPerWeek: 7 })}
                  className={`flex-1 py-1.5 rounded-lg border font-mono font-medium transition-colors ${
                    config.workDaysPerWeek === 7
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  7 días (24/7)
                </button>
              </div>
            </div>

            {/* Start date & time */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Fecha y Hora de Inicio
              </label>
              <input
                type="datetime-local"
                value={config.startDateTime.slice(0, 16)}
                onChange={(e) => updateConfig({ startDateTime: new Date(e.target.value).toISOString() })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-slate-200 font-mono text-xs focus:ring-1 focus:ring-cyan-500"
              />
            </div>

          </div>
        </div>
      </div>

      {/* Column 3: Estimación de Costes de Máquina y Fecha Final */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Costos & Entrega</h3>
              <p className="text-xs text-slate-400">Tarifas de hora máquina y cotización</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-400 mb-1">Costo/h Impresora</label>
                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-2">
                  <span className="text-slate-400 font-mono">$</span>
                  <input
                    type="number"
                    value={config.hourlyCostPrinter}
                    onChange={(e) => updateConfig({ hourlyCostPrinter: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-transparent py-1.5 px-1 font-mono text-white text-xs focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Costo/h Router</label>
                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-2">
                  <span className="text-slate-400 font-mono">$</span>
                  <input
                    type="number"
                    value={config.hourlyCostRouter}
                    onChange={(e) => updateConfig({ hourlyCostRouter: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-transparent py-1.5 px-1 font-mono text-white text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Cost breakdown */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1.5 font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Impresión ({(summary.totalPrintMinutesNet / 60).toFixed(1)}h):</span>
                <span className="text-sky-400 font-semibold">${summary.costEstimate.printerCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Router CNC ({(summary.totalCutMinutesNet / 60).toFixed(1)}h):</span>
                <span className="text-emerald-400 font-semibold">${summary.costEstimate.routerCost.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-bold text-white">
                <span>Costo Total Máquinas:</span>
                <span className="text-cyan-400">${summary.costEstimate.totalCost.toFixed(2)}</span>
              </div>
            </div>

            {/* Delivery projection card */}
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg">
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                Fecha Prometida de Entrega
              </div>
              <div className="text-sm font-bold text-white capitalize mt-1">
                {deliveryFormatted}
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                {summary.estimatedWorkDays.toFixed(1)} días laborales ({config.hoursPerShift * config.shiftsPerDay}h por jornada)
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};
