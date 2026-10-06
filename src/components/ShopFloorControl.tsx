import React, { useState, useEffect } from 'react';
import { PlateItem, WorkshopConfig } from '../types/production';
import { formatMinutesToHoursMinutes } from '../utils/productionCalculations';
import { Play, Pause, RotateCcw, CheckCircle2, AlertCircle, Printer, Scissors, Volume2, VolumeX } from 'lucide-react';

interface ShopFloorControlProps {
  plates: PlateItem[];
  setPlates: React.Dispatch<React.SetStateAction<PlateItem[]>>;
  config: WorkshopConfig;
}

export const ShopFloorControl: React.FC<ShopFloorControlProps> = ({
  plates,
  setPlates,
  config,
}) => {
  const [activeStation, setActiveStation] = useState<'printer' | 'router'>('printer');
  const [selectedPlateId, setSelectedPlateId] = useState<string>(plates[0]?.id || 'placa-1');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const selectedPlate = plates.find((p) => p.id === selectedPlateId) || plates[0];
  const targetSecondsPerPlate = activeStation === 'printer' 
    ? (selectedPlate?.printTimePerUnit || 3.5) * 60 
    : (selectedPlate?.cutTimePerUnit || 5.0) * 60;

  // Live timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const handleIncrementProgress = () => {
    if (!selectedPlate) return;

    if (activeStation === 'printer') {
      const nextVal = Math.min(selectedPlate.quantity, selectedPlate.completedPrintUnits + 1);
      setPlates((prev) =>
        prev.map((p) => (p.id === selectedPlate.id ? { ...p, completedPrintUnits: nextVal } : p))
      );
    } else {
      const nextVal = Math.min(selectedPlate.quantity, selectedPlate.completedCutUnits + 1);
      setPlates((prev) =>
        prev.map((p) => (p.id === selectedPlate.id ? { ...p, completedCutUnits: nextVal } : p))
      );
    }

    // Reset current plate stopwatch
    setSecondsElapsed(0);
  };

  const handleResetCurrent = () => {
    setIsRunning(false);
    setSecondsElapsed(0);
  };

  const timerMinutes = Math.floor(secondsElapsed / 60);
  const timerSecs = secondsElapsed % 60;
  const plateTimeProgress = Math.min(100, (secondsElapsed / targetSecondsPerPlate) * 100);

  // Filter plates relevant to this station
  const stationPlates = plates.filter((p) => (activeStation === 'printer' ? p.hasPrint : p.hasCut));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden mb-6">
      
      {/* Top Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-white">Panel de Control de Operador en Planta</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Registro de avance en tiempo real y cronómetro por estación de trabajo
          </p>
        </div>

        {/* Station switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs">
            <button
              onClick={() => {
                setActiveStation('printer');
                const firstPrint = plates.find((p) => p.hasPrint);
                if (firstPrint) setSelectedPlateId(firstPrint.id);
                handleResetCurrent();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 font-medium rounded-md transition-colors ${
                activeStation === 'printer'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Estación Impresión (3,5m)</span>
            </button>

            <button
              onClick={() => {
                setActiveStation('router');
                const firstCut = plates.find((p) => p.hasCut);
                if (firstCut) setSelectedPlateId(firstCut.id);
                handleResetCurrent();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 font-medium rounded-md transition-colors ${
                activeStation === 'router'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>Estación Router CNC (5,0m)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Floor Body */}
      <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Plate Queue Selector */}
        <div className="lg:col-span-4 space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Cola de Placas ({stationPlates.length})
          </span>

          <div className="space-y-1.5">
            {stationPlates.map((plate) => {
              const completed = activeStation === 'printer' ? plate.completedPrintUnits : plate.completedCutUnits;
              const isSelected = plate.id === selectedPlateId;
              const isFinished = completed >= plate.quantity;

              return (
                <button
                  key={plate.id}
                  onClick={() => {
                    setSelectedPlateId(plate.id);
                    handleResetCurrent();
                  }}
                  className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between ${
                    isSelected
                      ? activeStation === 'printer'
                        ? 'bg-sky-950/40 border-sky-500/40 text-white'
                        : 'bg-emerald-950/40 border-emerald-500/40 text-white'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs">{plate.name}</span>
                      {isFinished && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {plate.quantity} unid · {activeStation === 'printer' ? plate.printTimePerUnit : plate.cutTimePerUnit} min/u
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-bold tabular-nums">
                      {completed} / {plate.quantity}
                    </span>
                    <div className="w-16 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                      <div
                        style={{ width: `${(completed / plate.quantity) * 100}%` }}
                        className={`h-full ${
                          activeStation === 'printer' ? 'bg-sky-400' : 'bg-emerald-400'
                        }`}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center / Right: Active Stopwatch & Big Control */}
        <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono text-cyan-400 tracking-wider">
                  PLACA ACTIVA EN MÁQUINA
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">
                  {selectedPlate ? selectedPlate.name : 'Ninguna'}
                </h3>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 block">Tiempo Teórico Unitario</span>
                <span className="text-base font-mono font-bold text-white">
                  {activeStation === 'printer'
                    ? `${selectedPlate?.printTimePerUnit || 3.5} min (3m 30s)`
                    : `${selectedPlate?.cutTimePerUnit || 5.0} min (5m 00s)`}
                </span>
              </div>
            </div>

            {/* Big Stopwatch Display */}
            <div className="my-8 text-center">
              <div className="text-5xl sm:text-6xl font-mono font-bold text-white tracking-tight tabular-nums">
                {timerMinutes.toString().padStart(2, '0')}:{timerSecs.toString().padStart(2, '0')}
              </div>
              <p className="text-xs text-slate-400 mt-2 font-mono">
                {secondsElapsed >= targetSecondsPerPlate ? (
                  <span className="text-amber-400 font-semibold">
                    ¡Tiempo estándar completado! Listo para retirar placa.
                  </span>
                ) : (
                  <span>
                    Faltan {Math.max(0, Math.ceil((targetSecondsPerPlate - secondsElapsed) / 60))} min aprox.
                  </span>
                )}
              </p>

              {/* Progress bar of current plate */}
              <div className="max-w-md mx-auto h-2 bg-slate-800 rounded-full mt-4 overflow-hidden">
                <div
                  style={{ width: `${plateTimeProgress}%` }}
                  className={`h-full transition-all duration-300 ${
                    secondsElapsed > targetSecondsPerPlate
                      ? 'bg-amber-400'
                      : activeStation === 'printer'
                      ? 'bg-sky-400'
                      : 'bg-emerald-400'
                  }`}
                />
              </div>
            </div>

            {/* Stopwatch Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                  isRunning
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    : 'bg-cyan-400 hover:bg-cyan-300 text-slate-950'
                }`}
              >
                {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isRunning ? 'Pausar' : 'Iniciar Placa'}</span>
              </button>

              <button
                onClick={handleResetCurrent}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-mono transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reiniciar Reloj</span>
              </button>

              <button
                onClick={handleIncrementProgress}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-sm shadow-emerald-950"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Registrar Placa Terminada (+1)</span>
              </button>
            </div>
          </div>

          {/* Quick status summary footer */}
          <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              Completadas de {selectedPlate?.name}:{' '}
              <strong className="text-white font-mono">
                {activeStation === 'printer'
                  ? selectedPlate?.completedPrintUnits
                  : selectedPlate?.completedCutUnits}{' '}
                de {selectedPlate?.quantity}
              </strong>
            </span>

            <button
              onClick={() => {
                if (selectedPlate) {
                  if (activeStation === 'printer') {
                    setPlates((prev) =>
                      prev.map((p) => (p.id === selectedPlate.id ? { ...p, completedPrintUnits: 0 } : p))
                    );
                  } else {
                    setPlates((prev) =>
                      prev.map((p) => (p.id === selectedPlate.id ? { ...p, completedCutUnits: 0 } : p))
                    );
                  }
                }
              }}
              className="text-[11px] text-slate-500 hover:text-slate-300 underline"
            >
              Reiniciar contador de lote
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
