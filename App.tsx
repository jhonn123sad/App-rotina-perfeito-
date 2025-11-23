import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, TABLE_NAME } from './services/supabase';
import { TASK_LIST } from './constants';
import { TaskSection, ChartDataPoint } from './types';
import { Header } from './components/Header';
import { Section } from './components/Section';
import { Stats } from './components/Stats';
import { SetupGuide } from './components/SetupGuide';
import { Sun, Sunset, Moon, RotateCcw, Trash2 } from 'lucide-react';

// Utility to get today's date in YYYY-MM-DD based on LOCAL time, not UTC
const getLocalToday = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const App: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<string>(getLocalToday());
  const [dailyTasks, setDailyTasks] = useState<Record<string, boolean>>({});
  
  // Ref to hold the latest tasks state for async operations to avoid stale closures
  const tasksRef = useRef<Record<string, boolean>>({});

  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [showResetMenu, setShowResetMenu] = useState(false);
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(!!supabase);

  // Sync Ref with State
  useEffect(() => {
    tasksRef.current = dailyTasks;
  }, [dailyTasks]);

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

      if (error && error.code !== 'PGRST116') { 
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

  // Fetch history for chart (Last 30 records)
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
      fullDate: entry.date.split('-').reverse().join('/'), // DD/MM/YYYY
      day: entry.date.slice(8), // just DD
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
        // Optimisation: Only refetch history generally, but be careful overwriting current day 
        // if we are the ones editing it.
        fetchHistory();
        
        // If the change is about the current date, we might need to update,
        // BUT checking against local state avoids "bouncing" if we just saved it.
        if ((payload.new as any)?.date === currentDate) {
             // Optional: Logic to merge changes if multi-user, 
             // currently we trust the optimistic update for the active user.
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

    // 1. Calculate new state based on REF (current truth) to avoid race conditions
    const currentTasks = tasksRef.current;
    const newTasks = { ...currentTasks, [taskId]: !currentTasks[taskId] };
    
    // 2. Optimistic update
    setDailyTasks(newTasks);
    setSaveStatus('saving');

    const points = Object.values(newTasks).filter(Boolean).length;

    // 3. Send to Supabase
    try {
        const { error } = await supabase
        .from(TABLE_NAME)
        .upsert({
            date: currentDate,
            tasks: newTasks,
            points: points,
            created_at: new Date().toISOString()
        });

        if (error) {
            throw error;
        }

        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
        console.error('Error updating task:', error);
        // Revert optimistic update on error
        setDailyTasks(currentTasks);
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  // Reset Day - Using DELETE to remove the row entirely for a clean state
  const handleResetDay = async () => {
    if (!supabase) return;
    if (!window.confirm(`Tem certeza que deseja zerar o progresso do dia ${currentDate}?`)) return;

    setSaveStatus('saving');
    
    // Optimistic clear
    setDailyTasks({}); 

    // We use delete() instead of upsert({}) to ensure a truly clean state.
    // This requires DELETE permission in RLS.
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('date', currentDate);
    
    if (!error) {
      setShowResetMenu(false);
      setSaveStatus('saved');
      fetchHistory(); 
      setTimeout(() => setSaveStatus('idle'), 2000);
    } else {
      console.error("Reset Day Error:", error);
      setSaveStatus('error');
      // Explicit feedback about RLS
      if (error.code === '42501') {
         alert("ERRO DE PERMISSÃO: O Supabase bloqueou o comando DELETE.\n\nCopie o código SQL do arquivo 'services/supabase.ts' e rode no SQL Editor do Supabase para liberar a permissão.");
      } else {
         alert(`Erro ao resetar: ${error.message}`);
      }
    }
  };

  // Reset Application (Danger)
  const handleResetApp = async () => {
    if (!supabase) return;

    const code = prompt("Digite 'DELETAR' para confirmar que deseja apagar TODO o histórico.");
    if (code !== 'DELETAR') return;

    setSaveStatus('saving');

    // Using delete with a filter that matches all strings (greater than empty string)
    // This is more robust than .neq for Primary Key text columns.
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .gt('date', ''); 

    if (error) {
      console.error("Reset App Error:", error);
      setSaveStatus('error');
      if (error.code === '42501') {
         alert("ERRO DE PERMISSÃO: O Supabase bloqueou o comando DELETE.\n\nVerifique o arquivo 'services/supabase.ts' e rode o SQL necessário.");
      } else {
         alert(`Erro ao resetar app: ${error.message}`);
      }
    } else {
      setDailyTasks({});
      setChartData([]);
      setSaveStatus('saved');
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
        
        <Header 
          currentDate={currentDate} 
          onDateChange={setCurrentDate} 
          saveStatus={saveStatus}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Section 
            title="Manhã" 
            tasks={morningTasks} 
            completedTasks={dailyTasks} 
            onToggleTask={handleToggleTask}
            icon={<Sun size={18} />}
            colorClass="text-amber-400"
          />
          <Section 
            title="Tarde" 
            tasks={afternoonTasks} 
            completedTasks={dailyTasks} 
            onToggleTask={handleToggleTask}
            icon={<Sunset size={18} />}
            colorClass="text-orange-500"
          />
          <Section 
            title="Noite" 
            tasks={nightTasks} 
            completedTasks={dailyTasks} 
            onToggleTask={handleToggleTask}
            icon={<Moon size={18} />}
            colorClass="text-indigo-400"
          />
        </div>

        <Stats data={chartData} todayPoints={currentPoints} />

        {/* Footer / Reset Controls */}
        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col items-center">
          {!showResetMenu ? (
            <button 
              onClick={() => setShowResetMenu(true)}
              className="text-slate-600 text-sm hover:text-slate-400 flex items-center gap-2 transition-colors px-4 py-2 rounded-lg hover:bg-slate-900"
            >
              <RotateCcw size={14} /> Gerenciar Dados
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-900 p-3 rounded-xl border border-slate-800 animate-in fade-in slide-in-from-bottom-2 shadow-2xl">
              <button 
                onClick={handleResetDay}
                className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm rounded-md transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw size={14} /> Resetar Hoje
              </button>
              <div className="hidden sm:block w-px h-4 bg-slate-700"></div>
              <button 
                onClick={handleResetApp}
                className="w-full sm:w-auto px-4 py-2 bg-red-950/30 hover:bg-red-900/40 text-red-400 border border-red-900/50 text-sm rounded-md transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={14} /> Resetar Tudo
              </button>
              <button 
                onClick={() => setShowResetMenu(false)}
                className="text-xs text-slate-500 hover:text-slate-300 mt-2 sm:mt-0 sm:ml-2 underline decoration-dotted"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;