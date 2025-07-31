// functions/routes/users.js

import * as functions from 'firebase-functions'
import { getApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { defineSecret } from 'firebase-functions/params'

// Configuración para bcrypt (para hashear contraseñas)
const saltRounds = 10

// Secreto para firmar y verificar los JSON Web Tokens (JWT)
// Debe estar definido en tus parámetros de Firebase Functions
const JWT_SECRET_KEY_PARAM = defineSecret('BJS_JWT_SECRET_KEY')

// Middleware de autorización para administradores
// Este middleware verifica un token JWT personalizado para asegurar que el usuario es un administrador.
// Se mantiene aquí porque puede ser utilizado por otras funciones protegidas en este archivo.
const authorizeAdmin = async (req, res, next) => {
  // Configuración de CORS para este middleware
  res.set('Access-Control-Allow-Origin', '*')
  res.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  )
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(204).send('')
    return
  }

  const idToken = req.headers.authorization?.split('Bearer ')[1]
  if (!idToken) {
    return res.status(401).json({
      message: 'No autorizado: Token de autenticación no proporcionado.',
    })
  }

  try {
    const jwtSecretValue = JWT_SECRET_KEY_PARAM.value()

    if (!jwtSecretValue) {
      console.error(
        'JWT_SECRET no configurado en Firebase Functions para authorizeAdmin.',
      )
      return res
        .status(500)
        .json({ message: 'Error de configuración del servidor.' })
    }
    const cleanedJwtSecret = jwtSecretValue.trim()

    const decodedToken = jwt.verify(idToken, cleanedJwtSecret, {
      algorithms: ['HS256'],
    })
    const userUid = decodedToken.uid
    const userRole = decodedToken.role

    if (!userUid) {
      return res
        .status(401)
        .json({ message: 'Token inválido: UID no encontrado en el token.' })
    }

    // Este authorizeAdmin es específico para administradores
    if (userRole !== 'admin') {
      return res.status(403).json({
        message:
          'Acceso denegado: Solo administradores pueden realizar esta acción.',
      })
    }

    req.userUid = userUid // Adjunta el UID del usuario a la solicitud
    req.userRole = userRole // Adjunta el rol del usuario a la solicitud
    next()
  } catch (error) {
    console.error('Error de autorización (JWT):', error)
    let errorMessage = 'No autorizado: Token inválido.'
    if (error instanceof jwt.TokenExpiredError) {
      errorMessage = 'No autorizado: Token expirado.'
    } else if (error instanceof jwt.JsonWebTokenError) {
      errorMessage = `No autorizado: Token JWT inválido (${error.message}).`
    }
    return res.status(401).json({
      message: errorMessage,
      details: error.message,
    })
  }
}

// Middleware para configuración CORS de funciones públicas
const setPublicCorsHeaders = (req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.set('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(204).send('')
    return
  }
  next()
}

// 1. --- FUNCIÓN DE PRUEBA DE CONEXIÓN ---
export const testUsersModuleConnection = functions.https.onRequest(
  async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*')
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
    res.set('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') {
      res.status(204).send('')
      return
    }
    if (req.method !== 'GET') {
      return res.status(405).send('Método no permitido. Solo GET.')
    }
    try {
      const app = getApp()
      const db = getFirestore(app)
      const testDocRef = db
        .collection('test_users_module')
        .doc('connection_status')
      await testDocRef.set({
        timestamp: new Date().toISOString(),
        message: 'Conexión exitosa a Firestore desde users.js',
        module: 'users.js',
      })
      const snapshot = await testDocRef.get()
      const data = snapshot.data()
      return res.status(200).json({
        message:
          'Firebase Admin SDK inicializado y Firestore accesible desde users.js.',
        statusData: data,
      })
    } catch (error) {
      console.error(
        'Error en prueba de conexión a Firestore desde users.js:',
        error,
      )
      return res.status(500).json({
        message: 'Error al conectar con Firestore desde users.js.',
        error: error.message,
      })
    }
  },
)

