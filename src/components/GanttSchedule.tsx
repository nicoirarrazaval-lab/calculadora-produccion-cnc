import React, { useState } from 'react';
import { GanttBlock, WorkshopConfig, ProductionSummary } from '../types/production';
import { formatMinutesToHoursMinutes } from '../utils/productionCalculations';
import { Clock, Info, Layers, Zap, SlidersHorizontal } from 'lucide-react';

interface GanttScheduleProps {
  blocks: GanttBlock[];
  summary: ProductionSummary;
  config: WorkshopConfig;
  setConfig: React.Dispatch<React.SetStateAction<WorkshopConfig>>;
}

export const GanttSchedule: React.FC<GanttScheduleProps> = ({
  blocks,
  summary,
  config,
  setConfig,
}) => {
  const [selectedBlock, setSelectedBlock] = useState<GanttBlock | null>(null);

  // Maximum timeline duration in minutes
  const maxMinutes = Math.max(1, summary.makespanMinutes);
  
  // Separate blocks by machine
  const printerBlocks = blocks.filter((b) => b.machineType === 'printer');
  
  // Group router blocks by machineIndex
  const routerCount = Math.max(1, config.routerCount || 1);
  const routerBlocksByMachine: GanttBlock[][] = Array.from({ length: routerCount }, (_, i) =>
    blocks.filter((b) => b.machineType === 'router' && b.machineIndex === i)
  );

  // Time markers every 5 hours (300 mins) or 10 hours depending on total
  const stepMinutes = maxMinutes > 1500 ? 300 : 120; // 5 hours or 2 hours
  const markerCount = Math.ceil(maxMinutes / stepMinutes);
  const markers = Array.from({ length: markerCount + 1 }, (_, i) => i * stepMinutes);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden mb-6">
      
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-white">Cronograma Visual de Taller (Diagrama Gantt)</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Simulación de flujo concurrente entre Impresión Digital y Router CNC
          </p>
        </div>

        {/* Strategy switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Estrategia de cola:</span>
          <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setConfig((prev) => ({ ...prev, strategy: 'optimized' }))}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                config.strategy === 'optimized'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Optimizado (P3-P5 primero)
            </button>
            <button
              onClick={() => setConfig((prev) => ({ ...prev, strategy: 'fifo' }))}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                config.strategy === 'fifo'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Secuencial (P1 → P5)
            </button>
          </div>
        </div>
      </div>

      {/* Main Gantt Canvas */}
      <div className="p-4 sm:p-6 overflow-x-auto">
        <div className="min-w-[760px]">
          
          {/* Time scale ruler */}
          <div className="relative h-7 border-b border-slate-800 mb-3 text-[11px] font-mono text-slate-400">
            {markers.map((minute) => {
              const leftPercent = (minute / maxMinutes) * 100;
              if (leftPercent > 100) return null;
              return (
                <div
                  key={minute}
                  style={{ left: `${leftPercent}%` }}
                  className="absolute transform -translate-x-1/2 flex flex-col items-center"
                >
                  <span>{(minute / 60).toFixed(0)}h</span>
                  <div className="w-px h-1.5 bg-slate-700 mt-0.5" />
                </div>
              );
            })}
          </div>

          {/* Machine Track 1: Impresora */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-sky-400">LÍNEA 1: IMPRESORA DIGITAL</span>
                <span className="text-[11px] text-slate-400 font-mono">
                  (Carga: {formatMinutesToHoursMinutes(summary.totalPrintMinutesNet)})
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {((summary.totalPrintMinutesNet / maxMinutes) * 100).toFixed(0)}% ocupación
              </span>
            </div>

            {/* Track Bar Container */}
            <div className="relative h-12 bg-slate-950/80 border border-slate-800/80 rounded-lg overflow-hidden">
              {/* Background grid lines */}
              {markers.map((minute) => {
                const leftPercent = (minute / maxMinutes) * 100;
                return (
                  <div
                    key={minute}
                    style={{ left: `${leftPercent}%` }}
                    className="absolute inset-y-0 w-px bg-slate-800/40 pointer-events-none"
                  />
                );
              })}

              {/* Blocks */}
              {printerBlocks.map((block) => {
                const left = (block.startMinute / maxMinutes) * 100;
                const width = Math.max(0.5, (block.durationMinutes / maxMinutes) * 100);

                return (
                  <button
                    key={block.id}
                    onClick={() => setSelectedBlock(block)}
                    style={{
                      left: `${left}%`,
                      width: `${width}%`,
                      backgroundColor: block.color,
                    }}
                    className="absolute top-1.5 bottom-1.5 rounded text-left px-2 flex flex-col justify-center text-slate-950 font-medium transition-transform hover:scale-[1.01] hover:brightness-110 shadow-sm overflow-hidden"
                  >
                    <span className="text-[11px] font-bold truncate leading-tight">
                      {block.plateName}
                    </span>
                    <span className="text-[10px] opacity-90 truncate leading-tight font-mono">
                      {block.units}u · {formatMinutesToHoursMinutes(block.durationMinutes)}
                    </span>
                  </button>
                );
              })}

              {/* Idle remainder of printer */}
              {summary.totalPrintMinutesNet < maxMinutes && (
                <div
                  style={{
                    left: `${(summary.totalPrintMinutesNet / maxMinutes) * 100}%`,
                    right: 0,
                  }}
                  className="absolute inset-y-0 bg-slate-900/40 border-l border-dashed border-slate-700 flex items-center justify-center text-[11px] text-slate-400 font-mono"
                >
                  Impresora Libre / Disponible
                </div>
              )}
            </div>
          </div>

          {/* Machine Track 2+: Router CNC(s) */}
          {routerBlocksByMachine.map((rBlocks, rIndex) => (
            <div key={rIndex} className="mb-5">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-emerald-400">
                    LÍNEA {rIndex + 2}: ROUTER CNC {routerCount > 1 ? `#${rIndex + 1}` : ''}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    (Carga: {formatMinutesToHoursMinutes(summary.totalCutMinutesNet / routerCount)})
                  </span>
                </div>
                <span className="text-[11px] text-emerald-400/90 font-mono font-medium">
                  {summary.bottleneckMachine === 'Router CNC' ? 'Cuello de Botella Crítico (100%)' : 'Ocupación alta'}
                </span>
              </div>

              {/* Track Bar Container */}
              <div className="relative h-12 bg-slate-950/80 border border-slate-800/80 rounded-lg overflow-hidden">
                {/* Background grid lines */}
                {markers.map((minute) => {
                  const leftPercent = (minute / maxMinutes) * 100;
                  return (
                    <div
                      key={minute}
                      style={{ left: `${leftPercent}%` }}
                      className="absolute inset-y-0 w-px bg-slate-800/40 pointer-events-none"
                    />
                  );
                })}

                {/* Blocks */}
                {rBlocks.map((block) => {
                  const left = (block.startMinute / maxMinutes) * 100;
                  const width = Math.max(0.5, (block.durationMinutes / maxMinutes) * 100);

                  return (
                    <button
                      key={block.id}
                      onClick={() => setSelectedBlock(block)}
                      style={{
                        left: `${left}%`,
                        width: `${width}%`,
                        backgroundColor: block.color,
                      }}
                      className="absolute top-1.5 bottom-1.5 rounded text-left px-2 flex flex-col justify-center text-slate-950 font-medium transition-transform hover:scale-[1.01] hover:brightness-110 shadow-sm overflow-hidden"
                    >
                      <span className="text-[11px] font-bold truncate leading-tight">
                        {block.plateName}
                      </span>
                      <span className="text-[10px] opacity-90 truncate leading-tight font-mono">
                        {block.units}u · {formatMinutesToHoursMinutes(block.durationMinutes)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

        </div>
      </div>

      {/* Selected Block Quick Inspector */}
      {selectedBlock && (
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div
              className="w-3.5 h-3.5 rounded"
              style={{ backgroundColor: selectedBlock.color }}
            />
            <div>
              <span className="font-bold text-white text-sm mr-2">{selectedBlock.plateName}</span>
              <span className="text-slate-400 font-mono">
                {selectedBlock.machineType === 'printer' ? 'Impresión Digital' : 'Corte Router CNC'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-300 font-mono">
            <div>
              <span className="text-slate-400">Cantidad:</span> {selectedBlock.units} unidades
            </div>
            <div>
              <span className="text-slate-400">Tiempo unitario:</span> {selectedBlock.unitTime} min/placa
            </div>
            <div>
              <span className="text-slate-400">Duración:</span>{' '}
              <strong className="text-cyan-400">{formatMinutesToHoursMinutes(selectedBlock.durationMinutes)}</strong>
            </div>
            <div>
              <span className="text-slate-400">Inicio:</span> {(selectedBlock.startMinute / 60).toFixed(1)}h
              <span className="text-slate-400 mx-1">→</span>
              <span className="text-slate-400">Fin:</span> {(selectedBlock.endMinute / 60).toFixed(1)}h
            </div>
            <button
              onClick={() => setSelectedBlock(null)}
              className="text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Bottom Insights */}
      <div className="p-4 bg-slate-950/40 border-t border-slate-800 text-xs text-slate-400 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <strong className="text-slate-300">¿Por qué el Router es el Cuello de Botella?</strong>
          <p className="mt-0.5">
            El Router tiene 505 placas × 5 min = 2.525 min (42,1 horas), mientras que la impresora solo tiene 202 placas × 3,5 min = 707 min (11,8 horas). La impresora terminará casi 30 horas antes que el Router CNC.
          </p>
        </div>
        <div>
          <strong className="text-slate-300">Recomendación de Taller:</strong>
          <p className="mt-0.5">
            Al cortar primero las Placas 3, 4 y 5 (que no requieren impresión), el Router arranca al minuto 0 sin esperar a la impresora. Si se dispone de un 2º Router, el tiempo total se reduce a la mitad (~21 horas).
          </p>
        </div>
      </div>

    </div>
  );
};
