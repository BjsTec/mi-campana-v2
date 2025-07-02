// functions/index.js (Este es el archivo principal en la raíz de tu carpeta 'functions')

// Importar initializeApp UNA SOLA VEZ aquí.
import { initializeApp } from 'firebase-admin/app'

// --- INICIALIZACIÓN GLOBAL DE FIREBASE ADMIN SDK (¡ESTO ES CRUCIAL!) ---
// Esta línea DEBE estar presente y SIN comentar.
initializeApp()

// --- Importa y RE-EXPORTA tus funciones desde los módulos ---
// Esto le dice a Firebase CLI qué funciones deben ser desplegadas y con qué nombres.
// Asegúrate de que las rutas relativas sean correctas según tu estructura de carpetas.

// Exporta las funciones de usuario desde el módulo 'users.js' dentro de la carpeta 'routes'.
export * from './routes/users.js'

// Si tuvieras un módulo de productos en 'functions/routes/products.js', lo exportarías así:
// export * from './routes/products.js';
