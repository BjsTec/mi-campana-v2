/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors') // ¡Importante: importar los colores de Tailwind!

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3084F2', // Azul principal
          light: '#389BF2', // Azul más claro
          dark: '#102540', // Azul muy oscuro (casi negro azulado)
        },
        secondary: {
          DEFAULT: '#F2B90F', // Amarillo/dorado principal
          light: '#dfdfdf', // Gris muy claro (¡Quizás quieras un tono de amarillo más claro aquí!)
          dark: '#181818', // Gris muy oscuro (casi negro)
        },
        neutral: {
          100: '#F3F4F6', // Gris muy claro (para fondos)
          200: '#E5E7EB', // Gris claro
          300: '#D1D5DB', // Gris medio claro
          600: '#4B5563', // Gris oscuro para texto secundario
          800: '#1F2937', // Gris muy oscuro para texto principal (corregido: 'l' al final removido)
        },
        // Mapeo a colores de Tailwind existentes, ahora que 'colors' está importado
        info: colors.blue[500], // Azul estándar de Tailwind para información
        success: colors.green[500], // Verde estándar de Tailwind para éxito
        warning: colors.yellow[500], // Amarillo estándar de Tailwind para advertencia
        error: colors.red[600], // Rojo estándar de Tailwind para errores
      },
    },
  },
  plugins: [],
}