// 2. --- FUNCIÓN PARA CREAR UN USUARIO ADMINISTRADOR (USO INTERNO/POSTMAN) ---
// Esta función está diseñada para ser utilizada por un administrador existente o directamente
// para inicializar usuarios administradores. No debe ser expuesta públicamente en el frontend.
export const createAdminUser = functions.https.onRequest(async (req, res) => {
  // Configuración de CORS para permitir solicitudes desde cualquier origen para pruebas
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(204).send('')
    return
  }

  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed. Only POST is accepted.')
  }

  try {
    const app = getApp()
    const auth = getAuth(app)
    const db = getFirestore(app)
    const { email, password, name, cedula } = req.body // Datos esperados en el cuerpo de la solicitud

    // 1. Validar datos de entrada
    if (!email || !password || !name || !cedula) {
      return res.status(400).json({
        message: 'Missing required fields: email, password, name, and cedula.',
      })
    }
    if (typeof password !== 'string' || password.length < 6) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 6 characters long.' })
    }

    // 2. Verificar si el email ya está en uso en Firebase Authentication
    let firebaseAuthUid
    try {
      const userRecord = await auth.getUserByEmail(email)
      firebaseAuthUid = userRecord.uid
      // Si el usuario ya existe en Auth, verificar si ya es admin
      const existingUserDoc = await db
        .collection('users')
        .doc(firebaseAuthUid)
        .get()
      if (existingUserDoc.exists && existingUserDoc.data().role === 'admin') {
        return res.status(409).json({
          message: 'User with this email already exists and is an admin.',
        })
      }
      // Si existe pero no es admin, actualizaremos su rol
      console.log(
        `User with email ${email} already exists in Auth. Updating role to admin.`,
      )
    } catch (authError) {
      if (authError.code === 'auth/user-not-found') {
        // Si el usuario no existe en Auth, crearlo
        const newUserRecord = await auth.createUser({
          email: email,
          password: password,
          displayName: name,
        })
        firebaseAuthUid = newUserRecord.uid
      } else if (authError.code === 'auth/email-already-exists') {
        return res
          .status(409)
          .json({ message: 'Email already in use by another user.' })
      } else {
        console.error(
          'Error creating user in Firebase Authentication:',
          authError,
        )
        return res.status(500).json({
          message: `Internal server error during Auth user creation: ${authError.message}`,
        })
      }
    }

    // 3. Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // 4. Guardar/Actualizar credenciales en Firestore (user_credentials)
    const userCredentialsData = {
      cedula: cedula,
      firebaseAuthUid: firebaseAuthUid,
      hashedPassword: hashedPassword, // Usar 'hashedPassword' como key en inglés
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    await db
      .collection('user_credentials')
      .doc(firebaseAuthUid)
      .set(userCredentialsData, { merge: true })

    // 5. Guardar/Actualizar perfil de usuario en Firestore (users)
    const userProfileData = {
      name: name, // Usar 'name' como key en inglés para consistencia
      email: email,
      cedula: cedula,
      role: 'admin', // Asignar rol de administrador
      registeredViaAuthUid: firebaseAuthUid,
      lastLogin: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // campaignMemberships: [], // Los admins por defecto no son miembros de campaña, a menos que se especifique
    }
    await db
      .collection('users')
      .doc(firebaseAuthUid)
      .set(userProfileData, { merge: true })

    return res.status(201).json({
      message: 'Admin user created/updated successfully.',
      userId: firebaseAuthUid,
      email: email,
      role: 'admin',
    })
  } catch (error) {
    console.error('Error in createAdminUser Cloud Function:', error)
    return res
      .status(500)
      .json({ message: `Internal server error: ${error.message}` })
  }
})

// 3. --- FUNCIÓN PARA REGISTRAR UN USUARIO PÚBLICO (VOTANTE DE OPINIÓN - LANDING PAGE) ---
// Este registro NO crea una contraseña ni un usuario de Firebase Auth de inmediato.
// Solo guarda los datos como un lead.
export const registerPublicUser = functions.https.onRequest(
  async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*')
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.set('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') {
      res.status(204).send('')
      return
    }
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed. Only POST is accepted.')
    }

    try {
      const app = getApp()
      const db = getFirestore(app)
      const userData = req.body

      // Validaciones de datos de entrada (existentes)
      if (
        !userData ||
        typeof userData !== 'object' ||
        !userData.cedula ||
        !userData.name ||
        !userData.email
      ) {
        return res.status(400).json({
          message:
            'Invalid user data. Required fields: cedula, name, and email.',
        })
      }
      if (
        typeof userData.cedula !== 'string' ||
        userData.cedula.trim() === ''
      ) {
        return res.status(400).json({ message: 'Cedula is required.' })
      }
      if (typeof userData.name !== 'string' || userData.name.trim() === '') {
        return res.status(400).json({ message: 'Name is required.' })
      }
      if (
        typeof userData.email !== 'string' ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)
      ) {
        return res
          .status(400)
          .json({ message: 'Email must be a valid email address.' })
      }

      // Verificar si la cédula ya existe como un perfil de usuario (incluso si no tiene Auth)
      const cedulaSnapshot = await db
        .collection('users')
        .where('cedula', '==', userData.cedula)
        .limit(1)
        .get()

      if (!cedulaSnapshot.empty) {
        return res.status(409).json({
          message:
            'This cedula is already registered in the system. It can be confirmed by a campaign member.',
        })
      }

      // Crear el objeto de perfil de usuario con los nuevos campos opcionales
      const userProfileData = {
        name: userData.name,
        email: userData.email,
        cedula: userData.cedula,
        role: 'public_lead',
        status: 'pending_confirmation',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // *** NUEVOS CAMPOS AÑADIDOS AQUI ***
        campaignId: userData.campaignId || null, // ID de la campaña si aplica
        registeredByUid: userData.registeredByUid || null, // UID del usuario que lo registró si aplica
        // **********************************
      }
      const newUserRef = await db.collection('users').add(userProfileData)

      return res.status(201).json({
        message: 'Public user registered successfully (pending confirmation).',
        userId: newUserRef.id,
        cedula: userData.cedula,
        email: userData.email,
        role: 'public_lead',
        campaignId: userData.campaignId || null, // Devolver también en la respuesta
        registeredByUid: userData.registeredByUid || null, // Devolver también en la respuesta
      })
    } catch (error) {
      console.error('Error in registerPublicUser Cloud Function:', error)
      return res.status(500).json({
        message: 'Internal server error while registering public user.',
        error: error.message,
      })
    }
  },
)

