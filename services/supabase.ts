import { createClient } from '@supabase/supabase-js';

// INSTRUCTIONS FOR USER:
// 1. The table `daily_logs` must exist in your Supabase project.
/*
  === CÓDIGO SQL PARA RODAR NO SUPABASE (SQL EDITOR) ===
  Copie e rode tudo abaixo para corrigir o botão de Reset/Delete:

  -- 1. Limpeza NUCLEAR de permissões antigas (Remove tudo que pode estar bloqueando)
  drop policy if exists "Enable all access" on public.daily_logs;
  drop policy if exists "Acesso Total" on public.daily_logs;
  drop policy if exists "Acesso Irrestrito" on public.daily_logs;
  drop policy if exists "Super Policy Access" on public.daily_logs;
  drop policy if exists "Permissao_Suprema_Delete" on public.daily_logs;
  drop policy if exists "Enable read access for all users" on public.daily_logs;
  drop policy if exists "Enable insert for authenticated users only" on public.daily_logs;
  drop policy if exists "Enable delete for users based on user_id" on public.daily_logs;
  
  -- 2. Garante a tabela e RLS
  create table if not exists public.daily_logs (
    date text primary key,
    tasks jsonb default '{}'::jsonb,
    points integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now())
  );
  
  alter publication supabase_realtime add table public.daily_logs;
  alter table public.daily_logs enable row level security;
  
  -- 3. Cria a política DEFINITIVA (Libera DELETE, UPDATE, INSERT, SELECT)
  create policy "Permissao_Suprema_Delete" 
  on public.daily_logs 
  for all 
  using (true) 
  with check (true);
*/

// Credentials provided
const supabaseUrl = 'https://oaflhpwhrdaaqjvmdvyl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hZmxocHdocmRhYXFqdm1kdnlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4NjA2MDksImV4cCI6MjA3OTQzNjYwOX0.tZ6OciLdfh65RAkzmCSteSIeqovI1IkWPZyM8MPvqQo';

// Check if URL is valid to prevent runtime crash
const isValidUrl = (url: string) => url.startsWith('http://') || url.startsWith('https://');

export const supabase = (isValidUrl(supabaseUrl) && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

export const TABLE_NAME = 'daily_logs';