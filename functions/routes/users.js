// functions/routes/users.js

import * as functions from 'firebase-functions'
import { getApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore, FieldValue } from 'firebase-admin/firestore' // Importa FieldValue si se usa
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken' // Necesario para JWT.verify y jwt.sign
import { defineSecret } from 'firebase-functions/params' // Necesario para JWT_SECRET_KEY_PARAM

// Configuración para bcrypt (para hashear contraseñas)
const saltRounds = 10 // Definido localmente

// Secreto para firmar y verificar los JSON Web Tokens (JWT)
// Debe estar definido en tus parámetros de Firebase Functions
const JWT_SECRET_KEY_PARAM = defineSecret('BJS_JWT_SECRET_KEY') // Definido localmente

// Este middleware verifica un token JWT personalizado para asegurar que el usuario es un administrador.
// Se mantiene aquí porque es utilizado por otras funciones protegidas en este archivo.
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
      functions.logger.error(
        // CORREGIDO: Usar functions.logger.error
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
    functions.logger.error('Error de autorización (JWT):', error) // CORREGIDO: Usar functions.logger.error
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
  res.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  )
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(204).send('')
    return
  }
  next()
}

// Middleware de autenticación y adjuntar rol/UID a la solicitud (para funciones protegidas)
// Este middleware verifica el token JWT y adjunta userUid, userRole y campaignMemberships
// a la solicitud (req). La lógica de autorización específica por rol se hará en cada función.
// Definido localmente para este archivo users.js.
const authenticateUserAndAttachRole = async (req, res, next) => {
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
      functions.logger.error(
        // Usar functions.logger.error
        'JWT_SECRET no configurado en Firebase Functions para authenticateUserAndAttachRole.',
      )
      return res
        .status(500)
        .json({ message: 'Error de configuración del servidor.' })
    }
    const cleanedJwtSecret = jwtSecretValue.trim()

    const decodedToken = jwt.verify(idToken, cleanedJwtSecret, {
      algorithms: ['HS256'],
    })

    req.userUid = decodedToken.uid // Adjunta el UID del usuario a la solicitud
    req.userRole = decodedToken.role // Adjunta el rol del usuario a la solicitud
    req.campaignMemberships = decodedToken.campaignMemberships || [] // Adjunta membresías

    next()
  } catch (error) {
    functions.logger.error('Error de autenticación (JWT):', error) // Usar functions.logger.error
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

// Función auxiliar para propagar Votos Reales (directVotes y pyramidVotes)
// Se duplica aquí para mantener la independencia de este archivo users.js.
async function propagateRealVotes(db, campaignId, userId, changeAmount) {
  try {
    // 1. Actualizar el totalConfirmedVotes de la campaña principal
    const campaignRef = db.collection('campaigns').doc(campaignId)
    await campaignRef.update({
      totalConfirmedVotes: FieldValue.increment(changeAmount),
      updatedAt: new Date().toISOString(),
    })
    functions.logger.log(
      // CORREGIDO: Usar functions.logger.log
      `Campaña ${campaignId}: totalConfirmedVotes actualizado en ${changeAmount}.`,
    )

    // 2. Recorrer la pirámide hacia arriba para actualizar pyramidVotes
    let currentUserId = userId
    while (currentUserId) {
      const userDocRef = db.collection('users').doc(currentUserId)
      const userDoc = await userDocRef.get()

      if (!userDoc.exists) {
        functions.logger.warn(
          // CORREGIDO: Usar functions.logger.warn
          `Usuario ${currentUserId} no encontrado durante la propagación de votos reales.`,
        )
        break
      }

      const userData = userDoc.data()
      let campaignMemberships = userData.campaignMemberships || []
      const membershipIndex = campaignMemberships.findIndex(
        (m) => m.campaignId === campaignId,
      )

      if (membershipIndex === -1) {
        functions.logger.warn(
          // CORREGIDO: Usar functions.logger.warn
          `Membresía de campaña ${campaignId} no encontrada para el usuario ${currentUserId} durante la propagación de votos reales.`,
        )
        break
      }

      const currentMembership = campaignMemberships[membershipIndex]

      // Incrementar pyramidVotes para el miembro actual
      currentMembership.pyramidVotes =
        (currentMembership.pyramidVotes || 0) + changeAmount

      // Actualizar la membresía en Firestore
      campaignMemberships[membershipIndex] = currentMembership
      await userDocRef.update({
        campaignMemberships: campaignMemberships,
        updatedAt: new Date().toISOString(),
      })
      functions.logger.log(
        // CORREGIDO: Usar functions.logger.log
        `Usuario ${currentUserId}: pyramidVotes actualizado en ${changeAmount}.`,
      )

      // Mover al padre para la siguiente iteración
      currentUserId = currentMembership.ownerBy
      if (currentUserId === userData.id && userData.role === 'candidato') {
        currentUserId = null // Terminar el bucle si es el candidato raíz y ya se actualizó
      }
    }
  } catch (error) {
    functions.logger.error(
      'Error durante la propagación de votos reales:',
      error,
    ) // CORREGIDO: Usar functions.logger.error
    throw error
  }
}

// 1. --- FUNCIÓN DE PRUEBA DE CONEXIÓN ---
export const testUsersModuleConnection = functions.https.onRequest(
  async (req, res) => {
    setPublicCorsHeaders(req, res, async () => {
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
        functions.logger.error(
          // CORREGIDO: Usar functions.logger.error
          'Error en prueba de conexión a Firestore desde users.js:',
          error,
        )
        return res.status(500).json({
          message: 'Error al conectar con Firestore desde users.js.',
          error: error.message,
        })
      }
    })
  },
)

