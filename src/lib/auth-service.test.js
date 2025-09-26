import { signInWithCedulaAndPassword } from './auth-service'
import { supabase } from './supabase-client'
import { createSyntheticEmail } from './utils'

// Mock del cliente de Supabase
jest.mock('./supabase-client')
// Mock de las utilidades para aislar la prueba a la función de servicio
jest.mock('./utils')

describe('signInWithCedulaAndPassword', () => {
  beforeEach(() => {
    // Limpiar todos los mocks antes de cada prueba
    jest.clearAllMocks()
  })

  it('debe llamar a supabase.auth.signInWithPassword con un email sintético', async () => {
    const cedula = '123456789'
    const password = 'password123'
    const syntheticEmail = '123456789@auth.autoridadpolitica.app'

    // Configurar mocks
    createSyntheticEmail.mockReturnValue(syntheticEmail)
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: { id: 'fake-id' } },
      error: null,
    })

    // Llamar a la función
    await signInWithCedulaAndPassword(cedula, password)

    // Verificar que el email sintético fue creado
    expect(createSyntheticEmail).toHaveBeenCalledWith(cedula)
    // Verificar que la función de Supabase fue llamada con los datos correctos
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: syntheticEmail,
      password: password,
    })
  })

  it('debe devolver los datos del usuario en un inicio de sesión exitoso', async () => {
    const cedula = '123456789'
    const password = 'password123'
    const expectedData = { data: { user: { id: 'fake-id' } }, error: null }

    createSyntheticEmail.mockReturnValue(`${cedula}@auth.autoridadpolitica.app`)
    supabase.auth.signInWithPassword.mockResolvedValue(expectedData)

    const result = await signInWithCedulaAndPassword(cedula, password)

    expect(result).toEqual(expectedData)
  })

  it('debe devolver un error si las credenciales de Supabase son incorrectas', async () => {
    const cedula = '123456789'
    const password = 'wrong-password'
    const expectedError = {
      data: null,
      error: { message: 'Invalid login credentials' },
    }

    createSyntheticEmail.mockReturnValue(`${cedula}@auth.autoridadpolitica.app`)
    supabase.auth.signInWithPassword.mockResolvedValue(expectedError)

    const result = await signInWithCedulaAndPassword(cedula, password)

    expect(result).toEqual(expectedError)
  })

  it('debe devolver un error si la cédula o la contraseña faltan', async () => {
    let result = await signInWithCedulaAndPassword(null, 'password')
    expect(result.error.message).toBe(
      'La cédula y la contraseña son obligatorias.',
    )

    result = await signInWithCedulaAndPassword('12345', null)
    expect(result.error.message).toBe(
      'La cédula y la contraseña son obligatorias.',
    )
  })
})