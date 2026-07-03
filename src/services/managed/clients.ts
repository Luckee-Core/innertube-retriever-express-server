import type { SupabaseClient } from '@supabase/supabase-js';

let managedSupabaseClient: SupabaseClient | null = null;

/**
 * Returns the managed Supabase client, or null if not initialized.
 */
export const getManagedSupabaseClient = (): SupabaseClient | null => managedSupabaseClient;

/**
 * @internal Set by init-managed-clients at startup.
 */
export const setManagedSupabaseClient = (client: SupabaseClient | null): void => {
  managedSupabaseClient = client;
};
