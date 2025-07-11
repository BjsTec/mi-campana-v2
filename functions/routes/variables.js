// functions/routes/variables.js

import * as functions from 'firebase-functions'
import { getFirestore } from 'firebase-admin/firestore'
import { getApp } from 'firebase-admin/app'
import jwt from 'jsonwebtoken'
import { defineSecret } from 'firebase-functions/params'
import cors from 'cors' // Importar cors usando la sintaxis ES Modules

// Configuración de CORS para todas las funciones públicas
const publicCors = cors({ origin: true })

const JWT_SECRET_KEY_PARAM = defineSecret('BJS_JWT_SECRET_KEY')

// Middleware de autorización para administradores
// NOTA: Este middleware depende de 'jsonwebtoken' y de 'JWT_SECRET_KEY_PARAM'.
// Si esta función se utiliza fuera de 'variables.js', necesitarás importar/definir JWT_SECRET_KEY_PARAM y jwt aquí.
const authorizeAdmin = async (req, res, next) => {
  // CORS para funciones protegidas (si se accede desde un origen diferente)
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

// 1. OBTENER BONO PROMOCIONAL ACTIVO (GET - Pública para la Home)
export const getActivePromoBonus = functions.https.onRequest(
  async (req, res) => {
    publicCors(req, res, async () => {
      // Usar publicCors aquí
      if (req.method !== 'GET') {
        return res.status(405).send('Método no permitido. Solo GET.')
      }
      try {
        const db = getFirestore(getApp())
        const promoBonusRef = db
          .collection('system_variables')
          .doc('promo_bonus')
        const promoBonusDoc = await promoBonusRef.get()

        if (!promoBonusDoc.exists) {
          return res.status(200).json(null) // No hay bono configurado
        }

        const bonusData = promoBonusDoc.data()
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()) // Solo fecha, sin hora para comparación

        // Verificar si está activo y dentro del rango de fechas
        if (bonusData.isActive && bonusData.startDate && bonusData.endDate) {
          const startDate = new Date(bonusData.startDate + 'T00:00:00') // Asegura que la fecha se interprete al inicio del día
          const endDate = new Date(bonusData.endDate + 'T23:59:59') // Asegura que la fecha se interprete al final del día

          if (today >= startDate && today <= endDate) {
            return res.status(200).json(bonusData)
          }
        }

        return res.status(200).json(null) // No hay bono activo o válido
      } catch (error) {
        console.error('Error en getActivePromoBonus:', error)
        return res.status(500).json({
          message: 'Error interno del servidor al obtener el bono promocional.',
          error: error.message,
        })
      }
    })
  },
)

// 2. OBTENER TIPOS DE CAMPAÑA PÚBLICOS (GET - Pública para selectores y listados)
export const getPublicCampaignTypes = functions.https.onRequest(
  async (req, res) => {
    publicCors(req, res, async () => {
      // Usar publicCors aquí
      if (req.method !== 'GET') {
        return res.status(405).send('Método no permitido. Solo GET.')
      }
      try {
        const db = getFirestore(getApp())
        const docRef = db.collection('system_variables').doc('campaign_types')
        const doc = await docRef.get()

        if (!doc.exists || !doc.data().types) {
          return res.status(200).json([]) // Devolver un array vacío si no hay tipos
        }

        // Devolver solo los tipos activos
        const publicTypes = doc.data().types.filter((type) => type.active)

        return res.status(200).json(publicTypes)
      } catch (error) {
        console.error('Error en getPublicCampaignTypes:', error)
        return res.status(500).json({
          message: 'Error interno del servidor al obtener tipos de campaña.',
          error: error.message,
        })
      }
    })
  },
)

