export interface PlateItem {
  id: string;
  name: string;
  quantity: number;
  hasPrint: boolean;
  hasCut: boolean;
  printTimePerUnit: number; // in minutes (default 3.5)
  cutTimePerUnit: number; // in minutes (default 5.0)
  material?: string;
  thickness?: string;
  notes?: string;
  completedPrintUnits: number;
  completedCutUnits: number;
  priority: number;
}

export type ScheduleStrategy = 'optimized' | 'fifo';

export interface WorkshopConfig {
  printerCount: number;
  routerCount: number;
  hoursPerShift: number; // e.g. 8 hours
  shiftsPerDay: number; // 1, 2, or 3 (24h)
  workDaysPerWeek: 5 | 6 | 7;
  startDateTime: string; // ISO format
  efficiencyPercent: number; // 100% or 85%
  strategy: ScheduleStrategy;
  hourlyCostPrinter: number; // in local currency (e.g. $25/h)
  hourlyCostRouter: number; // in local currency (e.g. $35/h)
  plateChangeTimeMin: number; // setup per plate e.g. 0 min or 0.5 min
}

export interface GanttBlock {
  id: string;
  machineType: 'printer' | 'router';
  machineIndex: number;
  plateId: string;
  plateName: string;
  startMinute: number;
  endMinute: number;
  durationMinutes: number;
  units: number;
  unitTime: number;
  color: string;
}

export interface ProductionSummary {
  totalPlatesCount: number;
  totalPrintPlates: number;
  totalCutPlates: number;
  
  totalPrintMinutesNet: number;
  totalCutMinutesNet: number;
  totalWorkMinutesNet: number; // sum of both machines
  
  // Real floor makespan (concurrency taken into account)
  makespanMinutes: number;
  makespanHours: number;
  
  bottleneckMachine: 'Router CNC' | 'Impresora Digital' | 'Equilibrado';
  bottleneckRatio: number; // % of total workload in bottleneck
  
  estimatedWorkDays: number;
  completionDate: Date;
  
  costEstimate: {
    printerCost: number;
    routerCost: number;
    totalCost: number;
  };
  
  progressOverall: number; // 0 to 100%
}
