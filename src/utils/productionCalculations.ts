import { PlateItem, WorkshopConfig, ProductionSummary, GanttBlock } from '../types/production';

export const INITIAL_PLATES: PlateItem[] = [
  {
    id: 'placa-1',
    name: 'PLACA 1',
    quantity: 101,
    hasPrint: true,
    hasCut: true,
    printTimePerUnit: 3.5,
    cutTimePerUnit: 5.0,
    material: 'PVC Espumado / Sintra',
    thickness: '5 mm',
    notes: 'Impresión UV Directa + Corte perimetral con registro óptico',
    completedPrintUnits: 0,
    completedCutUnits: 0,
    priority: 1,
  },
  {
    id: 'placa-2',
    name: 'PLACA 2',
    quantity: 101,
    hasPrint: true,
    hasCut: true,
    printTimePerUnit: 3.5,
    cutTimePerUnit: 5.0,
    material: 'PVC Espumado / Sintra',
    thickness: '5 mm',
    notes: 'Impresión UV Directa + Corte perimetral con registro óptico',
    completedPrintUnits: 0,
    completedCutUnits: 0,
    priority: 2,
  },
  {
    id: 'placa-3',
    name: 'PLACA 3',
    quantity: 101,
    hasPrint: false,
    hasCut: true,
    printTimePerUnit: 3.5,
    cutTimePerUnit: 5.0,
    material: 'Acrílico Cristal / MDF',
    thickness: '3 mm',
    notes: 'Solo corte en Router CNC (fresado directo sin impresión previa)',
    completedPrintUnits: 0,
    completedCutUnits: 0,
    priority: 3,
  },
  {
    id: 'placa-4',
    name: 'PLACA 4',
    quantity: 101,
    hasPrint: false,
    hasCut: true,
    printTimePerUnit: 3.5,
    cutTimePerUnit: 5.0,
    material: 'Acrílico Cristal / MDF',
    thickness: '3 mm',
    notes: 'Solo corte en Router CNC (fresado directo sin impresión previa)',
    completedPrintUnits: 0,
    completedCutUnits: 0,
    priority: 4,
  },
  {
    id: 'placa-5',
    name: 'PLACA 5',
    quantity: 101,
    hasPrint: false,
    hasCut: true,
    printTimePerUnit: 3.5,
    cutTimePerUnit: 5.0,
    material: 'Acrílico Cristal / MDF',
    thickness: '3 mm',
    notes: 'Solo corte en Router CNC (fresado directo sin impresión previa)',
    completedPrintUnits: 0,
    completedCutUnits: 0,
    priority: 5,
  },
];

export const DEFAULT_CONFIG: WorkshopConfig = {
  printerCount: 1,
  routerCount: 1,
  hoursPerShift: 8,
  shiftsPerDay: 1, // 8h working day by default
  workDaysPerWeek: 5, // Lunes a Viernes
  startDateTime: new Date().toISOString(),
  efficiencyPercent: 100, // 100% ideal or 85% with OEE
  strategy: 'optimized', // 'optimized' cuts independent plates (3,4,5) first while printing 1,2
  hourlyCostPrinter: 35.0, // $/h
  hourlyCostRouter: 45.0, // $/h
  plateChangeTimeMin: 0, // setup extra
};

/**
 * Format minutes into "Xh Ym" string
 */