// 3. OBTENER PLANES DE PRECIOS PÚBLICOS (GET - Pública para la tabla de precios)
export const getPublicPricingPlans = functions.https.onRequest(
  async (req, res) => {
    publicCors(req, res, async () => {
      // Usar publicCors aquí
      if (req.method !== 'GET') {
        return res.status(405).send('Método no permitido. Solo GET.')
      }
      try {
        const db = getFirestore(getApp())
        const docRef = db.collection('system_variables').doc('pricing_plans')
        const doc = await docRef.get()

        if (!doc.exists || !doc.data().plans) {
          return res.status(200).json([]) // Devolver un array vacío si no hay planes
        }

        // Devolver todos los planes configurados (puedes añadir filtro 'active' si es necesario en el futuro)
        const publicPlans = doc.data().plans

        return res.status(200).json(publicPlans)
      } catch (error) {
        console.error('Error en getPublicPricingPlans:', error)
        return res.status(500).json({
          message: 'Error interno del servidor al obtener planes de precios.',
          error: error.message,
        })
      }
    })
  },
)

// --- FUNCIONES PROTEGIDAS (Solo accesibles por administradores) ---

// 4. OBTENER TODAS LAS VARIABLES DEL SISTEMA (GET - Para el panel de administración)
export const getSystemVariables = functions.https.onRequest(
  { secrets: [JWT_SECRET_KEY_PARAM] }, // Declara el secreto aquí para que esté disponible
  async (req, res) => {
    authorizeAdmin(req, res, async () => {
      if (req.method !== 'GET') {
        return res.status(405).send('Método no permitido. Solo GET.')
      }
      try {
        const db = getFirestore(getApp())

        const variableName = req.query.name

        if (variableName) {
          const docRef = db.collection('system_variables').doc(variableName)
          const doc = await docRef.get()
          if (!doc.exists) {
            return res
              .status(404)
              .json({ message: `Variable '${variableName}' no encontrada.` })
          }
          return res.status(200).json({ id: doc.id, ...doc.data() })
        } else {
          const snapshot = await db.collection('system_variables').get()
          const variables = {}
          snapshot.forEach((doc) => {
            variables[doc.id] = doc.data()
          })
          return res.status(200).json(variables)
        }
      } catch (error) {
        console.error('Error en getSystemVariables:', error)
        return res.status(500).json({
          message: 'Error interno del servidor al obtener variables.',
          error: error.message,
        })
      }
    })
  },
)

// 5. ACTUALIZAR UNA VARIABLE DEL SISTEMA (POST - Para el panel de administración)
export const updateSystemVariable = functions.https.onRequest(
  { secrets: [JWT_SECRET_KEY_PARAM] }, // Declara el secreto aquí
  async (req, res) => {
    authorizeAdmin(req, res, async () => {
      if (req.method !== 'POST') {
        return res.status(405).send('Método no permitido. Solo POST.')
      }
      try {
        const db = getFirestore(getApp())
        const { variableName, data } = req.body // variableName: 'campaign_types', 'contact_info', 'promo_bonus'

        if (!variableName || !data || typeof data !== 'object') {
          return res.status(400).json({
            message:
              'Se requiere variableName y un objeto con datos para actualizar.',
          })
        }

        const docRef = db.collection('system_variables').doc(variableName)
        await docRef.set(data, { merge: true }) // Usar set con merge para actualizar o crear

        return res.status(200).json({
          message: `Variable '${variableName}' actualizada exitosamente.`,
          variableName,
        })
      } catch (error) {
        console.error('Error en updateSystemVariable:', error)
        return res.status(500).json({
          message: 'Error interno del servidor al actualizar la variable.',
        })
      }
    })
  },
)