// 2. --- FUNCIÓN PARA CREAR UN USUARIO ADMINISTRADOR (USO INTERNO/POSTMAN) ---
export const createAdminUser = functions.https.onRequest(async (req, res) => {
  setPublicCorsHeaders(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed. Only POST is accepted.')
    }

    try {
      const app = getApp()
      const auth = getAuth(app)
      const db = getFirestore(app)
      const { email, password, name, cedula } = req.body

      if (!email || !password || !name || !cedula) {
        return res.status(400).json({
          message:
            'Missing required fields: email, password, name, and cedula.',
        })
      }
      if (typeof password !== 'string' || password.length < 6) {
        return res
          .status(400)
          .json({ message: 'Password must be at least 6 characters long.' })
      }

      let firebaseAuthUid
      try {
        const userRecord = await auth.getUserByEmail(email)
        firebaseAuthUid = userRecord.uid
        const existingUserDoc = await db
          .collection('users')
          .doc(firebaseAuthUid)
          .get()
        if (existingUserDoc.exists && existingUserDoc.data().role === 'admin') {
          return res.status(409).json({
            message: 'User with this email already exists and is an admin.',
          })
        }
        functions.logger.log(
          // Usar functions.logger.log
          `User with email ${email} already exists in Auth. Updating role to admin.`,
        )
      } catch (authError) {
        if (authError.code === 'auth/user-not-found') {
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
          functions.logger.error(
            // Usar functions.logger.error
            'Error creating user in Firebase Authentication:',
            authError,
          )
          return res.status(500).json({
            message: `Internal server error during Auth user creation: ${authError.message}`,
          })
        }
      }

      const hashedPassword = await bcrypt.hash(password, saltRounds)

      const userCredentialsData = {
        cedula: cedula,
        firebaseAuthUid: firebaseAuthUid,
        hashedPassword: hashedPassword,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      await db
        .collection('user_credentials')
        .doc(firebaseAuthUid)
        .set(userCredentialsData, { merge: true })

      const userProfileData = {
        name: name,
        email: email,
        cedula: cedula,
        role: 'admin',
        registeredViaAuthUid: firebaseAuthUid,
        lastLogin: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
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
      functions.logger.error('Error in createAdminUser Cloud Function:', error) // Usar functions.logger.error
      return res
        .status(500)
        .json({ message: `Internal server error: ${error.message}` })
    }
  })
})

// 3. --- FUNCIÓN PARA REGISTRAR UN USUARIO PÚBLICO (VOTANTE DE OPINIÓN - LANDING PAGE) ---
export const registerPublicUser = functions.https.onRequest(
  async (req, res) => {
    setPublicCorsHeaders(req, res, async () => {
      if (req.method !== 'POST') {
        return res
          .status(405)
          .send('Method Not Allowed. Only POST is accepted.')
      }

      try {
        const app = getApp()
        const db = getFirestore(app)
        const userData = req.body

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

        const userProfileData = {
          name: userData.name,
          email: userData.email,
          cedula: userData.cedula,
          role: 'public_lead',
          status: 'pending_confirmation',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          campaignId: userData.campaignId || null,
          registeredByUid: userData.registeredByUid || null,
        }
        const newUserRef = await db.collection('users').add(userProfileData)

        return res.status(201).json({
          message:
            'Public user registered successfully (pending confirmation).',
          userId: newUserRef.id,
          cedula: userData.cedula,
          email: userData.email,
          role: 'public_lead',
          campaignId: userData.campaignId || null,
          registeredByUid: userData.registeredByUid || null,
        })
      } catch (error) {
        functions.logger.error(
          'Error in registerPublicUser Cloud Function:',
          error,
        ) // Usar functions.logger.error
        return res.status(500).json({
          message: 'Internal server error while registering public user.',
          error: error.message,
        })
      }
    })
  },
)

// 4. --- FUNCIÓN PARA INICIAR SESIÓN CON EMAIL Y CLAVE (POST) ---
export const loginWithEmail = functions.https.onRequest(async (req, res) => {
  setPublicCorsHeaders(req, res, async () => {
    if (req.method === 'GET') {
      return res.status(200).send('Keep-alive ping. Instance is warm.')
    }

    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed. Only POST is accepted.')
    }

    try {
      const app = getApp()
      const db = getFirestore(app)
      const jwtSecretValue = JWT_SECRET_KEY_PARAM.value()

      if (!jwtSecretValue) {
        functions.logger.error(
          'JWT_SECRET not configured in Firebase Functions.',
        )
        return res.status(500).json({ message: 'Server configuration error.' })
      }
      const cleanedJwtSecret = jwtSecretValue.trim()

      const { email, clave } = req.body
      const userCredentialSnapshot = await db
        .collection('user_credentials')
        .where('cedula', '==', email)
        .limit(1)
        .get()

      if (userCredentialSnapshot.empty) {
        return res.status(401).json({ message: 'Incorrect credentials.' })
      }

      const userCredentialDoc = userCredentialSnapshot.docs[0].data()
      const storedHashedPassword = userCredentialDoc.hashedPassword
      const firebaseAuthUid = userCredentialDoc.firebaseAuthUid
      const passwordMatch = await bcrypt.compare(clave, storedHashedPassword)

      if (!passwordMatch) {
        return res.status(401).json({ message: 'Incorrect credentials.' })
      }

      const userDoc = await db.collection('users').doc(firebaseAuthUid).get()
      if (!userDoc.exists) {
        return res.status(404).json({ message: 'User profile not found.' })
      }

      const userData = userDoc.data()

      const allowedRolesForLogin = [
        'admin',
        'candidato',
        'manager',
        'ring',
        'anillo',
        'voter',
        'votante',
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
        name: userData.name || userData.nombre,
        role: userData.role,
        campaignMemberships: userData.campaignMemberships || [],
      }

      const idToken = jwt.sign(tokenPayload, cleanedJwtSecret, {
        algorithm: 'HS256',
        expiresIn: '1h',
      })

      return res.status(200).json({
        message: 'Credentials verified successfully.',
        firebaseAuthUid: firebaseAuthUid,
        email: userData.email,
        name: userData.name || userData.nombre,
        role: userData.role,
        idToken: idToken,
        campaignMemberships: userData.campaignMemberships || [],
      })
    } catch (error) {
      functions.logger.error('Error in loginWithEmail Cloud Function:', error)
      return res.status(500).json({
        message: 'Internal server error during login.',
        error: error.message,
      })
    }
  })
})

