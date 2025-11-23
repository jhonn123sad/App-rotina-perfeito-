import { TaskDef, TaskSection } from './types';

export const TASK_LIST: TaskDef[] = [
  // Manhã (Morning)
  { id: 'm_vacuum', label: 'Aspirar', section: TaskSection.MORNING },
  { id: 'm_run', label: 'Correr', section: TaskSection.MORNING },
  { id: 'm_minoxidil_1', label: 'Minoxidil (1ª dose)', section: TaskSection.MORNING },
  { id: 'm_read', label: 'Ler', section: TaskSection.MORNING },
  { id: 'm_kegel', label: 'Kegel e alongamento', section: TaskSection.MORNING },
  { id: 'm_tidy', label: 'Organizar ambiente', section: TaskSection.MORNING },
  
  // Tarde (Afternoon)
  { id: 'a_prospect', label: 'Prospecção (sem parar)', section: TaskSection.AFTERNOON },
  { id: 'a_post_videos', label: 'Postar três vídeos', section: TaskSection.AFTERNOON },
  { id: 'a_minoxidil_2', label: 'Minoxidil (2ª dose)', section: TaskSection.AFTERNOON },
  { id: 'a_last_meal', label: 'Última refeição', section: TaskSection.AFTERNOON },

  // Noite (Night)
  { id: 'n_cryo', label: 'Crioterapia (Banho gelado)', section: TaskSection.NIGHT },
  { id: 'n_gym', label: 'Academia', section: TaskSection.NIGHT },
  { id: 'n_write', label: 'Escrever para encerrar o dia', section: TaskSection.NIGHT },
];

export const MAX_DAILY_POINTS = TASK_LIST.length;