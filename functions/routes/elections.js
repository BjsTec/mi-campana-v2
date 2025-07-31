import * as functions from 'firebase-functions'
import { getFirestore, FieldValue } from 'firebase-admin/firestore' // Asegúrate de importar FieldValue
import { getAuth } from 'firebase-admin/auth'
import { getApp } from 'firebase-admin/app'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { defineSecret } from 'firebase-functions/params'

// Secreto para firmar y verificar los JSON Web Tokens (JWT)
const JWT_SECRET_KEY_PARAM = defineSecret('BJS_JWT_SECRET_KEY')

// Número de rondas de sal para bcrypt
const saltRounds = 10

// Middleware de autenticación y adjuntar rol/UID a la solicitud
const authenticateUserAndAttachRole = async (req, res, next) => {
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

    req.userUid = decodedToken.uid
    req.userRole = decodedToken.role
    req.campaignMemberships = decodedToken.campaignMemberships || []

    next()
  } catch (error) {
    console.error('Error de autenticación (JWT):', error)
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

// Función auxiliar para generar una contraseña aleatoria
const generateRandomPassword = (length = 10) => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

// Función auxiliar para propagar votos potenciales a través de la pirámide (CORREGIDA Y ÚNICA)
async function propagatePotentialVotes(db, campaignId, userId, changeAmount) {
  try {
    let currentUserId = userId
    while (currentUserId) {
      const userDocRef = db.collection('users').doc(currentUserId)
      const userDoc = await userDocRef.get()

      if (!userDoc.exists) {
        console.warn(
          `Usuario ${currentUserId} no encontrado durante la propagación.`,
        )
        break // Salir si el usuario no existe
      }

      const userData = userDoc.data()
      let campaignMemberships = userData.campaignMemberships || []
      const membershipIndex = campaignMemberships.findIndex(
        (m) => m.campaignId === campaignId,
      )

      if (membershipIndex === -1) {
        console.warn(
          `Membresía de campaña ${campaignId} no encontrada para el usuario ${currentUserId} durante la propagación.`,
        )
        break // Salir si la membresía no existe
      }

      const currentMembership = campaignMemberships[membershipIndex]

      // Actualizar el totalPotentialVotes del miembro actual
      // Esto es si cada nivel de la pirámide debe sumar los potenciales de sus subordinados
      currentMembership.totalPotentialVotes =
        (currentMembership.totalPotentialVotes || 0) + changeAmount
      campaignMemberships[membershipIndex] = currentMembership // Actualizar el objeto en el array

      await userDocRef.update({
        campaignMemberships: campaignMemberships,
        updatedAt: new Date().toISOString(),
      })
      console.log(
        `Usuario ${currentUserId}: totalPotentialVotes actualizado en ${changeAmount}.`,
      )

      // Mover al padre para la siguiente iteración
      currentUserId = currentMembership.ownerBy // Usar ownerBy para subir por la pirámide
      // Si el ownerBy es el propio Candidato, su parentId/ownerBy será null o su propio UID si es la raíz
      // El bucle terminará cuando currentUserId sea null/undefined
      if (currentUserId === userData.id && userData.role === 'candidato') {
        // Si es el candidato y su ownerBy es él mismo, el bucle termina después de actualizarlo
        currentUserId = null
      }
    }

    // Al final, actualizar el totalPotentialVotes de la campaña principal (si no se hizo ya recursivamente a través del Candidato)
    // Si el Candidato es el 'ownerBy' de los managers, esta línea de código no debería ser necesaria
    // si la propagación es hasta el candidato y el candidato está en la campaña.
    // Pero lo dejamos para asegurar que el total en la campaña se actualice.
    const campaignRef = db.collection('campaigns').doc(campaignId)
    await campaignRef.update({
      totalPotentialVotes: FieldValue.increment(changeAmount),
      updatedAt: new Date().toISOString(),
    })
    console.log(
      `Campaña ${campaignId}: totalPotentialVotes final actualizado en ${changeAmount}.`,
    )
  } catch (error) {
    console.error('Error durante la propagación de votos potenciales:', error)
    throw error // Relanzar el error para que la función que la llamó lo maneje
  }
}

// Función auxiliar para propagar Votos Reales (directVotes y pyramidVotes)
async function propagateRealVotes(db, campaignId, userId, changeAmount) {
  try {
    // 1. Actualizar el totalConfirmedVotes de la campaña principal
    const campaignRef = db.collection('campaigns').doc(campaignId)
    await campaignRef.update({
      totalConfirmedVotes: FieldValue.increment(changeAmount),
      updatedAt: new Date().toISOString(),
    })
    console.log(
      `Campaña ${campaignId}: totalConfirmedVotes actualizado en ${changeAmount}.`,
    )

    // 2. Recorrer la pirámide hacia arriba para actualizar pyramidVotes
    let currentUserId = userId
    while (currentUserId) {
      const userDocRef = db.collection('users').doc(currentUserId)
      const userDoc = await userDocRef.get()

      if (!userDoc.exists) {
        console.warn(
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
        console.warn(
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
      console.log(
        `Usuario ${currentUserId}: pyramidVotes actualizado en ${changeAmount}.`,
      )

      // Mover al padre para la siguiente iteración
      currentUserId = currentMembership.ownerBy
      if (currentUserId === userData.id && userData.role === 'candidato') {
        currentUserId = null
      }
    }
  } catch (error) {
    console.error('Error durante la propagación de votos reales:', error)
    throw error
  }
}

// 1. --- FUNCIÓN PARA REGISTRAR RESULTADOS DE ESCRUTINIO (POST - Protegida por Escrutador) ---
export const submitEscrutinioResult = functions.https.onRequest(
  { secrets: [JWT_SECRET_KEY_PARAM] },
  async (req, res) => {
    // Aplica el middleware de autenticación
    authenticateUserAndAttachRole(req, res, async () => {
      if (req.method !== 'POST') {
        return res.status(405).send('Método no permitido. Solo POST.')
      }

      try {
        const db = getFirestore(getApp())
        const {
          campaignId,
          pollingStationId,
          mesaNumber,
          votesCollected,
          photoEvidenceUrl,
          latitude,
          longitude,
        } = req.body
        const escrutadorUid = req.userUid
        const escrutadorRole = req.userRole

        // Validaciones de datos de entrada
        const requiredFields = [
          'campaignId',
          'pollingStationId',
          'mesaNumber',
          'votesCollected',
          'photoEvidenceUrl',
        ]
        for (const field of requiredFields) {
          if (!req.body[field]) {
            return res
              .status(400)
              .json({ message: `El campo '${field}' es requerido.` })
          }
        }
        if (typeof votesCollected !== 'number' || votesCollected < 0) {
          return res
            .status(400)
            .json({ message: 'votesCollected debe ser un número positivo.' })
        }
        if (
          typeof photoEvidenceUrl !== 'string' ||
          photoEvidenceUrl.trim() === ''
        ) {
          return res
            .status(400)
            .json({ message: 'photoEvidenceUrl debe ser una URL válida.' })
        }
        // Validar latitud y longitud si se proporcionan
        if (
          (latitude && typeof latitude !== 'number') ||
          (longitude && typeof longitude !== 'number')
        ) {
          return res.status(400).json({
            message: 'Latitude y Longitude deben ser números válidos.',
          })
        }

        // --- Lógica de Autorización para Escrutador ---
        // Verificar que el usuario tenga una asignación activa y esté habilitado para reportar
        const escrutadorAssignmentRef = db
          .collection('escrutador_assignments')
          .where('escrutadorUid', '==', escrutadorUid)
          .where('campaignId', '==', campaignId)
          .where('pollingStationId', '==', pollingStationId)
          .where('mesaNumber', '==', mesaNumber)
          .where('status', 'in', ['assigned', 'active']) // Puede ser 'assigned' o 'active'
          .where('canReport', '==', true)
          .limit(1)

        const assignmentSnapshot = await escrutadorAssignmentRef.get()

        const campaignDoc = await db
          .collection('campaigns')
          .doc(campaignId)
          .get()
        if (!campaignDoc.exists) {
          return res
            .status(404)
            .json({ message: 'Campaña asociada no encontrada.' })
        }
        const electionDateCampaign = campaignDoc.data().electionDate

        let isAuthorized = false
        if (escrutadorRole === 'admin') {
          isAuthorized = true // Un admin puede reportar sin asignación explícita
        } else if (!assignmentSnapshot.empty) {
          const assignmentData = assignmentSnapshot.docs[0].data()
          // Verificar que la fecha actual esté cerca de la fecha de la elección para permitir reportes
          const today = new Date().toISOString().slice(0, 10)
          // Permitir reporte solo el día de la elección o un rango cercano (ej. +/- 1 día)
          const electionDay =
            assignmentData.electionDate || electionDateCampaign

          // Lógica para rango de fechas (ej. día de la elección +/- 1 día)
          const electionDateTime = new Date(electionDay)
          const todayDateTime = new Date(today)
          const diffTime = Math.abs(electionDateTime - todayDateTime)
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

          if (diffDays <= 1) {
            // Permite reportar el día anterior, el mismo día y el día siguiente
            isAuthorized = true
          } else {
            return res.status(403).json({
              message: `La función de escrutinio solo está activa el día de la elección (${electionDay}) o en sus días cercanos.`,
            })
          }
        }

        if (!isAuthorized) {
          return res.status(403).json({
            message:
              'Acceso denegado: No tienes permiso o asignación activa para registrar resultados en esta mesa.',
          })
        }

        // 2. Guardar el resultado del escrutinio
        const newResultRef = db.collection('escrutinioResults').doc()
        const escrutinioData = {
          id: newResultRef.id,
          campaignId: campaignId,
          pollingStationId: pollingStationId,
          mesaNumber: mesaNumber,
          votesCollected: votesCollected,
          photoEvidenceUrl: photoEvidenceUrl,
          escrutadorUid: escrutadorUid,
          escrutadorRole: escrutadorRole, // Rol del usuario que reporta
          reportedAt: new Date().toISOString(), // Hora de registro automática
          location: {
            // Geolocalización
            latitude: latitude || null,
            longitude: longitude || null,
          },
          status: 'pending_verification', // Estado inicial del reporte
        }
        await newResultRef.set(escrutinioData)

        // 3. Actualizar los totales de votos en la campaña (para monitoreo en tiempo real)
        const campaignRef = db.collection('campaigns').doc(campaignId)
        await db.runTransaction(async (transaction) => {
          const campaignDoc = await transaction.get(campaignRef)
          if (!campaignDoc.exists) {
            // Si la campaña desapareció entre la verificación y la transacción, es un error.
            throw new Error(
              'La campaña asociada no existe durante la transacción.',
            )
          }
          const currentTotalConfirmedVotes =
            campaignDoc.data().totalConfirmedVotes || 0
          const newTotalConfirmedVotes =
            currentTotalConfirmedVotes + votesCollected
          transaction.update(campaignRef, {
            totalConfirmedVotes: newTotalConfirmedVotes,
            updatedAt: new Date().toISOString(),
          })
        })

        return res.status(201).json({
          message: 'Resultado de escrutinio registrado exitosamente.',
          resultId: newResultRef.id,
          campaignId: campaignId,
          mesaNumber: mesaNumber,
          votesCollected: votesCollected,
        })
      } catch (error) {
        console.error('Error en submitEscrutinioResult:', error)
        return res.status(500).json({
          message:
            'Error interno del servidor al registrar resultado de escrutinio.',
          error: error.message,
        })
      }
    })
  },
)

// 2. --- FUNCIÓN PARA ASIGNAR UN ROL DE ESCRUTADOR A UN USUARIO (POST - Protegida) ---
// Permite a un administrador o miembro de campaña autorizado asignar a un usuario como escrutador
// para un puesto de votación y mesa específicos.
export const assignEscrutadorAssignment = functions.https.onRequest(
  { secrets: [JWT_SECRET_KEY_PARAM] },
  async (req, res) => {
    authenticateUserAndAttachRole(req, res, async () => {
      if (req.method !== 'POST') {
        return res.status(405).send('Método no permitido. Solo POST.')
      }

      try {
        const db = getFirestore(getApp())
        const {
          escrutadorUid,
          campaignId,
          pollingStationId, // ID único del puesto de votación
          pollingStationName, // Nombre del puesto de votación
          mesaNumber, // Número de la mesa de votación
          electionDate, // Fecha de la elección para esta asignación (YYYY-MM-DD)
          // Detalles de ubicación del puesto de votación (para reportes geográficos)
          country,
          state,
          city,
          canReport = false, // Permiso inicial para reportar (se habilita en capacitación)
        } = req.body

        // Validaciones básicas de campos requeridos para la asignación
        const requiredFields = [
          'escrutadorUid',
          'campaignId',
          'pollingStationId',
          'pollingStationName',
          'mesaNumber',
          'electionDate',
          'country',
          'state',
          'city',
        ]
        for (const field of requiredFields) {
          if (!req.body[field]) {
            return res
              .status(400)
              .json({ message: `El campo '${field}' es requerido.` })
          }
        }

        // Validación de formato de fecha
        if (!/^\d{4}-\d{2}-\d{2}$/.test(electionDate)) {
          return res.status(400).json({
            message: 'El formato de electionDate debe ser YYYY-MM-DD.',
          })
        }

        // --- Autorización: Solo Admins, Candidatos, Gerentes y Anillos de la campaña pueden asignar escrutadores ---
        const callingUserRole = req.userRole
        const callingUserUid = req.userUid
        const callingUserCampaignMemberships = req.campaignMemberships

        const isAuthorized =
          callingUserRole === 'admin' ||
          callingUserCampaignMemberships.some(
            (m) =>
              m.campaignId === campaignId &&
              (m.role === 'candidato' ||
                m.role === 'manager' ||
                m.role === 'anillo') &&
              m.status === 'activo',
          )

        if (!isAuthorized) {
          return res.status(403).json({
            message:
              'Acceso denegado: Solo administradores, candidatos, gerentes o anillos activos de la campaña pueden asignar escrutadores.',
          })
        }

        // Verificar que el escrutadorUid realmente existe
        const escrutadorDoc = await db
          .collection('users')
          .doc(escrutadorUid)
          .get()
        if (!escrutadorDoc.exists) {
          return res
            .status(404)
            .json({ message: 'El usuario escrutador no existe.' })
        }
        const escrutadorData = escrutadorDoc.data()

        // Verificar que la campaña existe
        const campaignDoc = await db
          .collection('campaigns')
          .doc(campaignId)
          .get()
        if (!campaignDoc.exists) {
          return res
            .status(404)
            .json({ message: 'La campaña especificada no existe.' })
        }

        // Verificar si ya existe una asignación activa para este escrutador en esta mesa/campaña
        const existingAssignmentSnapshot = await db
          .collection('escrutador_assignments')
          .where('escrutadorUid', '==', escrutadorUid)
          .where('campaignId', '==', campaignId)
          .where('pollingStationId', '==', pollingStationId)
          .where('mesaNumber', '==', mesaNumber)
          .where('electionDate', '==', electionDate) // Asegurar que no haya duplicados para la misma elección
          .limit(1)
          .get()

        if (!existingAssignmentSnapshot.empty) {
          return res.status(409).json({
            message:
              'Este usuario ya tiene una asignación activa para esta mesa y campaña en la fecha indicada.',
          })
        }

        // Crear la nueva asignación
        const newAssignmentRef = db.collection('escrutador_assignments').doc()
        const assignmentData = {
          id: newAssignmentRef.id,
          escrutadorUid: escrutadorUid,
          escrutadorName: escrutadorData.name || escrutadorData.nombre || 'N/A', // Nombre del escrutador
          escrutadorEmail: escrutadorData.email,
          campaignId: campaignId,
          campaignName: campaignDoc.data().campaignName,
          pollingStationId: pollingStationId,
          pollingStationName: pollingStationName,
          mesaNumber: mesaNumber,
          electionDate: electionDate,
          country: country,
          state: state,
          city: city,
          canReport: canReport, // Se establece inicialmente aquí, se puede cambiar luego
          assignedByUid: callingUserUid,
          assignedByRole: callingUserRole,
          assignedAt: new Date().toISOString(),
          status: 'assigned', // 'assigned', 'active', 'completed', 'disabled'
        }

        await newAssignmentRef.set(assignmentData)

        return res.status(201).json({
          message: 'Asignación de escrutador creada exitosamente.',
          assignmentId: newAssignmentRef.id,
          escrutadorUid: escrutadorUid,
          campaignId: campaignId,
          mesaNumber: mesaNumber,
        })
      } catch (error) {
        console.error('Error en assignEscrutadorAssignment:', error)
        return res.status(500).json({
          message: 'Error interno del servidor al asignar escrutador.',
          error: error.message,
        })
      }
    })
  },
)

// 3. --- FUNCIÓN PARA IMPORTAR MASIVAMENTE ESCRUTADORES (POST - Protegida por Admin/Campaña) ---
// Permite cargar una lista de usuarios para ser creados/actualizados y asignados como escrutadores.
export const bulkImportEscrutadores = functions.https.onRequest(
  { secrets: [JWT_SECRET_KEY_PARAM] },
  async (req, res) => {
    authenticateUserAndAttachRole(req, res, async () => {
      if (req.method !== 'POST') {
        return res.status(405).send('Método no permitido. Solo POST.')
      }

      try {
        const db = getFirestore(getApp())
        const auth = getAuth(getApp())
        const { escrutadoresData, campaignId, electionDate } = req.body // escrutadoresData es un array de objetos
        const callingUserUid = req.userUid
        const callingUserRole = req.userRole
        const callingUserCampaignMemberships = req.campaignMemberships

        // Validaciones generales
        if (!Array.isArray(escrutadoresData) || escrutadoresData.length === 0) {
          return res.status(400).json({
            message: 'Se requiere un array no vacío de datos de escrutadores.',
          })
        }
        if (!campaignId || !electionDate) {
          return res.status(400).json({
            message:
              'El ID de la campaña y la fecha de la elección son requeridos.',
          })
        }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(electionDate)) {
          return res.status(400).json({
            message: 'El formato de electionDate debe ser YYYY-MM-DD.',
          })
        }

        // Autorización: Solo Admins, Candidatos, Gerentes y Anillos de la campaña.
        const isAuthorized =
          callingUserRole === 'admin' ||
          callingUserCampaignMemberships.some(
            (m) =>
              m.campaignId === campaignId &&
              (m.role === 'candidato' ||
                m.role === 'manager' ||
                m.role === 'anillo') &&
              m.status === 'activo',
          )

        if (!isAuthorized) {
          return res.status(403).json({
            message:
              'Acceso denegado: Solo administradores, candidatos, gerentes o anillos activos de la campaña pueden realizar importaciones masivas de escrutadores.',
          })
        }

        // Verificar que la campaña exista
        const campaignDoc = await db
          .collection('campaigns')
          .doc(campaignId)
          .get()
        if (!campaignDoc.exists) {
          return res
            .status(404)
            .json({ message: 'La campaña especificada no existe.' })
        }
        const campaignName = campaignDoc.data().campaignName

        const results = {
          successCount: 0,
          errorCount: 0,
          details: [],
        }

        // Iterar sobre cada escrutador en la lista
        for (const escrutador of escrutadoresData) {
          try {
            const {
              name,
              email,
              cedula,
              phone,
              whatsapp,
              country,
              state,
              city,
              pollingStationId,
              pollingStationName,
              mesaNumber,
            } = escrutador

            // Validaciones por escrutador individual
            if (
              !name ||
              !email ||
              !cedula ||
              !pollingStationId ||
              !pollingStationName ||
              !mesaNumber
            ) {
              throw new Error(
                `Datos incompletos para escrutador (name, email, cedula, pollingStationId, pollingStationName, mesaNumber son requeridos): ${email || cedula}`,
              )
            }

            let escrutadorUid
            let existingUserDocRef = null
            let existingUserData = null
            let authUserFound = false
            let tempPasswordForNewUser = null // Variable para guardar la contraseña generada para nuevos Auth users

            // 1. Prioridad: Buscar usuario por email en Firebase Auth
            try {
              const userRecord = await auth.getUserByEmail(email)
              escrutadorUid = userRecord.uid
              authUserFound = true
              existingUserDocRef = db.collection('users').doc(escrutadorUid)
              existingUserData = (await existingUserDocRef.get()).data()
            } catch (authError) {
              if (authError.code === 'auth/user-not-found') {
                authUserFound = false
              } else if (authError.code === 'auth/email-already-in-use') {
                throw new Error(
                  `Email '${email}' ya está en uso en Firebase Auth.`,
                )
              } else {
                throw authError // Otros errores inesperados de Auth
              }
            }

            // 2. Si no se encontró por email, buscar por cédula en Firestore
            if (!authUserFound) {
              const userByCedulaSnapshot = await db
                .collection('users')
                .where('cedula', '==', cedula)
                .limit(1)
                .get()
              if (!userByCedulaSnapshot.empty) {
                existingUserDocRef = userByCedulaSnapshot.docs[0].ref
                existingUserData = (await existingUserDocRef.get()).data()
                escrutadorUid = existingUserDocRef.id

                try {
                  await auth.getUser(escrutadorUid)
                  authUserFound = true // Sí, existe cuenta Auth con este UID
                } catch (authErrorByUid) {
                  if (authErrorByUid.code === 'auth/user-not-found') {
                    // No existe cuenta Auth con este UID. Crear una.
                    tempPasswordForNewUser = generateRandomPassword() // Generate password here
                    const newAuthRecord = await auth.createUser({
                      email: email,
                      password: tempPasswordForNewUser, // Use generated password
                      displayName: name,
                      uid: escrutadorUid, // Usar UID existente de Firestore
                    })
                    escrutadorUid = newAuthRecord.uid
                    authUserFound = true
                  } else {
                    throw authErrorByUid
                  }
                }
              }
            }

            // 3. Si aún no se encontró, crear usuario Auth completamente nuevo
            if (!authUserFound) {
              tempPasswordForNewUser = generateRandomPassword() // Generate password here
              const newAuthRecord = await auth.createUser({
                email: email,
                password: tempPasswordForNewUser, // Use generated password
                displayName: name,
              })
              escrutadorUid = newAuthRecord.uid
            }

            // Asegurar que existingUserDocRef y existingUserData estén correctos para el escrutadorUid final
            if (
              !existingUserDocRef ||
              existingUserDocRef.id !== escrutadorUid
            ) {
              existingUserDocRef = db.collection('users').doc(escrutadorUid)
              existingUserData = (await existingUserDocRef.get()).data() // Puede ser null si es un usuario totalmente nuevo
            }

            // 4. Actualizar/Crear perfil de usuario en Firestore (collection 'users')
            let userProfileData = {
              id: escrutadorUid,
              name: name,
              email: email,
              cedula: cedula,
              whatsapp: whatsapp || null,
              phone: phone || null,
              location: {
                country: country || 'Colombia',
                state: state || null,
                city: city || null,
                votingStation: pollingStationName || null, // Usar nombre del puesto como votingStation
              },
              role: existingUserData?.role || 'votante', // Mantener rol existente o default a 'votante'
              status: 'activo', // Los escrutadores son usuarios activos
              createdAt:
                existingUserData?.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              registeredViaAuthUid: callingUserUid, // Importado por admin/campaign user
              lastLogin: existingUserData?.lastLogin || null,
              campaignMemberships: existingUserData?.campaignMemberships || [],
            }

            // Si es un usuario existente, no sobrescribir su rol principal si ya es Candidato/Manager/Anillo/Admin
            if (existingUserData && existingUserData.id === escrutadorUid) {
              if (
                ['candidato', 'manager', 'ring', 'admin'].includes(
                  existingUserData.role,
                )
              ) {
                userProfileData.role = existingUserData.role
              }
            }

            await existingUserDocRef.set(userProfileData, { merge: true })

            // 5. Si es un usuario nuevo de Auth, guardar la contraseña temporal
            //    Ahora tempPasswordForNewUser está disponible y es la que se usó para crear el usuario Auth.
            if (tempPasswordForNewUser) {
              const hashedPassword = await bcrypt.hash(
                tempPasswordForNewUser,
                saltRounds,
              ) // <-- Corregido aquí
              await db.collection('user_credentials').doc(escrutadorUid).set(
                {
                  firebaseAuthUid: escrutadorUid,
                  cedula: cedula,
                  hashedPassword: hashedPassword,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
                { merge: true },
              )
              // NOTA: En un entorno real, enviar la contraseña temporal por email/SMS al escrutador
            }

            // 6. Crear/Actualizar asignación de escrutador
            // Buscar si ya existe una asignación activa para este escrutador en esta mesa/campaña
            const existingAssignmentSnapshot = await db
              .collection('escrutador_assignments')
              .where('escrutadorUid', '==', escrutadorUid)
              .where('campaignId', '==', campaignId)
              .where('pollingStationId', '==', pollingStationId)
              .where('mesaNumber', '==', mesaNumber)
              .where('electionDate', '==', electionDate)
              .limit(1)
              .get()

            let assignmentId
            if (!existingAssignmentSnapshot.empty) {
              // Actualizar asignación existente
              const assignmentDocRef = existingAssignmentSnapshot.docs[0].ref
              assignmentId = assignmentDocRef.id
              await assignmentDocRef.update({
                pollingStationName: pollingStationName,
                country: country || 'Colombia',
                state: state || null,
                city: city || null,
                canReport: true, // Asumimos que la importación masiva los habilita
                updatedAt: new Date().toISOString(),
                assignedByUid: callingUserUid,
                assignedByRole: callingUserRole,
                status: 'active', // Marcar como activo si se actualiza
              })
            } else {
              // Crear nueva asignación
              const newAssignmentRef = db
                .collection('escrutador_assignments')
                .doc()
              assignmentId = newAssignmentRef.id
              await newAssignmentRef.set({
                id: assignmentId,
                escrutadorUid: escrutadorUid,
                escrutadorName: name,
                escrutadorEmail: email,
                campaignId: campaignId,
                campaignName: campaignName,
                pollingStationId: pollingStationId,
                pollingStationName: pollingStationName,
                mesaNumber: mesaNumber,
                electionDate: electionDate,
                country: country || 'Colombia',
                state: state || null,
                city: city || null,
                canReport: true, // Se habilita por la importación masiva
                assignedByUid: callingUserUid,
                assignedByRole: callingUserRole,
                assignedAt: new Date().toISOString(),
                status: 'assigned',
              })
            }

            results.successCount++
            results.details.push({
              email: email,
              cedula: cedula,
              status: 'success',
              assignmentId: assignmentId,
              message: 'Usuario y asignación procesados.',
            })
          } catch (error) {
            results.errorCount++
            results.details.push({
              email: escrutador.email || 'N/A',
              cedula: escrutador.cedula || 'N/A',
              status: 'error',
              message: error.message,
            })
            console.error(
              `Error procesando escrutador ${escrutador.email || escrutador.cedula}:`,
              error.message,
            )
          }
        }

        return res.status(200).json({
          message: `Importación masiva completada. ${results.successCount} éxitos, ${results.errorCount} errores.`,
          summary: results,
        })
      } catch (error) {
        console.error('Error en bulkImportEscrutadores Cloud Function:', error)
        return res.status(500).json({
          message: 'Error interno del servidor durante la importación masiva.',
          error: error.message,
        })
      }
    })
  },
)

// 4. --- FUNCIÓN PARA EXPORTAR LISTA DE ESCRUTADORES (GET - Protegida) ---
// Permite a usuarios autorizados descargar una lista de escrutadores de una campaña en formato CSV.
export const exportEscrutadoresList = functions.https.onRequest(
  { secrets: [JWT_SECRET_KEY_PARAM] },
  async (req, res) => {
    // Reutiliza el middleware de autenticación
    authenticateUserAndAttachRole(req, res, async () => {
      if (req.method !== 'GET') {
        return res.status(405).send('Método no permitido. Solo GET.')
      }

      try {
        const db = getFirestore(getApp())
        const {
          campaignId,
          columns = 'escrutadorName,escrutadorEmail,cedula,city,state,pollingStationName,mesaNumber',
        } = req.query // columnas separadas por coma
        const callingUserRole = req.userRole
        const callingUserCampaignMemberships = req.campaignMemberships

        // Validaciones
        if (!campaignId) {
          return res
            .status(400)
            .json({ message: 'El ID de la campaña es requerido.' })
        }

        // Autorización: Solo Admins, Candidatos, Gerentes, Anillos de la campaña pueden exportar.
        const isAuthorized =
          callingUserRole === 'admin' ||
          callingUserCampaignMemberships.some(
            (m) =>
              m.campaignId === campaignId &&
              (m.role === 'candidato' ||
                m.role === 'manager' ||
                m.role === 'anillo') &&
              m.status === 'activo',
          )

        if (!isAuthorized) {
          return res.status(403).json({
            message:
              'Acceso denegado: No tienes permiso para exportar la lista de escrutadores de esta campaña.',
          })
        }

        // Verificar que la campaña exista
        const campaignDoc = await db
          .collection('campaigns')
          .doc(campaignId)
          .get()
        if (!campaignDoc.exists) {
          return res.status(404).json({ message: 'Campaña no encontrada.' })
        }

        // Obtener asignaciones de escrutadores para la campaña
        const assignmentsSnapshot = await db
          .collection('escrutador_assignments')
          .where('campaignId', '==', campaignId)
          .get()

        if (assignmentsSnapshot.empty) {
          return res
            .status(200)
            .send('No se encontraron escrutadores para esta campaña.')
        }

        const escrutadores = assignmentsSnapshot.docs.map((doc) => doc.data())

        // Procesar columnas seleccionadas
        const requestedColumns = columns.split(',').map((col) => col.trim())
        const defaultColumns = [
          'escrutadorName',
          'escrutadorEmail',
          'cedula',
          'city',
          'state',
          'pollingStationName',
          'mesaNumber',
        ]
        // Usar las columnas solicitadas o las por defecto si no se especificaron
        const finalColumns =
          requestedColumns.length > 0 && requestedColumns[0] !== ''
            ? requestedColumns
            : defaultColumns

        let csvContent = ''
        // Añadir encabezados CSV
        csvContent +=
          finalColumns
            .map((col) => {
              // Mapeo amigable para los encabezados si es necesario
              switch (col) {
                case 'escrutadorName':
                  return 'Nombre Escrutador'
                case 'escrutadorEmail':
                  return 'Email Escrutador'
                case 'cedula':
                  return 'Cédula'
                case 'city':
                  return 'Ciudad'
                case 'state':
                  return 'Departamento'
                case 'pollingStationName':
                  return 'Puesto de Votación'
                case 'mesaNumber':
                  return 'Mesa'
                case 'electionDate':
                  return 'Fecha Elección'
                case 'assignedByUid':
                  return 'Asignado Por UID'
                case 'status':
                  return 'Estado Asignación'
                // Añadir otros mapeos si se necesitan más columnas
                default:
                  return col // Si no hay mapeo, usa el nombre de la columna directamente
              }
            })
            .map((header) => `"${header.replace(/"/g, '""')}"`)
            .join(',') + '\n'

        // Añadir filas de datos
        escrutadores.forEach((escrutador) => {
          const row = finalColumns
            .map((col) => {
              let value
              // Manejar campos anidados (ej. location.city)
              if (col.includes('.')) {
                const parts = col.split('.')
                let current = escrutador
                for (const part of parts) {
                  if (
                    current &&
                    typeof current === 'object' &&
                    part in current
                  ) {
                    current = current[part]
                  } else {
                    current = undefined // Campo no encontrado en el camino
                    break
                  }
                }
                value = current
              } else {
                value = escrutador[col]
              }

              // Asegurar que el valor sea una cadena y escapar comillas
              const stringValue =
                value === null || value === undefined ? '' : String(value)
              return `"${stringValue.replace(/"/g, '""')}"`
            })
            .join(',')
          csvContent += row + '\n'
        })

        // Configurar cabeceras de respuesta para descarga de archivo CSV
        res.set('Content-Type', 'text/csv; charset=utf-8')
        res.set(
          'Content-Disposition',
          `attachment; filename="escrutadores_${campaignDoc.data().campaignName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv"`,
        )
        res.status(200).send(csvContent)
      } catch (error) {
        console.error('Error en exportEscrutadoresList:', error)
        return res.status(500).json({
          message:
            'Error interno del servidor al exportar la lista de escrutadores.',
          error: error.message,
        })
      }
    })
  },
)

// 5. --- FUNCIÓN PARA OBTENER LISTA DE ASIGNACIONES DE ESCRUTADORES (GET - Protegida) ---
// Permite a usuarios autorizados obtener asignaciones de escrutadores para una campaña, con filtros.
export const getEscrutadorAssignments = functions.https.onRequest(
  { secrets: [JWT_SECRET_KEY_PARAM] },
  async (req, res) => {
    authenticateUserAndAttachRole(req, res, async () => {
      if (req.method !== 'GET') {
        return res.status(405).send('Método no permitido. Solo GET.')
      }

      try {
        const db = getFirestore(getApp())
        const {
          campaignId,
          status,
          pollingStationId,
          mesaNumber,
          city,
          state,
          electionDate,
          limit,
          offset,
        } = req.query
        const callingUserRole = req.userRole
        const callingUserCampaignMemberships = req.campaignMemberships

        // Validaciones básicas
        if (!campaignId) {
          return res
            .status(400)
            .json({ message: 'El ID de la campaña es requerido.' })
        }

        // Autorización: Solo Admins o miembros activos de la campaña pueden ver sus asignaciones.
        const isAuthorized =
          callingUserRole === 'admin' ||
          callingUserCampaignMemberships.some(
            (m) => m.campaignId === campaignId && m.status === 'activo',
          )

        if (!isAuthorized) {
          return res.status(403).json({
            message:
              'Acceso denegado: No tienes permiso para ver las asignaciones de esta campaña.',
          })
        }

        // Verificar que la campaña exista
        const campaignDoc = await db
          .collection('campaigns')
          .doc(campaignId)
          .get()
        if (!campaignDoc.exists) {
          return res.status(404).json({ message: 'Campaña no encontrada.' })
        }

        let assignmentsQuery = db
          .collection('escrutador_assignments')
          .where('campaignId', '==', campaignId)

        // Aplicar filtros opcionales
        if (status)
          assignmentsQuery = assignmentsQuery.where('status', '==', status)
        if (pollingStationId)
          assignmentsQuery = assignmentsQuery.where(
            'pollingStationId',
            '==',
            pollingStationId,
          )
        if (mesaNumber)
          assignmentsQuery = assignmentsQuery.where(
            'mesaNumber',
            '==',
            mesaNumber,
          )
        if (city) assignmentsQuery = assignmentsQuery.where('city', '==', city)
        if (state)
          assignmentsQuery = assignmentsQuery.where('state', '==', state)
        if (electionDate) {
          if (!/^\d{4}-\d{2}-\d{2}$/.test(electionDate)) {
            return res.status(400).json({
              message: 'El formato de electionDate debe ser YYYY-MM-DD.',
            })
          }
          assignmentsQuery = assignmentsQuery.where(
            'electionDate',
            '==',
            electionDate,
          )
        }

        // Paginación
        if (limit)
          assignmentsQuery = assignmentsQuery.limit(parseInt(limit, 10))
        if (offset)
          assignmentsQuery = assignmentsQuery.offset(parseInt(offset, 10))

        const assignmentsSnapshot = await assignmentsQuery.get()
        const assignments = assignmentsSnapshot.docs.map((doc) => doc.data())

        return res.status(200).json({
          message: 'Asignaciones de escrutadores recuperadas exitosamente.',
          assignments: assignments,
        })
      } catch (error) {
        console.error('Error en getEscrutadorAssignments:', error)
        return res.status(500).json({
          message:
            'Error interno del servidor al obtener asignaciones de escrutadores.',
          error: error.message,
        })
      }
    })
  },
)

// 6. --- FUNCIÓN PARA ELIMINAR UNA ASIGNACIÓN DE ESCRUTADOR (DELETE - Protegida) ---
// Permite a administradores o miembros de campaña autorizados eliminar una asignación específica.
export const deleteEscrutadorAssignment = functions.https.onRequest(
  { secrets: [JWT_SECRET_KEY_PARAM] },
  async (req, res) => {
    authenticateUserAndAttachRole(req, res, async () => {
      if (req.method !== 'DELETE') {
        return res.status(405).send('Método no permitido. Solo DELETE.')
      }

      try {
        const db = getFirestore(getApp())
        const { assignmentId } = req.body // El ID de la asignación a eliminar
        const callingUserRole = req.userRole
        const callingUserUid = req.userUid
        const callingUserCampaignMemberships = req.campaignMemberships

        // Validaciones básicas
        if (!assignmentId) {
          return res
            .status(400)
            .json({ message: 'El ID de la asignación es requerido.' })
        }

        const assignmentRef = db
          .collection('escrutador_assignments')
          .doc(assignmentId)
        const assignmentDoc = await assignmentRef.get()

        if (!assignmentDoc.exists) {
          return res
            .status(404)
            .json({ message: 'La asignación de escrutador no fue encontrada.' })
        }

        const assignmentData = assignmentDoc.data()
        const assignedCampaignId = assignmentData.campaignId

        // --- Autorización para eliminar: ---
        // Admins pueden eliminar cualquier asignación.
        // Candidatos, Gerentes, Anillos solo pueden eliminar asignaciones de SU campaña
        const isAuthorized =
          callingUserRole === 'admin' ||
          callingUserCampaignMemberships.some(
            (m) =>
              m.campaignId === assignedCampaignId &&
              (m.role === 'candidato' ||
                m.role === 'manager' ||
                m.role === 'anillo') &&
              m.status === 'activo',
          )

        if (!isAuthorized) {
          return res.status(403).json({
            message:
              'Acceso denegado: No tienes permiso para eliminar esta asignación.',
          })
        }

        // Eliminar la asignación
        await assignmentRef.delete()

        return res.status(200).json({
          message: 'Asignación de escrutador eliminada exitosamente.',
          assignmentId: assignmentId,
        })
      } catch (error) {
        console.error('Error en deleteEscrutadorAssignment:', error)
        return res.status(500).json({
          message:
            'Error interno del servidor al eliminar la asignación de escrutador.',
          error: error.message,
        })
      }
    })
  },
)

// 7. --- FUNCIÓN PARA ACTUALIZAR UNA MEMBRESÍA DE CAMPAÑA (PATCH - Protegida) ---
// Permite actualizar campos específicos de la membresía de un usuario en una campaña.
export const updateCampaignMembership = functions.https.onRequest(
  { secrets: [JWT_SECRET_KEY_PARAM] },
  async (req, res) => {
    authenticateUserAndAttachRole(req, res, async () => {
      if (req.method !== 'PATCH') {
        return res.status(405).send('Método no permitido. Solo PATCH.')
      }

      try {
        const db = getFirestore(getApp())
        const { userId, campaignId, updates } = req.body
        const callingUserUid = req.userUid
        const callingUserRole = req.userRole
        const callingUserCampaignMemberships = req.campaignMemberships

        // Validaciones básicas
        if (
          !userId ||
          !campaignId ||
          !updates ||
          Object.keys(updates).length === 0
        ) {
          return res
            .status(400)
            .json({ message: 'userId, campaignId y updates son requeridos.' })
        }

        const userDocRef = db.collection('users').doc(userId)
        const userDoc = await userDocRef.get()

        if (!userDoc.exists) {
          return res.status(404).json({ message: 'Usuario no encontrado.' })
        }

        const userData = userDoc.data()
        let campaignMemberships = userData.campaignMemberships || []
        const membershipIndex = campaignMemberships.findIndex(
          (m) => m.campaignId === campaignId,
        )

        if (membershipIndex === -1) {
          return res.status(404).json({
            message: 'Membresía de campaña no encontrada para este usuario.',
          })
        }

        const currentMembership = campaignMemberships[membershipIndex]
        let potentialVotesChange = 0

        // --- Autorización para actualizar: ---
        // 1. Un usuario puede actualizar su propio votoPromesa (si userId es él mismo).
        // 2. Un superior (admin, candidato, manager, anillo) puede actualizar el votoEsperado de un subordinado directo.
        // 3. Admins pueden actualizar cualquier campo.

        let isAuthorized = false

        // Si es admin, está autorizado.
        if (callingUserRole === 'admin') {
          isAuthorized = true
        }
        // Si el usuario está actualizando su propia membresía
        else if (userId === callingUserUid) {
          // Solo puede actualizar su votoPromesa
          if (
            updates.votoPromesa !== undefined &&
            Object.keys(updates).length === 1
          ) {
            // Solo si solo actualiza votoPromesa
            isAuthorized = true
          } else {
            return res.status(403).json({
              message:
                'Acceso denegado: Solo puedes actualizar tu propio "votoPromesa".',
            })
          }
        }
        // Si no es admin y no es el propio usuario, debe ser un superior actualizando un subordinado
        else {
          // Verificar si el callingUserUid es el parentId (ownerBy) de este userId en esta campaña
          // Y si está intentando actualizar 'votoEsperado'
          const callingUserIsDirectSuperior =
            currentMembership.ownerBy === callingUserUid

          if (
            callingUserIsDirectSuperior &&
            updates.votoEsperado !== undefined
          ) {
            // Verificar que el callingUser sea un rol que pueda tener subordinados y que esté activo en la campaña
            const callingUserIsActiveCampaignMember =
              callingUserCampaignMemberships.some(
                (m) =>
                  m.campaignId === campaignId &&
                  (m.role === 'candidato' ||
                    m.role === 'manager' ||
                    m.role === 'anillo' ||
                    m.role === 'votante') && // Votantes también pueden tener subordinados via QR
                  m.status === 'activo' &&
                  m.campaignId === campaignId, // Asegurar que el superior esté en la misma campaña
              )

            if (callingUserIsActiveCampaignMember) {
              isAuthorized = true
            }
          }
          if (!isAuthorized) {
            // Si ya no se autorizó por las condiciones anteriores
            return res.status(403).json({
              message:
                'Acceso denegado: Solo el usuario o su superior directo pueden actualizar esta membresía.',
            })
          }
        }

        // Aplicar actualizaciones permitidas y calcular cambio en votoEsperado
        if (updates.votoPromesa !== undefined) {
          currentMembership.votoPromesa = updates.votoPromesa
        }

        if (updates.votoEsperado !== undefined) {
          const oldVotoEsperado = currentMembership.votoEsperado || 0
          const newVotoEsperado = updates.votoEsperado

          // Calcular el cambio para la propagación
          potentialVotesChange = newVotoEsperado - oldVotoEsperado
          currentMembership.votoEsperado = newVotoEsperado
        }

        // Puedes añadir otros campos que se puedan actualizar si es necesario,
        // siempre con su lógica de autorización correspondiente.
        // Ej: if (updates.status !== undefined) { currentMembership.status = updates.status; }

        // Actualizar el array de membresías
        campaignMemberships[membershipIndex] = currentMembership
        await userDocRef.update({
          campaignMemberships: campaignMemberships,
          updatedAt: new Date().toISOString(),
        })

        // Si hubo un cambio en votoEsperado, iniciar la propagación
        if (potentialVotesChange !== 0) {
          await propagatePotentialVotes(
            db,
            campaignId,
            userId,
            potentialVotesChange,
          )
        }

        return res.status(200).json({
          message: 'Membresía de campaña actualizada exitosamente.',
          updatedFields: Object.keys(updates),
          userId: userId,
          campaignId: campaignId,
        })
      } catch (error) {
        console.error('Error en updateCampaignMembership:', error)
        return res.status(500).json({
          message:
            'Error interno del servidor al actualizar la membresía de campaña.',
          error: error.message,
        })
      }
    })
  },
)

// 8. --- FUNCIÓN PARA REGISTRAR VOTOS DIRECTOS POR UN MIEMBRO DE CAMPAÑA (POST - Protegida) ---
// Permite a un votante (o miembro de pirámide) registrar votos confirmados personalmente.
export const submitDirectVote = functions.https.onRequest(
  { secrets: [JWT_SECRET_KEY_PARAM] },
  async (req, res) => {
    authenticateUserAndAttachRole(req, res, async () => {
      if (req.method !== 'POST') {
        return res.status(405).send('Método no permitido. Solo POST.')
      }

      try {
        const db = getFirestore(getApp())
        const { campaignId, votesCount } = req.body
        const reportingUserUid = req.userUid
        const reportingUserRole = req.userRole

        // Validaciones
        if (
          !campaignId ||
          votesCount === undefined ||
          typeof votesCount !== 'number' ||
          votesCount <= 0
        ) {
          return res.status(400).json({
            message:
              'campaignId y votesCount (número positivo) son requeridos.',
          })
        }

        const userDocRef = db.collection('users').doc(reportingUserUid)
        const userDoc = await userDocRef.get()

        if (!userDoc.exists) {
          return res
            .status(404)
            .json({ message: 'Usuario reportando votos no encontrado.' })
        }

        const userData = userDoc.data()
        let campaignMemberships = userData.campaignMemberships || []
        const membershipIndex = campaignMemberships.findIndex(
          (m) => m.campaignId === campaignId,
        )

        if (
          membershipIndex === -1 ||
          campaignMemberships[membershipIndex].status !== 'activo'
        ) {
          return res.status(403).json({
            message:
              'No eres un miembro activo de esta campaña para registrar votos.',
          })
        }

        const currentMembership = campaignMemberships[membershipIndex]

        // Autorización: Solo Candidatos, Gerentes, Anillos y Votantes pueden registrar votos directos.
        // Los administradores no registran votos directos de la pirámide, lo hacen vía escrutinio.
        if (
          !['candidato', 'manager', 'anillo', 'votante'].includes(
            reportingUserRole,
          )
        ) {
          return res
            .status(403)
            .json({ message: 'Tu rol no te permite registrar votos directos.' })
        }

        // Actualizar directVotes en la membresía del usuario que reporta
        currentMembership.directVotes =
          (currentMembership.directVotes || 0) + votesCount
        campaignMemberships[membershipIndex] = currentMembership
        await userDocRef.update({
          campaignMemberships: campaignMemberships,
          updatedAt: new Date().toISOString(),
        })

        // Propagar los votos reales hacia arriba en la pirámide
        await propagateRealVotes(db, campaignId, reportingUserUid, votesCount)

        return res.status(200).json({
          message: `Se registraron ${votesCount} votos directos exitosamente para el usuario y se propagaron.`,
          userId: reportingUserUid,
          campaignId: campaignId,
          newDirectVotes: currentMembership.directVotes,
        })
      } catch (error) {
        console.error('Error en submitDirectVote:', error)
        return res.status(500).json({
          message: 'Error interno del servidor al registrar votos directos.',
          error: error.message,
        })
      }
    })
  },
)
