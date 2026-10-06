import React from 'react';
import { PlateItem, WorkshopConfig, ProductionSummary } from '../types/production';
import { formatMinutesToHoursMinutes, formatMinutesToDecimalHours, getPlateMetrics } from '../utils/productionCalculations';
import { X, Printer as PrintIcon, CheckSquare } from 'lucide-react';

interface PrintOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  plates: PlateItem[];
  config: WorkshopConfig;
  summary: ProductionSummary;
}

export const PrintOrderModal: React.FC<PrintOrderModalProps> = ({
  isOpen,
  onClose,
  plates,
  config,
  summary,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const deliveryStr = summary.completionDate.toLocaleString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      
      {/* Container */}
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col text-slate-100">
        
        {/* Modal Action Bar (Hidden on paper print) */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between no-print sticky top-0 bg-slate-900 z-10">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-white">Hoja de Ruta / Orden de Taller</span>
            <span className="text-xs text-slate-400 font-mono">OP-PL-505</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold text-xs transition-colors"
            >
              <PrintIcon className="w-4 h-4" />
              <span>Imprimir / Guardar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Sheet (Pure white background when printed) */}
        <div className="p-8 sm:p-10 bg-slate-900 print:bg-white print:text-black">
          
          {/* Document Header */}
          <div className="border-b-2 border-slate-700 print:border-black pb-6 mb-6 flex justify-between items-start">
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 print:text-black font-semibold">
                ORDEN DE PRODUCCIÓN DE TALLER
              </div>
              <h1 className="text-2xl font-bold text-white print:text-black mt-1">
                Lote de 5 Placas (Impresión + Router CNC)
              </h1>
              <p className="text-xs text-slate-400 print:text-gray-600 mt-1 font-mono">
                Orden # OP-2026-505 · Fecha de emisión: {new Date().toLocaleDateString('es-ES')}
              </p>
            </div>

            <div className="text-right font-mono text-xs text-slate-300 print:text-black">
              <div><strong>Estado:</strong> PROGRAMADO</div>
              <div><strong>Prioridad:</strong> ALTA</div>
              <div><strong>Entrega Prometida:</strong></div>
              <div className="text-cyan-400 print:text-black font-bold capitalize">{deliveryStr}</div>
            </div>
          </div>

          {/* Key Parameters Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-950/60 print:bg-gray-100 print:border print:border-gray-300 mb-6 text-xs">
            <div>
              <span className="text-slate-400 print:text-gray-600 block">Total Unidades:</span>
              <strong className="text-base text-white print:text-black font-mono">
                {summary.totalPlatesCount} placas
              </strong>
            </div>
            <div>
              <span className="text-slate-400 print:text-gray-600 block">Tiempo Impresión:</span>
              <strong className="text-base text-sky-400 print:text-black font-mono">
                {formatMinutesToHoursMinutes(summary.totalPrintMinutesNet)}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 print:text-gray-600 block">Tiempo Router:</span>
              <strong className="text-base text-emerald-400 print:text-black font-mono">
                {formatMinutesToHoursMinutes(summary.totalCutMinutesNet)}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 print:text-gray-600 block">Duración Taller:</span>
              <strong className="text-base text-cyan-400 print:text-black font-mono">
                {formatMinutesToHoursMinutes(summary.makespanMinutes)}
              </strong>
            </div>
          </div>

          {/* Plates Specification Table */}
          <div className="mb-6 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-700 print:border-black text-slate-400 print:text-black">
                  <th className="py-2.5 px-3 font-semibold">Ítem</th>
                  <th className="py-2.5 px-3 font-semibold">Placa / Descripción</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Cant.</th>
                  <th className="py-2.5 px-3 font-semibold">Operaciones</th>
                  <th className="py-2.5 px-3 font-semibold text-right">T. Impr. (3,5m)</th>
                  <th className="py-2.5 px-3 font-semibold text-right">T. Corte (5,0m)</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Tiempo Total</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Control OK</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-gray-300">
                {plates.map((plate, i) => {
                  const m = getPlateMetrics(plate, config);
                  return (
                    <tr key={plate.id} className="print:text-black">
                      <td className="py-2.5 px-3 font-mono">{i + 1}</td>
                      <td className="py-2.5 px-3 font-bold">{plate.name}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold">{plate.quantity} u</td>
                      <td className="py-2.5 px-3">
                        {plate.hasPrint && plate.hasCut
                          ? 'Impresión + Corte Router'
                          : plate.hasPrint
                          ? 'Solo Impresión'
                          : 'Solo Corte Router CNC'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">
                        {plate.hasPrint ? formatMinutesToHoursMinutes(m.printMinutes) : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">
                        {plate.hasCut ? formatMinutesToHoursMinutes(m.cutMinutes) : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold">
                        {formatMinutesToHoursMinutes(m.totalMinutes)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="w-4 h-4 border border-slate-600 print:border-black rounded mx-auto" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-700 print:border-black font-bold text-white print:text-black">
                  <td colSpan={2} className="py-3 px-3">TOTALES CONSOLIDADOS</td>
                  <td className="py-3 px-3 text-center font-mono">{summary.totalPlatesCount} u</td>
                  <td className="py-3 px-3">
                    {summary.totalPrintPlates} imp · {summary.totalCutPlates} corte
                  </td>
                  <td className="py-3 px-3 text-right font-mono">
                    {formatMinutesToHoursMinutes(summary.totalPrintMinutesNet)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono">
                    {formatMinutesToHoursMinutes(summary.totalCutMinutesNet)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-cyan-300 print:text-black">
                    {formatMinutesToHoursMinutes(summary.totalWorkMinutesNet)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Operator Instructions */}
          <div className="border border-slate-800 print:border-gray-300 rounded-lg p-4 mb-8 text-xs text-slate-300 print:text-black">
            <h4 className="font-bold uppercase tracking-wider mb-2">Instrucciones de Taller & Secuencia:</h4>
            <ol className="list-decimal list-inside space-y-1 font-mono text-[11px] text-slate-400 print:text-gray-700">
              <li>El Router CNC debe comenzar de inmediato cortando Placas 3, 4 y 5 (sin impresión previa).</li>
              <li>La Impresora iniciará simultáneamente con Placa 1 (101 unidades) y luego Placa 2 (101 unidades).</li>
              <li>Verificar registro óptico / cruces de registro para Placas 1 y 2 en Router CNC antes del corte masivo.</li>
              <li>Aspiración y cambio de fresa de corte cada 150 placas para garantizar filo y acabado limpio.</li>
            </ol>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-800 print:border-black text-xs font-mono text-center">
            <div>
              <div className="h-14 border-b border-dashed border-slate-700 print:border-black mb-2" />
              <div className="font-bold text-white print:text-black">Firma Operador de Impresión / Router</div>
              <div className="text-slate-500 print:text-gray-600 text-[10px]">Taller de Producción</div>
            </div>
            <div>
              <div className="h-14 border-b border-dashed border-slate-700 print:border-black mb-2" />
              <div className="font-bold text-white print:text-black">Firma Jefe de Producción / Calidad</div>
              <div className="text-slate-500 print:text-gray-600 text-[10px]">Aprobación y Entrega</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