// 4. --- FUNCIÓN PARA INICIAR SESIÓN CON EMAIL Y CLAVE (POST) ---
export const loginWithEmail = functions.https.onRequest(
  { secrets: [JWT_SECRET_KEY_PARAM] },
  async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*')
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.set('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') {
      res.status(204).send('')
      return
    }
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed. Only POST is accepted.')
    }

    try {
      const app = getApp()
      const db = getFirestore(app)
      const jwtSecretValue = JWT_SECRET_KEY_PARAM.value()

      if (!jwtSecretValue) {
        console.error('JWT_SECRET not configured in Firebase Functions.')
        return res.status(500).json({ message: 'Server configuration error.' })
      }
      const cleanedJwtSecret = jwtSecretValue.trim()

      const { email, clave } = req.body
      // Buscar credenciales por cédula (email en este contexto)
      const userCredentialSnapshot = await db
        .collection('user_credentials')
        .where('cedula', '==', email)
        .limit(1)
        .get()

      if (userCredentialSnapshot.empty) {
        return res.status(401).json({ message: 'Incorrect credentials.' })
      }

      const userCredentialDoc = userCredentialSnapshot.docs[0].data()
      const storedHashedPassword = userCredentialDoc.hashedPassword // Usar 'hashedPassword'
      const firebaseAuthUid = userCredentialDoc.firebaseAuthUid
      const passwordMatch = await bcrypt.compare(clave, storedHashedPassword) // Comparar con 'clave' del request

      if (!passwordMatch) {
        return res.status(401).json({ message: 'Incorrect credentials.' })
      }

      const userDoc = await db.collection('users').doc(firebaseAuthUid).get()
      if (!userDoc.exists) {
        return res.status(404).json({ message: 'User profile not found.' })
      }

      const userData = userDoc.data()

      // Asegurarse de que el usuario tenga un rol que le permita iniciar sesión
      // (ej. no permitir login a 'public_lead' directamente)
      const allowedRolesForLogin = [
        'admin',
        'candidato',
        'manager',
        'ring',
        'voter',
        'votante', // Si se permite login directo a public_lead, ajustar según sea necesario
      ]
      if (!allowedRolesForLogin.includes(userData.role)) {
        return res
          .status(403)
          .json({ message: 'User role does not allow direct login.' })
      }

      await db.collection('users').doc(firebaseAuthUid).update({
        lastLogin: new Date().toISOString(),
      })

      const tokenPayload = {
        uid: firebaseAuthUid,
        email: userData.email,
        name: userData.name || userData.nombre, // Leer 'name' o 'nombre' para compatibilidad
        role: userData.role,
        campaignMemberships: userData.campaignMemberships || [],
      }

      const idToken = jwt.sign(tokenPayload, cleanedJwtSecret, {
        algorithm: 'HS256',
        expiresIn: '1h',
      })

      // La sección de depuración temporal se ha eliminado para producción
      return res.status(200).json({
        message: 'Credentials verified successfully.',
        firebaseAuthUid: firebaseAuthUid,
        email: userData.email,
        name: userData.name || userData.nombre, // También devolver en la respuesta directa
        role: userData.role,
        idToken: idToken, // Devolver el token para que Next.js API Route lo establezca en cookie
        campaignMemberships: userData.campaignMemberships || [],
      })
    } catch (error) {
      console.error('Error in loginWithEmail Cloud Function:', error)
      return res.status(500).json({
        message: 'Internal server error during login.',
        error: error.message,
      })
    }
  },
)

// 5. --- FUNCIÓN PARA OBTENER USUARIOS DE FORMA SEGURA (GET) ---
export const getSecureUsers = functions.https.onRequest(
  { secrets: [JWT_SECRET_KEY_PARAM] }, // Declarar el secreto para que sea inyectado
  async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*')
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    if (req.method === 'OPTIONS') {
      res.status(204).send('')
      return
    }
    if (req.method !== 'GET') {
      return res.status(405).send('Method Not Allowed. Only GET is accepted.')
    }

    const authorizationHeader = req.headers.authorization
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      return res
        .status(401)
        .json({ message: 'Unauthorized. Bearer token required.' })
    }

    const idToken = authorizationHeader.split('Bearer ')[1]
    const jwtSecretValue = JWT_SECRET_KEY_PARAM.value() // Obtener el valor del secreto

    if (!jwtSecretValue) {
      console.error(
        'JWT_SECRET not configured in Firebase Functions for getSecureUsers.',
      )
      return res.status(500).json({ message: 'Server configuration error.' })
    }
    const cleanedJwtSecret = jwtSecretValue.trim()

    try {
      // Se verifica el token personalizado usando jwt.verify y la clave secreta.
      const decodedToken = jwt.verify(idToken, cleanedJwtSecret, {
        algorithms: ['HS256'],
      })
      const uid = decodedToken.uid
      const role = decodedToken.role // Obtener el rol del token

      console.log('GET request authenticated by UID (custom JWT):', uid)

      // Opcional: Si esta ruta solo debe ser accesible por admins, descomentar:
      // if (role !== 'admin') {
      //   return res.status(403).json({ message: 'Access denied: Only administrators can perform this action.' });
      // }

      const app = getApp()
      const db = getFirestore(app)
      const usersCollectionRef = db.collection('users')
      const snapshot = await usersCollectionRef.get()

      const users = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      return res.status(200).json({
        message: 'Users retrieved successfully (authenticated).',
        data: users,
      })
    } catch (error) {
      console.error(
        'Error in getSecureUsers (token verification or Firestore):',
        error,
      )
      // El error puede ser por token inválido/expirado
      return res.status(403).json({
        message: 'Access denied. Invalid or expired token.',
        error: error.message,
      })
    }
  },
)

