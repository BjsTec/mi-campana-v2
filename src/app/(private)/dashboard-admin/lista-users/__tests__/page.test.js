import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import UserListPage from '../page'
import { useAuth } from '@/context/AuthContext'

// Mockear el contexto de autenticación
jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
}))

// Mockear el fetch global
global.fetch = jest.fn()

// Mockear los componentes hijos para aislar el componente principal
jest.mock(
  '@/components/ui/SearchInput',
  () =>
    ({ value, onChange, placeholder }) => (
      <input
        data-testid="search-input"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    ),
)
jest.mock(
  '@/components/ui/StatCard',
  () =>
    ({ title, value }) => (
      <div data-testid="stat-card">
        <h3>{title}</h3>
        <p>{value}</p>
      </div>
    ),
)

const mockUsers = [
  {
    id: '1',
    name: 'Alice Johnson',
    cedula: '12345',
    campaignMemberships: [{ status: 'activo', campaignName: 'Campaña Alpha' }],
  },
  {
    id: '2',
    name: 'Bob Williams',
    cedula: '67890',
    campaignMemberships: [{ status: 'inactivo', campaignName: 'Campaña Beta' }],
  },
]

describe('UserListPage', () => {
  let mockFetch

  beforeEach(() => {
    // Configuración del mock de useAuth para un admin
    useAuth.mockReturnValue({
      user: { role: 'admin' },
      idToken: 'test-token',
      isLoading: false,
    })

    // Limpiar y configurar el mock de fetch antes de cada prueba
    mockFetch = global.fetch.mockImplementation((url) => {
      // Mock para la actualización de estado
      if (url.includes('update-user-status')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'Status updated' }),
        })
      }
      // Mock para obtener la lista de usuarios
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: mockUsers }),
      })
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render loading state initially, then render users', async () => {
    render(<UserListPage />)

    // Verifica que el estado de carga se muestra al principio
    expect(screen.getByText(/Cargando usuarios.../i)).toBeInTheDocument()

    // Espera a que los usuarios se carguen y se muestren
    expect(await screen.findByText('Alice Johnson')).toBeInTheDocument()
    expect(await screen.findByText('Bob Williams')).toBeInTheDocument()

    // Verifica que la llamada a fetch se hizo para obtener los usuarios
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(process.env.NEXT_PUBLIC_GET_SECURE_USERS_URL),
      expect.any(Object),
    )
  })

  it('should filter users based on search term', async () => {
    render(<UserListPage />)
    await screen.findByText('Alice Johnson') // Esperar a que carguen los datos

    const searchInput = screen.getByPlaceholderText(
      /Buscar por nombre, cédula o teléfono.../i,
    )
    fireEvent.change(searchInput, { target: { value: 'Alice' } })

    expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
    expect(screen.queryByText('Bob Williams')).not.toBeInTheDocument()
  })

  it('should filter users by status', async () => {
    render(<UserListPage />)
    await screen.findByText('Alice Johnson') // Esperar a que carguen los datos

    const statusFilter = screen.getByRole('combobox')
    fireEvent.change(statusFilter, { target: { value: 'inactivo' } })

    expect(screen.queryByText('Alice Johnson')).not.toBeInTheDocument()
    expect(screen.getByText('Bob Williams')).toBeInTheDocument()
  })

  // PRUEBA CLAVE: Verifica que no hay bucle de re-renderizado
  it('should refetch users only once after changing a user status', async () => {
    render(<UserListPage />)
    await screen.findByText('Alice Johnson')

    // La llamada inicial a fetch para cargar los usuarios
    expect(mockFetch).toHaveBeenCalledTimes(1)

    // Encontrar el botón para desactivar a Alice (que está activa)
    const deactivateButton = screen.getAllByRole('button', {
      name: /Desactivar/i,
    })[0]
    fireEvent.click(deactivateButton)

    // Esperamos a que se completen las llamadas de red
    await waitFor(() => {
      // Se debe llamar a la API de actualización
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(
          `${process.env.NEXT_PUBLIC_UPDATE_USER_STATUS_URL}/1`,
        ),
        expect.objectContaining({ method: 'PUT' }),
      )
    })

    // Después de la actualización, se debe volver a llamar a fetch para obtener la lista actualizada
    // El número total de llamadas a fetch debe ser 2 (1 inicial + 1 de actualización)
    // Usamos `toHaveBeenCalledWith` para la lista de usuarios de nuevo.
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(process.env.NEXT_PUBLIC_GET_SECURE_USERS_URL),
        expect.any(Object),
      )
    })

    // El número total de llamadas a la API de *obtención* de usuarios debe ser 2
    const fetchUsersCalls = mockFetch.mock.calls.filter((call) =>
      call[0].includes(process.env.NEXT_PUBLIC_GET_SECURE_USERS_URL),
    )
    expect(fetchUsersCalls.length).toBe(2)
  })

  it('should display an error message if user is not an admin', () => {
    useAuth.mockReturnValue({
      user: { role: 'user' }, // No es admin
      idToken: 'test-token',
      isLoading: false,
    })

    render(<UserListPage />)

    expect(
      screen.getByText(
        /Acceso denegado. Solo administradores pueden ver esta página./i,
      ),
    ).toBeInTheDocument()
  })
})