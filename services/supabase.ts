import { createClient } from '@supabase/supabase-js';

// INSTRUCTIONS FOR USER:
// 1. The table `daily_logs` must exist in your Supabase project.
/*
  create table public.daily_logs (
    date text primary key,
    tasks jsonb default '{}'::jsonb,
    points integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now())
  );

  -- Enable Realtime
  alter publication supabase_realtime add table public.daily_logs;
  
  -- IMPORTANT: IF YOU SEE ERRORS, YOU LIKELY NEED TO ENABLE ACCESS VIA RLS POLICIES:
  alter table public.daily_logs enable row level security;
  create policy "Enable all access" on public.daily_logs for all using (true) with check (true);
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