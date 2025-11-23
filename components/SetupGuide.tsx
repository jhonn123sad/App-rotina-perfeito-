import React from 'react';
import { AlertTriangle, Terminal } from 'lucide-react';

export const SetupGuide: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 p-4">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-2xl">
        <div className="flex items-center gap-3 text-amber-500 mb-4">
          <AlertTriangle size={32} />
          <h2 className="text-2xl font-bold text-white">Conexão com Supabase Necessária</h2>
        </div>
        
        <p className="text-slate-300 mb-6">
          Para que este aplicativo funcione, você precisa conectá-lo ao seu projeto Supabase.
        </p>

        <div className="space-y-6">
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
            <h3 className="text-white font-medium mb-2 flex items-center gap-2">
              <Terminal size={16} /> 1. Execute a Query SQL
            </h3>
            <p className="text-sm text-slate-400 mb-2">Vá ao Editor SQL do Supabase e execute:</p>
            <pre className="text-xs bg-black p-3 rounded text-green-400 overflow-x-auto font-mono">
{`create table public.daily_logs (
  date text primary key,
  tasks jsonb default '{}'::jsonb,
  points integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter publication supabase_realtime add table public.daily_logs;

-- Liberar acesso (RLS)
alter table public.daily_logs enable row level security;
create policy "Acesso Total" on public.daily_logs for all using (true) with check (true);`}
            </pre>
          </div>

          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
             <h3 className="text-white font-medium mb-2">2. Configure as Credenciais</h3>
             <p className="text-sm text-slate-400">
               As credenciais já parecem estar no código, mas verifique se o URL e a Chave Anon estão corretos em <code>services/supabase.ts</code>.
             </p>
          </div>
        </div>
        
        <div className="mt-6 text-center">
             <p className="text-slate-500 text-sm italic">Recarregue esta página após configurar.</p>
        </div>
      </div>
    </div>
  );
};