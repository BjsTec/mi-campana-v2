import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  // Proporciona la ruta a tu aplicación Next.js para cargar next.config.js y .env en tu entorno de prueba
  dir: './',
})

// Añade cualquier configuración personalizada de Jest que desees
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  // Si estás utilizando alias de importación en tsconfig.json o jsconfig.json, necesitas configurar moduleNameMapper
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
}

// createJestConfig es una función asíncrona, por lo que no puedes usar `export default createJestConfig(customJestConfig)` directamente.
// En su lugar, exporta una función asíncrona que Jest ejecutará.
export default createJestConfig(customJestConfig)