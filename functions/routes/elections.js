import * as functions from 'firebase-functions'
import { getFirestore, FieldValue } from 'firebase-admin/firestore' // Asegúrate de importar FieldValue si es necesario
import { getAuth } from 'firebase-admin/auth'
import { getApp } from 'firebase-admin/app' // getApp es de firebase-admin/app (CORREGIDO)
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { defineSecret } from 'firebase-functions/params'

// Secreto para firmar y verificar los JSON Web Tokens (JWT)
// Definido localmente para este archivo, siguiendo el principio de independencia
const JWT_SECRET_KEY_PARAM = defineSecret('BJS_JWT_SECRET_KEY')

// Número de rondas de sal para bcrypt
const saltRounds = 10 // Definido localmente para este archivo

// Middleware de autenticación y adjuntar rol/UID a la solicitud
// Definido localmente para este archivo, siguiendo el principio de independencia
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
        // CORREGIDO: Usar functions.logger.error
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
    functions.logger.error('Error de autenticación (JWT):', error) // CORREGIDO: Usar functions.logger.error
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
// Mantenida localmente para este archivo
const generateRandomPassword = (length = 10) => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

// Función auxiliar para propagar votos potenciales a través de la pirámide
// Mantenida localmente para este archivo
async function propagatePotentialVotes(db, campaignId, userId, changeAmount) {
  try {
    let currentUserId = userId
    while (currentUserId) {
      const userDocRef = db.collection('users').doc(currentUserId)
      const userDoc = await userDocRef.get()

      if (!userDoc.exists) {
        functions.logger.warn(
          // Usar functions.logger.warn
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
        functions.logger.warn(
          // Usar functions.logger.warn
          `Membresía de campaña ${campaignId} no encontrada para el usuario ${currentUserId} durante la propagación.`,
        )
        break // Salir si la membresía no existe
      }

      const currentMembership = campaignMemberships[membershipIndex]

      // Actualizar el totalPotentialVotes del miembro actual
      currentMembership.totalPotentialVotes =
        (currentMembership.totalPotentialVotes || 0) + changeAmount
      campaignMemberships[membershipIndex] = currentMembership // Actualizar el objeto en el array

      await userDocRef.update({
        campaignMemberships: campaignMemberships,
        updatedAt: new Date().toISOString(),
      })
      functions.logger.log(
        // Usar functions.logger.log
        `Usuario ${currentUserId}: totalPotentialVotes actualizado en ${changeAmount}.`,
      )

      // Mover al padre para la siguiente iteración
      currentUserId = currentMembership.ownerBy // Usar ownerBy para subir por la pirámide
      if (currentUserId === userData.id && userData.role === 'candidato') {
        // Si es el candidato y su ownerBy es él mismo, el bucle termina después de actualizarlo
        currentUserId = null
      }
    }

    // Al final, actualizar el totalPotentialVotes de la campaña principal
    const campaignRef = db.collection('campaigns').doc(campaignId)
    await campaignRef.update({
      totalPotentialVotes: FieldValue.increment(changeAmount),
      updatedAt: new Date().toISOString(),
    })
    functions.logger.log(
      // Usar functions.logger.log
      `Campaña ${campaignId}: totalPotentialVotes final actualizado en ${changeAmount}.`,
    )
  } catch (error) {
    functions.logger.error(
      'Error durante la propagación de votos potenciales:',
      error,
    ) // Usar functions.logger.error
    throw error // Relanzar el error para que la función que la llamó lo maneje
  }
}

// Función auxiliar para propagar Votos Reales (directVotes y pyramidVotes) - ¡Ahora exportada!
export async function propagateRealVotes(db, campaignId, userId, changeAmount) {
  // <--- CORREGIDO: Añadido 'export'
  try {
    // 1. Actualizar el totalConfirmedVotes de la campaña principal
    const campaignRef = db.collection('campaigns').doc(campaignId)
    await campaignRef.update({
      totalConfirmedVotes: FieldValue.increment(changeAmount),
      updatedAt: new Date().toISOString(),
    })
    functions.logger.log(
      // Usar functions.logger.log
      `Campaña ${campaignId}: totalConfirmedVotes actualizado en ${changeAmount}.`,
    )

    // 2. Recorrer la pirámide hacia arriba para actualizar pyramidVotes
    let currentUserId = userId
    while (currentUserId) {
      const userDocRef = db.collection('users').doc(currentUserId)
      const userDoc = await userDocRef.get()

      if (!userDoc.exists) {
        functions.logger.warn(
          // Usar functions.logger.warn
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
          // Usar functions.logger.warn
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
        // Usar functions.logger.log
        `Usuario ${currentUserId}: pyramidVotes actualizado en ${changeAmount}.`,
      )

      // Mover al padre para la siguiente iteración
      currentUserId = currentMembership.ownerBy
      if (currentUserId === userData.id && userData.role === 'candidato') {
        currentUserId = null // Terminar el bucle si es el candidato raíz
      }
    }
  } catch (error) {
    functions.logger.error(
      'Error durante la propagación de votos reales:',
      error,
    ) // Usar functions.logger.error
    throw error
  }
}

// 1. --- FUNCIÓN PARA REGISTRAR RESULTADOS DE ESCRUTINIO (POST - Protegida por Escrutador) ---
export const submitEscrutinioResult = functions.https.onRequest(
  { secrets: [JWT_SECRET_KEY_PARAM] },
  async (req, res) => {
    // Aplica el middleware de autenticación
    await authenticateUserAndAttachRole(req, res, async () => {
      if (req.method !== 'POST') {
        return res.status(405).send('Método no permitido. Solo POST.')
      }

      try {
        const db = getFirestore(getApp()) // Inicializa Firestore
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
        const escrutadorAssignmentRef = db
          .collection('escrutador_assignments')
          .where('escrutadorUid', '==', escrutadorUid)
          .where('campaignId', '==', campaignId)
          .where('pollingStationId', '==', pollingStationId)
          .where('mesaNumber', '==', mesaNumber)
          .where('status', 'in', ['assigned', 'active'])
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
          isAuthorized = true
        } else if (!assignmentSnapshot.empty) {
          const assignmentData = assignmentSnapshot.docs[0].data()
          const today = new Date().toISOString().slice(0, 10)
          const electionDay =
            assignmentData.electionDate || electionDateCampaign

          const electionDateTime = new Date(electionDay)
          const todayDateTime = new Date(today)
          const diffTime = Math.abs(electionDateTime - todayDateTime)
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

          if (diffDays <= 1) {
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

        const newResultRef = db.collection('escrutinioResults').doc()
        const escrutinioData = {
          id: newResultRef.id,
          campaignId: campaignId,
          pollingStationId: pollingStationId,
          mesaNumber: mesaNumber,
          votesCollected: votesCollected,
          photoEvidenceUrl: photoEvidenceUrl,
          escrutadorUid: escrutadorUid,
          escrutadorRole: escrutadorRole,
          reportedAt: new Date().toISOString(),
          location: {
            latitude: latitude || null,
            longitude: longitude || null,
          },
          status: 'pending_verification',
        }
        await newResultRef.set(escrutinioData)

        const campaignRef = db.collection('campaigns').doc(campaignId)
        await db.runTransaction(async (transaction) => {
          const campaignDoc = await transaction.get(campaignRef)
          if (!campaignDoc.exists) {
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
        functions.logger.error('Error en submitEscrutinioResult:', error) // Usar functions.logger.error
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
          pollingStationId,
          pollingStationName,
          mesaNumber,
          electionDate,
          country,
          state,
          city,
          canReport = false,
        } = req.body

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

        if (!/^\d{4}-\d{2}-\d{2}$/.test(electionDate)) {
          return res.status(400).json({
            message: 'El formato de electionDate debe ser YYYY-MM-DD.',
          })
        }

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

        const campaignDoc = await db
          .collection('campaigns')
          .doc(campaignId)
          .get()
        if (!campaignDoc.exists) {
          return res
            .status(404)
            .json({ message: 'La campaña especificada no existe.' })
        }

        const existingAssignmentSnapshot = await db
          .collection('escrutador_assignments')
          .where('escrutadorUid', '==', escrutadorUid)
          .where('campaignId', '==', campaignId)
          .where('pollingStationId', '==', pollingStationId)
          .where('mesaNumber', '==', mesaNumber)
          .where('electionDate', '==', electionDate)
          .limit(1)
          .get()

        if (!existingAssignmentSnapshot.empty) {
          return res.status(409).json({
            message:
              'Este usuario ya tiene una asignación activa para esta mesa y campaña en la fecha indicada.',
          })
        }

        const newAssignmentRef = db.collection('escrutador_assignments').doc()
        const assignmentData = {
          id: newAssignmentRef.id,
          escrutadorUid: escrutadorUid,
          escrutadorName: escrutadorData.name || escrutadorData.nombre || 'N/A',
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
          canReport: canReport,
          assignedByUid: callingUserUid,
          assignedByRole: callingUserRole,
          assignedAt: new Date().toISOString(),
          status: 'assigned',
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
        functions.logger.error('Error en assignEscrutadorAssignment:', error) // Usar functions.logger.error
        return res.status(500).json({
          message: 'Error interno del servidor al asignar escrutador.',
          error: error.message,
        })
      }
    })
  },
)

// 3. --- FUNCIÓN PARA IMPORTAR MASIVAMENTE ESCRUTADORES (POST - Protegida por Admin/Campaña) ---
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
        const { escrutadoresData, campaignId, electionDate } = req.body
        const callingUserUid = req.userUid
        const callingUserRole = req.userRole
        const callingUserCampaignMemberships = req.campaignMemberships

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
            let tempPasswordForNewUser = null

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
                throw authError
              }
            }

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
                  authUserFound = true
                } catch (authErrorByUid) {
                  if (authErrorByUid.code === 'auth/user-not-found') {
                    tempPasswordForNewUser = generateRandomPassword()
                    const newAuthRecord = await auth.createUser({
                      email: email,
                      password: tempPasswordForNewUser,
                      displayName: name,
                      uid: escrutadorUid,
                    })
                    escrutadorUid = newAuthRecord.uid
                    authUserFound = true
                  } else {
                    throw authErrorByUid
                  }
                }
              }
            }

            if (!authUserFound) {
              tempPasswordForNewUser = generateRandomPassword()
              const newAuthRecord = await auth.createUser({
                email: email,
                password: tempPasswordForNewUser,
                displayName: name,
              })
              escrutadorUid = newAuthRecord.uid
            }

            if (
              !existingUserDocRef ||
              existingUserDocRef.id !== escrutadorUid
            ) {
              existingUserDocRef = db.collection('users').doc(escrutadorUid)
              existingUserData = (await existingUserDocRef.get()).data()
            }

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
                votingStation: pollingStationName || null,
              },
              role: existingUserData?.role || 'votante',
              status: 'activo',
              createdAt:
                existingUserData?.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              registeredViaAuthUid: callingUserUid,
              lastLogin: existingUserData?.lastLogin || null,
              campaignMemberships: existingUserData?.campaignMemberships || [],
            }

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

            if (tempPasswordForNewUser) {
              const hashedPassword = await bcrypt.hash(
                tempPasswordForNewUser,
                saltRounds,
              )
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
            }

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
              const assignmentDocRef = existingAssignmentSnapshot.docs[0].ref
              assignmentId = assignmentDocRef.id
              await assignmentDocRef.update({
                pollingStationName: pollingStationName,
                country: country || 'Colombia',
                state: state || null,
                city: city || null,
                canReport: true,
                updatedAt: new Date().toISOString(),
                assignedByUid: callingUserUid,
                assignedByRole: callingUserRole,
                status: 'active',
              })
            } else {
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
                canReport: true,
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
              // Manteniendo console.error
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
        console.error('Error en bulkImportEscrutadores Cloud Function:', error) // Manteniendo console.error
        return res.status(500).json({
          message: 'Error interno del servidor durante la importación masiva.',
          error: error.message,
        })
      }
    })
  },
)

