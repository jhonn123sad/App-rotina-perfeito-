import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ChartDataPoint } from '../types';
import { MAX_DAILY_POINTS } from '../constants';

interface StatsProps {
  data: ChartDataPoint[];
  todayPoints: number;
}

export const Stats: React.FC<StatsProps> = ({ data, todayPoints }) => {
  const progressPercentage = Math.round((todayPoints / MAX_DAILY_POINTS) * 100);
  
  // Ensure we always show a 1-30 domain conceptually on the chart if data allows,
  // or simply map the existing data points to "Day X" labels.
  const formattedChartData = data.map((d, index) => ({
    ...d,
    indexLabel: `${index + 1}` // Labels 1, 2, 3...
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
      {/* Current Day Progress */}
      <div className="lg:col-span-1 bg-slate-900 rounded-xl border border-slate-800 p-6 flex flex-col items-center justify-center relative overflow-hidden min-h-[250px]">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-transparent pointer-events-none" />
        <h3 className="text-slate-400 text-sm uppercase tracking-wider font-medium mb-6 relative z-10">Progresso do Dia</h3>
        
        <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center">
           {/* Simple SVG Ring */}
           <svg className="w-full h-full transform -rotate-90">
             <circle
               cx="50%" cy="50%" r="45%"
               stroke="currentColor"
               strokeWidth="10%"
               fill="transparent"
               className="text-slate-800"
             />
             <circle
               cx="50%" cy="50%" r="45%"
               stroke="currentColor"
               strokeWidth="10%"
               fill="transparent"
               strokeDasharray={283} // 2 * pi * 45 (approx radius relative to 100px viewBox logic, scaled by CSS)
               strokeDashoffset={283 - (283 * progressPercentage) / 100}
               className="text-blue-500 transition-all duration-1000 ease-out"
               strokeLinecap="round"
             />
           </svg>
           <div className="absolute inset-0 flex flex-col items-center justify-center">
             <span className="text-3xl sm:text-4xl font-bold text-white">{todayPoints}</span>
             <span className="text-[10px] sm:text-xs text-slate-500 uppercase font-semibold">Pontos</span>
           </div>
        </div>
      </div>

      {/* History Chart */}
      <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-800 p-6 min-h-[300px]">
        <h3 className="text-slate-400 text-sm uppercase tracking-wider font-medium mb-4">Desempenho (Últimos 30 Registros)</h3>
        <div className="w-full h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis 
                dataKey="indexLabel" 
                stroke="#64748b" 
                tick={{fontSize: 12}} 
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis 
                stroke="#64748b" 
                tick={{fontSize: 12}} 
                tickLine={false}
                axisLine={false}
                domain={[0, 13]}
                allowDataOverflow={true}
                ticks={[0, 3, 6, 9, 13]}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-950 border border-slate-700 p-2 rounded shadow-xl text-xs">
                        <p className="text-slate-400 mb-1">{payload[0].payload.fullDate}</p>
                        <p className="text-white font-bold">Dia {label}: <span className="text-blue-400">{payload[0].value} pts</span></p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area 
                type="monotone" 
                dataKey="points" 
                stroke="#3b82f6" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorPoints)" 
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};