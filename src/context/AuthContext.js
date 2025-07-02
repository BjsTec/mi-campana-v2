'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Necesario para redirigir en logout y en la carga inicial
import { jwtDecode } from 'jwt-decode'; // Importa la librería para decodificar JWT

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // Almacenará { uid, email, name, role, idToken }
  const [loadingInitial, setLoadingInitial] = useState(true); // Nuevo estado para indicar carga inicial del contexto
  const router = useRouter(); // Instancia del router para usar aquí

  // Cargar datos del usuario desde localStorage y validar el token al iniciar la aplicación
  useEffect(() => {
    const storedToken = localStorage.getItem('userToken'); // Lee el JWT de localStorage
    if (storedToken) {
      try {
        const decodedToken = jwtDecode(storedToken); // Decodifica el token
        // Opcional: Verificar si el token ha expirado (payload.exp es en segundos UNIX)
        const currentTime = Date.now() / 1000; // Tiempo actual en segundos

        if (decodedToken.exp < currentTime) {
          // Si el token ha expirado, limpia la sesión
          console.log('Token JWT expirado. Limpiando sesión.');
          localStorage.removeItem('userToken'); // Limpia el token
          setUser(null); // Limpia el estado del usuario
        } else {
          // Si el token es válido y no ha expirado, establece el usuario del contexto
          setUser({
            idToken: storedToken, // Guardamos el token completo también si es necesario
            firebaseAuthUid: decodedToken.uid,
            email: decodedToken.email,
            name: decodedToken.name,
            role: decodedToken.role,
            // Aquí puedes añadir cualquier otro dato del payload que necesites
          });
          console.log('Sesión restablecida desde JWT en localStorage.');
        }
      } catch (e) {
        // Si hay un error al decodificar (token corrupto, etc.), limpia la sesión
        console.error('Error al decodificar o validar el token JWT de localStorage:', e);
        localStorage.removeItem('userToken');
        setUser(null);
      }
    }
    setLoadingInitial(false); // La carga inicial del contexto ha terminado
  }, []); // Se ejecuta solo una vez al montar el componente

  // Función para iniciar sesión (actualiza el estado y guarda el token)
  // Ahora espera un objeto userData que incluye el idToken
  const login = (userData) => {
    // El idToken ya debe haberse guardado en localStorage en LoginPage
    // Aquí solo actualizamos el estado del contexto con los datos decodificados
    setUser(userData);
  };

  // Función para cerrar sesión (limpia el estado y localStorage)
  const logout = () => {
    setUser(null); // Limpia el estado del usuario
    localStorage.removeItem('userToken'); // Limpia el token del localStorage
    // Redirige al login después de cerrar sesión
    router.push('/login');
  };

  // Exporta los valores y la función loadingInitial
  const value = { user, login, logout, loadingInitial };

  // Muestra un loader o contenido nulo mientras se verifica el estado inicial de autenticación
  // Esto previene que las rutas privadas intenten renderizarse antes de saber si hay usuario
  if (loadingInitial) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-gray-700">Verificando sesión...</p>
        {/* Podrías usar aquí tu componente Lottie de carga si lo deseas */}
      </div>
    );
  }

  // Una vez que la carga inicial ha terminado, proporciona el contexto a los hijos
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook personalizado para usar el contexto de autenticación fácilmente
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}