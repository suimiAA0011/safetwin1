import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: {
      'X-Client-Info': 'safetwin-app'
    }
  }
});

// Database schema initialization
export const initializeDatabase = async () => {
  try {
    // Test connection
    const { data, error } = await supabase.from('airports').select('id').limit(1);
    if (error) {
      console.warn('Database connection test failed:', error);
      // Don't throw error, allow app to continue with demo mode
    } else {
      console.log('Database connection successful');
    }
  } catch (error) {
    console.error('Database initialization failed:', error);
    // Allow app to continue in demo mode
  }
};