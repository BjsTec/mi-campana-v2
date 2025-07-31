import * as functions from 'firebase-functions'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'
import { getApp } from 'firebase-admin/app'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { defineSecret } from 'firebase-functions/params'

// Configuración para bcrypt
const saltRounds = 10

// Secreto para firmar y verificar los JSON Web Tokens (JWT)
const JWT_SECRET_KEY_PARAM = defineSecret('BJS_JWT_SECRET_KEY')

// Middleware de autenticación y adjuntar rol/UID a la solicitud
// Este middleware verifica el token JWT y adjunta userUid, userRole y campaignMemberships
// a la solicitud (req). La lógica de autorización específica se realiza dentro de cada función.
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

    req.userUid = decodedToken.uid // Adjunta el UID del usuario a la solicitud
    req.userRole = decodedToken.role // Adjunta el rol del usuario a la solicitud
    req.campaignMemberships = decodedToken.campaignMemberships || [] // Adjunta membresías

    next()
  } catch (error) {
    console.error(
      'Error de autenticación (JWT) en authenticateUserAndAttachRole:',
      error,
    )
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

// 1. --- FUNCIÓN PARA CREAR UNA CAMPAÑA Y ASIGNAR CANDIDATO (POST - Protegida) ---
export const createCampaign = functions.https.onRequest(
  { secrets: [JWT_SECRET_KEY_PARAM] },
  async (req, res) => {
    // Aplica el middleware de autenticación
    authenticateUserAndAttachRole(req, res, async () => {
      if (req.method !== 'POST') {
        return res.status(405).send('Método no permitido. Solo POST.')
      }

      try {
        const db = getFirestore(getApp())
        const auth = getAuth(getApp())
        const data = req.body // Usaremos 'data' directamente del body

        // Campos requeridos ajustados
        const requiredFields = [
          'campaignName',
          'type',
          'candidateName',
          'candidateCedula',
          'candidateEmail',
          'candidatePassword',
          'sexo',
          'dateBirth',
          'planName',
          'planPrice',
        ]
        for (const field of requiredFields) {
          if (!data[field]) {
            return res
              .status(400)
              .json({ message: `El campo '${field}' es requerido.` })
          }
        }

        // Validación de formato de fecha para electionDate (si se proporciona)
        if (
          data.electionDate &&
          (typeof data.electionDate !== 'string' ||
            !/^\d{4}-\d{2}-\d{2}$/.test(data.electionDate))
        ) {
          return res.status(400).json({
            message: 'El formato de electionDate debe ser YYYY-MM-DD.',
          })
        }

        let candidateUid
        let existingUserDocRef = null
        let existingUserData = null
        let authUserFound = false

        // PRIORIDAD 1: Intentar buscar por email en Firebase Auth
        try {
          const userRecord = await auth.getUserByEmail(data.candidateEmail)
          candidateUid = userRecord.uid
          authUserFound = true
          existingUserDocRef = db.collection('users').doc(candidateUid)
          existingUserData = (await existingUserDocRef.get()).data()
        } catch (error) {
          if (error.code === 'auth/user-not-found') {
            // Email no encontrado en Auth. Pasamos a la siguiente estrategia.
            authUserFound = false
          } else if (error.code === 'auth/email-already-in-use') {
            // El email está en uso en Auth pero no se pudo recuperar directamente (ej. por rol o por una inconsistencia previa)
            return res.status(409).json({
              message:
                'El correo electrónico ya está en uso por otra cuenta Auth.',
            })
          } else {
            // Otro error inesperado de Auth (ej. formato de email inválido)
            console.error('Error al buscar usuario por email en Auth:', error)
            throw error
          }
        }

        // PRIORIDAD 2: Si no se encontró en Auth por email, buscar por cédula en Firestore
        if (!authUserFound) {
          const userByCedulaSnapshot = await db
            .collection('users')
            .where('cedula', '==', data.candidateCedula)
            .limit(1)
            .get()

          if (!userByCedulaSnapshot.empty) {
            // Usuario encontrado en Firestore por cédula.
            existingUserDocRef = userByCedulaSnapshot.docs[0].ref
            existingUserData = (await existingUserDocRef.get()).data()
            candidateUid = existingUserDocRef.id // UID de Firestore

            // Ahora, verificar si existe una cuenta Auth con este UID de Firestore.
            try {
              await auth.getUser(candidateUid)
              authUserFound = true // Sí, existe una cuenta Auth con este UID.
            } catch (error) {
              if (error.code === 'auth/user-not-found') {
                // No existe cuenta Auth con este UID. La creamos.
                const newAuthRecord = await auth.createUser({
                  email: data.candidateEmail,
                  password: data.candidatePassword,
                  displayName: data.candidateName,
                  uid: candidateUid, // Creamos Auth con el UID existente de Firestore
                })
                candidateUid = newAuthRecord.uid // Debería ser el mismo
                authUserFound = true // Ahora sí tenemos cuenta Auth.
              } else {
                // Otro error inesperado al buscar por UID en Auth
                console.error('Error al buscar usuario por UID en Auth:', error)
                throw error
              }
            }
          }
        }

        // PRIORIDAD 3: Si no se encontró por ninguna de las anteriores, crear un usuario Auth completamente nuevo
        if (!authUserFound) {
          const newAuthRecord = await auth.createUser({
            email: data.candidateEmail,
            password: data.candidatePassword,
            displayName: data.candidateName,
          })
          candidateUid = newAuthRecord.uid
          // existingUserDocRef y existingUserData se inicializarán o actualizarán en los pasos siguientes.
        }

        // Una vez que tenemos candidateUid definitivo, asegurar que existingUserDocRef y existingUserData estén actualizados
        if (!existingUserDocRef || existingUserDocRef.id !== candidateUid) {
          existingUserDocRef = db.collection('users').doc(candidateUid)
          existingUserData = (await existingUserDocRef.get()).data() // Puede ser null si es un usuario totalmente nuevo
        }

        // --- Validación: ¿Ya es candidato activo para este tipo de campaña? ---
        const isAlreadyActiveCandidateOfType =
          existingUserData?.campaignMemberships?.some(
            (membership) =>
              membership.type === data.type &&
              membership.role === 'candidato' &&
              membership.status === 'activo',
          )

        if (isAlreadyActiveCandidateOfType) {
          return res.status(409).json({
            message: `El correo electrónico o cédula ya está asociado a un candidato ACTIVO para una campaña de tipo '${data.type}'.`,
          })
        }

        // --- Guardar/Actualizar credenciales de usuario (contraseña hasheada) ---
        const hashedPassword = await bcrypt.hash(
          data.candidatePassword,
          saltRounds,
        )
        await db
          .collection('user_credentials')
          .doc(candidateUid)
          .set(
            {
              cedula: data.candidateCedula,
              firebaseAuthUid: candidateUid,
              hashedPassword: hashedPassword,
              updatedAt: new Date().toISOString(),
              createdAt:
                existingUserData?.createdAt || new Date().toISOString(),
            },
            { merge: true },
          )

        // --- Generar slug de registro para la campaña ---
        const registrationSlug = `${data.type}-${data.campaignName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`
        const newCampaignRef = db.collection('campaigns').doc()

        // --- Construir el objeto campaignData ---
        const campaignData = {
          id: newCampaignRef.id,
          campaignName: data.campaignName,
          type: data.type,
          scope: data.scope || null,
          planName: data.planName,
          planPrice: data.planPrice,
          discountPercentage: data.discountPercentage ?? 0,
          candidateId: candidateUid,
          candidateName: data.candidateName,
          registrationSlug: registrationSlug,
          status: 'activo',
          paymentStatus: 'pagado',
          createdAt: new Date().toISOString(),
          createdBy: req.userUid, // Quien realizó la acción (admin o el propio candidato)
          totalConfirmedVotes: 0,
          totalPotentialVotes: 0,

          electionDate: data.electionDate || null, // <--- ¡Añadido electionDate aquí!

          location: {
            country: data.location?.country || 'Colombia',
            state: data.location?.state || null,
            city: data.location?.city || null,
          },

          contactInfo: {
            email: data.contactInfo?.email || null,
            phone: data.contactInfo?.phone || null,
            whatsapp: data.contactInfo?.whatsapp || null,
            web: data.contactInfo?.web || null,
            supportEmail: data.contactInfo?.supportEmail || null,
            supportWhatsapp: data.contactInfo?.supportWhatsapp || null,
          },

          media:
            data.media && Object.keys(data.media).length > 0
              ? {
                  logoUrl: data.media.logoUrl || null,
                  bannerUrl: data.media.bannerUrl || null,
                }
              : {},

          socialLinks:
            data.socialLinks && Object.keys(data.socialLinks).length > 0
              ? {
                  facebook: data.socialLinks.facebook || null,
                  instagram: data.socialLinks.instagram || null,
                  tiktok: data.socialLinks.tiktok || null,
                  threads: data.socialLinks.threads || null,
                  youtube: data.socialLinks.youtube || null,
                  linkedin: data.socialLinks.linkedin || null,
                  twitter: data.socialLinks.twitter || null,
                }
              : {},

          messagingOptions: {
            email: data.messagingOptions?.email ?? true,
            alerts: data.messagingOptions?.alerts ?? true,
            sms: data.messagingOptions?.sms ?? false,
            whatsappBusiness: data.messagingOptions?.whatsappBusiness ?? false,
          },
        }

        // Autorización: Solo un administrador global o el propio candidato puede crear una campaña
        const isAuthorized =
          req.userRole === 'admin' || req.userUid === candidateUid
        if (!isAuthorized) {
          return res.status(403).json({
            message:
              'Acceso denegado: Solo administradores o el propio candidato pueden crear una campaña.',
          })
        }

        // Construir o actualizar el objeto userData para el candidato en Firestore
        let userDataToSet = {
          id: candidateUid,
          nombre: data.candidateName, // Preferencia por 'nombre'
          cedula: data.candidateCedula,
          email: data.candidateEmail,
          whatsapp: data.whatsapp || null,
          phone: data.phone || null,
          location: {
            country: data.candidateLocation?.country || 'Colombia',
            state: data.candidateLocation?.state || null,
            city: data.candidateLocation?.city || null,
            votingStation: data.puestoVotacion || null,
          },
          dateBirth: data.dateBirth,
          sexo: data.sexo,
          role: 'candidato',
          level: 0,
          status: 'activo',
          createdAt: existingUserData?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          registeredViaAuthUid: req.userUid, // Quien realizó la acción (admin o el propio candidato)
          lastLogin: null,
        }

        // Gestionar campaignMemberships
        let updatedCampaignMemberships =
          existingUserData?.campaignMemberships || []
        const existingMembershipIndex = updatedCampaignMemberships.findIndex(
          (m) => m.type === data.type && m.role === 'candidato',
        )

        const newMembership = {
          campaignId: newCampaignRef.id,
          campaignName: data.campaignName,
          role: 'candidato',
          type: data.type,
          status: 'activo',
          registeredAt: new Date().toISOString(),
          registeredBy: req.userUid, // Quien realizó la acción
          ownerBy: candidateUid,
          voterStatus: null,
          votoPromesa: null,
          votoEsperado: null,
          directVotes: 0,
          pyramidVotes: 0,
        }

        if (existingMembershipIndex !== -1) {
          updatedCampaignMemberships[existingMembershipIndex] = {
            ...updatedCampaignMemberships[existingMembershipIndex],
            ...newMembership,
            status: 'activo',
          }
        } else {
          updatedCampaignMemberships.push(newMembership)
        }
        userDataToSet.campaignMemberships = updatedCampaignMemberships

        // Guardar la nueva campaña y el perfil de usuario
        await newCampaignRef.set(campaignData)
        await db
          .collection('users')
          .doc(candidateUid)
          .set(userDataToSet, { merge: true })

        return res.status(201).json({
          message: 'Campaña y candidato creados exitosamente.',
          campaignId: newCampaignRef.id,
          candidateId: candidateUid,
          electionDate: data.electionDate, // Devolver el campo en la respuesta
        })
      } catch (error) {
        console.error('Error en createCampaign:', error)
        // Manejo de errores más específico
        if (error.code && error.message) {
          if (error.code === 'auth/email-already-in-use') {
            return res.status(409).json({
              message:
                'El correo electrónico ya está en uso por otra cuenta Auth.',
            })
          }
          return res.status(500).json({
            message: `Error interno del servidor al crear la campaña: ${error.message}`,
            error: error.message,
          })
        }
        return res.status(500).json({
          message: 'Error interno del servidor al crear la campaña.',
          error: error.message,
        })
      }
    })
  },
)

// 2. --- FUNCIÓN PARA ACTUALIZAR UNA CAMPAÑA (PATCH - Protegida) ---
export const updateCampaign = functions.https.onRequest(
  { secrets: [JWT_SECRET_KEY_PARAM] },
  async (req, res) => {
    // Aplica el middleware de autenticación
    authenticateUserAndAttachRole(req, res, async () => {
      if (req.method !== 'PATCH') {
        // Cambiado a PATCH
        return res.status(405).send('Método no permitido. Solo PATCH.')
      }

      try {
        const db = getFirestore(getApp())
        const { campaignId, updates } = req.body
        const callingUserUid = req.userUid
        const callingUserRole = req.userRole

        if (!campaignId || !updates || typeof updates !== 'object') {
          return res.status(400).json({
            message:
              'Se requiere el ID de la campaña y un objeto con las actualizaciones.',
          })
        }

        const campaignRef = db.collection('campaigns').doc(campaignId)
        const campaignDoc = await campaignRef.get()

        if (!campaignDoc.exists) {
          return res
            .status(404)
            .json({ message: 'La campaña no fue encontrada.' })
        }

        const currentCampaignData = campaignDoc.data()
        const campaignCandidateId = currentCampaignData.candidateId

        // Autorización: Solo un administrador global o el candidato de la campaña puede actualizarla
        const isAuthorized =
          callingUserRole === 'admin' ||
          (callingUserRole === 'candidato' &&
            campaignCandidateId === callingUserUid)

        if (!isAuthorized) {
          return res.status(403).json({
            message:
              'Acceso denegado: No tienes permisos para actualizar esta campaña.',
          })
        }

        const updateData = {}
        // Campos que un administrador puede modificar (todos los que no son sensibles)
        const adminAllowedFields = [
          'campaignName',
          'type',
          'scope',
          'planName',
          'planPrice',
          'discountPercentage',
          'registrationSlug',
          'status',
          'paymentStatus',
          'totalConfirmedVotes',
          'totalPotentialVotes',
          'location',
          'contactInfo',
          'media',
          'socialLinks',
          'messagingOptions',
          'electionDate',
        ]

        // Campos que un candidato puede modificar (subconjunto de los adminAllowedFields)
        const candidateEditableFields = [
          'campaignName',
          'scope',
          'location',
          'contactInfo',
          'media',
          'socialLinks',
          'messagingOptions',
          'electionDate',
        ]

        for (const key in updates) {
          if (Object.prototype.hasOwnProperty.call(updates, key)) {
            if (callingUserRole === 'admin') {
              if (adminAllowedFields.includes(key)) {
                updateData[key] = updates[key]
              }
              // Omitir campos muy sensibles como candidateId, createdBy, createdAt, id
            } else {
              // Si no es admin, es el candidato
              if (candidateEditableFields.includes(key)) {
                updateData[key] = updates[key]
              } else {
                return res.status(403).json({
                  message: `Acceso denegado: No tienes permiso para modificar el campo '${key}'.`,
                })
              }
            }
            // Validación específica para electionDate si está presente
            if (key === 'electionDate') {
              if (
                typeof updates[key] !== 'string' ||
                !/^\d{4}-\d{2}-\d{2}$/.test(updates[key])
              ) {
                return res.status(400).json({
                  message: 'El formato de electionDate debe ser YYYY-MM-DD.',
                })
              }
            }
          }
        }

        if (Object.keys(updateData).length === 0) {
          return res.status(400).json({
            message:
              'No se proporcionaron campos válidos para actualizar o no tienes permiso.',
          })
        }

        updateData.updatedAt = new Date().toISOString()

        await campaignRef.update(updateData)

        return res.status(200).json({
          message: 'Campaña actualizada exitosamente.',
          updatedFields: Object.keys(updateData),
        })
      } catch (error) {
        console.error('Error en updateCampaign:', error)
        return res.status(500).json({
          message: 'Error interno del servidor al actualizar la campaña.',
          error: error.message,
        })
      }
    })
  },
)

// 3. --- FUNCIÓN PARA OBTENER LOS DATOS DE UNA CAMPAÑA POR ID (GET - Protegida) ---
export const getCampaignById = functions.https.onRequest(
  { secrets: [JWT_SECRET_KEY_PARAM] },
  async (req, res) => {
    authenticateUserAndAttachRole(req, res, async () => {
      if (req.method !== 'GET') {
        return res.status(405).send('Método no permitido. Solo GET.')
      }

      try {
        const db = getFirestore(getApp())
        const campaignId = req.query.id

        if (!campaignId) {
          return res.status(400).json({
            message:
              'Se requiere el ID de la campaña como parámetro en la URL.',
          })
        }

        const campaignRef = db.collection('campaigns').doc(campaignId)
        const campaignDoc = await campaignRef.get()

        if (!campaignDoc.exists) {
          return res
            .status(404)
            .json({ message: 'La campaña no fue encontrada.' })
        }

        const campaignData = campaignDoc.data()

        // --- Lógica de Autorización para getCampaignById ---
        // Un admin global puede ver cualquier campaña.
        // Un candidato solo puede ver SU campaña (la que posee).
        // Otros roles (manager, anillo, votante) solo pueden ver campañas de las que son miembros activos.
        let isAuthorized = false
        if (req.userRole === 'admin') {
          isAuthorized = true
        } else {
          const isMember = req.campaignMemberships.some(
            (m) => m.campaignId === campaignId && m.status === 'activo',
          )
          if (isMember) {
            isAuthorized = true
          }
        }

        if (!isAuthorized) {
          return res.status(403).json({
            message:
              'Acceso denegado: No tienes permiso para ver esta campaña.',
          })
        }
        // --- Fin Lógica de Autorización ---

        // --- Obtener los datos del candidato asociado a la campaña ---
        let candidateProfile = null
        if (campaignData.candidateId) {
          const candidateDoc = await db
            .collection('users')
            .doc(campaignData.candidateId)
            .get()

          if (candidateDoc.exists) {
            const fullProfile = candidateDoc.data()
            // Filtrar campos sensibles antes de enviar al frontend
            candidateProfile = {
              id: candidateDoc.id,
              name: fullProfile.nombre || fullProfile.name || null,
              email: fullProfile.email || null,
              cedula: fullProfile.cedula || null,
              whatsapp: fullProfile.whatsapp || null,
              phone: fullProfile.phone || null,
              sexo: fullProfile.sexo || null,
              dateBirth: fullProfile.dateBirth || null,
              location: fullProfile.location || null,
              votingStation:
                fullProfile.votingStation ||
                fullProfile.location?.votingStation ||
                null,
              role: fullProfile.role || null,
            }
          }
        }

        // Devolver los datos de la campaña y el perfil del candidato
        return res.status(200).json({
          id: campaignDoc.id,
          ...campaignData,
          candidateProfile: candidateProfile,
        })
      } catch (error) {
        console.error('Error en getCampaignById:', error)
        return res.status(500).json({
          message: 'Error interno del servidor al obtener la campaña.',
          error: error.message,
        })
      }
    })
  },
)

// 4. OBTENER LISTADO DE CAMPAÑAS (GET - Protegida)
export const getCampaigns = functions.https.onRequest(
  { secrets: [JWT_SECRET_KEY_PARAM] },
  async (req, res) => {
    authenticateUserAndAttachRole(req, res, async () => {
      if (req.method !== 'GET') {
        return res.status(405).send('Método no permitido. Solo GET.')
      }

      try {
        const db = getFirestore(getApp())
        let campaignsQuery = db.collection('campaigns')

        const { type, status, search, limit, offset } = req.query
        const callingUserUid = req.userUid
        const callingUserRole = req.userRole
        const callingUserCampaignMemberships = req.campaignMemberships

        // Lógica de Autorización y Filtrado de Campañas para no-admins
        if (callingUserRole !== 'admin') {
          const memberCampaignIds = callingUserCampaignMemberships
            .filter((m) => m.status === 'activo')
            .map((m) => m.campaignId)

          if (memberCampaignIds.length === 0) {
            return res.status(200).json({
              campaigns: [],
              message: 'No eres miembro activo de ninguna campaña.',
            })
          }
          // Si no es admin, solo puede ver las campañas de las que es miembro activo
          campaignsQuery = campaignsQuery.where(
            '__name__',
            'in',
            memberCampaignIds.slice(0, 10), // 'in' solo soporta hasta 10 elementos. Manejo más complejo si hay más de 10 membresías.
          )
          // Si el usuario tiene más de 10 membresías, se necesitaría una consulta más avanzada o lógica de cliente/paginación
        }

        // --- FILTROS (Aplicar en el backend para rendimiento) ---
        if (type) {
          campaignsQuery = campaignsQuery.where('type', '==', type)
        }
        if (status) {
          campaignsQuery = campaignsQuery.where('status', '==', status)
        }
        // Para 'search', Firestore no permite búsquedas de texto completas directamente.
        // Una solución común es usar un servicio de búsqueda como Algolia o ElasticSearch.
        // Por ahora, no implementaremos 'search' en el query de Firestore para evitar errores
        // si no hay índices configurados o si la búsqueda es compleja.

        // Paginación
        if (limit) {
          campaignsQuery = campaignsQuery.limit(parseInt(limit, 10))
        }
        if (offset) {
          campaignsQuery = campaignsQuery.offset(parseInt(offset, 10))
        }

        const campaignsSnapshot = await campaignsQuery.get()
        const campaigns = []
        campaignsSnapshot.forEach((doc) => {
          const data = doc.data()
          // Solo devolver datos esenciales para el listado (tarjetas)
          campaigns.push({
            id: doc.id,
            campaignName: data.campaignName,
            type: data.type,
            scope: data.scope,
            status: data.status,
            candidateName: data.candidateName,
            logoUrl: data.media?.logoUrl || null,
            createdAt: data.createdAt,
            totalConfirmedVotes: data.totalConfirmedVotes || 0,
            totalPotentialVotes: data.totalPotentialVotes || 0,
            electionDate: data.electionDate || null, // <--- Añadido electionDate aquí también para listado
          })
        })

        return res.status(200).json({
          campaigns,
        })
      } catch (error) {
        console.error('Error en getCampaigns:', error)
        return res.status(500).json({
          message: 'Error interno del servidor al obtener campañas.',
          error: error.message,
        })
      }
    })
  },
)

// 5. ACTUALIZAR ESTADO DE CAMPAÑA (PATCH - Protegida)
export const updateCampaignStatus = functions.https.onRequest(
  { secrets: [JWT_SECRET_KEY_PARAM] },
  async (req, res) => {
    authenticateUserAndAttachRole(req, res, async () => {
      if (req.method !== 'PATCH') {
        // Cambiado a PATCH
        return res.status(405).send('Método no permitido. Solo PATCH.')
      }

      try {
        const db = getFirestore(getApp())
        const { campaignId, status } = req.body
        const callingUserUid = req.userUid
        const callingUserRole = req.userRole

        if (!campaignId || !status) {
          return res.status(400).json({
            message: 'Se requiere el ID de la campaña y el nuevo estado.',
          })
        }

        const validStatuses = ['activo', 'inactivo', 'archivado']
        if (!validStatuses.includes(status)) {
          return res.status(400).json({
            message: `Estado inválido. Los estados permitidos son: ${validStatuses.join(', ')}.`,
          })
        }

        const campaignRef = db.collection('campaigns').doc(campaignId)
        const campaignDoc = await campaignRef.get()
        if (!campaignDoc.exists) {
          return res.status(404).json({ message: 'Campaña no encontrada.' })
        }
        const currentCampaignData = campaignDoc.data()

        // Autorización: Solo un administrador global o el candidato de la campaña puede cambiar el estado
        const isAuthorized =
          callingUserRole === 'admin' ||
          (callingUserRole === 'candidato' &&
            currentCampaignData.candidateId === callingUserUid)

        if (!isAuthorized) {
          return res.status(403).json({
            message:
              'Acceso denegado: Solo administradores o el candidato principal de la campaña pueden cambiar su estado.',
          })
        }

        await campaignRef.update({
          status: status,
          updatedAt: new Date().toISOString(),
        })

        return res.status(200).json({
          message: `Estado de la campaña '${campaignId}' actualizado a '${status}' exitosamente.`,
        })
      } catch (error) {
        console.error('Error en updateCampaignStatus:', error)
        return res.status(500).json({
          message:
            'Error interno del servidor al actualizar el estado de la campaña.',
          error: error.message,
        })
      }
    })
  },
)
