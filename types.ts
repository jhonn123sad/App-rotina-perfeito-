export enum TaskSection {
  MORNING = 'Morning',
  AFTERNOON = 'Afternoon',
  NIGHT = 'Night',
}

export interface TaskDef {
  id: string;
  label: string;
  section: TaskSection;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD used as Primary Key
  tasks: Record<string, boolean>; // Map task ID to completion status
  points: number;
  created_at?: string;
}

export interface ChartDataPoint {
  day: string;
  points: number;
  fullDate: string;
}