export function formatMinutesToHoursMinutes(totalMinutes: number): string {
  if (isNaN(totalMinutes) || totalMinutes < 0) return '0m';
  const rounded = Math.round(totalMinutes);
  const hours = Math.floor(rounded / 60);
  const minutes = rounded % 60;
  
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} h`;
  return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
}

/**
 * Format minutes into decimal hours string (e.g. "11.78 h")
 */
export function formatMinutesToDecimalHours(totalMinutes: number): string {
  const hours = totalMinutes / 60;
  return `${hours.toFixed(2)} h`;
}

/**
 * Converts decimal minutes (e.g. 3.5) into minutes and seconds { mins: 3, secs: 30 }
 */
export function minutesToMinSec(minutes: number): { mins: number; secs: number } {
  const validMin = Math.max(0, isNaN(minutes) ? 0 : minutes);
  const totalSecs = Math.round(validMin * 60);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  return { mins, secs };
}

/**
 * Converts minutes and seconds to decimal minutes (e.g. 3m 30s -> 3.5)
 */
export function minSecToMinutes(mins: number, secs: number): number {
  const safeMins = Math.max(0, isNaN(mins) ? 0 : mins);
  const safeSecs = Math.max(0, isNaN(secs) ? 0 : secs);
  return Number((safeMins + safeSecs / 60).toFixed(3));
}

/**
 * Formats unit time clearly, e.g. "3.5 min (3m 30s)"
 */
export function formatUnitTimeDisplay(minutes: number): string {
  const { mins, secs } = minutesToMinSec(minutes);
  if (secs === 0) return `${mins} min`;
  return `${minutes.toFixed(1)}m (${mins}m ${secs.toString().padStart(2, '0')}s)`;
}


/**
 * Calculates raw machine metrics for a plate item
 */
export function getPlateMetrics(plate: PlateItem, config: WorkshopConfig) {
  const efficiency = (config.efficiencyPercent || 100) / 100;
  const setupExtra = config.plateChangeTimeMin || 0;

  const printTimePerUnitEffective = (plate.hasPrint ? (plate.printTimePerUnit + setupExtra) : 0) / efficiency;
  const cutTimePerUnitEffective = (plate.hasCut ? (plate.cutTimePerUnit + setupExtra) : 0) / efficiency;

  const printMinutes = plate.hasPrint ? plate.quantity * printTimePerUnitEffective : 0;
  const cutMinutes = plate.hasCut ? plate.quantity * cutTimePerUnitEffective : 0;
  const totalMinutes = printMinutes + cutMinutes;

  return {
    printMinutes,
    cutMinutes,
    totalMinutes,
    printHours: printMinutes / 60,
    cutHours: cutMinutes / 60,
    totalHours: totalMinutes / 60,
  };
}

/**
 * Computes workshop delivery date taking into account shift schedule and weekend breaks
 */
export function calculateCompletionDate(
  startIsoDate: string,
  makespanMinutes: number,
  hoursPerShift: number,
  shiftsPerDay: number,
  workDaysPerWeek: 5 | 6 | 7
): Date {
  const startDate = new Date(startIsoDate);
  const dailyWorkMinutes = hoursPerShift * shiftsPerDay * 60;
  
  if (dailyWorkMinutes <= 0) return startDate;

  let remainingMinutes = makespanMinutes;
  const cursor = new Date(startDate.getTime());

  // Define daily work start hour (e.g. 8:00 AM)
  const workStartHour = 8;
  const workEndHour = workStartHour + (hoursPerShift * shiftsPerDay);

  // If start date is currently outside working hours, snap to start of next working period
  while (remainingMinutes > 0) {
    const dayOfWeek = cursor.getDay(); // 0 is Sunday, 6 is Saturday
    const isWeekend = (workDaysPerWeek === 5 && (dayOfWeek === 0 || dayOfWeek === 6)) ||
                      (workDaysPerWeek === 6 && dayOfWeek === 0);

    if (isWeekend) {
      // Advance to next day at workStartHour
      cursor.setDate(cursor.getDate() + 1);
      cursor.setHours(workStartHour, 0, 0, 0);
      continue;
    }

    const currentHour = cursor.getHours() + cursor.getMinutes() / 60;
    if (currentHour < workStartHour) {
      cursor.setHours(workStartHour, 0, 0, 0);
    } else if (currentHour >= workEndHour) {
      // Advance to tomorrow at workStartHour
      cursor.setDate(cursor.getDate() + 1);
      cursor.setHours(workStartHour, 0, 0, 0);
      continue;
    }

    // Minutes remaining in this working day
    const minutesLeftInDay = (workEndHour - (cursor.getHours() + cursor.getMinutes() / 60)) * 60;

    if (remainingMinutes <= minutesLeftInDay) {
      cursor.setMinutes(cursor.getMinutes() + Math.round(remainingMinutes));
      remainingMinutes = 0;
    } else {
      remainingMinutes -= minutesLeftInDay;
      cursor.setDate(cursor.getDate() + 1);
      cursor.setHours(workStartHour, 0, 0, 0);
    }
  }

  return cursor;
}

/**
 * Computes high-level summary and Gantt schedule
 */
export function computeProductionSummary(plates: PlateItem[], config: WorkshopConfig): {
  summary: ProductionSummary;
  ganttBlocks: GanttBlock[];
} {
  const efficiency = (config.efficiencyPercent || 100) / 100;
  const setupExtra = config.plateChangeTimeMin || 0;

  let totalPlatesCount = 0;
  let totalPrintPlates = 0;
  let totalCutPlates = 0;
  let totalPrintMinutesNet = 0;
  let totalCutMinutesNet = 0;
  let totalCompletedPrint = 0;
  let totalCompletedCut = 0;

  plates.forEach((p) => {
    totalPlatesCount += p.quantity;
    if (p.hasPrint) {
      totalPrintPlates += p.quantity;
      totalPrintMinutesNet += (p.quantity * (p.printTimePerUnit + setupExtra)) / efficiency;
      totalCompletedPrint += Math.min(p.completedPrintUnits, p.quantity);
    }
    if (p.hasCut) {
      totalCutPlates += p.quantity;
      totalCutMinutesNet += (p.quantity * (p.cutTimePerUnit + setupExtra)) / efficiency;
      totalCompletedCut += Math.min(p.completedCutUnits, p.quantity);
    }
  });

  const totalWorkMinutesNet = totalPrintMinutesNet + totalCutMinutesNet;

  // Bottleneck analysis
  let bottleneckMachine: 'Router CNC' | 'Impresora Digital' | 'Equilibrado' = 'Equilibrado';
  let bottleneckRatio = 50;

  if (totalWorkMinutesNet > 0) {
    if (totalCutMinutesNet > totalPrintMinutesNet * 1.1) {
      bottleneckMachine = 'Router CNC';
      bottleneckRatio = Math.round((totalCutMinutesNet / totalWorkMinutesNet) * 100);
    } else if (totalPrintMinutesNet > totalCutMinutesNet * 1.1) {
      bottleneckMachine = 'Impresora Digital';
      bottleneckRatio = Math.round((totalPrintMinutesNet / totalWorkMinutesNet) * 100);
    } else {
      bottleneckMachine = 'Equilibrado';
      bottleneckRatio = 50;
    }
  }

  // Gantt and Makespan Simulation
  // We simulate jobs on Printer and Router.
  // Plates that need printing must be printed first, and cutting can begin once printed.
  // Plates that don't need printing can be cut immediately.
  const ganttBlocks: GanttBlock[] = [];
  const palette = [
    '#38BDF8', // Cyan (Placa 1)
    '#818CF8', // Indigo (Placa 2)
    '#34D399', // Emerald (Placa 3)
    '#FBBF24', // Amber (Placa 4)
    '#F472B6', // Pink (Placa 5)
    '#A78BFA', // Violet (Placa 6)
    '#4ADE80', // Green (Placa 7)
    '#FB923C', // Orange (Placa 8)
  ];

  let printerAvailableTime = 0;
  let routerAvailableTime = 0;

  // Track completion times for printing each plate so cutting can respect dependencies
  const platePrintCompletionTimes = new Map<string, number>();

  // 1. Schedule Printer Tasks
  plates
    .filter((p) => p.hasPrint)
    .forEach((plate, idx) => {
      const dur = (plate.quantity * (plate.printTimePerUnit + setupExtra)) / efficiency;
      const start = printerAvailableTime;
      const end = start + dur;
      printerAvailableTime = end;
      platePrintCompletionTimes.set(plate.id, end);

      ganttBlocks.push({
        id: `print-${plate.id}`,
        machineType: 'printer',
        machineIndex: 0,
        plateId: plate.id,
        plateName: plate.name,
        startMinute: start,
        endMinute: end,
        durationMinutes: dur,
        units: plate.quantity,
        unitTime: plate.printTimePerUnit,
        color: palette[idx % palette.length],
      });
    });

  // 2. Schedule Router Tasks
  // In 'optimized' mode: Router starts cutting cut-only plates (e.g. Placas 3, 4, 5) immediately from t=0!
  // In 'fifo' mode: Router waits for Placa 1, Placa 2, etc. (with pipelining: can cut unit 1 once unit 1 finishes printing).
  let cutQueue = [...plates.filter((p) => p.hasCut)];

  if (config.strategy === 'optimized') {
    // Cut plates without printing first to maximize concurrency, then printed plates
    cutQueue.sort((a, b) => {
      if (!a.hasPrint && b.hasPrint) return -1;
      if (a.hasPrint && !b.hasPrint) return 1;
      return a.priority - b.priority;
    });
  } else {
    // Strict order by priority/declaration
    cutQueue.sort((a, b) => a.priority - b.priority);
  }

  // Adjust for router count (scaling capability)
  const routerCount = Math.max(1, config.routerCount || 1);
  const routerClocks = new Array(routerCount).fill(0);

  cutQueue.forEach((plate) => {
    // Find the router machine that is available earliest
    let minRouterIdx = 0;
    for (let r = 1; r < routerCount; r++) {
      if (routerClocks[r] < routerClocks[minRouterIdx]) {
        minRouterIdx = r;
      }
    }

    const dur = (plate.quantity * (plate.cutTimePerUnit + setupExtra)) / (efficiency * (routerCount > 1 ? 1 : 1));
    const singleUnitPrintTime = (plate.printTimePerUnit + setupExtra) / efficiency;

    // Earliest start for this cut task:
    // If it requires print, can start cutting as soon as first unit is printed (buffer of 1 plate), or when previous cut finishes.
    let earliestPossibleStart = 0;
    if (plate.hasPrint) {
      // The first unit of this plate is ready at: (print start of plate) + 1 * printTime
      const printBlock = ganttBlocks.find((b) => b.machineType === 'printer' && b.plateId === plate.id);
      if (printBlock) {
        earliestPossibleStart = printBlock.startMinute + singleUnitPrintTime;
      }
    }

    const actualStart = Math.max(routerClocks[minRouterIdx], earliestPossibleStart);
    const actualEnd = actualStart + dur;
    routerClocks[minRouterIdx] = actualEnd;

    const originalIdx = plates.findIndex((p) => p.id === plate.id);
    ganttBlocks.push({
      id: `cut-${plate.id}-${minRouterIdx}`,
      machineType: 'router',
      machineIndex: minRouterIdx,
      plateId: plate.id,
      plateName: plate.name,
      startMinute: actualStart,
      endMinute: actualEnd,
      durationMinutes: dur,
      units: plate.quantity,
      unitTime: plate.cutTimePerUnit,
      color: palette[originalIdx >= 0 ? originalIdx % palette.length : 0],
    });
  });

  const maxRouterTime = Math.max(...routerClocks);
  const makespanMinutes = Math.max(printerAvailableTime, maxRouterTime);
  const makespanHours = makespanMinutes / 60;

  // Work days & Delivery date
  const hoursPerDay = (config.hoursPerShift || 8) * (config.shiftsPerDay || 1);
  const estimatedWorkDays = hoursPerDay > 0 ? makespanHours / hoursPerDay : 0;

  const completionDate = calculateCompletionDate(
    config.startDateTime,
    makespanMinutes,
    config.hoursPerShift,
    config.shiftsPerDay,
    config.workDaysPerWeek
  );

  // Cost estimates
  const printerHours = totalPrintMinutesNet / 60;
  const routerHours = totalCutMinutesNet / 60;
  const printerCost = printerHours * (config.hourlyCostPrinter || 0);
  const routerCost = routerHours * (config.hourlyCostRouter || 0);

  // Overall progress
  const totalOps = totalPrintPlates + totalCutPlates;
  const doneOps = totalCompletedPrint + totalCompletedCut;
  const progressOverall = totalOps > 0 ? Math.round((doneOps / totalOps) * 100) : 0;

  return {
    summary: {
      totalPlatesCount,
      totalPrintPlates,
      totalCutPlates,
      totalPrintMinutesNet,
      totalCutMinutesNet,
      totalWorkMinutesNet,
      makespanMinutes,
      makespanHours,
      bottleneckMachine,
      bottleneckRatio,
      estimatedWorkDays,
      completionDate,
      costEstimate: {
        printerCost,
        routerCost,
        totalCost: printerCost + routerCost,
      },
      progressOverall,
    },
    ganttBlocks,
  };
}

/**
 * Generate a clean plain-text summary for WhatsApp or email report
 */
export function generateWhatsAppReport(plates: PlateItem[], config: WorkshopConfig, summary: ProductionSummary): string {
  const dateStr = summary.completionDate.toLocaleString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  let text = `*PLAN DE PRODUCCIÓN - IMPRESIÓN Y ROUTER CNC*\n`;
  text += `────────────────────────────\n`;
  text += `*RESUMEN GENERAL:*\n`;
  text += `• Total placas a imprimir: ${summary.totalPrintPlates} unid.\n`;
  text += `• Total placas a cortar: ${summary.totalCutPlates} unid.\n`;
  text += `• Tiempo total Impresión: ${formatMinutesToHoursMinutes(summary.totalPrintMinutesNet)} (${(summary.totalPrintMinutesNet / 60).toFixed(1)} h)\n`;
  text += `• Tiempo total Router CNC: ${formatMinutesToHoursMinutes(summary.totalCutMinutesNet)} (${(summary.totalCutMinutesNet / 60).toFixed(1)} h)\n`;
  text += `• Duración de Taller (Makespan): ${formatMinutesToHoursMinutes(summary.makespanMinutes)} (${(summary.makespanMinutes / 60).toFixed(1)} h)\n`;
  text += `• Cuello de botella: ${summary.bottleneckMachine} (${summary.bottleneckRatio}% de la carga)\n`;
  text += `• Jornada configurada: ${config.hoursPerShift}h/día (${config.shiftsPerDay} turno${config.shiftsPerDay > 1 ? 's' : ''})\n`;
  text += `• Días laborables requeridos: ${summary.estimatedWorkDays.toFixed(1)} días\n`;
  text += `• Fecha estimada de entrega: ${dateStr}\n\n`;

  text += `*DETALLE POR PLACA:*\n`;
  plates.forEach((p) => {
    const pPrint = p.hasPrint ? `${p.quantity * p.printTimePerUnit} min` : 'No aplica';
    const pCut = p.hasCut ? `${p.quantity * p.cutTimePerUnit} min` : 'No aplica';
    const pTotal = (p.hasPrint ? p.quantity * p.printTimePerUnit : 0) + (p.hasCut ? p.quantity * p.cutTimePerUnit : 0);

    text += `*${p.name}* (${p.quantity} unid):\n`;
    text += `  - Impresión: ${pPrint} (${p.printTimePerUnit}m/u)\n`;
    text += `  - Router Corte: ${pCut} (${p.cutTimePerUnit}m/u)\n`;
    text += `  - Subtotal: ${formatMinutesToHoursMinutes(pTotal)}\n`;
  });

  text += `────────────────────────────\n`;
  text += `Generado por Sistema de Producción Digital`;

  return text;
}
