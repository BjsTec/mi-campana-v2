import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import LoginPage from './page' // El componente a probar
import { supabase } from '@/lib/supabase-client' // Importamos el mock
import { createSyntheticEmail } from '@/lib/utils'

// Mock de dependencias
// 1. next/navigation
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: jest.fn(),
  }),
}))

// 2. AuthContext (ya no es necesario si la redirección es lo único que hace)
// Si el componente hiciera algo más con el contexto, lo mantendríamos.
// Por ahora, el test se centra en la lógica de la página misma.

// 3. Animación Lottie
jest.mock('lottie-react', () => () => <div data-testid="lottie-animation"></div>)

// 4. Mock del cliente de Supabase
// Jest usará automáticamente el archivo en `src/lib/__mocks__/supabase-client.js`
jest.mock('@/lib/supabase-client')

describe('LoginPage', () => {
  // Limpiar mocks antes de cada prueba
  beforeEach(() => {
    // Limpiamos los mocks antes de cada prueba para asegurar el aislamiento
    jest.clearAllMocks()
  })

  it('debe renderizar el formulario de login correctamente', () => {
    render(<LoginPage />)
    expect(
      screen.getByRole('heading', { name: /Bienvenido/i }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/Cédula/i)).toBeInTheDocument()
    expect(
      screen.getByLabelText(/Contraseña/i, { selector: 'input' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Iniciar Sesión/i }),
    ).toBeInTheDocument()
  })

  it('debe llamar a supabase.auth.signInWithPassword y redirigir en un envío exitoso', async () => {
    // Arrange: Configuramos el mock de Supabase para simular un éxito
    const cedula = '12345'
    const password = 'password123'
    const syntheticEmail = createSyntheticEmail(cedula)

    // El mock debe devolver un objeto sin error
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: { id: '123' }, session: { access_token: 'fake-token' } },
      error: null,
    })

    render(<LoginPage />)

    // Act: Rellenamos y enviamos el formulario
    fireEvent.change(screen.getByLabelText(/Cédula/i), {
      target: { value: cedula },
    })
    fireEvent.change(
      screen.getByLabelText(/Contraseña/i, { selector: 'input' }),
      { target: { value: password } },
    )
    fireEvent.click(screen.getByRole('button', { name: /Iniciar Sesión/i }))

    // Assert
    await waitFor(() => {
      // 1. Verificar que la función de Supabase fue llamada correctamente
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: syntheticEmail,
        password: password,
      })
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledTimes(1)

      // 2. Verificar que el router fue llamado para redirigir
      expect(mockPush).toHaveBeenCalledWith('/dashboard-redirect')
    })
  })

  it('debe mostrar un mensaje de error si Supabase devuelve un error', async () => {
    // Arrange: Configuramos el mock para simular un error de autenticación
    const errorMessage =
      'Credenciales incorrectas. Por favor, verifica tus datos.'
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: null,
      error: { message: 'Invalid login credentials', name: 'AuthApiError' },
    })

    render(<LoginPage />)

    // Act
    fireEvent.change(screen.getByLabelText(/Cédula/i), {
      target: { value: '12345' },
    })
    fireEvent.change(
      screen.getByLabelText(/Contraseña/i, { selector: 'input' }),
      { target: { value: 'wrongpassword' } },
    )
    fireEvent.click(screen.getByRole('button', { name: /Iniciar Sesión/i }))

    // Assert
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(errorMessage)

    // Verificar que no se intentó redirigir
    expect(mockPush).not.toHaveBeenCalled()
  })
})