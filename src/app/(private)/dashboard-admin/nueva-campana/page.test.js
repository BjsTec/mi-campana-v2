import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import NuevaCampanaPage from './page'

// Mock de los hooks y módulos necesarios
jest.mock('../../../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { role: 'admin' },
    idToken: 'fake-id-token',
  }),
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

// Mockear fetch globalmente
global.fetch = jest.fn()

// Datos de prueba para las APIs
const mockCampaignTypes = [
  { id: 'tipo-1', name: 'Gobernación', active: true },
  { id: 'tipo-2', name: 'Alcaldía', active: true },
  { id: 'tipo-3', name: 'Concejo', active: false }, // Inactivo, no debería aparecer
]

const mockPricingPlans = [
  { id: 'plan-1', name: 'Básico', price: 100, typeId: 'tipo-1' },
  { id: 'plan-2', name: 'Profesional', price: 200, typeId: 'tipo-1' },
  { id: 'plan-3', name: 'Demo', price: 0, typeId: 'tipo-2' },
  { id: 'plan-4', name: 'Otro Plan', price: 50, typeId: 'tipo-2' },
]

const mockDepartments = [
  { id: 'dep-1', name: 'Antioquia' },
  { id: 'dep-2', name: 'Cundinamarca' },
]

const mockCities = [{ id: 'city-1', name: 'Medellín' }]

