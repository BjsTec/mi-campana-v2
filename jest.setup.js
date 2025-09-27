// Opcional: limpia las simulaciones (mocks) después de cada prueba si las estás utilizando
// jest.clearAllMocks()

// Importa matchers extendidos de jest-dom
import '@testing-library/jest-dom'

// Cargar variables de entorno para el entorno de prueba de Jest
process.env.NEXT_PUBLIC_GET_SECURE_USERS_URL =
  'http://localhost:3000/api/get-secure-users'
process.env.NEXT_PUBLIC_UPDATE_USER_STATUS_URL =
  'http://localhost:3000/api/update-user-status'