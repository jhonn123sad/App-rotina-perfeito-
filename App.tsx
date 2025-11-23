import React, { useState, useEffect, useCallback } from 'react';
import { supabase, TABLE_NAME } from './services/supabase';
import { TASK_LIST, MAX_DAILY_POINTS } from './constants';
import { TaskSection, DailyLog, ChartDataPoint } from './types';
import { Header } from './components/Header';
import { Section } from './components/Section';
import { Stats } from './components/Stats';
import { SetupGuide } from './components/SetupGuide';
import { Sun, Sunset, Moon, RotateCcw, AlertOctagon } from 'lucide-react';

// Utility to get today's date as YYYY-MM-DD
const getToday = () => new Date().toISOString().split('T')[0];

const App: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<string>(getToday());
  const [dailyTasks, setDailyTasks] = useState<Record<string, boolean>>({});
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResetMenu, setShowResetMenu] = useState(false);
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(!!supabase);

  // Fetch data for selected date
  const fetchDayData = useCallback(async (date: string) => {
    if (!supabase) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('date', date)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "Row not found", which is fine
        console.error('Error fetching day:', error);
      }

      if (data) {
        setDailyTasks(data.tasks || {});
      } else {
        setDailyTasks({});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch history for chart (Last 30 days)
  const fetchHistory = useCallback(async () => {
    if (!supabase) return;

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('date, points')
      .order('date', { ascending: true })
      .limit(30);

    if (error) {
      console.error('Error fetching history:', error);
      return;
    }

    // Transform to chart friendly format
    const formatted: ChartDataPoint[] = (data || []).map((entry: any) => ({
      fullDate: entry.date,
      day: entry.date.slice(5), // remove year for brevity (MM-DD)
      points: entry.points
    }));
    setChartData(formatted);
  }, []);

  // Initial Load & Subscription
  useEffect(() => {
    if (!supabase) {
      setIsSupabaseConfigured(false);
      return;
    }

    fetchDayData(currentDate);
    fetchHistory();

    // Real-time subscription
    const channel = supabase
      .channel('public:daily_logs')
      .on('postgres_changes', { event: '*', schema: 'public', table: TABLE_NAME }, (payload) => {
        // Refresh history on any change
        fetchHistory();
        
        // If the change affects the current view, refresh current day
        if ((payload.new as any)?.date === currentDate || (payload.old as any)?.date === currentDate) {
             fetchDayData(currentDate);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentDate, fetchDayData, fetchHistory]);

  // Toggle Task Handler
  const handleToggleTask = async (taskId: string) => {
    if (!supabase) return;

    const newTasks = { ...dailyTasks, [taskId]: !dailyTasks[taskId] };
    // Optimistic update
    setDailyTasks(newTasks);

    const points = Object.values(newTasks).filter(Boolean).length;

    // Upsert to Supabase
    const { error } = await supabase
      .from(TABLE_NAME)
      .upsert({
        date: currentDate,
        tasks: newTasks,
        points: points,
        created_at: new Date().toISOString() // updates timestamp on edit
      });

    if (error) {
      console.error('Error updating task:', error);
      // Revert on error would go here in a more complex app
    }
  };

  // Reset Day
  const handleResetDay = async () => {
    if (!supabase) return;
    if (!window.confirm(`Are you sure you want to reset all progress for ${currentDate}?`)) return;

    const { error } = await supabase
      .from(TABLE_NAME)
      .upsert({
        date: currentDate,
        tasks: {},
        points: 0
      }); // effectively clears it. Could also use DELETE.
    
    if (!error) {
      setDailyTasks({});
      setShowResetMenu(false);
    }
  };

  // Reset Application (Danger)
  const handleResetApp = async () => {
    if (!supabase) return;

    const code = prompt("Type 'DELETE' to confirm erasing ALL data forever.");
    if (code !== 'DELETE') return;

    // Supabase client usually blocks truncate for anon unless configured in Postgres RLS/Policies
    // We use a simple delete loop or delete where query to clear data
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .neq('date', '0000-00-00'); // Hack to match all rows if TRUNCATE isn't available via API

    if (error) {
      alert('Error resetting app. Check RLS policies or API permissions.');
      console.error(error);
    } else {
      window.location.reload();
    }
  };

  const morningTasks = TASK_LIST.filter(t => t.section === TaskSection.MORNING);
  const afternoonTasks = TASK_LIST.filter(t => t.section === TaskSection.AFTERNOON);
  const nightTasks = TASK_LIST.filter(t => t.section === TaskSection.NIGHT);
  
  const currentPoints = Object.values(dailyTasks).filter(Boolean).length;

  if (!isSupabaseConfigured) {
    return <SetupGuide />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 pb-24 font-sans">
      <div className="max-w-5xl mx-auto">
        
        <Header currentDate={currentDate} onDateChange={setCurrentDate} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Section 
            title="Morning" 
            tasks={morningTasks} 
            completedTasks={dailyTasks} 
            onToggleTask={handleToggleTask}
            icon={<Sun size={18} />}
            colorClass="text-amber-400"
          />
          <Section 
            title="Afternoon" 
            tasks={afternoonTasks} 
            completedTasks={dailyTasks} 
            onToggleTask={handleToggleTask}
            icon={<Sunset size={18} />}
            colorClass="text-orange-500"
          />
          <Section 
            title="Night" 
            tasks={nightTasks} 
            completedTasks={dailyTasks} 
            onToggleTask={handleToggleTask}
            icon={<Moon size={18} />}
            colorClass="text-indigo-400"
          />
        </div>

        <Stats data={chartData} todayPoints={currentPoints} />

        {/* Footer / Reset Controls */}
        <div className="mt-12 pt-8 border-t border-slate-900 flex justify-center">
          {!showResetMenu ? (
            <button 
              onClick={() => setShowResetMenu(true)}
              className="text-slate-600 text-sm hover:text-slate-400 flex items-center gap-2 transition-colors"
            >
              <RotateCcw size={14} /> Manage Data
            </button>
          ) : (
            <div className="flex items-center gap-4 bg-slate-900 p-2 rounded-lg border border-slate-800 animate-in fade-in slide-in-from-bottom-2">
              <button 
                onClick={handleResetDay}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm rounded-md transition-colors flex items-center gap-2"
              >
                <RotateCcw size={14} /> Reset This Day
              </button>
              <div className="w-px h-4 bg-slate-700"></div>
              <button 
                onClick={handleResetApp}
                className="px-4 py-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/50 text-sm rounded-md transition-colors flex items-center gap-2"
              >
                <AlertOctagon size={14} /> Reset Everything
              </button>
              <button 
                onClick={() => setShowResetMenu(false)}
                className="ml-2 text-slate-500 hover:text-slate-300"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;