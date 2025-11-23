import React from 'react';
import { TaskDef } from '../types';
import { Check, Circle } from 'lucide-react';

interface SectionProps {
  title: string;
  tasks: TaskDef[];
  completedTasks: Record<string, boolean>;
  onToggleTask: (taskId: string) => void;
  icon: React.ReactNode;
  colorClass: string;
}

export const Section: React.FC<SectionProps> = ({ 
  title, 
  tasks, 
  completedTasks, 
  onToggleTask,
  icon,
  colorClass
}) => {
  const completedCount = tasks.filter(t => completedTasks[t.id]).length;
  const totalCount = tasks.length;
  const isAllComplete = completedCount === totalCount && totalCount > 0;

  return (
    <div className={`bg-slate-900/50 rounded-xl border border-slate-800 p-5 flex flex-col h-full hover:border-slate-700 transition-colors duration-300 ${isAllComplete ? 'bg-slate-800/30 shadow-lg ' + colorClass.replace('text-', 'shadow-') + '/10' : ''}`}>
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div className={`flex items-center gap-2 font-semibold ${colorClass}`}>
          {icon}
          <h3 className="uppercase tracking-wider text-sm">{title}</h3>
        </div>
        <span className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded-md border border-slate-800">
          {completedCount}/{totalCount}
        </span>
      </div>

      <div className="flex-1 space-y-3">
        {tasks.map(task => {
          const isDone = !!completedTasks[task.id];
          return (
            <button
              key={task.id}
              onClick={() => onToggleTask(task.id)}
              className="w-full group flex items-center gap-3 text-left p-2 rounded-lg hover:bg-slate-800/50 transition-all"
            >
              <div className={`
                w-6 h-6 rounded-md border flex items-center justify-center transition-all duration-200
                ${isDone 
                  ? 'bg-blue-500 border-blue-500 text-white' 
                  : 'bg-transparent border-slate-600 group-hover:border-slate-500 text-transparent'}
              `}>
                <Check size={14} strokeWidth={3} />
              </div>
              <span className={`text-sm transition-all ${isDone ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                {task.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};