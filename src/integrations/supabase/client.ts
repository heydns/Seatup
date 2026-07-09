// Client Supabase — lit depuis .env (VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_KEY)
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  // Log clair en console au lieu de crasher en silence
  console.error(
    '[Supabase] Variables manquantes. Vérifie ton .env :\n' +
      '  VITE_SUPABASE_URL=' + (SUPABASE_URL || '(vide)') + '\n' +
      '  VITE_SUPABASE_PUBLISHABLE_KEY=' + (SUPABASE_PUBLISHABLE_KEY ? '(présente)' : '(vide)')
  );
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
