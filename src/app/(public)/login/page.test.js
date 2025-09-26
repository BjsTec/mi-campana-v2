import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import LoginPage from './page' // El componente a probar
import { jwtDecode } from 'jwt-decode'

// Mock de dependencias
// 1. next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}))

// 2. AuthContext
const mockLogin = jest.fn()
jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}))

// 3. Animación Lottie
jest.mock('lottie-react', () => () => <div data-testid="lottie-animation"></div>)

// 4. jwt-decode
jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn(),
}))

// 5. Mock del fetch global
global.fetch = jest.fn()

// Mock de la variable de entorno
process.env.NEXT_PUBLIC_LOGIN_WITH_EMAIL_URL = 'https://fake-login-url.com/api'

describe('LoginPage', () => {
  // Limpiar mocks antes de cada prueba
  beforeEach(() => {
    // Limpiamos los mocks antes de cada prueba para asegurar el aislamiento
    fetch.mockClear()
    mockLogin.mockClear()
    jwtDecode.mockClear()
  })

  it('debe renderizar el formulario de login correctamente', () => {
    render(<LoginPage />)

    // Verificar el título
    expect(
      screen.getByRole('heading', { name: /Bienvenido/i }),
    ).toBeInTheDocument()

    // Verificar los campos de entrada
    expect(screen.getByLabelText(/Cédula/i)).toBeInTheDocument()
    expect(
      screen.getByLabelText(/Contraseña/i, { selector: 'input' }),
    ).toBeInTheDocument()

    // Verificar el botón de login
    expect(
      screen.getByRole('button', { name: /Iniciar Sesión/i }),
    ).toBeInTheDocument()
  })

  it('debe llamar a la función de login en un envío exitoso', async () => {
    // Arrange: Mock de las respuestas de la API y del token decodificado
    const fakeToken = 'fake.jwt.token'
    const fakeUser = { role: 'candidato', name: 'Juan Candi' }

    // Mock de la primera llamada fetch (a la función de login)
    fetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ idToken: fakeToken })),
      json: () => Promise.resolve({ idToken: fakeToken }),
    })

    // Mock de la segunda llamada fetch (para establecer la cookie de sesión)
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    })

    // Mock de jwtDecode
    jwtDecode.mockReturnValue(fakeUser)

    render(<LoginPage />)

    // Act: Rellenar el formulario y enviarlo
    fireEvent.change(screen.getByLabelText(/Cédula/i), {
      target: { value: '12345' },
    })
    fireEvent.change(
      screen.getByLabelText(/Contraseña/i, { selector: 'input' }),
      {
        target: { value: 'password123' },
      },
    )
    fireEvent.click(screen.getByRole('button', { name: /Iniciar Sesión/i }))

    // Assert: Verificar que la función de login del contexto fue llamada, que es la responsabilidad principal del componente.
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(fakeUser, fakeToken)
    })
  })

  it('debe mostrar un mensaje de error en un login fallido', async () => {
    // Arrange: Mock de una respuesta de API fallida
    const errorMessage = 'Credenciales incorrectas.'
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ message: errorMessage }),
      text: () => Promise.resolve(JSON.stringify({ message: errorMessage })),
    })

    render(<LoginPage />)

    // Act
    fireEvent.change(screen.getByLabelText(/Cédula/i), {
      target: { value: '12345' },
    })
    fireEvent.change(
      screen.getByLabelText(/Contraseña/i, { selector: 'input' }),
      {
        target: { value: 'wrongpassword' },
      },
    )
    fireEvent.click(screen.getByRole('button', { name: /Iniciar Sesión/i }))

    // Assert
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(errorMessage)
  })
})