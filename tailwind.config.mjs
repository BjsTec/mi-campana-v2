/** @type {import('tailwindcss').Config} */
import colors from 'tailwindcss/colors' // Importar los colores de Tailwind para extender

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
          light: '#61A3F7', // Azul más claro (ajustado para ser más armónico con el DEFAULT)
          dark: '#102540', // Azul muy oscuro (casi negro azulado)
        },
        secondary: {
          DEFAULT: '#F2B90F', // Amarillo/dorado principal
          light: '#FCE497', // **¡Mejorado!** Tono más claro de amarillo/dorado
          dark: '#CC9900', // Tono más oscuro de amarillo/dorado (manteniendo la vibración)
        },
        neutral: {
          50: '#FAFAFA', // Nuevo: Blanco roto o gris casi blanco, útil para fondos sutiles
          100: '#F3F4F6', // Gris muy claro (para fondos, como el actual bg-gray-100)
          200: '#E5E7EB', // Gris claro
          300: '#D1D5DB', // Gris medio claro
          600: '#4B5563', // Gris oscuro para texto secundario
          800: '#1F2937', // Gris muy oscuro para texto principal
        },
        // Mapeo a colores de Tailwind existentes
        info: colors.blue[500], // Azul estándar de Tailwind para información
        success: colors.green[500], // Verde estándar de Tailwind para éxito
        warning: colors.yellow[500], // Amarillo estándar de Tailwind para advertencia
        error: colors.red[600], // Rojo estándar de Tailwind para errores
      },
    },
  },
  plugins: [],
}
