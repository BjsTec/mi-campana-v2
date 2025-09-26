// src/lib/__mocks__/supabase-client.js

// Creamos un mock profundo de la estructura que utiliza el componente de Login.
// La clave es replicar la ruta del objeto: supabase.auth.signInWithPassword
export const supabase = {
  auth: {
    signInWithPassword: jest.fn(),
  },
};