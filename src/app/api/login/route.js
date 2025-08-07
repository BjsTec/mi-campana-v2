// src/app/api/login/route.js

// Este es el Route Handler para manejar solicitudes POST a /api/login
export async function POST(request) {
  try {
    // 1. Obtener los datos (cedula y password) del cuerpo de la solicitud del frontend
    const { email, password } = await request.json()

    // 2. Validar que los datos necesarios existan
    if (!email || !password) {
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

    // 3. URL de tu Firebase Function que probaste en Postman
    const firebaseFunctionUrl =
      'https://us-central1-micampanav2.cloudfunctions.net/loginWithEmail'

    // 4. Realizar la solicitud POST a tu Firebase Function
    const firebaseResponse = await fetch(firebaseFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // ¡IMPORTANTE! Asegúrate de que el nombre del campo 'clave' coincida con lo que espera tu Firebase Function
      // En tu frontend envías 'password', aquí lo mapeamos a 'clave' para tu backend.
      body: JSON.stringify({ email, clave: password }),
    })

    const firebaseDaCta = await firebaseResponse.json()

    // 5. Manejar la respuesta de la Firebase Function
    if (!firebaseResponse.ok) {
      // Si la Firebase Function devolvió un error (ej. status 400, 401, 500)
      // Reenviamos el mismo error y mensaje de la función al frontend
      return new Response(
        JSON.stringify({
          error:
            firebaseDaCta.message ||
            firebaseDaCta.error ||
            'Error al conectar con la función de autenticación.',
        }),
        {
          status: firebaseResponse.status,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
    }

    // 6. Si la Firebase Function fue exitosa (status 200 OK)
    // Devolver la respuesta completa de la Firebase Function al frontend
    return new Response(JSON.stringify(firebaseDaCta), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    // 7. Captura cualquier error inesperado en este Route Handler
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
