import { createClient } from '@supabase/supabase-js';
import { setManagedSupabaseClient } from './clients';

/**
 * Initializes the Supabase client with service role and stores it for reuse.
 */
export const initManagedClients = async (): Promise<void> => {
  console.log('🚀 [initManagedClients] Initializing managed clients');

  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('❌ [initManagedClients] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    setManagedSupabaseClient(null);
    return;
  }

  const client = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  setManagedSupabaseClient(client);
  console.log('✅ [initManagedClients] Supabase client initialized');
};
