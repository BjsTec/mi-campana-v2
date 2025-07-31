// tailwind.config.js
/** @type {import('tailwindcss').Config} */
import colors from 'tailwindcss/colors'

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
          DEFAULT: '#123979ff', // Azul que usamos anteriormente que sí se veía sólido (blue-600)
          light: '#61A3F7', // Tu azul claro original
          dark: '#21345cff', // Un azul más oscuro que el DEFAULT, ideal para hover del botón
          800: '#161d30ff', // Un azul oscuro para el degradado si lo necesitas, similar a primary-dark que usamos en la izquierda
        },
        secondary: {
          DEFAULT: '#F2B90F', // Amarillo/dorado principal
          light: '#FCE497', // Tono más claro de amarillo/dorado
          dark: '#CC9900', // Tono más oscuro de amarillo/dorado
        },
        neutral: {
          50: '#FAFAFA', // Nuevo: Blanco roto o gris casi blanco, útil para fondos sutiles
          100: '#F3F4F6', // Gris muy claro
          200: '#E5E7EB', // Gris claro
          300: '#D1D5DB', // Gris medio claro
          600: '#4B5563', // Gris oscuro para texto secundario
          800: '#1F2937', // Gris muy oscuro para texto principal
        },
        // Mapeo a colores de Tailwind existentes
        info: colors.blue[500],
        success: colors.green[500],
        warning: colors.yellow[500],
        error: colors.red[600],
      },
      fontFamily: {
        headings: ['var(--font-montserrat)', 'sans-serif'],
        body: ['var(--font-open-sans)', 'sans-serif'],
      },
    },
    // Asegúrate de que los keyframes y animations estén al mismo nivel que extend o dentro de él si es que aplica
    // Esto es una aclaración, tu código original los tenía fuera de extend pero dentro de theme, lo cual es correcto.
    keyframes: {
      'pulse-slow': {
        '0%, 100%': { opacity: '0.2' },
        '50%': { opacity: '0.4' },
      },
      'fade-in': {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
      },
    },
    animation: {
      'pulse-slow': 'pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      'fade-in': 'fade-in 1s ease-out forwards',
    },
  },
  plugins: [],
}