// 6. AÑADIR TIPO DE CAMPAÑA (POST - Para el panel de administración)
export const addCampaignType = functions.https.onRequest(
  { secrets: [JWT_SECRET_KEY_PARAM] }, // Declara el secreto aquí
  async (req, res) => {
    authorizeAdmin(req, res, async () => {
      if (req.method !== 'POST') {
        return res.status(405).send('Método no permitido. Solo POST.')
      }

      let newType
      try {
        // Asegurar que req.body sea parseado como JSON.
        // req.body podría ser un Buffer o una cadena si Content-Type no es application/json
        // o si el middleware body-parser no lo está manejando implícitamente por alguna razón.
        if (
          req.body &&
          typeof req.body === 'object' &&
          !Array.isArray(req.body) &&
          Object.keys(req.body).length > 0
        ) {
          newType = req.body // Ya parseado por el runtime de Firebase Functions
        } else if (typeof req.body === 'string' && req.body.length > 0) {
          newType = JSON.parse(req.body) // Parsear si es una cadena cruda
        } else {
          // Si req.body es undefined, null, un array vacío o un objeto vacío, asumimos un objeto vacío
          newType = {}
        }
      } catch (parseError) {
        console.error(
          'Error al parsear el cuerpo de la solicitud en addCampaignType:',
          parseError,
        )
        return res
          .status(400)
          .json({ message: 'Cuerpo de la solicitud inválido o no JSON.' })
      }

      console.log(
        'Cuerpo recibido para addCampaignType (después del intento de parsing):',
        newType,
      )

      try {
        const db = getFirestore(getApp())
        // La validación ahora se basa en el 'newType' parseado
        if (!newType || !newType.id || !newType.name) {
          console.log(
            'Fallo de validación: newType:',
            newType,
            'newType.id:',
            newType.id,
            'newType.name:',
            newType.name,
          )
          return res.status(400).json({
            message: 'Se requiere ID y nombre para el nuevo tipo de campaña.',
          })
        }

        const campaignTypesRef = db
          .collection('system_variables')
          .doc('campaign_types')
        const doc = await campaignTypesRef.get()
        let types = []
        if (doc.exists && doc.data().types) {
          types = doc.data().types
        }

        if (types.some((t) => t.id === newType.id)) {
          return res.status(409).json({
            message: `El tipo de campaña con ID '${newType.id}' ya existe.`,
          })
        }

        types.push(newType)
        await campaignTypesRef.set({ types }, { merge: true })

        return res
          .status(201)
          .json({ message: 'Tipo de campaña añadido exitosamente.', newType })
      } catch (error) {
        console.error('Error en addCampaignType:', error)
        return res.status(500).json({
          message: 'Error interno del servidor al añadir tipo de campaña.',
        })
      }
    })
  },
)

// 7. ACTUALIZAR TIPO DE CAMPAÑA (POST - Para el panel de administración)
export const updateCampaignType = functions.https.onRequest(
  { secrets: [JWT_SECRET_KEY_PARAM] }, // Declara el secreto aquí
  async (req, res) => {
    authorizeAdmin(req, res, async () => {
      if (req.method !== 'POST') {
        return res.status(405).send('Método no permitido. Solo POST.')
      }
      try {
        const db = getFirestore(getApp())
        const { id, updates } = req.body // id del tipo de campaña, y el objeto con actualizaciones

        if (!id || !updates || typeof updates !== 'object') {
          return res.status(400).json({
            message:
              'Se requiere ID y actualizaciones para el tipo de campaña.',
          })
        }

        const campaignTypesRef = db
          .collection('system_variables')
          .doc('campaign_types')
        const doc = await campaignTypesRef.get()
        if (!doc.exists || !doc.data().types) {
          return res.status(404).json({
            message: 'No se encontraron tipos de campaña para actualizar.',
          })
        }

        let types = doc.data().types
        const index = types.findIndex((t) => t.id === id)

        if (index === -1) {
          return res
            .status(404)
            .json({ message: `Tipo de campaña con ID '${id}' no encontrado.` })
        }

        types[index] = { ...types[index], ...updates }
        await campaignTypesRef.set({ types }, { merge: true })

        return res.status(200).json({
          message: 'Tipo de campaña actualizado exitosamente.',
          updatedType: types[index],
        })
      } catch (error) {
        console.error('Error en updateCampaignType:', error)
        return res.status(500).json({
          message: 'Error interno del servidor al actualizar tipo de campaña.',
        })
      }
    })
  },
)

