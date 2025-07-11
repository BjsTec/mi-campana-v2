// functions/routes/campaigns.js

import * as functions from 'firebase-functions'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'
import { getApp } from 'firebase-admin/app'
import bcrypt from 'bcryptjs'

import jwt from 'jsonwebtoken' // Importar jwt
import { defineSecret } from 'firebase-functions/params' // Importar defineSecret

// Define el secreto JWT como un parámetro de función para Cloud Functions v2.
// Este secreto se usa para verificar tokens JWT personalizados en el middleware de autorización.
const JWT_SECRET_KEY_PARAM = defineSecret('BJS_JWT_SECRET_KEY')

// Configuración para bcrypt (para hashear contraseñas)
const saltRounds = 10

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
// Se mantiene aquí porque puede ser utilizado por funciones públicas de este archivo (ej. getCampaignById si se hace pública)
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

// --- FUNCIÓN PARA CREAR UNA CAMPAÑA Y SU CANDIDATO ASOCIADO (POST) ---
// Esta función es pública por diseño actual (no usa authorizeAdmin directamente).
export const createCampaign = functions.https.onRequest(async (req, res) => {
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

    // Campos requeridos para la creación de la campaña y el candidato
    const requiredFields = [
      'campaignName',
      'type',
      'candidateName',
      'candidateCedula',
      'candidateEmail',
      'candidatePassword',
      'sexo', // Añadido como requerido según la tabla de usuarios
      'dateBirth', // Añadido como requerido según la tabla de usuarios
    ]
    for (const field of requiredFields) {
      if (!data[field]) {
        return res
          .status(400)
          .json({ message: `El campo '${field}' es requerido.` })
      }
    }

    let candidateUid
    let existingUserDocRef // Referencia al documento de usuario en Firestore
    let existingUserData = null // Datos del usuario existente en Firestore

    // --- Lógica para manejar usuarios existentes o nuevos ---
    try {
      // Intenta obtener el usuario por email de Firebase Auth
      const userRecord = await auth.getUserByEmail(data.candidateEmail)
      candidateUid = userRecord.uid
      existingUserDocRef = db.collection('users').doc(candidateUid)
      existingUserData = (await existingUserDocRef.get()).data()

      // Si el usuario ya existe en Auth y tiene una membresía de candidato ACTIVA del MISMO TIPO
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
        // Si el email NO existe en Firebase Auth, verificamos por cédula en Firestore
        const userByCedulaSnapshot = await db
          .collection('users')
          .where('cedula', '==', data.candidateCedula)
          .limit(1)
          .get()

        if (!userByCedulaSnapshot.empty) {
          // Usuario existente en Firestore por cédula (ej. un votante)
          existingUserDocRef = userByCedulaSnapshot.docs[0].ref
          existingUserData = userByCedulaSnapshot.docs[0].data()
          candidateUid = existingUserDocRef.id // El UID de Auth se vinculará al ID de este documento

          // Si la cédula ya está asociada a un candidato ACTIVO del MISMO TIPO
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

          // Crear un nuevo usuario en Firebase Auth y vincularlo al UID existente de Firestore
          try {
            const newAuthRecord = await auth.createUser({
              email: data.candidateEmail,
              password: data.candidatePassword,
              displayName: data.candidateName,
              uid: candidateUid, // Intentar usar el UID existente para vincular
            })
            candidateUid = newAuthRecord.uid // Asegurar que candidateUid es el UID final de Auth

            // Actualizar el documento de usuario en Firestore con el email y el rol si es necesario
            await existingUserDocRef.update({
              email: data.candidateEmail,
              role: 'candidato', // Asegurar que el rol sea candidato
              updatedAt: new Date().toISOString(),
            })
          } catch (authError) {
            if (authError.code === 'auth/email-already-in-use') {
              return res
                .status(409)
                .json({
                  message:
                    'El correo electrónico del candidato ya está en uso en otro usuario.',
                })
            }
            throw authError // Re-lanzar otros errores de Auth
          }
        } else {
          // Usuario completamente nuevo: No existe ni en Auth por email ni en Firestore por cédula
          const newAuthRecord = await auth.createUser({
            email: data.candidateEmail,
            password: data.candidatePassword,
            displayName: data.candidateName,
          })
          candidateUid = newAuthRecord.uid
          existingUserDocRef = db.collection('users').doc(candidateUid) // Nueva referencia para el nuevo usuario
        }
      } else {
        throw error // Re-lanzar otros errores de Firebase Auth
      }
    }

    // --- Guardar/Actualizar credenciales de usuario (contraseña hasheada) ---
    const hashedPassword = await bcrypt.hash(data.candidatePassword, saltRounds)
    await db
      .collection('user_credentials')
      .doc(candidateUid)
      .set(
        {
          cedula: data.candidateCedula,
          firebaseAuthUid: candidateUid,
          hashedClave: hashedPassword,
          updatedAt: new Date().toISOString(), // Actualizar fecha de modificación
          createdAt: existingUserData?.createdAt || new Date().toISOString(), // Mantener fecha de creación original si existe
        },
        { merge: true },
      ) // Usar merge para no sobrescribir otros campos si el documento ya existe

    // --- Generar slug de registro para la campaña ---
    const registrationSlug = `${data.type}-${data.campaignName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`
    const newCampaignRef = db.collection('campaigns').doc() // Generar un nuevo ID de documento para la campaña

    // --- Construir el objeto campaignData con la nueva estructura ---
    const campaignData = {
      // Campos principales de la campaña
      id: newCampaignRef.id, // ID del documento de la campaña
      campaignName: data.campaignName,
      type: data.type,
      scope: data.scope || null, // Puede ser null si no se especifica
      candidateId: candidateUid, // Mantener candidateId explícitamente
      registrationSlug: registrationSlug, // Slug único para la campaña
      status: 'activo', // Estado inicial de la campaña
      paymentStatus: 'pagado', // Estado de pago inicial
      createdAt: new Date().toISOString(), // Fecha de creación
      createdBy: 'admin_uid_placeholder', // UID del administrador que crea la campaña (si aplica)
      // Nuevos campos para métricas de campaña
      totalConfirmedVotes: 0, // Total de votos confirmados en la campaña
      totalPotentialVotes: 0, // Total de votos potenciales en la campaña

      // Ajuste: Estructura de Location (país, estado, ciudad, puestoVotacion)
      location: {
        country: data.location?.country || 'Colombia', // Default a Colombia
        state: data.location?.state || null,
        city: data.location?.city || null,
        // votingStation: data.location?.votingStation || null, // Si la campaña tiene su propio puesto de votación
      },

      // Ajuste: Estructura de ContactInfo
      contactInfo: {
        email: data.contactInfo?.email || null,
        phone: data.contactInfo?.phone || null,
        whatsapp: data.contactInfo?.whatsapp || null,
        web: data.contactInfo?.web || null,
        supportEmail: data.contactInfo?.supportEmail || null,
        supportWhatsapp: data.contactInfo?.supportWhatsapp || null,
        salesEmail: data.contactInfo?.salesEmail || null,
        salesWhatsapp: data.contactInfo?.salesWhatsapp || null,
      },

      // Ajuste: Estructura de Media (objeto vacío si no se proporciona, o con nulls si se proporciona y no tienen valor)
      media:
        data.media && Object.keys(data.media).length > 0
          ? {
              logoUrl: data.media.logoUrl || null,
              bannerUrl: data.media.bannerUrl || null,
            }
          : {},

      // Ajuste: Estructura de SocialLinks (objeto vacío si no se proporciona, o con nulls si se proporciona y no tienen valor)
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

      // Nuevo campo: Opciones de mensajería por defecto y configurables
      messagingOptions: {
        email: data.messagingOptions?.email ?? true,
        alerts: data.messagingOptions?.alerts ?? true,
        sms: data.messagingOptions?.sms ?? false,
        whatsappBusiness: data.messagingOptions?.whatsappBusiness ?? false,
      },
    }

    // --- Construir o actualizar el objeto userData para el candidato en Firestore ---
    let userDataToSet = {
      id: candidateUid, // El ID del documento de usuario
      nombre: data.candidateName,
      cedula: data.candidateCedula,
      email: data.candidateEmail,
      whatsapp: data.whatsapp || null, // Añadido según la tabla de usuarios
      phone: data.phone || null, // Añadido según la tabla de usuarios
      // passwordHash no se guarda aquí, está en user_credentials

      location: {
        // Ubicación del usuario, puede ser diferente a la de la campaña
        country: data.candidateLocation?.country || 'Colombia',
        state: data.candidateLocation?.state || null,
        city: data.candidateLocation?.city || null,
        votingStation: data.puestoVotacion || null, // Añadido según la tabla de usuarios
      },

      dateBirth: data.dateBirth, // Añadido según la tabla de usuarios
      sexo: data.sexo, // Añadido según la tabla de usuarios

      role: 'candidato', // Rol principal del usuario en el sistema
      level: 0, // Nivel 0 para el candidato
      status: 'activo', // Estado activo para el usuario

      createdAt: existingUserData?.createdAt || new Date().toISOString(), // Mantener fecha de creación original si existe
      updatedAt: new Date().toISOString(), // Fecha de última actualización
      registeredViaAuthUid: 'admin_uid_placeholder', // Quién lo registró (ej. un admin)
      lastLogin: null, // Se actualizará en el login
    }

    // Gestionar campaignMemberships
    let updatedCampaignMemberships = existingUserData?.campaignMemberships || []
    const existingMembershipIndex = updatedCampaignMemberships.findIndex(
      (m) => m.type === data.type && m.role === 'candidato',
    )

    const newMembership = {
      campaignId: newCampaignRef.id,
      campaignName: data.campaignName,
      role: 'candidato',
      type: data.type,
      status: 'activo', // La nueva membresía siempre es activa
      registeredAt: new Date().toISOString(),
      registeredBy: 'admin_uid_placeholder', // Quién lo registró en esta campaña (ej. un admin)
      ownerBy: candidateUid, // El candidato es su propio ownerBy en su campaña
      voterStatus: null, // No aplica para el rol de candidato
      votoPromesa: null, // No aplica para el rol de candidato
      votoEsperado: null, // No aplica para el rol de candidato
      directVotes: 0, // Inicialmente 0
      pyramidVotes: 0, // Inicialmente 0
    }

    if (existingMembershipIndex !== -1) {
      // Si ya existe una membresía de candidato del mismo tipo, la actualizamos.
      // Esto cubre el escenario de "se lanzó a Concejo, perdió, se lanza de nuevo a Concejo".
      // La membresía anterior de este tipo se marca como inactiva (si no lo estaba)
      // y se sobrescribe con los detalles de la nueva campaña activa.
      updatedCampaignMemberships[existingMembershipIndex] = {
        ...updatedCampaignMemberships[existingMembershipIndex],
        ...newMembership, // Sobrescribir con los nuevos detalles de la campaña
        status: 'activo', // Asegurar que la nueva sea activa
      }
    } else {
      // Si no existe una membresía de candidato del mismo tipo, la añadimos.
      updatedCampaignMemberships.push(newMembership)
    }
    userDataToSet.campaignMemberships = updatedCampaignMemberships

    // --- Guardar la nueva campaña y el perfil de usuario ---
    await newCampaignRef.set(campaignData)
    // Usar set con merge para actualizar el documento de usuario si ya existe,
    // o crearlo si es completamente nuevo.
    await db
      .collection('users')
      .doc(candidateUid)
      .set(userDataToSet, { merge: true })

    // --- Respuesta exitosa ---
    return res.status(201).json({
      message: 'Campaña y candidato creados exitosamente.',
      campaignId: newCampaignRef.id,
      candidateId: candidateUid,
    })
  } catch (error) {
    console.error('Error en createCampaign:', error)
    // Manejo de errores específicos para una mejor depuración
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

// --- FUNCIÓN PARA ACTUALIZAR UNA CAMPAÑA (POST) ---
export const updateCampaign = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(204).send('')
    return
  }

  if (req.method !== 'POST') {
    return res.status(405).send('Método no permitido.')
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

    const { callingUserUid } = req.body
    if (!callingUserUid) {
      return res.status(401).json({
        message: 'No se proporcionó UID del usuario para la autorización.',
      })
    }

    const campaignRef = db.collection('campaigns').doc(campaignId)
    const campaignDoc = await campaignRef.get()

    if (!campaignDoc.exists) {
      return res.status(404).json({ message: 'La campaña no fue encontrada.' })
    }

    if (campaignDoc.data().candidateId !== callingUserUid) {
      return res.status(403).json({
        message: 'Acceso denegado. No tienes permiso para editar esta campaña.',
      })
    }

    const updateData = {}
    for (const key in updates) {
      if (Object.prototype.hasOwnProperty.call(updates, key)) {
        updateData[key] = updates[key]
      }
    }

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

// --- NUEVA FUNCIÓN PARA OBTENER LOS DATOS DE UNA CAMPAÑA (GET) ---
export const getCampaignById = functions.https.onRequest(async (req, res) => {
  // Configuración de CORS
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(204).send('')
    return
  }

  if (req.method !== 'GET') {
    return res.status(405).send('Método no permitido.')
  }

  try {
    const db = getFirestore(getApp())
    const campaignId = req.query.id

    if (!campaignId) {
      return res.status(400).json({
        message: 'Se requiere el ID de la campaña como parámetro en la URL.',
      })
    }

    // TODO: Añadir verificación de que quien llama es un miembro de la campaña.

    const campaignRef = db.collection('campaigns').doc(campaignId)
    const campaignDoc = await campaignRef.get()

    if (!campaignDoc.exists) {
      return res.status(404).json({ message: 'La campaña no fue encontrada.' })
    }

    return res.status(200).json({
      id: campaignDoc.id,
      ...campaignDoc.data(),
    })
  } catch (error) {
    console.error('Error en getCampaignById:', error)
    return res.status(500).json({
      message: 'Error interno del servidor al obtener la campaña.',
      error: error.message,
    })
  }
})
