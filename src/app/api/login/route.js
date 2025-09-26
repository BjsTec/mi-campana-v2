// src/app/api/login/route.js

import { supabase } from '../../../lib/supabase-client'
import { createSyntheticEmail } from '../../../lib/utils'

// Este es el Route Handler para manejar solicitudes POST a /api/login
export async function POST(request) {
  try {
    // 1. Obtener los datos (cédula y password) del cuerpo de la solicitud
    const { cedula, password } = await request.json()

    // 2. Validar que los datos necesarios existan
    if (!cedula || !password) {
      return new Response(
        JSON.stringify({ error: 'Faltan credenciales (cédula o contraseña).' }),
        {
          status: 400, // Bad Request
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
    }

    // 3. Construir el email sintético usando la función de utilidad
    const syntheticEmail = createSyntheticEmail(cedula)

    // 4. Autenticar con Supabase usando el email sintético
    const { data, error } = await supabase.auth.signInWithPassword({
      email: syntheticEmail,
      password,
    })

    // 5. Manejar el error de Supabase
    if (error) {
      console.error('Error de autenticación de Supabase:', error.message)
      // Devolver un error claro al cliente
      return new Response(
        JSON.stringify({
          error: 'Credenciales inválidas.',
          details: error.message,
        }),
        {
          status: 401, // Unauthorized
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
    }

    // 5. Si la autenticación es exitosa
    // Devolver los datos del usuario y la sesión al frontend
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    // 6. Captura cualquier error inesperado en este Route Handler
    console.error('Error en el Route Handler /api/login:', error)
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor.' }),
      {
        status: 500, // Internal Server Error
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
  }
}
