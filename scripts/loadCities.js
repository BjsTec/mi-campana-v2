// loadCities.js
// Ejecutar con: node loadCities.js
// Asegúrate de tener 'firebase-admin' instalado: npm install firebase-admin
// ¡Este script NO necesita dotenv ni el archivo .env si usas serviceAccountKey.json directamente!

const admin = require('firebase-admin')
// ¡IMPORTANTE! Reemplaza './serviceAccountKey.json' con la ruta correcta a tu archivo JSON de clave de cuenta de servicio.
// Este archivo DEBE estar presente en la ruta especificada.
const serviceAccount = require('./serviceAccountKey.json')
const colombiaData = require('./colombia_data.json') // Ruta corregida, asumiendo que está en la misma carpeta 'scripts'

// Inicializa Firebase Admin SDK usando el archivo de clave de cuenta de servicio
// Asegúrate de que solo se inicialice una vez si este script se ejecuta múltiples veces
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    })
    console.log(
      'Firebase Admin SDK inicializado exitosamente usando serviceAccountKey.json.',
    )
  } catch (error) {
    console.error(
      'Error al inicializar Firebase Admin SDK con serviceAccountKey.json:',
      error.message,
    )
    console.error(
      'Verifica que el archivo serviceAccountKey.json es válido y tiene los permisos correctos.',
    )
    process.exit(1) // Termina el script si la inicialización falla
  }
}

const db = admin.firestore()

async function uploadColombiaData() {
  console.log(
    'Iniciando carga de datos de departamentos y municipios de Colombia a Firestore...',
  )
  const batch = db.batch() // Usar batch para operaciones atómicas y eficientes

  let departmentCount = 0
  let cityCount = 0
  let skippedItems = 0 // Contador para elementos saltados

  // --- INICIO DE DEPURACIÓN (Mantenemos los logs para verificar la nueva lógica) ---
  console.log(
    'Contenido de colombiaData (primeros 2 elementos):',
    colombiaData.slice(0, 2),
  )
  if (colombiaData.length > 0) {
    console.log('Primer departamento ID (original):', colombiaData[0].id)
    console.log('Primer departamento nombre:', colombiaData[0].departamento)
    if (colombiaData[0].ciudades && colombiaData[0].ciudades.length > 0) {
      console.log(
        'Primera ciudad del primer departamento (original):',
        colombiaData[0].ciudades[0],
      )
    }
  }
  // --- FIN DE DEPURACIÓN ---

  // Colección principal para los departamentos
  const departmentsCollectionRef = db.collection('departamentos')

  for (const department of colombiaData) {
    // Adaptar el ID del departamento: convertir a string
    const departmentId = String(department.id).trim() // Asegurarse de que sea string y no esté vacío

    if (!departmentId) {
      console.warn(
        `Saltando departamento sin ID válido (después de conversión): ${department.departamento || 'Desconocido'}. ID convertido: '${departmentId}'`,
      )
      skippedItems++
      continue
    }

    // Referencia al documento del departamento usando su 'id' como ID de documento
    const departmentDocRef = departmentsCollectionRef.doc(departmentId)

    // Añadir/actualizar el documento del departamento
    batch.set(departmentDocRef, {
      name: department.departamento,
      country: 'Colombia', // País fijo por ahora
      code: departmentId, // Usar el ID del departamento como su código
    })
    departmentCount++

    // Subcolección para las ciudades/municipios dentro de cada departamento
    const citiesSubcollectionRef = departmentDocRef.collection('ciudades')

    // Iterar sobre las ciudades, que ahora son solo cadenas de texto
    for (const cityName of department.ciudades) {
      // Generar un ID para la ciudad a partir de su nombre
      const cityId = cityName
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '')

      if (!cityId) {
        console.warn(
          `Saltando ciudad sin ID válido (generado) en departamento ${department.departamento}: ${cityName || 'Desconocido'}. ID generado: '${cityId}'`,
        )
        skippedItems++
        continue
      }

      // Referencia al documento de la ciudad usando el ID generado
      const cityDocRef = citiesSubcollectionRef.doc(cityId)

      // Añadir/actualizar el documento del municipio
      batch.set(cityDocRef, {
        name: cityName, // El nombre de la ciudad es la cadena original
        code: cityId, // Usar el ID generado como su código
        // Puedes añadir aquí otros datos relevantes si los tienes o los necesitas
      })
      cityCount++
    }
  }

  try {
    await batch.commit()
    console.log(
      `Carga completada: ${departmentCount} departamentos y ${cityCount} ciudades/municipios añadidas.`,
    )
    if (skippedItems > 0) {
      console.warn(
        `${skippedItems} elementos fueron saltados debido a IDs inválidos.`,
      )
    }
  } catch (error) {
    console.error('Error durante la carga de datos:', error)
    // Si hay un error, el batch se revierte automáticamente
  }
}

// Ejecutar la función de carga
uploadColombiaData()
  .then(() => {
    console.log('Script de carga de datos geográficos finalizado con éxito.')
    process.exit(0) // Termina el proceso Node.js exitosamente
  })
  .catch((err) => {
    console.error('Error fatal en el script de carga:', err)
    process.exit(1) // Termina el proceso Node.js con error
  })