// 5. --- FUNCIÓN PARA OBTENER USUARIOS DE FORMA SEGURA (GET) ---
export const getSecureUsers = functions.https.onRequest(
  { secrets: [JWT_SECRET_KEY_PARAM] },
  async (req, res) => {
    // Uso de authorizeAdmin local para este endpoint
    authorizeAdmin(req, res, async () => {
      if (req.method !== 'GET') {
        return res.status(405).send('Method Not Allowed. Only GET is accepted.')
      }

      try {
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
        functions.logger.error(
          // Usar functions.logger.error
          'Error in getSecureUsers (Firestore):',
          error,
        )
        return res.status(500).json({
          message: 'Error interno del servidor al obtener usuarios seguros.',
          error: error.message,
        })
      }
    })
  },
)

// 6. --- FUNCIÓN PARA OBTENER USUARIO POR CÉDULA (GET - Pública) ---
export const getUserByCedula = functions.https.onRequest(async (req, res) => {
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

      const publicUserData = {
        id: userId,
        name: userData.name || userData.nombre,
        email: userData.email,
        cedula: userData.cedula,
        role: userData.role,
        location: userData.location || null,
        campaignMemberships: userData.campaignMemberships || [],
      }

      return res
        .status(200)
        .json({ user: publicUserData, message: 'User found.' })
    } catch (error) {
      functions.logger.error('Error in getUserByCedula Cloud Function:', error) // Usar functions.logger.error
      return res.status(500).json({
        message: 'Internal server error while searching user by cedula.',
        error: error.message,
      })
    }
  })
})

