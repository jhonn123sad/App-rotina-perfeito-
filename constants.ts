import { TaskDef, TaskSection } from './types';

export const TASK_LIST: TaskDef[] = [
  // Morning
  { id: 'm_vacuum', label: 'Vacuum', section: TaskSection.MORNING },
  { id: 'm_run', label: 'Run', section: TaskSection.MORNING },
  { id: 'm_minoxidil_1', label: 'Minoxidil (1 dose)', section: TaskSection.MORNING },
  { id: 'm_read', label: 'Read', section: TaskSection.MORNING },
  { id: 'm_kegel', label: 'Kegel and stretching', section: TaskSection.MORNING },
  { id: 'm_tidy', label: 'Tidy up environment', section: TaskSection.MORNING },
  
  // Afternoon
  { id: 'a_prospect', label: 'Prospect (non-stop)', section: TaskSection.AFTERNOON },
  { id: 'a_post_videos', label: 'Post three videos', section: TaskSection.AFTERNOON },
  { id: 'a_minoxidil_2', label: 'Minoxidil (2 doses)', section: TaskSection.AFTERNOON },
  { id: 'a_last_meal', label: 'Last meal', section: TaskSection.AFTERNOON },

  // Night
  { id: 'n_cryo', label: 'Cryo', section: TaskSection.NIGHT },
  { id: 'n_gym', label: 'Gym', section: TaskSection.NIGHT },
  { id: 'n_write', label: 'Write to finish day', section: TaskSection.NIGHT },
];

export const MAX_DAILY_POINTS = TASK_LIST.length;