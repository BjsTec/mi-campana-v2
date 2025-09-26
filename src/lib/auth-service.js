import { supabase } from './supabase-client'
import { createSyntheticEmail } from './utils'

/**
 * Inicia sesión de un usuario utilizando su cédula y contraseña.
 * Encapsula la lógica de crear un email sintético y llamar a Supabase.
 * @param {string} cedula - La cédula del usuario.
 * @param {string} password - La contraseña del usuario.
 * @returns {Promise<{data: object, error: object|null}>} El resultado de la operación de Supabase.
 */
export async function signInWithCedulaAndPassword(cedula, password) {
  if (!cedula || !password) {
    return {
      data: null,
      error: { message: 'La cédula y la contraseña son obligatorias.' },
    }
  }

  const syntheticEmail = createSyntheticEmail(cedula)
  if (!syntheticEmail) {
    return {
      data: null,
      error: { message: 'La cédula proporcionada no es válida.' },
    }
  }

  return await supabase.auth.signInWithPassword({
    email: syntheticEmail,
    password: password,
  })
}