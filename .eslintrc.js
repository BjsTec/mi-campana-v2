// .eslintrc.js

module.exports = {
  root: true,
  extends: [
    "universe/native",        // Si aún quieres universe/native
    "next",                   // Configuración base de Next.js
    "next/core-web-vitals",   // Reglas de Core Web Vitals
    "plugin:prettier/recommended" // <--- ¡CAMBIO CRÍTICO! Va AL FINAL y reemplaza "prettier"
  ],
  rules: {
    // Mantén esta regla deshabilitada si te causó problemas de compatibilidad
    "node/handle-callback-err": "off",
    "import/order": "off",
    // Reglas específicas de React para Next.js 17+
    "react/react-in-jsx-scope": "off",
    "react/jsx-uses-react": "off"

    // ¡IMPORTANTE! Hemos eliminado las reglas "semi" y "quotes" de aquí.
    // Ahora, "plugin:prettier/recommended" se encargará de que Prettier fuerce
    // el estilo (sin punto y coma, comillas simples) y ESLint lo valide.
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: "latest",
    sourceType: "module"
  },
  settings: {
    react: {
      version: "detect"
    }
  }
};