// tailwind.config.mjs

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // --- Nueva Paleta Azul/Dorado (Esta paleta está perfecta) ---
        primary: {
          DEFAULT: '#0B2A4A',
          light: '#1E4A7D',
          dark: '#041A2F',
        },
        secondary: {
          DEFAULT: '#D4AF37',
          light: '#EACD6F',
          dark: '#B8860B',
        },
        accent: {
          DEFAULT: '#F0E68C',
        },
        neutral: {
          lightest: '#F0F4F8',
          light: '#D3DCE6',
          medium: '#AAB8C6',
          dark: '#3E5A74',
          darkest: '#1C2B3A',
        },
        success: {
          DEFAULT: '#10B981',
        },
        error: {
          DEFAULT: '#EF4444',
        },
        warning: {
          DEFAULT: '#F59E0B',
        },
        // --- Fin Nueva Paleta ---

        /* LIMPIEZA: Se eliminan las claves de color antiguas 
          ('color-text-primary', 'background', 'text', 'hover').
          Ya no son necesarias, pues usaremos la paleta 'neutral' directamente.
        */
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      // AÑADIDO: Registrar las fuentes de layout.js en Tailwind
      fontFamily: {
        sans: ['var(--font-open-sans)', 'sans-serif'],
        heading: ['var(--font-montserrat)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config