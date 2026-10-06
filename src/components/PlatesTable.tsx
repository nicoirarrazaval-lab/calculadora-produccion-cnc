import React, { useState } from 'react';
import { PlateItem, WorkshopConfig } from '../types/production';
import {
  formatMinutesToHoursMinutes,
  formatMinutesToDecimalHours,
  getPlateMetrics,
  minutesToMinSec,
  minSecToMinutes,
} from '../utils/productionCalculations';
import { Plus, Trash2, Copy, Check, Printer, Scissors, HelpCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';

interface PlatesTableProps {
  plates: PlateItem[];
  setPlates: React.Dispatch<React.SetStateAction<PlateItem[]>>;
  config: WorkshopConfig;
}

export const PlatesTable: React.FC<PlatesTableProps> = ({ plates, setPlates, config }) => {
  const [editingModalPlateId, setEditingModalPlateId] = useState<string | null>(null);

  const updatePlate = (id: string, updates: Partial<PlateItem>) => {
    setPlates((prev) =>
      prev.map((plate) => (plate.id === id ? { ...plate, ...updates } : plate))
    );
  };

  const handleDuplicate = (plate: PlateItem) => {
    const newPlate: PlateItem = {
      ...plate,
      id: `placa-${Date.now()}`,
      name: `${plate.name} (Copia)`,
      completedPrintUnits: 0,
      completedCutUnits: 0,
      priority: plates.length + 1,
    };
    setPlates((prev) => [...prev, newPlate]);
  };

  const handleDelete = (id: string) => {
    if (plates.length <= 1) return;
    setPlates((prev) => prev.filter((p) => p.id !== id));
  };

  const handleAddPlate = () => {
    const nextNumber = plates.length + 1;
    const newPlate: PlateItem = {
      id: `placa-${Date.now()}`,
      name: `PLACA ${nextNumber}`,
      quantity: 101,
      hasPrint: true,
      hasCut: true,
      printTimePerUnit: 3.5,
      cutTimePerUnit: 5.0,
      material: 'PVC Espumado 5mm',
      thickness: '5 mm',
      completedPrintUnits: 0,
      completedCutUnits: 0,
      priority: nextNumber,
    };
    setPlates((prev) => [...prev, newPlate]);
  };

  const handleSetAllQuantity = (qty: number) => {
    setPlates((prev) => prev.map((p) => ({ ...p, quantity: qty })));
  };

  const handleResetStandardTimes = () => {
    setPlates((prev) =>
      prev.map((p) => ({
        ...p,
        printTimePerUnit: 3.5,
        cutTimePerUnit: 5.0,
      }))
    );
  };

  // Grand summary values for the table footer
  let sumPlates = 0;
  let sumPrintPlates = 0;
  let sumCutPlates = 0;
  let sumPrintMin = 0;
  let sumCutMin = 0;
  let sumTotalMin = 0;

  plates.forEach((p) => {
    const m = getPlateMetrics(p, config);
    sumPlates += p.quantity;
    if (p.hasPrint) sumPrintPlates += p.quantity;
    if (p.hasCut) sumCutPlates += p.quantity;
    sumPrintMin += m.printMinutes;
    sumCutMin += m.cutMinutes;
    sumTotalMin += m.totalMinutes;
  });

  const selectedPlateForDetail = plates.find((p) => p.id === editingModalPlateId);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden mb-6">
      
      {/* Table Header Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-white">Desglose de Producción por Placa</h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
            <span>{plates.length} placas configuradas</span>
            <span aria-hidden="true">·</span>
            <span>Edición individual o grupal de tiempos</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg p-1 text-xs">
            <span className="text-slate-400 px-2">Fijar todas:</span>
            <button
              onClick={() => handleSetAllQuantity(101)}
              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-mono"
            >
              101 u
            </button>
            <button
              onClick={() => handleSetAllQuantity(50)}
              className="px-2 py-0.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded font-mono"
            >
              50 u
            </button>
            <button
              onClick={() => handleSetAllQuantity(200)}
              className="px-2 py-0.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded font-mono"
            >
              200 u
            </button>
          </div>

          <button
            onClick={handleResetStandardTimes}
            title="Restablecer 3.5 min impr. y 5.0 min corte"
            className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
          >
            Reajustar 3,5m / 5m
          </button>

          <button
            onClick={handleAddPlate}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-900 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Añadir Placa</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-950/60 text-slate-400 text-xs border-b border-slate-800">
            <tr>
              <th scope="col" className="py-3 px-3 font-medium w-10 text-center">#</th>
              <th scope="col" className="py-3 px-3 font-medium min-w-[150px]">Identificación / Placa</th>
              <th scope="col" className="py-3 px-3 font-medium text-center min-w-[120px]">Cantidad</th>
              <th scope="col" className="py-3 px-3 font-medium text-center min-w-[130px]">Procesos</th>
              <th scope="col" className="py-3 px-3 font-medium text-center min-w-[150px]">
                <div className="flex items-center justify-center gap-1 text-sky-400">
                  <Printer className="w-3.5 h-3.5" />
                  <span>T. Impresión</span>
                </div>
              </th>
              <th scope="col" className="py-3 px-3 font-medium text-center min-w-[150px]">
                <div className="flex items-center justify-center gap-1 text-emerald-400">
                  <Scissors className="w-3.5 h-3.5" />
                  <span>T. Router CNC</span>
                </div>
              </th>
              <th scope="col" className="py-3 px-3 font-medium text-right min-w-[120px]">Tiempo Total</th>
              <th scope="col" className="py-3 px-3 font-medium min-w-[120px]">Distribución</th>
              <th scope="col" className="py-3 px-3 font-medium text-center w-16">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {plates.map((plate, idx) => {
              const metrics = getPlateMetrics(plate, config);
              const printRatio = metrics.totalMinutes > 0 ? (metrics.printMinutes / metrics.totalMinutes) * 100 : 0;
              const cutRatio = metrics.totalMinutes > 0 ? (metrics.cutMinutes / metrics.totalMinutes) * 100 : 0;

              const printMs = minutesToMinSec(plate.printTimePerUnit);
              const cutMs = minutesToMinSec(plate.cutTimePerUnit);

              return (
                <tr key={plate.id} className="hover:bg-slate-800/40 transition-colors">
                  
                  {/* Row index */}
                  <td className="py-3 px-3 text-center font-mono text-xs text-slate-500">
                    {idx + 1}
                  </td>

                  {/* Name & Material */}
                  <td className="py-3 px-3">
                    <div className="flex flex-col">
                      <input
                        type="text"
                        value={plate.name}
                        onChange={(e) => updatePlate(plate.id, { name: e.target.value })}
                        className="bg-transparent font-medium text-slate-100 hover:text-cyan-300 focus:text-white focus:bg-slate-950/80 focus:ring-1 focus:ring-cyan-500 rounded px-1.5 py-0.5 -ml-1.5 text-sm transition-colors border border-transparent focus:border-cyan-500/50"
                      />
                      <span className="text-[11px] text-slate-400 px-0.5 mt-0.5">
                        {plate.hasPrint && plate.hasCut
                          ? 'Impresión + Corte'
                          : plate.hasPrint
                          ? 'Solo Impresión'
                          : 'Solo Corte (Router)'}
                      </span>
                    </div>
                  </td>

                  {/* Quantity with quick adjust */}
                  <td className="py-3 px-3 text-center">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => updatePlate(plate.id, { quantity: Math.max(1, plate.quantity - 10) })}
                        title="-10 unidades"
                        className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs font-mono"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={plate.quantity}
                        onChange={(e) => updatePlate(plate.id, { quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                        className="w-16 text-center font-mono font-semibold text-white bg-slate-950 border border-slate-700 rounded py-1 px-1 text-sm focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                      />
                      <button
                        onClick={() => updatePlate(plate.id, { quantity: plate.quantity + 10 })}
                        title="+10 unidades"
                        className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs font-mono"
                      >
                        +
                      </button>
                    </div>
                  </td>

                  {/* Process checkboxes */}
                  <td className="py-3 px-3">
                    <div className="flex items-center justify-center gap-2">
                      <label className="flex items-center gap-1 cursor-pointer text-xs group">
                        <input
                          type="checkbox"
                          checked={plate.hasPrint}
                          onChange={(e) => updatePlate(plate.id, { hasPrint: e.target.checked })}
                          className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-950 text-sky-500 focus:ring-sky-500/30"
                        />
                        <span className={`group-hover:text-white transition-colors ${plate.hasPrint ? 'text-sky-400 font-medium' : 'text-slate-400 line-through'}`}>
                          Impr.
                        </span>
                      </label>

                      <label className="flex items-center gap-1 cursor-pointer text-xs group">
                        <input
                          type="checkbox"
                          checked={plate.hasCut}
                          onChange={(e) => updatePlate(plate.id, { hasCut: e.target.checked })}
                          className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500/30"
                        />
                        <span className={`group-hover:text-white transition-colors ${plate.hasCut ? 'text-emerald-400 font-medium' : 'text-slate-400 line-through'}`}>
                          Corte
                        </span>
                      </label>
                    </div>
                  </td>

                  {/* Print Time Column (Enhanced with Steppers & Clear Inputs) */}
                  <td className="py-3 px-3 text-center">
                    {plate.hasPrint ? (
                      <div className="flex flex-col items-center">
                        <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg p-1">
                          <button
                            onClick={() => updatePlate(plate.id, { printTimePerUnit: Math.max(0.1, Number((plate.printTimePerUnit - 0.5).toFixed(2))) })}
                            title="Restar 30 seg (-0.5 min)"
                            className="w-5 h-5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-mono"
                          >
                            -
                          </button>
                          
                          <input
                            type="number"
                            step="0.1"
                            min="0.1"
                            value={plate.printTimePerUnit}
                            onChange={(e) => updatePlate(plate.id, { printTimePerUnit: Math.max(0.1, parseFloat(e.target.value) || 0.1) })}
                            className="w-12 text-center bg-transparent font-mono font-bold text-sky-300 text-xs focus:outline-none"
                          />
                          <span className="text-[10px] text-slate-500 font-mono pr-0.5">m</span>

                          <button
                            onClick={() => updatePlate(plate.id, { printTimePerUnit: Number((plate.printTimePerUnit + 0.5).toFixed(2)) })}
                            title="Sumar 30 seg (+0.5 min)"
                            className="w-5 h-5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-mono"
                          >
                            +
                          </button>
                        </div>

                        <div className="flex items-center gap-1 mt-1 text-[11px] font-mono text-slate-400">
                          <span>{printMs.mins}m {printMs.secs.toString().padStart(2, '0')}s</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-sky-400/90 font-semibold">{formatMinutesToHoursMinutes(metrics.printMinutes)}</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-600 font-mono">-</span>
                    )}
                  </td>

                  {/* Cut Time Column (Enhanced with Steppers & Clear Inputs) */}
                  <td className="py-3 px-3 text-center">
                    {plate.hasCut ? (
                      <div className="flex flex-col items-center">
                        <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg p-1">
                          <button
                            onClick={() => updatePlate(plate.id, { cutTimePerUnit: Math.max(0.1, Number((plate.cutTimePerUnit - 0.5).toFixed(2))) })}
                            title="Restar 30 seg (-0.5 min)"
                            className="w-5 h-5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-mono"
                          >
                            -
                          </button>

                          <input
                            type="number"
                            step="0.1"
                            min="0.1"
                            value={plate.cutTimePerUnit}
                            onChange={(e) => updatePlate(plate.id, { cutTimePerUnit: Math.max(0.1, parseFloat(e.target.value) || 0.1) })}
                            className="w-12 text-center bg-transparent font-mono font-bold text-emerald-300 text-xs focus:outline-none"
                          />
                          <span className="text-[10px] text-slate-500 font-mono pr-0.5">m</span>

                          <button
                            onClick={() => updatePlate(plate.id, { cutTimePerUnit: Number((plate.cutTimePerUnit + 0.5).toFixed(2)) })}
                            title="Sumar 30 seg (+0.5 min)"
                            className="w-5 h-5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-mono"
                          >
                            +
                          </button>
                        </div>

                        <div className="flex items-center gap-1 mt-1 text-[11px] font-mono text-slate-400">
                          <span>{cutMs.mins}m {cutMs.secs.toString().padStart(2, '0')}s</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-emerald-400/90 font-semibold">{formatMinutesToHoursMinutes(metrics.cutMinutes)}</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-600 font-mono">-</span>
                    )}
                  </td>

                  {/* Total Time per Plate */}
                  <td className="py-3 px-3 text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-mono font-semibold text-white tabular-nums text-sm">
                        {formatMinutesToHoursMinutes(metrics.totalMinutes)}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {metrics.totalMinutes.toFixed(1)} min
                      </span>
                    </div>
                  </td>

                  {/* Visual ratio bar */}
                  <td className="py-3 px-3">
                    <div className="w-full">
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                        {plate.hasPrint && (
                          <div
                            style={{ width: `${printRatio}%` }}
                            className="bg-sky-400 h-full"
                            title={`Impresión: ${printRatio.toFixed(0)}%`}
                          />
                        )}
                        {plate.hasCut && (
                          <div
                            style={{ width: `${cutRatio}%` }}
                            className="bg-emerald-400 h-full"
                            title={`Corte Router: ${cutRatio.toFixed(0)}%`}
                          />
                        )}
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                        <span>{plate.hasPrint ? `${printRatio.toFixed(0)}% imp` : ''}</span>
                        <span>{plate.hasCut ? `${cutRatio.toFixed(0)}% corte` : ''}</span>
                      </div>
                    </div>
                  </td>

                  {/* Action buttons */}
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleDuplicate(plate)}
                        title="Duplicar placa"
                        className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(plate.id)}
                        title="Eliminar placa"
                        disabled={plates.length <= 1}
                        className="p-1 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                </tr>
              );
            })}
          </tbody>

          {/* Table Footer with Totals */}
          <tfoot className="bg-slate-950 font-medium text-slate-200 border-t-2 border-slate-800 text-xs">
            <tr>
              <td className="py-3.5 px-3 text-center text-slate-400 font-mono">Σ</td>
              <td className="py-3.5 px-3 font-bold text-white uppercase tracking-wider">
                Totales ({plates.length} Placas)
              </td>
              <td className="py-3.5 px-3 text-center font-mono font-bold text-white text-sm">
                {sumPlates} u
              </td>
              <td className="py-3.5 px-3 text-center text-slate-400">
                <span>{sumPrintPlates} imp · {sumCutPlates} corte</span>
              </td>
              <td className="py-3.5 px-3 text-center font-mono font-bold text-sky-400 text-sm">
                {formatMinutesToHoursMinutes(sumPrintMin)}
                <div className="text-[10px] text-sky-400/80 font-normal">
                  {sumPrintMin.toFixed(0)} min ({formatMinutesToDecimalHours(sumPrintMin)})
                </div>
              </td>
              <td className="py-3.5 px-3 text-center font-mono font-bold text-emerald-400 text-sm">
                {formatMinutesToHoursMinutes(sumCutMin)}
                <div className="text-[10px] text-emerald-400/80 font-normal">
                  {sumCutMin.toFixed(0)} min ({formatMinutesToDecimalHours(sumCutMin)})
                </div>
              </td>
              <td className="py-3.5 px-3 text-right font-mono font-bold text-cyan-300 text-sm">
                {formatMinutesToHoursMinutes(sumTotalMin)}
                <div className="text-[10px] text-cyan-400/80 font-normal">
                  {sumTotalMin.toFixed(0)} min ({formatMinutesToDecimalHours(sumTotalMin)})
                </div>
              </td>
              <td colSpan={2} className="py-3.5 px-3 text-slate-400 text-[11px]">
                Suma acumulada de trabajo de máquinas
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Footer Notes */}
      <div className="p-4 bg-slate-950/40 border-t border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
          <span>
            Puedes ajustar los tiempos con los botones <strong className="text-white font-mono">[+]</strong> y <strong className="text-white font-mono">[-]</strong> o escribir directamente el valor en minutos decimales.
          </span>
        </div>
        <div className="text-slate-400 font-mono text-[11px]">
          Fórmula: Cantidad × Minutos por placa ÷ Eficiencia
        </div>
      </div>

    </div>
  );
};
