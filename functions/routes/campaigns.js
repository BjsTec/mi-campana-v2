// functions/routes/campaigns.js

import * as functions from 'firebase-functions'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'
import { getApp } from 'firebase-admin/app'

// --- FUNCIÓN PARA CREAR UNA CAMPAÑA Y SU CANDIDATO ASOCIADO (POST) ---
export const createCampaign = functions.https.onRequest(async (req, res) => {
  // Configuración de CORS para permitir peticiones desde tu frontend
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

  // TODO: Añadir verificación de que quien llama es un 'admin'
  // const adminUid = await verifyAdminToken(req.headers.authorization);
  // if (!adminUid) {
  //   return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador.' });
  // }

  try {
    const db = getFirestore(getApp())
    const auth = getAuth(getApp())

    const data = req.body

    // --- 1. Validación de Datos de Entrada ---
    const requiredFields = [
      'campaignName',
      'type',
      'candidateName',
      'candidateCedula',
      'candidateEmail',
      'candidatePassword',
    ]
    for (const field of requiredFields) {
      if (!data[field]) {
        return res
          .status(400)
          .json({ message: `El campo '${field}' es requerido.` })
      }
    }

    // --- 2. Verificación de Unicidad del Candidato ---
    // Comprobar si ya existe un usuario con esa cédula
    const userByCedulaSnapshot = await db
      .collection('users')
      .where('cedula', '==', data.candidateCedula)
      .limit(1)
      .get()
    if (!userByCedulaSnapshot.empty) {
      const existingUser = userByCedulaSnapshot.docs[0].data()
      // Revisar si ya es candidato en una campaña del mismo tipo
      const isAlreadyCandidate = existingUser.campaignMemberships?.some(
        (membership) =>
          membership.type === data.type && membership.role === 'candidato',
      )
      if (isAlreadyCandidate) {
        return res
          .status(409)
          .json({
            message: `Este usuario ya es candidato para una campaña de tipo '${data.type}'.`,
          })
      }
    }

    // Comprobar si ya existe un usuario con ese email en Firebase Auth
    try {
      await auth.getUserByEmail(data.candidateEmail)
      return res
        .status(409)
        .json({
          message: 'El correo electrónico del candidato ya está en uso.',
        })
    } catch (error) {
      if (error.code !== 'auth/user-not-found') {
        throw error // Lanzar otros errores de autenticación
      }
      // Si el error es 'user-not-found', significa que el email está disponible, lo cual es bueno.
    }

    // --- 3. Creación del Usuario Candidato ---
    const candidateRecord = await auth.createUser({
      email: data.candidateEmail,
      password: data.candidatePassword,
      displayName: data.candidateName,
    })
    const candidateUid = candidateRecord.uid

    // --- 4. Creación del Documento de Campaña ---
    // Generar un slug único para el link de registro
    const registrationSlug = `${data.type}-${data.campaignName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`

    const newCampaignRef = db.collection('campaigns').doc() // Genera un nuevo ID para la campaña
    const campaignData = {
      campaignName: data.campaignName,
      type: data.type,
      scope: data.scope || null, // ej: "nacional", "departamental"
      location: data.location || {}, // ej: { department: "Casanare", city: "Yopal" }
      candidateId: candidateUid, // Enlace al candidato
      contactInfo: data.contactInfo || {},
      media: {
        logoUrl: data.logoUrl || null,
        bannerUrl: data.bannerUrl || null,
      },
      socialLinks: data.socialLinks || {},
      status: 'activo',
      paymentStatus: 'pagado', // Estado inicial
      registrationSlug: registrationSlug,
      createdAt: new Date().toISOString(),
      createdBy: 'admin_uid_placeholder', // Reemplazar con el UID del admin verificado
    }

    // --- 5. Creación del Documento de Usuario con su Membresía ---
    const userDocRef = db.collection('users').doc(candidateUid)
    const userData = {
      name: data.candidateName,
      email: data.candidateEmail,
      cedula: data.candidateCedula,
      createdAt: new Date().toISOString(),
      primaryRole: 'candidato',
      campaignMemberships: [
        {
          campaignId: newCampaignRef.id,
          campaignName: data.campaignName,
          role: 'candidato',
          type: data.type,
        },
      ],
      // Añadir ubicación si se proporciona
      location: data.candidateLocation || {},
    }

    // Escribir ambos documentos en la base de datos
    await newCampaignRef.set(campaignData)
    await userDocRef.set(userData)

    return res.status(201).json({
      message: 'Campaña y candidato creados exitosamente.',
      campaignId: newCampaignRef.id,
      candidateId: candidateUid,
    })
  } catch (error) {
    console.error('Error en createCampaign:', error)
    // Si se creó el usuario en Auth pero falló Firestore, se debería considerar limpiarlo.
    // Por ahora, devolvemos un error genérico.
    return res.status(500).json({
      message: 'Error interno del servidor al crear la campaña.',
      error: error.message,
    })
  }
})

// Aquí añadiremos más funciones como getCampaigns, updateCampaign, etc.
