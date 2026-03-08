import { createClient } from '@supabase/supabase-js';

// Replace with your Supabase project URL and anon public key
const SUPABASE_URL = 'https://uzoegrwmsxdlnkrpfptt.supabase.co'; // Replace with your Project URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6b2Vncndtc3hkbG5rcnBmcHR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIzNTM3NzEsImV4cCI6MjA0NzkyOTc3MX0.oJMJnTtc5BA3dUdgrnkhs5bibh_5TOZl3i7eB1VXIrU'; // Replace with your anon public API key

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
