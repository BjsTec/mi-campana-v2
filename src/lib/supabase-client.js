import { createClient } from '@supabase/supabase-js';

// Lee las variables de entorno para la configuración de Supabase.
// Es una buena práctica usar variables de entorno para mantener la seguridad de las claves.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Valida que las variables de entorno necesarias estén definidas.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anon Key. Make sure to set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env file.');
}

// Crea y exporta el cliente de Supabase para ser usado en toda la aplicación.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);