// 7. --- FUNCIÓN PARA CREAR/ACTIVAR UN USUARIO Y ASIGNAR MEMBRESÍA A CAMPAÑA (PROTEGIDA) ---
export const createActiveUserAndMembership = functions.https.onRequest(
  { secrets: [JWT_SECRET_KEY_PARAM] },
  async (req, res) => {
    authenticateUserAndAttachRole(req, res, async () => {
      if (req.method !== 'POST') {
        return res.status(405).send('Método no permitido. Solo POST.')
      }

      try {
        const db = getFirestore(getApp())
        const auth = getAuth(getApp())
        const {
          email,
          password,
          cedula,
          name,
          role,
          campaignId,
          parentUid,
          whatsapp,
          phone,
          location,
          dateBirth,
          sexo,
          votoPromesa,
          votoEsperado,
        } = req.body

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

        const campaignRef = db.collection('campaigns').doc(campaignId)
        const campaignDoc = await campaignRef.get()
        if (!campaignDoc.exists) {
          return res.status(404).json({ message: 'Campaña no encontrada.' })
        }
        const campaignData = campaignDoc.data()
        const isDemoCampaign = campaignData.type === 'equipo_de_trabajo'
        const demoSettings = campaignData.demoSettings

        const parentUserRef = db.collection('users').doc(parentUid)
        const parentUserDoc = await parentUserRef.get()
        if (!parentUserDoc.exists) {
          return res
            .status(404)
            .json({ message: 'Usuario padre no encontrado.' })
        }
        const parentUserData = parentUserDoc.data()
        const parentMembership = parentUserData.campaignMemberships?.find(
          (m) => m.campaignId === campaignId && m.status === 'activo',
        )

        if (!parentMembership) {
          return res.status(403).json({
            message: 'El usuario padre no es miembro activo de esta campaña.',
          })
        }

        const callingUserUid = req.userUid
        const callingUserRole = req.userRole

        // --- INICIO DE LÓGICA DE AUTORIZACIÓN MODIFICADA ---
        let isAuthorized = false
        if (callingUserRole === 'admin') {
          isAuthorized = true
        } else if (callingUserUid === parentUid) {
          // Un usuario puede crear un subordinado debajo de sí mismo
          const allowedSubordinateRoles = {
            candidato: ['manager', 'anillo', 'votante'],
            manager: ['anillo', 'votante'],
            anillo: ['votante'],
            votante: ['votante'],
          }
          if (allowedSubordinateRoles[callingUserRole]?.includes(role)) {
            isAuthorized = true
          }
        }

        if (!isAuthorized) {
          return res.status(403).json({
            message:
              'Acceso denegado: No tienes permiso para crear este rol de subordinado o no puedes crear un usuario bajo otro superior.',
          })
        }
        // --- FIN DE LÓGICA DE AUTORIZACIÓN MODIFICADA ---

        const newMemberLevel = (parentMembership.level || 0) + 1
        if (isDemoCampaign && demoSettings) {
          if (newMemberLevel >= demoSettings.maxDepth) {
            return res.status(400).json({
              message: `No se puede agregar más miembros. Se ha alcanzado el límite de ${demoSettings.maxDepth} niveles en la pirámide demo.`,
            })
          }

          const parentCurrentSubordinatesCount =
            parentMembership.subordinatesCount || 0
          if (
            parentCurrentSubordinatesCount >=
            demoSettings.generalMaxDirectSubordinates
          ) {
            return res.status(400).json({
              message: `El usuario padre ya tiene el número máximo de ${demoSettings.generalMaxDirectSubordinates} subordinados directos permitidos en esta campaña demo.`,
            })
          }

          const parentCurrentSubordinatesByRole =
            parentMembership.subordinatesByRole || {}
          const allowedRolesForParent =
            demoSettings.rolesLimits?.[parentMembership.role]

          if (allowedRolesForParent) {
            switch (role) {
              case 'manager':
                if (
                  (parentCurrentSubordinatesByRole.managers || 0) >=
                  (allowedRolesForParent.managers || 0)
                ) {
                  return res.status(400).json({
                    message: `El ${parentMembership.role} ya ha creado el número máximo de ${allowedRolesForParent.managers} Gerentes.`,
                  })
                }
                break
              case 'anillo':
                if (
                  (parentCurrentSubordinatesByRole.anillos || 0) >=
                  (allowedRolesForParent.anillos || 0)
                ) {
                  return res.status(400).json({
                    message: `El ${parentMembership.role} ya ha creado el número máximo de ${allowedRolesForParent.anillos} Anillos.`,
                  })
                }
                break
              case 'votante':
                if (
                  (parentCurrentSubordinatesByRole.votantes || 0) >=
                  (allowedRolesForParent.votantes || 0)
                ) {
                  return res.status(400).json({
                    message: `El ${parentMembership.role} ya ha creado el número máximo de ${allowedRolesForParent.votantes} Votantes.`,
                  })
                }
                break
            }
          } else {
            functions.logger.warn(
              `Rol de padre ${parentMembership.role} no tiene límites definidos en demoSettings.rolesLimits.`,
            )
            return res.status(400).json({
              message: `Configuración de límites incompleta para el rol ${parentMembership.role}. Contacte al administrador.`,
            })
          }
        }
        // Fin Lógica de Validación de Límites para Campañas Demo

        if (parentMembership.votoPromesa && parentMembership.votoPromesa > 0) {
          return res.status(403).json({
            message:
              'Acceso denegado: No puedes registrar nuevos miembros si tienes una promesa de voto activa.',
          })
        }

        if (
          Object.prototype.hasOwnProperty.call(
            parentMembership,
            'canRegisterSubordinates',
          ) &&
          parentMembership.canRegisterSubordinates === false
        ) {
          functions.logger.warn(
            `Acceso denegado: Usuario ${parentMembership.id || 'N/A'} no tiene habilitada la capacidad para registrar subordinados en campaña ${parentMembership.campaignId || 'N/A'}.`,
          )
          return res.status(403).json({
            message:
              'Acceso denegado: No tienes habilitada la capacidad para registrar subordinados.',
          })
        }

        let userUid
        let existingUserDocRef
        let existingUserDataForNewMember = null
        let isExistingAuthUser = false

        try {
          const userRecord = await auth.getUserByEmail(email)
          userUid = userRecord.uid
          isExistingAuthUser = true

          existingUserDocRef = db.collection('users').doc(userUid)
          existingUserDataForNewMember = (await existingUserDocRef.get()).data()

          if (
            existingUserDataForNewMember &&
            existingUserDataForNewMember.role === 'admin'
          ) {
            return res
              .status(409)
              .json({ message: 'Este email ya pertenece a un administrador.' })
          }

          const isAlreadyActiveInCampaign =
            existingUserDataForNewMember?.campaignMemberships?.some(
              (membership) =>
                membership.campaignId === campaignId &&
                membership.status === 'activo',
            )
          if (isAlreadyActiveInCampaign) {
            return res.status(409).json({
              message: `Este usuario ya es miembro activo de esta campaña.`,
            })
          }

          if (password) {
            await auth.updateUser(userUid, { password: password })
          }
        } catch (error) {
          if (error.code === 'auth/user-not-found') {
            if (!password) {
              return res.status(400).json({
                message:
                  'Se requiere contraseña para nuevos usuarios que no existen en Auth.',
              })
            }
            const newUserRecord = await auth.createUser({
              email: email,
              password: password,
              displayName: name,
            })
            userUid = newUserRecord.uid
            existingUserDocRef = db.collection('users').doc(userUid)
          } else if (error.code === 'auth/email-already-in-use') {
            return res.status(409).json({
              message:
                'El correo electrónico ya está en uso por otra cuenta Auth.',
            })
          } else {
            functions.logger.error(
              'Error al manejar usuario en Firebase Auth:',
              error,
            )
            return res.status(500).json({
              message: `Error al procesar usuario en Auth: ${error.message}`,
            })
          }
        }

        const hashedPassword = password
          ? await bcrypt.hash(password, saltRounds)
          : existingUserDataForNewMember?.hashedPassword || null

        if (!hashedPassword) {
          return res.status(500).json({
            message: 'No se pudo generar o recuperar la contraseña hasheada.',
          })
        }

        await db
          .collection('user_credentials')
          .doc(userUid)
          .set(
            {
              firebaseAuthUid: userUid,
              cedula: cedula,
              hashedPassword: hashedPassword,
              createdAt:
                existingUserDataForNewMember?.createdAt ||
                new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            { merge: true },
          )

        let updatedCampaignMemberships =
          existingUserDataForNewMember?.campaignMemberships || []

        const newMembership = {
          campaignId: campaignId,
          campaignName: campaignData.campaignName,
          role: role,
          type: campaignData.type,
          status: 'activo',
          registeredAt: new Date().toISOString(),
          registeredBy: callingUserUid,
          ownerBy: parentUid,
          voterStatus: null,
          votoPromesa: votoPromesa || null,
          votoEsperado: votoEsperado || null,
          directVotes: 0,
          pyramidVotes: 0,
          totalPotentialVotes: 0,
          level: newMemberLevel,
          canRegister: ['candidato', 'manager', 'anillo', 'votante'].includes(
            role,
          ),
          canPromise: true,
          maxSubordinates: isDemoCampaign
            ? demoSettings.generalMaxDirectSubordinates
            : null,
          subordinatesCount: 0,
          subordinatesByRole: { managers: 0, anillos: 0, votantes: 0 },
          canRegisterSubordinates: true,
        }

        const existingMembershipIndex = updatedCampaignMemberships.findIndex(
          (m) => m.campaignId === campaignId && m.role === role,
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
          whatsapp: whatsapp || null,
          phone: phone || null,
          location: location || null,
          dateBirth: dateBirth || null,
          sexo: sexo || null,
          role: role,
          level: newMemberLevel,
          status: 'activo',
          createdAt:
            existingUserDataForNewMember?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          registeredViaAuthUid: callingUserUid,
          lastLogin: isExistingAuthUser
            ? existingUserDataForNewMember?.lastLogin || null
            : null,
          campaignMemberships: updatedCampaignMemberships,
        }

        await db
          .collection('users')
          .doc(userUid)
          .set(userProfileToSet, { merge: true })

        await db.runTransaction(async (transaction) => {
          const parentDocSnapshot = await transaction.get(parentUserRef)
          if (!parentDocSnapshot.exists) {
            throw new Error(
              'Parent user disappeared during transaction for subordinate creation.',
            )
          }
          let parentMemberships =
            parentDocSnapshot.data()?.campaignMemberships || []
          const parentIndex = parentMemberships.findIndex(
            (m) => m.campaignId === campaignId,
          )

          if (parentIndex !== -1) {
            let currentParentMembership = parentMemberships[parentIndex]
            currentParentMembership.subordinatesCount =
              (currentParentMembership.subordinatesCount || 0) + 1
            currentParentMembership.subordinatesByRole =
              currentParentMembership.subordinatesByRole || {
                managers: 0,
                anillos: 0,
                votantes: 0,
              }
            currentParentMembership.subordinatesByRole[role] =
              (currentParentMembership.subordinatesByRole[role] || 0) + 1
            parentMemberships[parentIndex] = currentParentMembership

            transaction.update(parentUserRef, {
              campaignMemberships: parentMemberships,
              updatedAt: new Date().toISOString(),
            })
          } else {
            functions.logger.warn(
              `Parent ${parentUid} membership for campaign ${campaignId} not found during transaction.`,
            )
          }
        })

        return res.status(201).json({
          message: `Usuario ${role} creado/actualizado y vinculado a campaña exitosamente.`,
          userId: userUid,
          email: email,
          role: role,
          campaignId: campaignId,
          parentUid: parentUid,
        })
      } catch (error) {
        functions.logger.error(
          'Error en createActiveUserAndMembership Cloud Function:',
          error,
        )
        if (error.code === 'auth/email-already-in-use') {
          return res.status(409).json({
            message:
              'El correo electrónico ya está en uso por otra cuenta Auth.',
          })
        }
        if (
          error.message.includes('Acceso denegado') ||
          error.message.includes('No autorizado') ||
          error.message.includes('No tienes permiso')
        ) {
          return res.status(403).json({ message: error.message })
        }
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
export const updateUserProfile = functions.https.onRequest(
  { secrets: [JWT_SECRET_KEY_PARAM] }, // Declara el secreto para JWT
  async (req, res) => {
    // CORREGIDO: Envuelve esta función con el middleware authenticateUserAndAttachRole principal
    await authenticateUserAndAttachRole(req, res, async () => {
      // CORS Headers para la respuesta (se mantienen por si authenticateUserAndAttachRole no las setea todas)
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
          isAuthorized = true
        } else if (callingUserUid === userId) {
          isAuthorized = true
        } else {
          return res.status(403).json({
            message:
              'Acceso denegado: No tienes permiso para actualizar este perfil de usuario.',
          })
        }

        const selfEditableFields = [
          'name',
          'whatsapp',
          'phone',
          'location',
          'dateBirth',
          'sexo',
          'puestoVotacion',
        ]

        const updateData = {}
        if (callingUserRole === 'admin') {
          for (const key in updates) {
            if (Object.prototype.hasOwnProperty.call(updates, key)) {
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
                functions.logger.warn(
                  // CORREGIDO: Usar functions.logger.warn
                  `Admin intentó actualizar campo sensible ${key}. Operación bloqueada para esta función.`,
                )
              }
            }
          }
        } else {
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

        updateData.updatedAt = new Date().toISOString()

        const userRef = db.collection('users').doc(userId)
        await userRef.update(updateData)

        return res.status(200).json({
          message: 'Perfil de usuario actualizado exitosamente.',
          updatedFields: Object.keys(updateData),
        })
      } catch (error) {
        functions.logger.error('Error en updateUserProfile:', error) // CORREGIDO: Usar functions.logger.error
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
export const generateQrRegistrationLink = functions.https.onRequest(
  { secrets: [JWT_SECRET_KEY_PARAM] },
  async (req, res) => {
    // CORREGIDO: Usar el middleware authenticateUserAndAttachRole principal
    await authenticateUserAndAttachRole(req, res, async () => {
      if (req.method !== 'GET') {
        return res.status(405).send('Método no permitido. Solo GET.')
      }

      try {
        const db = getFirestore(getApp())
        const campaignId = req.query.campaignId
        const parentUid = req.userUid // El UID del usuario que genera el QR (viene del JWT)

        if (!campaignId) {
          return res
            .status(400)
            .json({ message: 'El ID de la campaña es requerido.' })
        }

        const userDoc = await db.collection('users').doc(parentUid).get()
        const userData = userDoc.data()
        const parentMembership = userData?.campaignMemberships?.find(
          (membership) =>
            membership.campaignId === campaignId &&
            membership.status === 'activo',
        )

        // Autorización para generar QR: Admin o miembro activo de la campaña (viene del JWT)
        if (req.userRole !== 'admin' && !parentMembership) {
          return res.status(403).json({
            message: 'Acceso denegado: No eres miembro activo de esta campaña.',
          })
        }

        // VALIDACIÓN DE NEGOCIO: "Promesa de Voto" del padre (Regla 4.3 en manual de lógica)
        // Si un usuario tiene una Promesa de Voto activa (votoPromesa > 0), NO puede generar enlaces de registro.
        if (parentMembership?.votoPromesa && parentMembership.votoPromesa > 0) {
          functions.logger.warn(
            // CORREGIDO: Usar functions.logger.warn
            `Acceso denegado: Usuario ${parentUid || 'N/A'} no puede generar QR, tiene promesa de voto activa.`,
          )
          return res.status(403).json({
            message:
              'Acceso denegado: No puedes generar enlaces de registro si tienes una promesa de voto activa.',
          })
        }

        // VALIDACIÓN DE NEGOCIO: `canRegisterSubordinates` del padre (Regla 4.4 en manual de lógica)
        // Si el campo existe y es false, denegar.
        if (
          Object.prototype.hasOwnProperty.call(
            parentMembership,
            'canRegisterSubordinates',
          ) &&
          parentMembership.canRegisterSubordinates === false
        ) {
          functions.logger.warn(
            // CORREGIDO: Usar functions.logger.warn
            `Acceso denegado: Usuario ${parentUid || 'N/A'} no tiene habilitada la capacidad para generar enlaces de registro de subordinados en campaña ${campaignId || 'N/A'}.`,
          )
          return res.status(403).json({
            message:
              'Acceso denegado: No tienes habilitada la capacidad para generar enlaces de registro de subordinados.',
          })
        }

        const baseFrontendUrl = 'https://www.autoridadpolitica.com'
        const qrLink = `${baseFrontendUrl}/auto-registro-qr?campaignId=${campaignId}&parentUid=${parentUid}`

        return res.status(200).json({
          message: 'Enlace de registro QR generado exitosamente.',
          qrLink: qrLink,
        })
      } catch (error) {
        functions.logger.error('Error en generateQrRegistrationLink:', error) // CORREGIDO: Usar functions.logger.error
        return res.status(500).json({
          message: 'Error interno del servidor al generar el enlace QR.',
          error: error.message,
        })
      }
    })
  },
)

// 10. --- FUNCIÓN PARA PROCESAR AUTO-REGISTRO POR QR (PÚBLICA) ---
export const registerUserViaQr = functions.https.onRequest(async (req, res) => {
  setPublicCorsHeaders(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).send('Método no permitido. Solo POST.')
    }

    try {
      const db = getFirestore(getApp())
      const auth = getAuth(getApp())
      const { email, password, cedula, name, campaignId, parentUid } = req.body

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

      const parentDoc = await db.collection('users').doc(parentUid).get()
      if (!parentDoc.exists) {
        return res.status(404).json({
          message: 'El usuario que generó el QR (parentUid) no existe.',
        })
      }
      const parentUserData = parentDoc.data()
      const campaignDoc = await db.collection('campaigns').doc(campaignId).get()
      if (!campaignDoc.exists) {
        return res
          .status(404)
          .json({ message: 'La campaña especificada no existe.' })
      }
      const campaignData = campaignDoc.data()
      const isDemoCampaign = campaignData.type === 'equipo_de_trabajo'
      const demoSettings = campaignData.demoSettings

      const parentMembership = parentUserData?.campaignMemberships?.find(
        (m) => m.campaignId === campaignId && m.status === 'activo',
      )

      if (!parentMembership) {
        return res.status(403).json({
          message:
            'El usuario que generó el QR no es miembro activo de esta campaña.',
        })
      }

      // Validación de "Promesa de Voto" del padre: Si el padre tiene votoPromesa > 0, NO puede registrar
      if (parentMembership.votoPromesa && parentMembership.votoPromesa > 0) {
        return res.status(403).json({
          message:
            'Acceso denegado: No puedes auto-registrar nuevos miembros si la persona que generó el QR tiene una promesa de voto activa.',
        })
      }

      // CORREGIDO: Uso de Object.prototype.hasOwnProperty.call para canRegisterSubordinates
      if (
        Object.prototype.hasOwnProperty.call(
          parentMembership,
          'canRegisterSubordinates',
        ) &&
        parentMembership.canRegisterSubordinates === false
      ) {
        functions.logger.warn(
          // Usar functions.logger.warn
          `Acceso denegado: Usuario ${parentUid || 'N/A'} no tiene habilitada la capacidad para registrar subordinados en campaña ${campaignId || 'N/A'}.`,
        )
        return res.status(403).json({
          message:
            'Acceso denegado: La persona que generó el QR no tiene habilitada la capacidad para registrar subordinados.',
        })
      }

      const newMemberLevel = (parentMembership.level || 0) + 1
      if (isDemoCampaign && demoSettings) {
        if (newMemberLevel >= demoSettings.maxDepth) {
          return res.status(400).json({
            message: `No se puede agregar más miembros. Se ha alcanzado el límite de ${demoSettings.maxDepth} niveles en la pirámide demo.`,
          })
        }

        const parentCurrentSubordinatesCount =
          parentMembership.subordinatesCount || 0
        if (
          parentCurrentSubordinatesCount >=
          demoSettings.generalMaxDirectSubordinates
        ) {
          return res.status(400).json({
            message: `La persona que generó el QR ya tiene el número máximo de ${demoSettings.generalMaxDirectSubordinates} subordinados directos permitidos en esta campaña demo.`,
          })
        }

        const parentCurrentSubordinatesByRole =
          parentMembership.subordinatesByRole || {}
        const allowedRolesForParent =
          demoSettings.rolesLimits?.[parentMembership.role]

        if (
          allowedRolesForParent &&
          (parentCurrentSubordinatesByRole.votantes || 0) >=
            (allowedRolesForParent.votantes || 0)
        ) {
          return res.status(400).json({
            message: `La persona que generó el QR ya ha creado el número máximo de ${allowedRolesForParent.votantes} Votantes.`,
          })
        }
      }

      let userUid
      let existingUserDocRef
      let existingUserData = null
      let isExistingAuthUser = false

      try {
        const userRecord = await auth.getUserByEmail(email)
        userUid = userRecord.uid
        isExistingAuthUser = true

        existingUserDocRef = db.collection('users').doc(userUid)
        existingUserData = (await existingUserDocRef.get()).data()

        const isAlreadyActiveInCampaign =
          existingUserData?.campaignMemberships?.some(
            (membership) =>
              membership.campaignId === campaignId &&
              membership.status === 'activo',
          )
        if (isAlreadyActiveInCampaign && existingUserData.role === 'votante') {
          return res.status(409).json({
            message: `Este usuario ya es un votante activo en esta campaña.`,
          })
        }

        await auth.updateUser(userUid, { password: password })
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
          return res.status(409).json({
            message: 'El correo electrónico ya está en uso por otra cuenta.',
          })
        } else {
          functions.logger.error(
            // Usar functions.logger.error
            'Error al crear/actualizar usuario en Firebase Auth vía QR:',
            error,
          )
          return res.status(500).json({
            message: `Error al procesar usuario en Auth: ${error.message}`,
          })
        }
      }

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

      let updatedCampaignMemberships =
        existingUserData?.campaignMemberships || []
      const newMembership = {
        campaignId: campaignId,
        campaignName: campaignData.campaignName,
        role: 'votante',
        type: campaignData.type,
        status: 'activo',
        registeredAt: new Date().toISOString(),
        registeredBy: parentUid,
        ownerBy: parentUid,
        voterStatus: 'confirmed',
        votoPromesa: 1,
        votoEsperado: null,
        directVotes: 0,
        pyramidVotes: 0,
        totalPotentialVotes: 0, // Inicializar para nuevo miembro
        level: newMemberLevel,
        canRegister: true, // Un votante puede registrar a otros votantes via QR
        canPromise: true,
        maxSubordinates: isDemoCampaign
          ? demoSettings.generalMaxDirectSubordinates
          : null,
        subordinatesCount: 0, // Inicializar para nuevo miembro
        subordinatesByRole: { managers: 0, anillos: 0, votantes: 0 }, // Inicializar para nuevo miembro
        canRegisterSubordinates: true, // Por defecto un votante auto-registrado con QR puede registrar
      }

      const existingMembershipIndex = updatedCampaignMemberships.findIndex(
        (m) => m.campaignId === campaignId && m.role === 'votante',
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
        role: 'votante',
        level: newMemberLevel,
        status: 'activo',
        createdAt: existingUserData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        registeredViaAuthUid: parentUid,
        lastLogin: isExistingAuthUser
          ? existingUserData?.lastLogin || null
          : null,
        campaignMemberships: updatedCampaignMemberships,
      }

      await db
        .collection('users')
        .doc(userUid)
        .set(userProfileToSet, { merge: true })

      // 6. Actualizar contadores del padre Y PROPAGAR VOTOS REALES
      await db.runTransaction(async (transaction) => {
        const parentDocSnapshot = await transaction.get(parentDoc.ref)
        if (!parentDocSnapshot.exists) {
          throw new Error(
            'Parent user disappeared during transaction for QR registration.',
          )
        }
        let parentMemberships =
          parentDocSnapshot.data()?.campaignMemberships || []
        const parentIndex = parentMemberships.findIndex(
          (m) => m.campaignId === campaignId,
        )

        if (parentIndex !== -1) {
          let currentParentMembership = parentMemberships[parentIndex]
          // Incrementar subordinados
          currentParentMembership.subordinatesCount =
            (currentParentMembership.subordinatesCount || 0) + 1
          currentParentMembership.subordinatesByRole =
            currentParentMembership.subordinatesByRole || {
              managers: 0,
              anillos: 0,
              votantes: 0,
            }
          currentParentMembership.subordinatesByRole['votante'] =
            (currentParentMembership.subordinatesByRole['votante'] || 0) + 1

          // Atribuir el voto directo al generador del QR
          currentParentMembership.directVotes =
            (currentParentMembership.directVotes || 0) + 1

          parentMemberships[parentIndex] = currentParentMembership
          transaction.update(parentDoc.ref, {
            campaignMemberships: parentMemberships,
            updatedAt: new Date().toISOString(),
          })
        } else {
          functions.logger.warn(
            `Parent ${parentUid} membership for campaign ${campaignId} not found during transaction.`,
          ) // Usar functions.logger.warn
        }
      })
      await propagateRealVotes(db, campaignId, parentUid, 1)

      return res.status(201).json({
        message: 'Usuario auto-registrado y vinculado a campaña exitosamente.',
        userId: userUid,
        email: email,
        role: 'votante',
        campaignId: campaignId,
        parentUid: parentUid,
      })
    } catch (error) {
      functions.logger.error(
        'Error en registerUserViaQr Cloud Function:',
        error,
      ) // Usar functions.logger.error
      return res.status(500).json({
        message: 'Error interno del servidor al procesar auto-registro QR.',
        error: error.message,
      })
    }
  })
})

// 11. --- FUNCIÓN PARA OBTENER MIEMBROS DE UNA CAMPAÑA (PROTEGIDA) ---
export const getCampaignMembers = functions.https.onRequest(
  { secrets: ['BJS_JWT_SECRET_KEY'] },
  async (req, res) => {
    await authenticateUserAndAttachRole(req, res, async () => {
      if (req.method !== 'GET') {
        return res.status(405).send('Método no permitido. Solo GET.')
      }

      const db = getFirestore(getApp())
      const { campaignId, parentUid } = req.query
      const callingUserUid = req.userUid
      const callingUserRole = req.userRole

      if (!campaignId) {
        return res
          .status(400)
          .json({ message: 'El campo "campaignId" es requerido.' })
      }

      const userCampaignMembership = req.campaignMemberships.find(
        (m) => m.campaignId === campaignId && m.status === 'activo',
      )

      if (!userCampaignMembership && callingUserRole !== 'admin') {
        return res.status(403).json({
          message: 'Acceso denegado: No eres miembro activo de esta campaña.',
        })
      }

      try {
        let membersQuery = db.collection('users')

        // CORRECCIÓN CLAVE: La consulta ahora se construye dinámicamente.
        // Si hay un parentUid, busca los subordinados directos.
        // Si no hay, busca todos los miembros de la campaña.
        if (parentUid) {
          membersQuery = membersQuery.where(
            'campaignMemberships',
            'array-contains',
            {
              campaignId: campaignId,
              ownerBy: parentUid,
              status: 'activo',
            },
          )
        } else {
          membersQuery = membersQuery.where(
            'campaignMemberships',
            'array-contains',
            {
              campaignId: campaignId,
              status: 'activo',
            },
          )
        }

        const membersSnapshot = await membersQuery.get()
        const campaignMembers = []

        if (!membersSnapshot.empty) {
          membersSnapshot.forEach((doc) => {
            const userData = doc.data()
            const membership = userData.campaignMemberships.find(
              (m) => m.campaignId === campaignId,
            )

            if (membership) {
              campaignMembers.push({
                userId: doc.id,
                name: userData.name || userData.nombre,
                role: membership.role,
                level: membership.level,
                directVotes: membership.directVotes,
                pyramidVotes: membership.pyramidVotes,
                totalPotentialVotes: membership.totalPotentialVotes,
                ownerBy: membership.ownerBy,
                subordinatesCount: membership.subordinatesCount,
              })
            }
          })
        }

        // Agregamos el usuario de la solicitud si no está en la lista para que el frontend lo pueda mostrar
        if (!parentUid) {
          // Solo si estamos en la vista de campaña general
          const isSelfIncluded = campaignMembers.some(
            (member) => member.userId === callingUserUid,
          )
          if (userCampaignMembership && !isSelfIncluded) {
            campaignMembers.push({
              userId: callingUserUid,
              name:
                req.userRole === 'admin'
                  ? 'Admin'
                  : userCampaignMembership.name || 'N/A',
              role: userCampaignMembership.role,
              level: userCampaignMembership.level,
              directVotes: userCampaignMembership.directVotes,
              pyramidVotes: userCampaignMembership.pyramidVotes,
              totalPotentialVotes: userCampaignMembership.totalPotentialVotes,
              ownerBy: userCampaignMembership.ownerBy,
              subordinatesCount: userCampaignMembership.subordinatesCount,
            })
          }
        }

        return res.status(200).json({
          message: 'Miembros de la campaña recuperados exitosamente.',
          campaignMembers: campaignMembers,
        })
      } catch (error) {
        functions.logger.error(
          'Error en getCampaignMembers Cloud Function:',
          error,
        )
        return res.status(500).json({
          message:
            'Error interno del servidor al recuperar miembros de la campaña.',
          error: error.message,
        })
      }
    })
  },
)
