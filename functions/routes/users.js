// functions/routes/users.js

import * as functions from 'firebase-functions'
import { getApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { defineSecret } from 'firebase-functions/params'

const saltRounds = 10

const JWT_SECRET_KEY_PARAM = defineSecret('BJS_JWT_SECRET_KEY')

// Middleware de autorización para administradores
// NOTA: Este middleware depende de 'jsonwebtoken' y de 'JWT_SECRET_KEY_PARAM'
// que NO están importados/definidos en este archivo 'campaigns.js'.
// Si esta función se utiliza fuera de 'variables.js', necesitarás importar/definir JWT_SECRET_KEY_PARAM y jwt aquí.
const authorizeAdmin = async (req, res, next) => {
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
    // Si JWT_SECRET_KEY_PARAM y jwt no están definidos globalmente en este contexto de Firebase Functions
    // o importados en este archivo, las siguientes líneas causarán un error.
    // Asumiendo que se importarán o definirán si esta función se saca de variables.js
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

    if (userRole !== 'admin') {
      return res.status(403).json({
        message:
          'Acceso denegado: Solo administradores pueden realizar esta acción.',
      })
    }

    req.userUid = userUid
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

// --- FUNCIÓN DE PRUEBA DE CONEXIÓN ---
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

// --- FUNCIÓN PARA CREAR/REGISTRAR UN USUARIO (POST) ---
export const registerUser = functions.https.onRequest(async (req, res) => {
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
    const app = getApp()
    const auth = getAuth(app)
    const db = getFirestore(app)
    const userData = req.body

    // Validaciones de datos de entrada
    if (
      !userData ||
      typeof userData !== 'object' ||
      !userData.cedula ||
      !userData.clave ||
      !userData.name ||
      !userData.email
    ) {
      return res.status(400).json({
        message:
          'Datos de usuario inválidos. Se requieren cédula, clave, nombre y email.',
      })
    }
    if (typeof userData.cedula !== 'string' || userData.cedula.trim() === '') {
      return res.status(400).json({ message: 'La cédula es requerida.' })
    }
    if (typeof userData.clave !== 'string' || userData.clave.length < 6) {
      return res
        .status(400)
        .json({ message: 'La clave debe tener al menos 6 caracteres.' })
    }
    if (typeof userData.name !== 'string' || userData.name.trim() === '') {
      return res.status(400).json({ message: 'El nombre es requerido.' })
    }
    if (
      typeof userData.email !== 'string' ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)
    ) {
      return res
        .status(400)
        .json({ message: 'El email debe ser un correo válido.' })
    }

    const cedulaSnapshot = await db
      .collection('user_credentials')
      .where('cedula', '==', userData.cedula)
      .get()
    if (!cedulaSnapshot.empty) {
      return res.status(409).json({ message: 'La cédula ya está registrada.' })
    }

    let firebaseAuthUid
    try {
      const userRecord = await auth.createUser({
        email: `id-${userData.cedula}@campana.com`,
        password: userData.cedula,
        displayName: userData.name,
      })
      firebaseAuthUid = userRecord.uid
    } catch (authError) {
      console.error(
        'Error al crear usuario en Firebase Authentication:',
        authError,
      )
      if (authError.code === 'auth/email-already-exists') {
        return res.status(409).json({
          message:
            'Ya existe un usuario registrado con este correo electrónico.',
        })
      }
      return res.status(500).json({
        message: 'Error interno al registrar el usuario en autenticación.',
        error: authError.message,
      })
    }

    const hashedPassword = await bcrypt.hash(userData.clave, saltRounds)

    const userCredentialsData = {
      cedula: userData.cedula,
      firebaseAuthUid: firebaseAuthUid,
      hashedClave: hashedPassword,
      createdAt: new Date().toISOString(),
    }
    await db
      .collection('user_credentials')
      .doc(firebaseAuthUid)
      .set(userCredentialsData)

    const userProfileData = {
      name: userData.name,
      email: userData.email,
      cedula: userData.cedula,
      role: userData.role || 'user',
      registeredViaAuthUid: firebaseAuthUid,
      lastLogin: null,
      createdAt: new Date().toISOString(),
    }
    await db.collection('users').doc(firebaseAuthUid).set(userProfileData)

    return res.status(201).json({
      message: 'Usuario registrado exitosamente',
      firebaseAuthUid: firebaseAuthUid,
      cedula: userData.cedula,
      email: userData.email,
    })
  } catch (error) {
    console.error('Error en registerUser (general):', error)
    return res.status(500).json({
      message: 'Error interno del servidor al registrar el usuario.',
      error: error.message,
    })
  }
})

