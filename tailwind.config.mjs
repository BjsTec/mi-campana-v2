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
        // --- Nueva Paleta Azul/Dorado ---
        primary: {
          DEFAULT: '#0B2A4A', // Azul Oscuro Principal
          light: '#1E4A7D',   // Azul claro (hover/detalles)
          dark: '#041A2F',    // Azul muy oscuro (fondos profundos)
        },
        secondary: {
          DEFAULT: '#D4AF37', // Dorado Principal
          light: '#EACD6F',   // Dorado claro (brillos/hover)
          dark: '#B8860B',    // Dorado oscuro/ocre (acentos)
        },
        accent: {
          DEFAULT: '#F0E68C', // Caqui/Dorado pálido (fondos sutiles)
        },
        neutral: {          // Grises azulados
          lightest: '#F0F4F8',// Casi blanco
          light: '#D3DCE6',   // Gris claro
          medium: '#AAB8C6', // Gris medio
          dark: '#3E5A74',   // Gris oscuro azulado
          darkest: '#1C2B3A', // Muy oscuro
        },
        success: {
          DEFAULT: '#10B981', // Verde éxito
        },
        error: {
          DEFAULT: '#EF4444',   // Rojo error
        },
        warning: {
          DEFAULT: '#F59E0B', // Ambar advertencia
        },
         // --- Fin Nueva Paleta ---

        // Mantener otros colores si son necesarios, o eliminarlos
        // Ejemplo de color existente (revisar si se mantiene o se mapea a la nueva paleta):
        'color-text-primary': '#333', // ¿Mapear a neutral.darkest?
         background: {
          light: '#ffffff',
          dark: '#1a202c',
        },
        text: {
          light: '#4a5568',
          dark: '#e2e8f0',
        },
        hover: {
          light: '#edf2f7',
          dark: '#2d3748',
        },
        // ... otros colores existentes ...
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      // Puedes añadir aquí extensiones para fontFamily, keyframes, etc. si es necesario
    },
  },
  plugins: [],
};

export default config;