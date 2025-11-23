import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface HeaderProps {
  currentDate: string;
  onDateChange: (date: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentDate, onDateChange }) => {
  const handlePrevDay = () => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - 1);
    onDateChange(date.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + 1);
    onDateChange(date.toISOString().split('T')[0]);
  };

  const isToday = new Date().toISOString().split('T')[0] === currentDate;

  return (
    <header className="flex flex-col md:flex-row items-center justify-between pb-6 border-b border-slate-800 mb-8 gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/50">
           <span className="font-bold text-white text-xl">30</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Day Challenge</h1>
      </div>

      <div className="flex items-center bg-slate-800/50 rounded-full p-1 border border-slate-700">
        <button 
          onClick={handlePrevDay}
          className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        
        <div className="flex items-center gap-2 px-4 min-w-[140px] justify-center">
          <Calendar size={16} className="text-blue-400" />
          <span className="text-slate-200 font-mono font-medium">
            {currentDate}
          </span>
        </div>

        <button 
          onClick={handleNextDay}
          className={`p-2 rounded-full transition-colors ${isToday ? 'text-slate-600 cursor-not-allowed' : 'hover:bg-slate-700 text-slate-400 hover:text-white'}`}
          disabled={isToday} // Optional: prevent going into future
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </header>
  );
};