// 6. --- FUNCIÓN PARA OBTENER USUARIO POR CÉDULA (GET - Pública) ---
export const getUserByCedula = functions.https.onRequest(async (req, res) => {
  // Middleware para configuración CORS de funciones públicas
  const setPublicCorsHeaders = (req, res, next) => {
    res.set('Access-Control-Allow-Origin', '*')
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
    res.set('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') {
      res.status(204).send('')
      return
    }
    next()
  }

  setPublicCorsHeaders(req, res, async () => {
    if (req.method !== 'GET') {
      return res.status(405).send('Method Not Allowed. Only GET is accepted.')
    }

    const cedula = req.query.cedula

    if (!cedula) {
      return res.status(400).json({
        message: 'Cedula number is required as a parameter (cedula).',
      })
    }

    try {
      const db = getFirestore(getApp())
      // Buscar en la colección 'users' por el campo 'cedula'
      const userSnapshot = await db
        .collection('users')
        .where('cedula', '==', cedula)
        .limit(1)
        .get()

      if (userSnapshot.empty) {
        return res
          .status(200)
          .json({ user: null, message: 'User not found by cedula.' })
      }

      const userData = userSnapshot.docs[0].data()
      const userId = userSnapshot.docs[0].id

      // Filtrar datos sensibles y asegurar consistencia de nombres
      const publicUserData = {
        id: userId,
        name: userData.name || userData.nombre, // Priorizar 'name', luego 'nombre'
        email: userData.email,
        cedula: userData.cedula,
        role: userData.role,
        location: userData.location || null,
        campaignMemberships: userData.campaignMemberships || [],
        // No devolver 'hashedPassword' ni otros datos sensibles
      }

      return res
        .status(200)
        .json({ user: publicUserData, message: 'User found.' })
    } catch (error) {
      console.error('Error in getUserByCedula Cloud Function:', error)
      return res.status(500).json({
        message: 'Internal server error while searching user by cedula.',
        error: error.message,
      })
    }
  })
})

