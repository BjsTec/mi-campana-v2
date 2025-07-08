// functions/routes/campaigns.js

import * as functions from 'firebase-functions'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'
import { getApp } from 'firebase-admin/app'
import bcrypt from 'bcryptjs'

// Configuración para bcrypt
const saltRounds = 10

// --- FUNCIÓN PARA CREAR UNA CAMPAÑA Y SU CANDIDATO ASOCIADO (POST) ---
export const createCampaign = functions.https.onRequest(async (req, res) => {
  // ... (código existente de createCampaign)
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

    const userByCedulaSnapshot = await db
      .collection('users')
      .where('cedula', '==', data.candidateCedula)
      .limit(1)
      .get()
    if (!userByCedulaSnapshot.empty) {
      const existingUser = userByCedulaSnapshot.docs[0].data()
      const isAlreadyCandidate = existingUser.campaignMemberships?.some(
        (membership) =>
          membership.type === data.type && membership.role === 'candidato',
      )
      if (isAlreadyCandidate) {
        return res.status(409).json({
          message: `Este usuario ya es candidato para una campaña de tipo '${data.type}'.`,
        })
      }
    }

    try {
      await auth.getUserByEmail(data.candidateEmail)
      return res.status(409).json({
        message: 'El correo electrónico del candidato ya está en uso.',
      })
    } catch (error) {
      if (error.code !== 'auth/user-not-found') {
        throw error
      }
    }

    const candidateRecord = await auth.createUser({
      email: data.candidateEmail,
      password: data.candidatePassword,
      displayName: data.candidateName,
    })
    const candidateUid = candidateRecord.uid

    const hashedPassword = await bcrypt.hash(data.candidatePassword, saltRounds)
    const userCredentialsData = {
      cedula: data.candidateCedula,
      firebaseAuthUid: candidateUid,
      hashedClave: hashedPassword,
      createdAt: new Date().toISOString(),
    }
    await db
      .collection('user_credentials')
      .doc(candidateUid)
      .set(userCredentialsData)

    const registrationSlug = `${data.type}-${data.campaignName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`
    const newCampaignRef = db.collection('campaigns').doc()
    const campaignData = {
      campaignName: data.campaignName,
      type: data.type,
      scope: data.scope || null,
      location: data.location || {},
      candidateId: candidateUid,
      contactInfo: data.contactInfo || {},
      media: {
        logoUrl: data.logoUrl || null,
        bannerUrl: data.bannerUrl || null,
      },
      socialLinks: data.socialLinks || {},
      status: 'activo',
      paymentStatus: 'pagado',
      registrationSlug: registrationSlug,
      createdAt: new Date().toISOString(),
      createdBy: 'admin_uid_placeholder',
    }

    const userDocRef = db.collection('users').doc(candidateUid)
    const userData = {
      name: data.candidateName,
      email: data.candidateEmail,
      cedula: data.candidateCedula,
      role: 'candidato',
      registeredViaAuthUid: candidateUid,
      lastLogin: null,
      createdAt: new Date().toISOString(),
      campaignMemberships: [
        {
          campaignId: newCampaignRef.id,
          campaignName: data.campaignName,
          role: 'candidato',
          type: data.type,
        },
      ],
      location: data.candidateLocation || {},
    }

    await newCampaignRef.set(campaignData)
    await userDocRef.set(userData)

    return res.status(201).json({
      message: 'Campaña y candidato creados exitosamente.',
      campaignId: newCampaignRef.id,
      candidateId: candidateUid,
    })
  } catch (error) {
    console.error('Error en createCampaign:', error)
    return res.status(500).json({
      message: 'Error interno del servidor al crear la campaña.',
      error: error.message,
    })
  }
})

// --- FUNCIÓN PARA ACTUALIZAR UNA CAMPAÑA (POST) ---
export const updateCampaign = functions.https.onRequest(async (req, res) => {
  // ... (código existente de updateCampaign)
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
