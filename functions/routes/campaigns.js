// functions/routes/campaigns.js

import * as functions from 'firebase-functions'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'
import { getApp } from 'firebase-admin/app'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken' // Importar jwt
import { defineSecret } from 'firebase-functions/params' // Importar defineSecret

// Configuración para bcrypt (para hashear contraseñas)
const saltRounds = 10

// Secreto para firmar y verificar los JSON Web Tokens (JWT)
// Debe estar definido en tus parámetros de Firebase Functions
const JWT_SECRET_KEY_PARAM = defineSecret('BJS_JWT_SECRET_KEY')

// Middleware de autorización para administradores
// Este middleware verifica un token JWT personalizado para asegurar que el usuario es un administrador.
// Se mantiene aquí porque puede ser utilizado por otras funciones de campaña protegidas en este archivo.
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

// --- FUNCIÓN PARA CREAR UNA CAMPAÑA Y SU CANDIDATO ASOCIADO (POST) ---
// Esta función es pública por diseño actual (no usa authorizeAdmin directamente).
export const createCampaign = functions.https.onRequest(async (req, res) => {
  // Configuración de CORS manual para esta función pública
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

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
    const data = req.body

    // ¡CAMBIO AQUÍ! Campos requeridos ajustados
    const requiredFields = [
      'campaignName',
      'type',
      'candidateName',
      'candidateCedula',
      'candidateEmail',
      'candidatePassword',
      'sexo',
      'dateBirth',
      'planName', // ¡Añadido: ahora el nombre del plan es requerido!
      'planPrice', // ¡Añadido: ahora el precio del plan es requerido!
      // planId ya NO es un campo requerido aquí en el backend
    ]
    for (const field of requiredFields) {
      if (!data[field]) {
        return res
          .status(400)
          .json({ message: `El campo '${field}' es requerido.` })
      }
    }

    // ¡CAMBIO AQUÍ! ELIMINADO POR COMPLETO el bloque de búsqueda del plan por ID en Firestore.
    // El frontend ya envía el planName y planPrice.

    let candidateUid
    let existingUserDocRef
    let existingUserData = null

    // --- Lógica para manejar usuarios existentes o nuevos (sin cambios) ---
    try {
      const userRecord = await auth.getUserByEmail(data.candidateEmail)
      candidateUid = userRecord.uid
      existingUserDocRef = db.collection('users').doc(candidateUid)
      existingUserData = (await existingUserDocRef.get()).data()

      const isAlreadyActiveCandidateOfType =
        existingUserData?.campaignMemberships?.some(
          (membership) =>
            membership.type === data.type &&
            membership.role === 'candidato' &&
            membership.status === 'activo',
        )

      if (isAlreadyActiveCandidateOfType) {
        return res.status(409).json({
          message: `El correo electrónico ya está asociado a un candidato ACTIVO para una campaña de tipo '${data.type}'.`,
        })
      }
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        const userByCedulaSnapshot = await db
          .collection('users')
          .where('cedula', '==', data.candidateCedula)
          .limit(1)
          .get()

        if (!userByCedulaSnapshot.empty) {
          existingUserDocRef = userByCedulaSnapshot.docs[0].ref
          existingUserData = userByCedulaSnapshot.docs[0].data()
          candidateUid = existingUserDocRef.id

          const isAlreadyActiveCandidateOfType =
            existingUserData?.campaignMemberships?.some(
              (membership) =>
                membership.type === data.type &&
                membership.role === 'candidato' &&
                membership.status === 'activo',
            )

          if (isAlreadyActiveCandidateOfType) {
            return res.status(409).json({
              message: `La cédula ya está asociada a un candidato ACTIVO para una campaña de tipo '${data.type}'.`,
            })
          }

          try {
            const newAuthRecord = await auth.createUser({
              email: data.candidateEmail,
              password: data.candidatePassword,
              displayName: data.candidateName,
              uid: candidateUid,
            })
            candidateUid = newAuthRecord.uid

            await existingUserDocRef.update({
              email: data.candidateEmail,
              role: 'candidato',
              updatedAt: new Date().toISOString(),
            })
          } catch (authError) {
            if (authError.code === 'auth/email-already-in-use') {
              return res.status(409).json({
                message:
                  'El correo electrónico del candidato ya está en uso en otro usuario.',
              })
            }
            throw authError
          }
        } else {
          const newAuthRecord = await auth.createUser({
            email: data.candidateEmail,
            password: data.candidatePassword,
            displayName: data.candidateName,
          })
          candidateUid = newAuthRecord.uid
          existingUserDocRef = db.collection('users').doc(candidateUid)
        }
      } else {
        throw error
      }
    }

    // --- Guardar/Actualizar credenciales de usuario (contraseña hasheada) (sin cambios) ---
    const hashedPassword = await bcrypt.hash(data.candidatePassword, saltRounds)
    await db
      .collection('user_credentials')
      .doc(candidateUid)
      .set(
        {
          cedula: data.candidateCedula,
          firebaseAuthUid: candidateUid,
          hashedClave: hashedPassword,
          updatedAt: new Date().toISOString(),
          createdAt: existingUserData?.createdAt || new Date().toISOString(),
        },
        { merge: true },
      )

    // --- Generar slug de registro para la campaña (sin cambios) ---
    const registrationSlug = `${data.type}-${data.campaignName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`
    const newCampaignRef = db.collection('campaigns').doc()

    // --- Construir el objeto campaignData con la nueva estructura ---
    const campaignData = {
      id: newCampaignRef.id,
      campaignName: data.campaignName,
      type: data.type,
      scope: data.scope || null,
      // ¡CAMBIO AQUÍ! Guardar directamente planName y planPrice
      planName: data.planName,
      planPrice: data.planPrice,
      discountPercentage: data.discountPercentage ?? 0,
      // planId ya no se guarda aquí
      candidateId: candidateUid,
      candidateName: data.candidateName,
      registrationSlug: registrationSlug,
      status: 'activo',
      paymentStatus: 'pagado',
      createdAt: new Date().toISOString(),
      createdBy: 'admin_uid_placeholder',
      totalConfirmedVotes: 0,
      totalPotentialVotes: 0,

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

    // --- Construir o actualizar el objeto userData para el candidato en Firestore (sin cambios) ---
    let userDataToSet = {
      id: candidateUid,
      nombre: data.candidateName,
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
      registeredViaAuthUid: 'admin_uid_placeholder',
      lastLogin: null,
    }

    // Gestionar campaignMemberships (sin cambios)
    let updatedCampaignMemberships = existingUserData?.campaignMemberships || []
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
      registeredBy: 'admin_uid_placeholder',
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

    // --- Guardar la nueva campaña y el perfil de usuario (sin cambios) ---
    await newCampaignRef.set(campaignData)
    await db
      .collection('users')
      .doc(candidateUid)
      .set(userDataToSet, { merge: true })

    // --- Respuesta exitosa (sin cambios) ---
    return res.status(201).json({
      message: 'Campaña y candidato creados exitosamente.',
      campaignId: newCampaignRef.id,
      candidateId: candidateUid,
    })
  } catch (error) {
    console.error('Error en createCampaign:', error)
    if (error.code && error.message) {
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

// ... (resto de tus funciones en functions/routes/campaigns.js) ...

// --- FUNCIÓN PARA ACTUALIZAR UNA CAMPAÑA (POST) ---
// ... (otras importaciones y configuraciones) ...

// --- FUNCIÓN PARA ACTUALIZAR UNA CAMPAÑA (POST) ---
export const updateCampaign = functions.https.onRequest(
  { secrets: [JWT_SECRET_KEY_PARAM] },
  async (req, res) => {
    authorizeAdmin(req, res, async () => {
      if (req.method !== 'POST') {
        return res.status(405).send('Método no permitido. Solo POST.')
      }

      try {
        const db = getFirestore(getApp())
        const { campaignId, updates } = req.body

        if (!campaignId || !updates || typeof updates !== 'object') {
          return res.status(400).json({
            message:
              'Se requiere el ID de la campaña y un objeto con las actualizaciones.',
          })
        }

        const callingUserUid = req.userUid
        const callingUserRole = req.userRole

        const campaignRef = db.collection('campaigns').doc(campaignId)
        const campaignDoc = await campaignRef.get()

        if (!campaignDoc.exists) {
          return res
            .status(404)
            .json({ message: 'La campaña no fue encontrada.' })
        }

        const currentCampaignData = campaignDoc.data()
        const campaignCandidateId = currentCampaignData.candidateId

        // Definir los campos que solo los administradores pueden modificar
        const adminOnlyFields = [
          'planId',
          'planDetails',
          'discountPercentage',
          'status',
          'paymentStatus',
          'totalConfirmedVotes',
          'totalPotentialVotes',
          'createdBy',
          'registrationSlug',
          'candidateId',
          'type',
        ]

        // Definir los campos que un candidato puede modificar
        // Estos son los únicos campos que un candidato NO admin puede tocar.
        const candidateEditableFields = [
          'campaignName',
          'scope',
          'location',
          'contactInfo',
          'media',
          'socialLinks',
          'messagingOptions',
        ]

        const updateData = {}
        let isAllowedToUpdate = false

        if (callingUserRole === 'admin') {
          // Si es administrador, puede actualizar CUALQUIER campo
          for (const key in updates) {
            if (Object.prototype.hasOwnProperty.call(updates, key)) {
              updateData[key] = updates[key]
            }
          }
          isAllowedToUpdate = true
        } else if (callingUserUid === campaignCandidateId) {
          // Si no es admin, pero es el candidato propietario de la campaña
          for (const key in updates) {
            if (Object.prototype.hasOwnProperty.call(updates, key)) {
              if (adminOnlyFields.includes(key)) {
                // Si intenta actualizar un campo solo para admin, denegar
                return res.status(403).json({
                  message: `Acceso denegado: No tienes permiso para modificar el campo '${key}'. Solo administradores pueden hacerlo.`,
                })
              }
              // ¡CAMBIO AQUÍ! Ahora verificamos que el campo esté en candidateEditableFields.
              // Si no está ni en adminOnlyFields ni en candidateEditableFields, también se deniega.
              if (!candidateEditableFields.includes(key)) {
                return res.status(403).json({
                  message: `Acceso denegado: No tienes permiso para modificar el campo '${key}'. Los candidatos solo pueden editar: ${candidateEditableFields.join(', ')}.`,
                })
              }
              updateData[key] = updates[key]
            }
          }
          isAllowedToUpdate = true
        } else {
          // Si no es ni admin ni el candidato propietario
          return res.status(403).json({
            message:
              'Acceso denegado: No tienes permiso para actualizar esta campaña.',
          })
        }

        if (!isAllowedToUpdate || Object.keys(updateData).length === 0) {
          return res.status(400).json({
            message:
              'No se proporcionaron campos válidos para actualizar o no tienes permiso.',
          })
        }

        // Añadir la fecha de actualización automáticamente
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

// ... (el resto de tus funciones en functions/routes/campaigns.js) ...

// --- FUNCIÓN PARA OBTENER LOS DATOS DE UNA CAMPAÑA POR ID (GET - Protegida por Admin) ---
// ... (otras importaciones y funciones como authorizeAdmin) ...

// --- FUNCIÓN PARA OBTENER LOS DATOS DE UNA CAMPAÑA POR ID (GET - Protegida por Admin) ---
export const getCampaignById = functions.https.onRequest(
  { secrets: [JWT_SECRET_KEY_PARAM] },
  async (req, res) => {
    authorizeAdmin(req, res, async () => {
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

        // --- AÑADIDO: Obtener los datos del candidato asociado a la campaña ---
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
              name: fullProfile.nombre || fullProfile.name || null, // Asegurar compatibilidad
              email: fullProfile.email || null,
              cedula: fullProfile.cedula || null,
              whatsapp: fullProfile.whatsapp || null,
              phone: fullProfile.phone || null,
              sexo: fullProfile.sexo || null,
              dateBirth: fullProfile.dateBirth || null,
              location: fullProfile.location || null, // Ubicación del candidato
              votingStation:
                fullProfile.votingStation ||
                fullProfile.location?.votingStation ||
                null, // Puesto de votación
              role: fullProfile.role || null,
              // No enviar passwordHash ni campaignMemberships completos a menos que sea estrictamente necesario y se filtre bien
              // Si necesitas más campos, añádelos aquí.
            }
          }
        }

        // Devolver los datos de la campaña y el perfil del candidato
        return res.status(200).json({
          id: campaignDoc.id,
          ...campaignData, // Todos los datos de la campaña
          candidateProfile: candidateProfile, // ¡AÑADIDO! Los datos filtrados del candidato
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

// --- NUEVAS FUNCIONES PARA EL PANEL DE ADMINISTRADOR ---

// 1. OBTENER LISTADO DE CAMPAÑAS (GET - Protegida por Admin)
export const getCampaigns = functions.https.onRequest(
  { secrets: [JWT_SECRET_KEY_PARAM] },
  async (req, res) => {
    // AÑADIDO: Declarar el secreto
    authorizeAdmin(req, res, async () => {
      // Proteger con authorizeAdmin
      if (req.method !== 'GET') {
        return res.status(405).send('Método no permitido. Solo GET.')
      }

      try {
        const db = getFirestore(getApp())
        let campaignsQuery = db.collection('campaigns')

        // --- FILTROS (Aplicar en el backend para rendimiento) ---
        const { type, status, search, limit, offset } = req.query

        if (type) {
          campaignsQuery = campaignsQuery.where('type', '==', type)
        }
        if (status) {
          campaignsQuery = campaignsQuery.where('status', '==', status)
        }
        // Para 'search', Firestore no permite búsquedas de texto completas directamente.
        // Una solución común es usar un servicio de búsqueda como Algolia o ElasticSearch.
        // Para una implementación simple, podrías buscar por prefijo o hacer una búsqueda más amplia
        // y luego filtrar en el cliente (menos eficiente para grandes volúmenes).
        // Por ahora, no implementaremos 'search' en el query de Firestore para evitar errores
        // si no hay índices configurados o si la búsqueda es compleja.
        // Si necesitas buscar por nombre de campaña o candidato, avísame para discutir opciones.

        // Paginación
        // Para obtener el total de documentos antes de aplicar limit/offset,
        // se necesita una consulta separada o un contador en tiempo real.
        // Por simplicidad, no se implementa el totalCount aquí, pero es importante para la paginación en el frontend.
        // const countSnapshot = await campaignsQuery.count().get();
        // totalCount = countSnapshot.data().count;

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
            candidateName: data.candidateName, // Asumiendo que candidateName está en el documento de campaña
            logoUrl: data.media?.logoUrl || null, // URL del logo para la tarjeta
            createdAt: data.createdAt,
            totalConfirmedVotes: data.totalConfirmedVotes || 0,
            totalPotentialVotes: data.totalPotentialVotes || 0,
          })
        })

        return res.status(200).json({
          campaigns,
          // totalCount: totalCount // Descomentar si implementas el conteo total
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

// 2. ACTUALIZAR ESTADO DE CAMPAÑA (POST - Protegida por Admin)
export const updateCampaignStatus = functions.https.onRequest(
  { secrets: [JWT_SECRET_KEY_PARAM] },
  async (req, res) => {
    // AÑADIDO: Declarar el secreto
    authorizeAdmin(req, res, async () => {
      // Proteger con authorizeAdmin
      if (req.method !== 'POST') {
        return res.status(405).send('Método no permitido. Solo POST.')
      }

      try {
        const db = getFirestore(getApp())
        const { campaignId, status } = req.body

        if (!campaignId || !status) {
          return res.status(400).json({
            message: 'Se requiere el ID de la campaña y el nuevo estado.',
          })
        }

        const validStatuses = ['activo', 'inactivo', 'archivado'] // Define tus estados válidos
        if (!validStatuses.includes(status)) {
          return res.status(400).json({
            message: `Estado inválido. Los estados permitidos son: ${validStatuses.join(', ')}.`,
          })
        }

        const campaignRef = db.collection('campaigns').doc(campaignId)
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

// --- TODO: Funciones para la pirámide y edición de datos sensibles de usuario ---
// Estas se pueden añadir más adelante según la necesidad y complejidad.