// 8. ELIMINAR TIPO DE CAMPAÑA (POST - Para el panel de administración)
export const deleteCampaignType = functions.https.onRequest(
  { secrets: [JWT_SECRET_KEY_PARAM] }, // Declara el secreto aquí
  async (req, res) => {
    authorizeAdmin(req, res, async () => {
      if (req.method !== 'POST') {
        return res.status(405).send('Método no permitido. Solo POST.')
      }
      try {
        const db = getFirestore(getApp())
        const { id } = req.body

        if (!id) {
          return res.status(400).json({
            message: 'Se requiere ID para eliminar el tipo de campaña.',
          })
        }

        // CORRECCIÓN: Usar campaignTypesRef y 'campaign_types'
        const campaignTypesRef = db
          .collection('system_variables')
          .doc('campaign_types')
        const doc = await campaignTypesRef.get()
        if (!doc.exists || !doc.data().types) {
          return res.status(404).json({
            message: 'No se encontraron tipos de campaña para eliminar.',
          })
        }

        let types = doc.data().types
        const initialLength = types.length
        types = types.filter((t) => t.id !== id)

        if (types.length === initialLength) {
          return res
            .status(404)
            .json({ message: `Tipo de campaña con ID '${id}' no encontrado.` })
        }

        // CORRECCIÓN: Usar campaignTypesRef.set
        await campaignTypesRef.set({ types }, { merge: true })

        return res.status(200).json({
          message: 'Tipo de campaña eliminado exitosamente.',
          deletedId: id,
        })
      } catch (error) {
        console.error('Error en deleteCampaignType:', error)
        return res.status(500).json({
          message: 'Error interno del servidor al eliminar tipo de campaña.',
        })
      }
    })
  },
)

// 9. AÑADIR PLAN DE PRECIOS (POST - Para el panel de administración)
export const addPricingPlan = functions.https.onRequest(
  { secrets: [JWT_SECRET_KEY_PARAM] }, // Declara el secreto aquí
  async (req, res) => {
    authorizeAdmin(req, res, async () => {
      if (req.method !== 'POST') {
        return res.status(405).send('Método no permitido. Solo POST.')
      }
      try {
        const db = getFirestore(getApp())
        const newPlan = req.body // { id, typeId, name, price, description }

        if (
          !newPlan ||
          !newPlan.id ||
          !newPlan.name ||
          newPlan.price === undefined ||
          !newPlan.typeId
        ) {
          return res.status(400).json({
            message:
              'Se requieren ID, tipo de campaña, nombre y precio para el nuevo plan.',
          })
        }

        const pricingPlansRef = db
          .collection('system_variables')
          .doc('pricing_plans')
        const doc = await pricingPlansRef.get()
        let plans = []
        if (doc.exists && doc.data().plans) {
          plans = doc.data().plans
        }

        if (plans.some((p) => p.id === newPlan.id)) {
          return res.status(409).json({
            message: `El plan de precios con ID '${newPlan.id}' ya existe.`,
          })
        }

        plans.push(newPlan)
        await pricingPlansRef.set({ plans }, { merge: true })

        return res
          .status(201)
          .json({ message: 'Plan de precios añadido exitosamente.', newPlan })
      } catch (error) {
        console.error('Error en addPricingPlan:', error)
        return res.status(500).json({
          message: 'Error interno del servidor al añadir plan de precios.',
        })
      }
    })
  },
)

// 10. ACTUALIZAR PLAN DE PRECIOS (POST - Para el panel de administración)
export const updatePricingPlan = functions.https.onRequest(
  { secrets: [JWT_SECRET_KEY_PARAM] }, // Declara el secreto aquí
  async (req, res) => {
    authorizeAdmin(req, res, async () => {
      if (req.method !== 'POST') {
        return res.status(405).send('Método no permitido. Solo POST.')
      }
      try {
        const db = getFirestore(getApp())
        const { id, updates } = req.body

        if (!id || !updates || typeof updates !== 'object') {
          return res.status(400).json({
            message:
              'Se requiere ID y actualizaciones para el plan de precios.',
          })
        }

        const pricingPlansRef = db
          .collection('system_variables')
          .doc('pricing_plans')
        const doc = await pricingPlansRef.get()
        if (!doc.exists || !doc.data().plans) {
          return res.status(404).json({
            message: 'No se encontraron planes de precios para actualizar.',
          })
        }

        let plans = doc.data().plans
        const index = plans.findIndex((p) => p.id === id)

        if (index === -1) {
          return res
            .status(404)
            .json({ message: `Plan de precios con ID '${id}' no encontrado.` })
        }

        plans[index] = { ...plans[index], ...updates }
        await pricingPlansRef.set({ plans }, { merge: true })

        return res.status(200).json({
          message: 'Plan de precios actualizado exitosamente.',
          updatedPlan: plans[index],
        })
      } catch (error) {
        console.error('Error en updatePricingPlan:', error)
        return res.status(500).json({
          message: 'Error interno del servidor al actualizar plan de precios.',
        })
      }
    })
  },
)

