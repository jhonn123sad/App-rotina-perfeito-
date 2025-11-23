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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
      {/* Current Day Progress */}
      <div className="lg:col-span-1 bg-slate-900 rounded-xl border border-slate-800 p-6 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-transparent pointer-events-none" />
        <h3 className="text-slate-400 text-sm uppercase tracking-wider font-medium mb-6 relative z-10">Daily Progress</h3>
        
        <div className="relative w-40 h-40 flex items-center justify-center">
           {/* Simple SVG Ring */}
           <svg className="w-full h-full transform -rotate-90">
             <circle
               cx="80" cy="80" r="70"
               stroke="currentColor"
               strokeWidth="12"
               fill="transparent"
               className="text-slate-800"
             />
             <circle
               cx="80" cy="80" r="70"
               stroke="currentColor"
               strokeWidth="12"
               fill="transparent"
               strokeDasharray={440}
               strokeDashoffset={440 - (440 * progressPercentage) / 100}
               className="text-blue-500 transition-all duration-1000 ease-out"
               strokeLinecap="round"
             />
           </svg>
           <div className="absolute inset-0 flex flex-col items-center justify-center">
             <span className="text-4xl font-bold text-white">{todayPoints}</span>
             <span className="text-xs text-slate-500 uppercase font-semibold">Points</span>
           </div>
        </div>
      </div>

      {/* History Chart */}
      <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-800 p-6 min-h-[300px]">
        <h3 className="text-slate-400 text-sm uppercase tracking-wider font-medium mb-4">Last 30 Days Performance</h3>
        <div className="w-full h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis 
                dataKey="day" 
                stroke="#64748b" 
                tick={{fontSize: 12}} 
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#64748b" 
                tick={{fontSize: 12}} 
                tickLine={false}
                axisLine={false}
                domain={[0, MAX_DAILY_POINTS]}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }}
                itemStyle={{ color: '#3b82f6' }}
                cursor={{ stroke: '#334155', strokeWidth: 1 }}
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