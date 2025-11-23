import React from 'react';
import { ChevronLeft, ChevronRight, Calendar, CheckCircle2, RefreshCw } from 'lucide-react';

interface HeaderProps {
  currentDate: string;
  onDateChange: (date: string) => void;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
}

export const Header: React.FC<HeaderProps> = ({ currentDate, onDateChange, saveStatus }) => {
  const handlePrevDay = () => {
    const date = new Date(currentDate + 'T00:00:00'); // Force local time parsing
    date.setDate(date.getDate() - 1);
    // Format back to YYYY-MM-DD using local time
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    onDateChange(`${year}-${month}-${day}`);
  };

  const handleNextDay = () => {
    const date = new Date(currentDate + 'T00:00:00');
    date.setDate(date.getDate() + 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    onDateChange(`${year}-${month}-${day}`);
  };

  // Format date for display (PT-BR)
  const displayDate = new Date(currentDate + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <header className="flex flex-col gap-4 mb-8 pb-6 border-b border-slate-800">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo / Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/50">
             <span className="font-bold text-white text-xl">30</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Desafio Diário</h1>
        </div>

        {/* Save Status Indicator */}
        <div className="flex items-center gap-2 h-8">
          {saveStatus === 'saving' && (
            <span className="text-xs font-medium text-amber-400 flex items-center gap-1 animate-pulse">
              <RefreshCw size={12} className="animate-spin" /> Salvando...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
              <CheckCircle2 size={12} /> Salvo
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="text-xs font-medium text-red-400 flex items-center gap-1">
              Erro ao salvar
            </span>
          )}
        </div>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-between bg-slate-800/50 rounded-xl p-2 border border-slate-700 w-full md:w-auto md:self-end">
        <button 
          onClick={handlePrevDay}
          className="p-3 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        
        <div className="flex items-center gap-2 px-4 justify-center flex-1">
          <Calendar size={18} className="text-blue-400 hidden sm:block" />
          <span className="text-slate-200 font-mono font-medium text-lg capitalize">
            {displayDate}
          </span>
        </div>

        <button 
          onClick={handleNextDay}
          className="p-3 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </header>
  );
};