describe('NuevaCampanaPage', () => {
  beforeEach(() => {
    // Limpiar mocks antes de cada prueba
    fetch.mockClear()

    // Mockear las variables de entorno para las URLs de la API
    process.env.NEXT_PUBLIC_GET_PUBLIC_CAMPAIGN_TYPES_URL =
      'http://localhost/api/get-public-campaign-types'
    process.env.NEXT_PUBLIC_GET_PUBLIC_PRICING_PLANS_URL =
      'http://localhost/api/get-public-pricing-plans'
    process.env.NEXT_PUBLIC_GET_DEPARTMENTS_URL =
      'http://localhost/api/get-departments'
    process.env.NEXT_PUBLIC_GET_CITIES_BY_DEPARTMENT_URL =
      'http://localhost/api/get-cities-by-department'
    process.env.NEXT_PUBLIC_GET_USER_BY_CEDULA_URL =
      'http://localhost/api/get-user-by-cedula'
    process.env.NEXT_PUBLIC_CREATE_CAMPAIGN_URL =
      'http://localhost/api/create-campaign'

    // Configurar la implementación del mock de fetch
    fetch.mockImplementation((url) => {
      const urlObject = new URL(url)
      if (url.includes('get-public-campaign-types')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCampaignTypes),
        })
      }
      if (url.includes('get-public-pricing-plans')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockPricingPlans),
        })
      }
      if (url.includes('get-departments')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockDepartments),
        })
      }
      if (url.includes('get-cities-by-department')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCities),
        })
      }
      if (url.includes('get-user-by-cedula')) {
        const cedula = urlObject.searchParams.get('cedula')
        if (cedula === '123456789') {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                user: { name: 'Juan Perez', email: 'juan@test.com' },
              }),
          })
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ user: null }),
        })
      }
      if (url.includes('create-campaign')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              message: 'Campaña creada con éxito',
              candidateWhatsappLink: 'https://wa.me/123',
              adminWhatsappLink: 'https://wa.me/456',
            }),
        })
      }
      return Promise.reject(new Error(`URL no mockeada: ${url}`))
    })
  })

  test('debe renderizar la página y el primer paso del formulario', async () => {
    render(<NuevaCampanaPage />)

    // Esperar a que se resuelvan las llamadas iniciales de la API
    await waitFor(() => {
      expect(
        screen.getByText('Crear Nueva Campaña'),
      ).toBeInTheDocument()
    })

    // Verificar que el primer paso está visible
    expect(
      screen.getByText('Información General de la Campaña'),
    ).toBeInTheDocument()

    // Verificar campos clave del primer paso
    expect(
      screen.getByLabelText(/Nombre de la Campaña/i),
    ).toBeInTheDocument()
    expect(
      screen.getByLabelText(/Tipo de Campaña/i),
    ).toBeInTheDocument()
    expect(
      screen.getByLabelText(/Plan de Campaña/i),
    ).toBeInTheDocument()
  })

  test('debe actualizar los campos de texto al escribir', async () => {
    render(<NuevaCampanaPage />)
    await waitFor(() => {
      expect(
        screen.getByText('Información General de la Campaña'),
      ).toBeInTheDocument()
    })

    const campaignNameInput = screen.getByLabelText(/Nombre de la Campaña/i)
    fireEvent.change(campaignNameInput, {
      target: { value: 'Mi Gran Campaña' },
    })
    expect(campaignNameInput.value).toBe('Mi Gran Campaña')
  })

  test('debe permitir la selección de tipo y plan de campaña', async () => {
    render(<NuevaCampanaPage />)
    await waitFor(() => {
      expect(screen.getByLabelText(/Tipo de Campaña/i)).toBeInTheDocument()
    })

    const typeSelect = screen.getByLabelText(/Tipo de Campaña/i)
    fireEvent.change(typeSelect, { target: { value: 'tipo-1' } })

    await waitFor(() => {
      // Espera a que los planes se filtren y actualicen
      expect(screen.getByLabelText(/Plan de Campaña/i)).not.toBeDisabled()
    })

    const planSelect = screen.getByLabelText(/Plan de Campaña/i)
    // Deberían aparecer 2 planes para tipo-1
    expect(planSelect.children.length).toBe(3) // "Seleccione un plan" + 2 opciones
    expect(screen.getByText('Básico - $100/mes')).toBeInTheDocument()

    fireEvent.change(planSelect, { target: { value: 'plan-1' } })
    expect(planSelect.value).toBe('plan-1')
  })

  test('debe buscar un candidato por cédula y mostrar el resultado', async () => {
    render(<NuevaCampanaPage />)
    await waitFor(() => {
      expect(
        screen.getByText('Información General de la Campaña'),
      ).toBeInTheDocument()
    })

    // --- Llenar el paso 1 para pasar la validación ---
    fireEvent.change(screen.getByLabelText(/Nombre de la Campaña/i), {
      target: { value: 'Campaña de Prueba' },
    })
    fireEvent.change(screen.getByLabelText(/Tipo de Campaña/i), {
      target: { value: 'tipo-1' },
    })
    await waitFor(() => {
      expect(screen.getByLabelText(/Plan de Campaña/i)).not.toBeDisabled()
    })
    fireEvent.change(screen.getByLabelText(/Plan de Campaña/i), {
      target: { value: 'plan-1' },
    })
    fireEvent.change(screen.getByLabelText(/Departamento \(Campaña\)/i), {
      target: { value: 'dep-1' },
    })
    await waitFor(() => {
      expect(screen.getByLabelText(/Ciudad \(Campaña\)/i)).not.toBeDisabled()
    })
    fireEvent.change(screen.getByLabelText(/Ciudad \(Campaña\)/i), {
      target: { value: 'city-1' },
    })
    fireEvent.change(screen.getByLabelText(/Email de Contacto/i), {
      target: { value: 'contacto@test.com' },
    })
    fireEvent.change(screen.getByLabelText(/Teléfono de Contacto/i), {
      target: { value: '1234567' },
    })

    // Navegar al segundo paso
    fireEvent.click(screen.getByText('Siguiente'))

    await waitFor(() => {
      expect(screen.getByText('Datos del Candidato')).toBeInTheDocument()
    })

    const cedulaInput = screen.getByLabelText(/Cédula del Candidato/i)
    fireEvent.change(cedulaInput, { target: { value: '123456789' } })

    // Esperar a que aparezca el mensaje de usuario encontrado
    await waitFor(
      () => {
        expect(
          screen.getByText(/Usuario encontrado: Juan Perez/i),
        ).toBeInTheDocument()
      },
      { timeout: 2000 },
    )
  })

  test('debe filtrar los planes correctamente y mostrar "Demo" para el tipo correcto', async () => {
    render(<NuevaCampanaPage />)
    await waitFor(() =>
      expect(screen.getByLabelText(/Tipo de Campaña/i)).toBeInTheDocument(),
    )

    const typeSelect = screen.getByLabelText(/Tipo de Campaña/i)

    // Seleccionar tipo 'Alcaldía' (tipo-2)
    fireEvent.change(typeSelect, { target: { value: 'tipo-2' } })

    await waitFor(() => {
      // El plan "Demo" (asociado a tipo-2) debe ser visible
      expect(screen.getByText('Demo - $0/mes')).toBeInTheDocument()
      // Un plan de otro tipo (tipo-1) no debe ser visible
      expect(
        screen.queryByText('Básico - $100/mes'),
      ).not.toBeInTheDocument()
    })

    // Cambiar a tipo 'Gobernación' (tipo-1)
    fireEvent.change(typeSelect, { target: { value: 'tipo-1' } })

    await waitFor(() => {
      // Ahora "Básico" debe ser visible
      expect(screen.getByText('Básico - $100/mes')).toBeInTheDocument()
      // Y "Demo" no debe ser visible
      expect(screen.queryByText('Demo - $0/mes')).not.toBeInTheDocument()
    })
  })

  test('debe enviar el formulario con éxito y mostrar la pantalla de éxito', async () => {
    render(<NuevaCampanaPage />)
    await waitFor(() =>
      expect(
        screen.getByText('Información General de la Campaña'),
      ).toBeInTheDocument(),
    )

    // Llenar Paso 1
    fireEvent.change(screen.getByLabelText(/Nombre de la Campaña/i), {
      target: { value: 'Campaña Final' },
    })
    fireEvent.change(screen.getByLabelText(/Tipo de Campaña/i), {
      target: { value: 'tipo-2' },
    })
    await waitFor(() => {
      expect(screen.getByLabelText(/Plan de Campaña/i)).not.toBeDisabled()
    })
    fireEvent.change(screen.getByLabelText(/Plan de Campaña/i), {
      target: { value: 'plan-3' },
    })
    fireEvent.change(screen.getByLabelText(/Departamento \(Campaña\)/i), {
      target: { value: 'dep-1' },
    })
    await waitFor(() => {
      expect(screen.getByLabelText(/Ciudad \(Campaña\)/i)).not.toBeDisabled()
    })
    fireEvent.change(screen.getByLabelText(/Ciudad \(Campaña\)/i), {
      target: { value: 'city-1' },
    })
    fireEvent.change(screen.getByLabelText(/Email de Contacto/i), {
      target: { value: 'final@test.com' },
    })
    fireEvent.change(screen.getByLabelText(/Teléfono de Contacto/i), {
      target: { value: '5555555' },
    })
    fireEvent.click(screen.getByText('Siguiente'))

    // Llenar Paso 2
    await waitFor(() =>
      expect(screen.getByText('Datos del Candidato')).toBeInTheDocument(),
    )
    fireEvent.change(screen.getByLabelText(/Nombre Completo del Candidato/i), {
      target: { value: 'Candidato Final' },
    })
    fireEvent.change(screen.getByLabelText(/Cédula del Candidato/i), {
      target: { value: '987654321' },
    })
    fireEvent.change(screen.getByLabelText(/Email del Candidato/i), {
      target: { value: 'candidato@final.com' },
    })
    fireEvent.change(
      screen.getByLabelText(/Contraseña Inicial para el Candidato/i),
      { target: { value: 'password123' } },
    )
    fireEvent.change(screen.getByLabelText(/Sexo/i), {
      target: { value: 'M' },
    })
    fireEvent.change(screen.getByLabelText(/Fecha de Nacimiento/i), {
      target: { value: '1990-01-01' },
    })
    fireEvent.change(screen.getByLabelText(/Departamento \(Candidato\)/i), {
      target: { value: 'dep-1' },
    })
    await waitFor(() => {
      expect(screen.getByLabelText(/Ciudad \(Candidato\)/i)).not.toBeDisabled()
    })
    fireEvent.change(screen.getByLabelText(/Ciudad \(Candidato\)/i), {
      target: { value: 'city-1' },
    })
    fireEvent.click(screen.getByText('Siguiente'))

    // Navegar al Paso 3 y enviar
    await waitFor(() =>
      expect(screen.getByText('Identidad Visual y Redes')).toBeInTheDocument(),
    )
    fireEvent.click(screen.getByText(/Finalizar y Crear Campaña/i))

    // Verificar que la API fue llamada y se muestra la pantalla de éxito
    await screen.findByText(/¡Campaña .* Creada con Exito!/i)

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('create-campaign'),
      expect.any(Object),
    )
  })

  test('debe mostrar un mensaje de error si el envío del formulario falla', async () => {
    // Sobrescribir el mock de fetch para que falle en la creación
    fetch.mockImplementation((url) => {
      const urlObject = new URL(url)
      if (url.includes('create-campaign')) {
        return Promise.resolve({
          ok: false,
          json: () =>
            Promise.resolve({ message: 'Error del servidor simulado' }),
        })
      }
      if (url.includes('get-public-campaign-types')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCampaignTypes),
        })
      }
      if (url.includes('get-public-pricing-plans')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockPricingPlans),
        })
      }
      if (url.includes('get-departments')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockDepartments),
        })
      }
      if (url.includes('get-cities-by-department')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCities),
        })
      }
      if (url.includes('get-user-by-cedula')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ user: null }),
        })
      }
      return Promise.reject(new Error(`URL no mockeada: ${url}`))
    })

    render(<NuevaCampanaPage />)
    await waitFor(() =>
      expect(
        screen.getByText('Información General de la Campaña'),
      ).toBeInTheDocument(),
    )

    // Llenar todo el formulario (similar al test de éxito)
    fireEvent.change(screen.getByLabelText(/Nombre de la Campaña/i), {
      target: { value: 'Campaña Fallida' },
    })
    fireEvent.change(screen.getByLabelText(/Tipo de Campaña/i), {
      target: { value: 'tipo-1' },
    })
    await waitFor(() => {
      expect(screen.getByLabelText(/Plan de Campaña/i)).not.toBeDisabled()
    })
    fireEvent.change(screen.getByLabelText(/Plan de Campaña/i), {
      target: { value: 'plan-1' },
    })
    fireEvent.change(screen.getByLabelText(/Departamento \(Campaña\)/i), {
      target: { value: 'dep-1' },
    })
    await waitFor(() => {
      expect(screen.getByLabelText(/Ciudad \(Campaña\)/i)).not.toBeDisabled()
    })
    fireEvent.change(screen.getByLabelText(/Ciudad \(Campaña\)/i), {
      target: { value: 'city-1' },
    })
    fireEvent.change(screen.getByLabelText(/Email de Contacto/i), {
      target: { value: 'fallido@test.com' },
    })
    fireEvent.change(screen.getByLabelText(/Teléfono de Contacto/i), {
      target: { value: '1112223' },
    })
    fireEvent.click(screen.getByText('Siguiente'))

    await waitFor(() =>
      expect(screen.getByText('Datos del Candidato')).toBeInTheDocument(),
    )
    fireEvent.change(screen.getByLabelText(/Nombre Completo del Candidato/i), {
      target: { value: 'Candidato Fallido' },
    })
    fireEvent.change(screen.getByLabelText(/Cédula del Candidato/i), {
      target: { value: '11111111' },
    })
    fireEvent.change(screen.getByLabelText(/Email del Candidato/i), {
      target: { value: 'candidato@fallido.com' },
    })
    fireEvent.change(
      screen.getByLabelText(/Contraseña Inicial para el Candidato/i),
      { target: { value: 'password123' } },
    )
    fireEvent.change(screen.getByLabelText(/Sexo/i), {
      target: { value: 'F' },
    })
    fireEvent.change(screen.getByLabelText(/Fecha de Nacimiento/i), {
      target: { value: '1991-01-01' },
    })
    fireEvent.change(screen.getByLabelText(/Departamento \(Candidato\)/i), {
      target: { value: 'dep-1' },
    })
    await waitFor(() => {
      expect(screen.getByLabelText(/Ciudad \(Candidato\)/i)).not.toBeDisabled()
    })
    fireEvent.change(screen.getByLabelText(/Ciudad \(Candidato\)/i), {
      target: { value: 'city-1' },
    })
    fireEvent.click(screen.getByText('Siguiente'))

    await waitFor(() =>
      expect(screen.getByText('Identidad Visual y Redes')).toBeInTheDocument(),
    )
    fireEvent.click(screen.getByText(/Finalizar y Crear Campaña/i))

    // Verificar que se muestra el mensaje de error
    await waitFor(() => {
      expect(
        screen.getByText('Error del servidor simulado'),
      ).toBeInTheDocument()
    })
  })
})