// 11. ELIMINAR PLAN DE PRECIOS (POST - Para el panel de administración)
export const deletePricingPlan = functions.https.onRequest(
  { secrets: [JWT_SECRET_KEY_PARAM] }, // Declara el secreto aquí
  async (req, res) => {
    authorizeAdmin(req, res, async () => {
      if (req.method !== 'POST') {
        return res.status(405).send('Método no permitido. Solo POST.')
      }
      try {
        const db = getFirestore(getApp())
        const { id } = req.body

        if (!id) {
          return res.status(400).json({
            message: 'Se requiere ID para eliminar el plan de precios.',
          })
        }

        const pricingPlansRef = db
          .collection('system_variables')
          .doc('pricing_plans')
        const doc = await pricingPlansRef.get()
        if (!doc.exists || !doc.data().plans) {
          return res.status(404).json({
            message: 'No se encontraron planes de precios para eliminar.',
          })
        }

        let plans = doc.data().plans
        const initialLength = plans.length
        plans = plans.filter((t) => t.id !== id)

        if (plans.length === initialLength) {
          return res
            .status(404)
            .json({ message: `Plan de precios con ID '${id}' no encontrado.` })
        }

        await pricingPlansRef.set({ plans }, { merge: true })

        return res.status(200).json({
          message: 'Plan de precios eliminado exitosamente.',
          deletedId: id,
        })
      } catch (error) {
        console.error('Error en deletePricingPlan:', error)
        return res.status(500).json({
          message: 'Error interno del servidor al eliminar plan de precios.',
        })
      }
    })
  },
)

// --- NUEVAS FUNCIONES PARA UBICACIONES (Departamentos y Ciudades) ---

// 12. OBTENER TODOS LOS DEPARTAMENTOS (GET - Pública)
export const getDepartments = functions.https.onRequest(async (req, res) => {
  publicCors(req, res, async () => {
    // Usar publicCors aquí
    if (req.method !== 'GET') {
      return res.status(405).send('Método no permitido. Solo GET.')
    }
    try {
      const db = getFirestore(getApp())
      const departmentsSnapshot = await db.collection('departamentos').get()

      const departments = []
      departmentsSnapshot.forEach((doc) => {
        departments.push({ id: doc.id, ...doc.data() })
      })

      // Opcional: Ordenar por nombre
      departments.sort((a, b) => a.name.localeCompare(b.name))

      return res.status(200).json(departments)
    } catch (error) {
      console.error('Error en getDepartments:', error)
      return res.status(500).json({
        message: 'Error interno del servidor al obtener departamentos.',
        error: error.message,
      })
    }
  })
})

// 13. OBTENER CIUDADES POR DEPARTAMENTO (GET - Pública)
export const getCitiesByDepartment = functions.https.onRequest((req, res) => {
  publicCors(req, res, async () => {
    // Usar publicCors aquí
    if (req.method !== 'GET') {
      return res.status(405).send('Método no permitido. Solo GET.')
    }
    const departmentId = req.query.departmentId

    if (!departmentId) {
      return res.status(400).json({
        message:
          'Se requiere el ID del departamento como parámetro (departmentId).',
      })
    }

    try {
      const db = getFirestore(getApp())
      const citiesSnapshot = await db
        .collection('departamentos')
        .doc(departmentId)
        .collection('ciudades')
        .get()

      const cities = []
      citiesSnapshot.forEach((doc) => {
        cities.push({ id: doc.id, ...doc.data() })
      })

      // Opcional: Ordenar por nombre
      cities.sort((a, b) => a.name.localeCompare(b.name))

      return res.status(200).json(cities)
    } catch (error) {
      console.error('Error en getCitiesByDepartment:', error)
      return res.status(500).json({
        message: 'Error interno del servidor al obtener ciudades.',
        error: error.message,
      })
    }
  })
})