// 4. --- FUNCIÓN PARA EXPORTAR LISTA DE ESCRUTADORES (GET - Protegida) ---
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
        } = req.query
        const callingUserRole = req.userRole
        const callingUserCampaignMemberships = req.campaignMemberships

        if (!campaignId) {
          return res
            .status(400)
            .json({ message: 'El ID de la campaña es requerido.' })
        }

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

        const campaignDoc = await db
          .collection('campaigns')
          .doc(campaignId)
          .get()
        if (!campaignDoc.exists) {
          return res.status(404).json({ message: 'Campaña no encontrada.' })
        }

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
        const finalColumns =
          requestedColumns.length > 0 && requestedColumns[0] !== ''
            ? requestedColumns
            : defaultColumns

        let csvContent = ''
        csvContent +=
          finalColumns
            .map((col) => {
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
                default:
                  return col
              }
            })
            .map((header) => `"${header.replace(/"/g, '""')}"`)
            .join(',') + '\n'

        escrutadores.forEach((escrutador) => {
          const row = finalColumns
            .map((col) => {
              let value
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
                    current = undefined
                    break
                  }
                }
                value = current
              } else {
                value = escrutador[col]
              }

              const stringValue =
                value === null || value === undefined ? '' : String(value)
              return `"${stringValue.replace(/"/g, '""')}"`
            })
            .join(',')
          csvContent += row + '\n'
        })

        res.set('Content-Type', 'text/csv; charset=utf-8')
        res.set(
          'Content-Disposition',
          `attachment; filename="escrutadores_${campaignDoc.data().campaignName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv"`,
        )
        res.status(200).send(csvContent)
      } catch (error) {
        functions.logger.error('Error en exportEscrutadoresList:', error) // CORREGIDO: Usar functions.logger.error
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

        if (!campaignId) {
          return res
            .status(400)
            .json({ message: 'El ID de la campaña es requerido.' })
        }

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
        console.error('Error en getEscrutadorAssignments:', error) // Manteniendo console.error
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
export const deleteEscrutadorAssignment = functions.https.onRequest(
  { secrets: [JWT_SECRET_KEY_PARAM] },
  async (req, res) => {
    authenticateUserAndAttachRole(req, res, async () => {
      if (req.method !== 'DELETE') {
        return res.status(405).send('Método no permitido. Solo DELETE.')
      }

      try {
        const db = getFirestore(getApp())
        const { assignmentId } = req.body
        const callingUserRole = req.userRole
        const callingUserUid = req.userUid
        const callingUserCampaignMemberships = req.campaignMemberships

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

        await assignmentRef.delete()

        return res.status(200).json({
          message: 'Asignación de escrutador eliminada exitosamente.',
          assignmentId: assignmentId,
        })
      } catch (error) {
        functions.logger.error('Error en getEscrutadorAssignments:', error) // CORREGIDO: Usar functions.logger.error
        return res.status(500).json({
          message:
            'Error interno del servidor al obtener asignaciones de escrutadores.',
          error: error.message,
        })
      }
    })
  },
)

// 7. --- FUNCIÓN PARA ACTUALIZAR UNA MEMBRESÍA DE CAMPAÑA (PATCH - Protegida) ---
export const updateCampaignMembership = functions.https.onRequest(
  { secrets: [JWT_SECRET_KEY_PARAM] },
  async (req, res) => {
    // Aplica el middleware de autenticación
    await authenticateUserAndAttachRole(req, res, async () => {
      if (req.method !== 'PATCH') {
        return res.status(405).send('Método no permitido. Solo PATCH.')
      }

      try {
        const db = getFirestore(getApp())
        const { userId, campaignId, updates } = req.body
        const callingUserUid = req.userUid
        const callingUserRole = req.userRole
        const callingUserCampaignMemberships = req.campaignMemberships

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

        let isAuthorized = false

        if (callingUserRole === 'admin') {
          // Un admin siempre puede actualizar
          isAuthorized = true
        } else if (userId === callingUserUid) {
          // El propio usuario solo puede actualizar su votoPromesa
          if (
            updates.votoPromesa !== undefined &&
            Object.keys(updates).length === 1
          ) {
            isAuthorized = true
          } else {
            return res.status(403).json({
              message:
                'Acceso denegado: Solo puedes actualizar tu propio "votoPromesa".',
            })
          }
        } else {
          const callingUserIsDirectSuperior =
            currentMembership.ownerBy === callingUserUid

          // Un superior directo puede actualizar el votoEsperado de su subordinado
          if (
            callingUserIsDirectSuperior &&
            updates.votoEsperado !== undefined
          ) {
            const callingUserIsActiveCampaignMember =
              callingUserCampaignMemberships.some(
                (m) =>
                  m.campaignId === campaignId &&
                  (m.role === 'candidato' ||
                    m.role === 'manager' ||
                    m.role === 'anillo' ||
                    m.role === 'votante') && // Votantes también pueden ser superiores si registran a otros
                  m.status === 'activo',
              )

            if (callingUserIsActiveCampaignMember) {
              isAuthorized = true
            }
          }

          // CORREGIDO: Lógica para permitir a superiores directos modificar canRegisterSubordinates
          if (
            Object.prototype.hasOwnProperty.call(
              updates,
              'canRegisterSubordinates',
            ) &&
            callingUserIsDirectSuperior
          ) {
            const callingUserCanManageSubordinates = [
              'admin',
              'candidato',
              'manager',
              'anillo',
            ].includes(callingUserRole)
            if (callingUserCanManageSubordinates) {
              isAuthorized = true
            } else {
              functions.logger.warn(
                // CORREGIDO: Usar functions.logger.warn
                `Acceso denegado: Rol ${callingUserRole} no autorizado para modificar canRegisterSubordinates para ${userId}.`,
              )
              return res.status(403).json({
                message:
                  'Acceso denegado: Tu rol no te permite modificar la capacidad de registro de subordinados.',
              })
            }
          }

          if (!isAuthorized) {
            return res.status(403).json({
              message:
                'Acceso denegado: Solo el usuario, su superior directo o un admin pueden actualizar esta membresía o campo específico.',
            })
          }
        }

        // Aplicar actualizaciones si están presentes
        if (updates.votoPromesa !== undefined) {
          currentMembership.votoPromesa = updates.votoPromesa
        }

        if (updates.votoEsperado !== undefined) {
          const oldVotoEsperado = currentMembership.votoEsperado || 0
          const newVotoEsperado = updates.votoEsperado

          potentialVotesChange = newVotoEsperado - oldVotoEsperado
          currentMembership.votoEsperado = newVotoEsperado
        }

        // CORREGIDO: Permitir la actualización de canRegisterSubordinates si la clave está en updates
        if (
          Object.prototype.hasOwnProperty.call(
            updates,
            'canRegisterSubordinates',
          )
        ) {
          currentMembership.canRegisterSubordinates =
            updates.canRegisterSubordinates
        }

        // Actualizar la membresía en la base de datos
        campaignMemberships[membershipIndex] = currentMembership
        await userDocRef.update({
          campaignMemberships: campaignMemberships,
          updatedAt: new Date().toISOString(),
        })

        // Si hubo cambio en votos potenciales, propagar
        if (potentialVotesChange !== 0) {
          const app = getApp() // Obtener app dentro de la función para el logger.
          const dbForPropagate = getFirestore(app) // Pasar db instance to propagatePotentialVotes
          await propagatePotentialVotes(
            dbForPropagate, // Pasar la instancia de db
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
        functions.logger.error('Error en updateCampaignMembership:', error) // CORREGIDO: Usar functions.logger.error
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

        if (
          !['candidato', 'manager', 'anillo', 'votante'].includes(
            reportingUserRole,
          )
        ) {
          return res
            .status(403)
            .json({ message: 'Tu rol no te permite registrar votos directos.' })
        }

        currentMembership.directVotes =
          (currentMembership.directVotes || 0) + votesCount
        campaignMemberships[membershipIndex] = currentMembership
        await userDocRef.update({
          campaignMemberships: campaignMemberships,
          updatedAt: new Date().toISOString(),
        })

        await propagateRealVotes(db, campaignId, reportingUserUid, votesCount)

        return res.status(200).json({
          message: `Se registraron ${votesCount} votos directos exitosamente para el usuario y se propagaron.`,
          userId: reportingUserUid,
          campaignId: campaignId,
          newDirectVotes: currentMembership.directVotes,
        })
      } catch (error) {
        functions.logger.error('Error en submitDirectVote:', error) // CORREGIDO: Usar functions.logger.error
        return res.status(500).json({
          message: 'Error interno del servidor al registrar votos directos.',
          error: error.message,
        })
      }
    })
  },
)