// 7. --- FUNCIÓN PARA CREAR/ACTIVAR UN USUARIO Y ASIGNAR MEMBRESÍA A CAMPAÑA (PROTEGIDA) ---
// Esta función permite crear un usuario activo (con Firebase Auth y contraseña)
// o activar un 'public_lead', asignarle un rol (votante, anillo, manager)
// y vincularlo a una campaña y a un padre en la pirámide.
export const createActiveUserAndMembership = functions.https.onRequest(
  { secrets: [JWT_SECRET_KEY_PARAM] },
  async (req, res) => {
    // Protección: Solo administradores pueden usar esta ruta por ahora.
    // Podríamos expandir para que managers/anillos/votantes registren debajo de ellos.
    authorizeAdmin(req, res, async () => {
      if (req.method !== 'POST') {
        return res.status(405).send('Método no permitido. Solo POST.')
      }

      try {
        const db = getFirestore(getApp())
        const auth = getAuth(getApp())
        const {
          email,
          password, // Opcional si ya existe Auth user y solo se activa
          cedula,
          name,
          role, // 'votante', 'anillo', 'manager'
          campaignId,
          parentUid, // UID del usuario que lo registra (su 'padre' en la pirámide)
          // Puedes añadir más campos como whatsapp, phone, location, dateBirth, sexo
          whatsapp,
          phone,
          location,
          dateBirth,
          sexo,
          votoPromesa, // Solo para votantes
          votoEsperado, // Solo para managers/anillos/votantes para sus subordinados
        } = req.body

        // 1. Validaciones básicas
        const requiredFields = ['email', 'cedula', 'name', 'role', 'campaignId']
        for (const field of requiredFields) {
          if (!req.body[field]) {
            return res
              .status(400)
              .json({ message: `El campo '${field}' es requerido.` })
          }
        }
        if (!['votante', 'anillo', 'manager'].includes(role)) {
          return res.status(400).json({
            message: 'Rol inválido. Debe ser "votante", "anillo" o "manager".',
          })
        }

        // 2. Verificar existencia de campaña
        const campaignRef = db.collection('campaigns').doc(campaignId)
        const campaignDoc = await campaignRef.get()
        if (!campaignDoc.exists) {
          return res.status(404).json({ message: 'Campaña no encontrada.' })
        }
        const campaignData = campaignDoc.data()

        // 3. Obtener UID del usuario que realiza la acción (del token JWT)
        const registeredByUid = req.userUid // UID del admin/candidato/manager que hace la llamada

        // 4. Determinar el nivel en la pirámide
        let level
        switch (role) {
          case 'manager':
            level = 1
            break // Gerente debajo del candidato (nivel 0)
          case 'anillo':
            level = 2
            break // Anillo debajo del gerente
          case 'votante':
            level = 3
            break // Votante debajo del anillo
          default:
            level = 99 // Rol desconocido
        }
        // Nota: Para niveles más dinámicos, el nivel se calcularía en base al nivel del parentUid.
        // Aquí asumimos una estructura fija simple por ahora.

        let userUid
        let existingUserDocRef
        let existingUserData = null
        let isExistingAuthUser = false // Bandera para saber si el usuario ya tiene Auth

        // 5. Crear o actualizar usuario en Firebase Authentication
        try {
          const userRecord = await auth.getUserByEmail(email)
          userUid = userRecord.uid
          isExistingAuthUser = true // El usuario ya tiene una cuenta Auth

          // Si ya existe en Auth, verificar si tiene un perfil en Firestore
          existingUserDocRef = db.collection('users').doc(userUid)
          existingUserData = (await existingUserDocRef.get()).data()

          if (existingUserData && existingUserData.role === 'admin') {
            return res
              .status(409)
              .json({ message: 'Este email ya pertenece a un administrador.' })
          }

          // Si el usuario ya tiene una membresía activa para esta campaña y rol, o es Candidato para esta campaña
          const isAlreadyActiveInCampaign =
            existingUserData?.campaignMemberships?.some(
              (membership) =>
                membership.campaignId === campaignId &&
                membership.status === 'activo',
            )
          if (isAlreadyActiveInCampaign && existingUserData.role === role) {
            return res.status(409).json({
              message: `Este usuario ya es un ${role} activo en esta campaña.`,
            })
          }

          // Si se provee una nueva contraseña para un usuario Auth existente, la actualizamos
          if (password) {
            await auth.updateUser(userUid, { password: password })
          }
        } catch (error) {
          if (error.code === 'auth/user-not-found') {
            // Si no existe en Auth, lo creamos
            if (!password) {
              return res.status(400).json({
                message: 'Se requiere contraseña para nuevos usuarios.',
              })
            }
            const newUserRecord = await auth.createUser({
              email: email,
              password: password,
              displayName: name,
            })
            userUid = newUserRecord.uid
            existingUserDocRef = db.collection('users').doc(userUid) // Preparamos la referencia para crear el perfil
          } else if (error.code === 'auth/email-already-in-use') {
            // Este caso debería ser manejado por el primer try-catch de auth.getUserByEmail
            return res.status(409).json({
              message:
                'El correo electrónico ya está en uso por otra cuenta Auth.',
            })
          } else {
            console.error('Error al manejar usuario en Firebase Auth:', error)
            return res.status(500).json({
              message: `Error al procesar usuario en Auth: ${error.message}`,
            })
          }
        }

        // 6. Verificar o crear entrada en user_credentials (para hash de contraseña)
        const hashedPassword = password
          ? await bcrypt.hash(password, saltRounds)
          : existingUserData?.hashedPassword || null

        await db
          .collection('user_credentials')
          .doc(userUid)
          .set(
            {
              firebaseAuthUid: userUid,
              cedula: cedula,
              hashedPassword: hashedPassword,
              createdAt:
                existingUserData?.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            { merge: true },
          )

        // 7. Preparar/Actualizar perfil de usuario en Firestore (collection 'users')
        let updatedCampaignMemberships =
          existingUserData?.campaignMemberships || []
        const newMembership = {
          campaignId: campaignId,
          campaignName: campaignData.campaignName,
          role: role,
          type: campaignData.type, // Tipo de campaña desde el documento de campaña
          status: 'activo',
          registeredAt: new Date().toISOString(),
          registeredBy: registeredByUid, // Quien lo registra
          ownerBy: parentUid || registeredByUid, // Su padre en la pirámide (o quien lo registra si no hay padre explícito)
          voterStatus: null, // Si aplica (para votantes)
          votoPromesa: votoPromesa || null,
          votoEsperado: votoEsperado || null,
          directVotes: 0,
          pyramidVotes: 0,
        }

        const existingMembershipIndex = updatedCampaignMemberships.findIndex(
          (m) => m.campaignId === campaignId && m.role === role,
        )

        if (existingMembershipIndex !== -1) {
          // Si ya tiene una membresía para esta campaña y rol, la actualizamos
          updatedCampaignMemberships[existingMembershipIndex] = {
            ...updatedCampaignMemberships[existingMembershipIndex],
            ...newMembership, // Sobreescribir con nueva info de rol y status
            status: 'activo',
          }
        } else {
          // Si es una nueva membresía para esta campaña
          updatedCampaignMemberships.push(newMembership)
        }

        const userProfileToSet = {
          id: userUid,
          name: name,
          email: email,
          cedula: cedula,
          whatsapp: whatsapp || null,
          phone: phone || null,
          location: location || null,
          dateBirth: dateBirth || null,
          sexo: sexo || null,
          role: role, // El rol principal del usuario (puede ser el de la membresía más alta o el último asignado)
          level: level, // El nivel en la pirámide
          status: 'activo', // El estado global del usuario
          createdAt: existingUserData?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          registeredViaAuthUid: registeredByUid, // Quien lo creó en Auth (o admin_uid_placeholder)
          lastLogin: isExistingAuthUser
            ? existingUserData?.lastLogin || null
            : null, // Mantener lastLogin si ya existía
          campaignMemberships: updatedCampaignMemberships,
        }

        await db
          .collection('users')
          .doc(userUid)
          .set(userProfileToSet, { merge: true })

        return res.status(201).json({
          message: `Usuario ${role} creado/actualizado y vinculado a campaña exitosamente.`,
          userId: userUid,
          email: email,
          role: role,
          campaignId: campaignId,
        })
      } catch (error) {
        console.error(
          'Error en createActiveUserAndMembership Cloud Function:',
          error,
        )
        return res.status(500).json({
          message:
            'Error interno del servidor al crear/actualizar usuario y membresía.',
          error: error.message,
        })
      }
    })
  },
)

// 8. --- FUNCIÓN PARA ACTUALIZAR EL PERFIL DE UN USUARIO (PROTEGIDA) ---
// Permite a un usuario autenticado actualizar su propio perfil
// o a un administrador actualizar el perfil de cualquier usuario.
export const updateUserProfile = functions.https.onRequest(
  { secrets: [JWT_SECRET_KEY_PARAM] }, // Declara el secreto para JWT
  async (req, res) => {
    // CORS Headers para la respuesta
    res.set('Access-Control-Allow-Origin', '*')
    res.set('Access-Control-Allow-Methods', 'PATCH, OPTIONS')
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    if (req.method === 'OPTIONS') {
      res.status(204).send('')
      return
    }
    if (req.method !== 'PATCH') {
      return res.status(405).send('Método no permitido. Solo PATCH.')
    }

    // Middleware de autorización para verificar el token JWT
    // Se reutiliza authorizeAdmin, pero la lógica de 'adminOnly' ahora será manejada dentro de esta función.
    const authMiddleware = async (innerReq, innerRes, next) => {
      const idToken = innerReq.headers.authorization?.split('Bearer ')[1]
      if (!idToken) {
        return innerRes.status(401).json({
          message: 'No autorizado: Token de autenticación no proporcionado.',
        })
      }

      try {
        const jwtSecretValue = JWT_SECRET_KEY_PARAM.value()
        if (!jwtSecretValue) {
          console.error('JWT_SECRET no configurado para updateUserProfile.')
          return innerRes
            .status(500)
            .json({ message: 'Error de configuración del servidor.' })
        }
        const cleanedJwtSecret = jwtSecretValue.trim()
        const decodedToken = jwt.verify(idToken, cleanedJwtSecret, {
          algorithms: ['HS256'],
        })

        innerReq.userUid = decodedToken.uid // UID del usuario autenticado
        innerReq.userRole = decodedToken.role // Rol del usuario autenticado
        next()
      } catch (error) {
        console.error(
          'Error de autenticación (JWT) en updateUserProfile:',
          error,
        )
        let errorMessage = 'No autorizado: Token inválido.'
        if (error instanceof jwt.TokenExpiredError) {
          errorMessage = 'No autorizado: Token expirado.'
        } else if (error instanceof jwt.JsonWebTokenError) {
          errorMessage = `No autorizado: Token JWT inválido (${error.message}).`
        }
        return innerRes
          .status(401)
          .json({ message: errorMessage, details: error.message })
      }
    }

    // Ejecutar el middleware de autenticación
    authMiddleware(req, res, async () => {
      try {
        const db = getFirestore(getApp())
        const { userId, updates } = req.body

        if (!userId || !updates || typeof updates !== 'object') {
          return res.status(400).json({
            message:
              'Se requiere el ID del usuario y un objeto con las actualizaciones.',
          })
        }

        const callingUserUid = req.userUid
        const callingUserRole = req.userRole

        // --- Lógica de Autorización ---
        let isAuthorized = false
        if (callingUserRole === 'admin') {
          // Un administrador puede actualizar cualquier perfil
          isAuthorized = true
        } else if (callingUserUid === userId) {
          // Un usuario puede actualizar su propio perfil
          isAuthorized = true
        } else {
          // No está autorizado
          return res.status(403).json({
            message:
              'Acceso denegado: No tienes permiso para actualizar este perfil de usuario.',
          })
        }

        // Definir los campos que un usuario NO administrador puede modificar en su propio perfil
        const selfEditableFields = [
          'name',
          'whatsapp',
          'phone',
          'location',
          'dateBirth',
          'sexo',
          'puestoVotacion', // Asumiendo que se desea permitir actualizar este campo
          // NO: email, cedula, role, status, campaignMemberships, registeredViaAuthUid, createdAt, updatedAt, lastLogin, hashedPassword, firebaseAuthUid
        ]

        const updateData = {}
        if (callingUserRole === 'admin') {
          // Si es administrador, puede actualizar cualquier campo permitido por la estructura
          for (const key in updates) {
            if (Object.prototype.hasOwnProperty.call(updates, key)) {
              // Prevenir la actualización directa de campos sensibles o calculados
              if (
                ![
                  'email',
                  'cedula',
                  'role',
                  'status',
                  'createdAt',
                  'lastLogin',
                  'firebaseAuthUid',
                  'hashedPassword',
                ].includes(key)
              ) {
                updateData[key] = updates[key]
              } else {
                // Si intenta actualizar un campo sensible que solo debe ser manejado por lógica interna
                console.warn(
                  `Admin intentó actualizar campo sensible ${key}. Operación bloqueada para esta función.`,
                )
              }
            }
          }
          // Para cambiar role o status de un usuario, se deberían usar funciones específicas de gestión de usuarios/roles.
        } else {
          // Si es un usuario normal, solo puede actualizar los campos permitidos para sí mismo
          for (const key in updates) {
            if (Object.prototype.hasOwnProperty.call(updates, key)) {
              if (selfEditableFields.includes(key)) {
                updateData[key] = updates[key]
              } else {
                return res.status(403).json({
                  message: `Acceso denegado: No tienes permiso para modificar el campo '${key}'.`,
                })
              }
            }
          }
        }

        if (Object.keys(updateData).length === 0) {
          return res.status(400).json({
            message: 'No se proporcionaron campos válidos para actualizar.',
          })
        }

        // Añadir la fecha de actualización automáticamente
        updateData.updatedAt = new Date().toISOString()

        const userRef = db.collection('users').doc(userId)
        await userRef.update(updateData)

        return res.status(200).json({
          message: 'Perfil de usuario actualizado exitosamente.',
          updatedFields: Object.keys(updateData),
        })
      } catch (error) {
        console.error('Error en updateUserProfile:', error)
        return res.status(500).json({
          message:
            'Error interno del servidor al actualizar el perfil del usuario.',
          error: error.message,
        })
      }
    })
  },
)

// 9. --- FUNCIÓN PARA GENERAR ENLACE DE REGISTRO QR (PROTEGIDA) ---
// Permite a cualquier usuario autenticado generar un link para su QR.
export const generateQrRegistrationLink = functions.https.onRequest(
  { secrets: [JWT_SECRET_KEY_PARAM] },
  async (req, res) => {
    // Reutilizar el middleware de autenticación (similar al de updateUserProfile)
    const authMiddleware = async (innerReq, innerRes, next) => {
      res.set('Access-Control-Allow-Origin', '*')
      res.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
      res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

      if (innerReq.method === 'OPTIONS') {
        innerRes.status(204).send('')
        return
      }

      const idToken = innerReq.headers.authorization?.split('Bearer ')[1]
      if (!idToken) {
        return innerRes.status(401).json({
          message: 'No autorizado: Token de autenticación no proporcionado.',
        })
      }

      try {
        const jwtSecretValue = JWT_SECRET_KEY_PARAM.value()
        if (!jwtSecretValue) {
          console.error(
            'JWT_SECRET no configurado para generateQrRegistrationLink.',
          )
          return innerRes
            .status(500)
            .json({ message: 'Error de configuración del servidor.' })
        }
        const cleanedJwtSecret = jwtSecretValue.trim()
        const decodedToken = jwt.verify(idToken, cleanedJwtSecret, {
          algorithms: ['HS256'],
        })

        innerReq.userUid = decodedToken.uid
        innerReq.userRole = decodedToken.role
        next()
      } catch (error) {
        console.error(
          'Error de autenticación (JWT) en generateQrRegistrationLink:',
          error,
        )
        let errorMessage = 'No autorizado: Token inválido.'
        if (error instanceof jwt.TokenExpiredError) {
          errorMessage = 'No autorizado: Token expirado.'
        } else if (error instanceof jwt.JsonWebTokenError) {
          errorMessage = `No autorizado: Token JWT inválido (${error.message}).`
        }
        return innerRes
          .status(401)
          .json({ message: errorMessage, details: error.message })
      }
    }

    authMiddleware(req, res, async () => {
      if (req.method !== 'GET') {
        return res.status(405).send('Método no permitido. Solo GET.')
      }

      try {
        const db = getFirestore(getApp())
        const campaignId = req.query.campaignId
        const parentUid = req.userUid // El UID del usuario que genera el QR

        if (!campaignId) {
          return res
            .status(400)
            .json({ message: 'El ID de la campaña es requerido.' })
        }

        // Opcional: Verificar que el usuario que genera el QR sea miembro de esa campaña
        const userDoc = await db.collection('users').doc(parentUid).get()
        const userData = userDoc.data()
        const isMemberOfCampaign = userData?.campaignMemberships?.some(
          (membership) =>
            membership.campaignId === campaignId &&
            membership.status === 'activo',
        )

        if (req.userRole !== 'admin' && !isMemberOfCampaign) {
          return res.status(403).json({
            message: 'Acceso denegado: No eres miembro activo de esta campaña.',
          })
        }

        // Construir el enlace. Asumimos que tu frontend estará en 'https://micampana.com'
        // y que el formulario de auto-registro QR estará en '/auto-registro-qr'
        const baseFrontendUrl = 'https://www.autoridadpolitica.com' // Usamos tu dominio publicado
        const qrLink = `${baseFrontendUrl}/auto-registro-qr?campaignId=${campaignId}&parentUid=${parentUid}`

        return res.status(200).json({
          message: 'Enlace de registro QR generado exitosamente.',
          qrLink: qrLink,
        })
      } catch (error) {
        console.error('Error en generateQrRegistrationLink:', error)
        return res.status(500).json({
          message: 'Error interno del servidor al generar el enlace QR.',
          error: error.message,
        })
      }
    })
  },
)

// 10. --- FUNCIÓN PARA PROCESAR AUTO-REGISTRO POR QR (PÚBLICA) ---
// Permite que un usuario se registre a sí mismo y obtenga acceso inmediato como votante.
export const registerUserViaQr = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.set('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(204).send('')
    return
  }
  if (req.method !== 'POST') {
    return res.status(405).send('Método no permitido. Solo POST.')
  }

  try {
    const db = getFirestore(getApp())
    const auth = getAuth(getApp())
    const { email, password, cedula, name, campaignId, parentUid } = req.body

    // 1. Validaciones de datos de entrada
    const requiredFields = [
      'email',
      'password',
      'cedula',
      'name',
      'campaignId',
      'parentUid',
    ]
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res
          .status(400)
          .json({ message: `El campo '${field}' es requerido.` })
      }
    }
    if (typeof password !== 'string' || password.length < 6) {
      return res
        .status(400)
        .json({ message: 'La contraseña debe tener al menos 6 caracteres.' })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res
        .status(400)
        .json({ message: 'El formato del email es inválido.' })
    }

    // 2. Verificar que el parentUid y campaignId existan y sean válidos
    const parentDoc = await db.collection('users').doc(parentUid).get()
    if (!parentDoc.exists) {
      return res
        .status(404)
        .json({ message: 'El usuario que generó el QR (parentUid) no existe.' })
    }
    const campaignDoc = await db.collection('campaigns').doc(campaignId).get()
    if (!campaignDoc.exists) {
      return res
        .status(404)
        .json({ message: 'La campaña especificada no existe.' })
    }
    const campaignData = campaignDoc.data()

    let userUid
    let existingUserDocRef
    let existingUserData = null
    let isExistingAuthUser = false

    // 3. Crear o actualizar usuario en Firebase Authentication
    try {
      const userRecord = await auth.getUserByEmail(email)
      userUid = userRecord.uid
      isExistingAuthUser = true

      existingUserDocRef = db.collection('users').doc(userUid)
      existingUserData = (await existingUserDocRef.get()).data()

      // Si el email ya está en uso pero no tiene perfil en Firestore, o si es un lead, podemos activarlo
      // Si ya tiene un rol activo y es miembro de esta campaña, podríamos considerar un 409
      const isAlreadyActiveInCampaign =
        existingUserData?.campaignMemberships?.some(
          (membership) =>
            membership.campaignId === campaignId &&
            membership.status === 'activo',
        )
      if (isAlreadyActiveInCampaign && existingUserData.role === 'votante') {
        // Asumiendo que QR crea votantes
        return res.status(409).json({
          message: `Este usuario ya es un votante activo en esta campaña.`,
        })
      }

      await auth.updateUser(userUid, { password: password }) // Actualizar contraseña si ya existía Auth user
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        const newUserRecord = await auth.createUser({
          email: email,
          password: password,
          displayName: name,
        })
        userUid = newUserRecord.uid
        existingUserDocRef = db.collection('users').doc(userUid)
      } else if (error.code === 'auth/email-already-in-use') {
        // Si el email ya está en uso en Auth pero no es el mismo que buscamos, o es un public_lead.
        // Aquí necesitaríamos una lógica más compleja si queremos 'migrar' un public_lead existente
        // a una cuenta Auth usando este endpoint. Por ahora, asumimos que si ya existe en Auth
        // y no fue manejado por el try de arriba, es un conflicto directo.
        return res.status(409).json({
          message: 'El correo electrónico ya está en uso por otra cuenta.',
        })
      } else {
        console.error(
          'Error al crear/actualizar usuario en Firebase Auth vía QR:',
          error,
        )
        return res.status(500).json({
          message: `Error al procesar usuario en Auth: ${error.message}`,
        })
      }
    }

    // 4. Guardar/Actualizar credenciales en Firestore (user_credentials)
    const hashedPassword = await bcrypt.hash(password, saltRounds)
    await db
      .collection('user_credentials')
      .doc(userUid)
      .set(
        {
          firebaseAuthUid: userUid,
          cedula: cedula,
          hashedPassword: hashedPassword,
          createdAt: existingUserData?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      )

    // 5. Preparar/Actualizar perfil de usuario en Firestore (collection 'users')
    let updatedCampaignMemberships = existingUserData?.campaignMemberships || []
    const newMembership = {
      campaignId: campaignId,
      campaignName: campaignData.campaignName,
      role: 'votante', // Por defecto, el auto-registro QR crea votantes
      type: campaignData.type,
      status: 'activo',
      registeredAt: new Date().toISOString(),
      registeredBy: parentUid, // Quien generó el QR
      ownerBy: parentUid, // Su padre en la pirámide
      voterStatus: 'confirmed', // Voto confirmado al auto-registrarse
      votoPromesa: 1, // Se asume que auto-registro es una promesa de 1 voto
      votoEsperado: null,
      directVotes: 0,
      pyramidVotes: 0,
    }

    const existingMembershipIndex = updatedCampaignMemberships.findIndex(
      (m) => m.campaignId === campaignId && m.role === 'votante', // Buscar si ya es votante en esta campaña
    )

    if (existingMembershipIndex !== -1) {
      updatedCampaignMemberships[existingMembershipIndex] = {
        ...updatedCampaignMemberships[existingMembershipIndex],
        ...newMembership,
        status: 'activo',
      }
    } else {
      updatedCampaignMemberships.push(newMembership)
    }

    const userProfileToSet = {
      id: userUid,
      name: name,
      email: email,
      cedula: cedula,
      role: 'votante', // Rol principal asignado al auto-registrarse
      level: (parentDoc.data()?.level ?? -1) + 1, // Nivel del padre + 1 (o 0+1 si el padre es Candidato/Nivel 0)
      status: 'activo',
      createdAt: existingUserData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      registeredViaAuthUid: parentUid, // Quien lo creó
      lastLogin: isExistingAuthUser
        ? existingUserData?.lastLogin || null
        : null,
      campaignMemberships: updatedCampaignMemberships,
    }

    await db
      .collection('users')
      .doc(userUid)
      .set(userProfileToSet, { merge: true })

    return res.status(201).json({
      message: 'Usuario auto-registrado y vinculado a campaña exitosamente.',
      userId: userUid,
      email: email,
      role: 'votante',
      campaignId: campaignId,
      parentUid: parentUid,
    })
  } catch (error) {
    console.error('Error en registerUserViaQr Cloud Function:', error)
    return res.status(500).json({
      message: 'Error interno del servidor al procesar auto-registro QR.',
      error: error.message,
    })
  }
})