// --- FUNCIÓN PARA INICIAR SESIÓN CON EMAIL Y CLAVE (POST) ---
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
      return res.status(405).send('Método no permitido. Solo POST.')
    }

    try {
      const app = getApp()
      const db = getFirestore(app)
      const jwtSecretValue = JWT_SECRET_KEY_PARAM.value()

      if (!jwtSecretValue) {
        console.error('JWT_SECRET no configurado en Firebase Functions.')
        return res
          .status(500)
          .json({ message: 'Error de configuración del servidor.' })
      }
      const cleanedJwtSecret = jwtSecretValue.trim()

      const { email, clave } = req.body
      const userCredentialSnapshot = await db
        .collection('user_credentials')
        .where('cedula', '==', email)
        .limit(1)
        .get()

      if (userCredentialSnapshot.empty) {
        return res.status(401).json({ message: 'Credenciales incorrectas.' })
      }

      const userCredentialDoc = userCredentialSnapshot.docs[0].data()
      const storedHashedClave = userCredentialDoc.hashedClave
      const firebaseAuthUid = userCredentialDoc.firebaseAuthUid
      const passwordMatch = await bcrypt.compare(clave, storedHashedClave)

      if (!passwordMatch) {
        return res.status(401).json({ message: 'Credenciales incorrectas.' })
      }

      const userDoc = await db.collection('users').doc(firebaseAuthUid).get()
      if (!userDoc.exists) {
        return res
          .status(404)
          .json({ message: 'Perfil de usuario no encontrado.' })
      }

      const userData = userDoc.data()
      await db.collection('users').doc(firebaseAuthUid).update({
        lastLogin: new Date().toISOString(),
      })

      const tokenPayload = {
        uid: firebaseAuthUid,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        // --- ESTA ES LA LÍNEA QUE HACE EXACTAMENTE LO QUE PIDES ---
        campaignMemberships: userData.campaignMemberships || [],
      }

      const idToken = jwt.sign(tokenPayload, cleanedJwtSecret, {
        algorithm: 'HS256',
        expiresIn: '1h',
      })

      // --- INICIO: SECCIÓN DE DEPURACIÓN TEMPORAL ---
      // ¡NUNCA HACER ESTO EN PRODUCCIÓN! Solo para depuración.
      // Se añaden los detalles de la clave secreta a la respuesta para poder compararla
      // con la clave que está usando el frontend (Next.js).
      return res.status(200).json({
        message: 'Credenciales verificadas exitosamente.',
        firebaseAuthUid: firebaseAuthUid,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        idToken: idToken,
      })
      // --- FIN: SECCIÓN DE DEPURACIÓN TEMPORAL ---
    } catch (error) {
      console.error('Error en loginWithEmail (JWT):', error)
      return res.status(500).json({
        message: 'Error interno del servidor al iniciar sesión.',
        error: error.message,
      })
    }
  },
)

// --- FUNCIÓN PARA OBTENER USUARIOS DE FORMA SEGURA (GET) ---
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
      return res.status(405).send('Método no permitido. Solo GET.')
    }

    const authorizationHeader = req.headers.authorization
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      return res
        .status(401)
        .json({ message: 'No autorizado. Se requiere token Bearer.' })
    }

    const idToken = authorizationHeader.split('Bearer ')[1]
    const jwtSecretValue = JWT_SECRET_KEY_PARAM.value() // Obtener el valor del secreto

    if (!jwtSecretValue) {
      console.error(
        'JWT_SECRET no configurado en Firebase Functions para getSecureUsers.',
      )
      return res
        .status(500)
        .json({ message: 'Error de configuración del servidor.' })
    }
    const cleanedJwtSecret = jwtSecretValue.trim()

    try {
      // --- INICIO DE LA CORRECCIÓN ---
      // Se verifica el token personalizado usando jwt.verify y la clave secreta.
      // NO se usa auth.verifyIdToken de Firebase.
      const decodedToken = jwt.verify(idToken, cleanedJwtSecret, {
        algorithms: ['HS256'],
      })
      const uid = decodedToken.uid
      console.log('Petición GET autenticada por UID (custom JWT):', uid)
      // --- FIN DE LA CORRECCIÓN ---

      const app = getApp()
      const db = getFirestore(app)
      const usersCollectionRef = db.collection('users')
      const snapshot = await usersCollectionRef.get()

      const users = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      return res.status(200).json({
        message: 'Usuarios obtenidos exitosamente (autenticado)',
        data: users,
      })
    } catch (error) {
      console.error(
        'Error en getSecureUsers (verificación de token o Firestore):',
        error,
      )
      // El error puede ser por token inválido/expirado
      return res.status(403).json({
        message: 'Acceso denegado. Token inválido o expirado.',
        error: error.message,
      })
    }
  },
)

// 14. OBTENER USUARIO POR CÉDULA (GET - Pública)
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
      return res.status(405).send('Método no permitido. Solo GET.');
    }

    const cedula = req.query.cedula;

    if (!cedula) {
      return res.status(400).json({
        message: 'Se requiere el número de cédula como parámetro (cedula).',
      });
    }

    try {
      const db = getFirestore(getApp());
      // Buscar en la colección 'users' por el campo 'cedula'
      const userSnapshot = await db.collection('users').where('cedula', '==', cedula).limit(1).get();

      if (userSnapshot.empty) {
        return res.status(200).json({ user: null, message: 'Usuario no encontrado por cédula.' });
      }

      const userData = userSnapshot.docs[0].data();
      const userId = userSnapshot.docs[0].id;

      // Opcional: Filtrar datos sensibles si userData contiene información que no debería ser pública
      const publicUserData = {
        id: userId,
        name: userData.name,
        email: userData.email,
        cedula: userData.cedula,
        role: userData.role,
        location: userData.location || null,
        campaignMemberships: userData.campaignMemberships || [],
        // Puedes añadir más campos aquí si son relevantes para el frontend y no son sensibles
      };

      return res.status(200).json({ user: publicUserData, message: 'Usuario encontrado.' });

    } catch (error) {
      console.error('Error en getUserByCedula:', error);
      return res.status(500).json({
        message: 'Error interno del servidor al buscar usuario por cédula.',
        error: error.message,
      });
    }
  });
});
