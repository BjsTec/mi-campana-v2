/**
 * Crea un "email sintético" a partir de una cédula, según la lógica de negocio.
 * Supabase Auth requiere un email, por lo que transformamos la cédula a este formato.
 * @param {string} cedula - El número de cédula del usuario.
 * @returns {string} El email sintético formateado.
 */
export function createSyntheticEmail(cedula) {
  if (!cedula || typeof cedula !== 'string') {
    return null
  }
  return `${cedula.trim()}@auth.autoridadpolitica.app`
}