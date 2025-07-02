// functions/routes/users.js

import * as functions from 'firebase-functions';
import { getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Configuración para bcrypt
const saltRounds = 10;

// IMPORTANTE: NO inicializamos 'app', 'auth' o 'db' aquí al nivel superior del módulo.
// Se inicializarán DENTRO de cada función para asegurar que 'initializeApp()' ya se haya ejecutado
// en functions/index.js antes de que intenten obtener los servicios.


// --- FUNCIÓN DE PRUEBA DE CONEXIÓN (Mantenida por ahora) ---
export const testUsersModuleConnection = functions.https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    if (req.method !== 'GET') {
        return res.status(405).send('Método no permitido. Solo GET.');
    }

    try {
        // --- Obtener las instancias de Firebase Admin SDK DENTRO de la función ---
        const app = getApp(); // Obtiene la aplicación por defecto ya inicializada
        const db = getFirestore(app); // Obtiene la instancia de Firestore para esa app
        const auth = getAuth(app); // Añadido para verificar Auth también si es necesario en el futuro

        // Prueba simple de acceso a Auth (no crea token)
        await auth.getUser('some-non-existent-uid-for-test').catch(e => {
            if (e.code !== 'auth/user-not-found') throw e; // Ignorar si no encuentra el usuario, pero lanzar otros errores
        });

        const testDocRef = db.collection('test_users_module').doc('connection_status');
        await testDocRef.set({
            timestamp: new Date().toISOString(),
            message: 'Conexión exitosa a Firestore y Auth desde users.js (dentro de función)',
            module: 'users.js'
        });

        const snapshot = await testDocRef.get();
        const data = snapshot.data();

        return res.status(200).json({
            message: 'Firebase Admin SDK inicializado y Firestore/Auth accesible desde users.js.',
            statusData: data
        });
    } catch (error) {
        console.error('Error durante la prueba de conexión a Firestore/Auth desde users.js:', error);
        return res.status(500).json({
            message: 'Error al conectar o interactuar con Firestore/Auth desde users.js.',
            error: error.message
        });
    }
});


// --- FUNCIÓN PARA CREAR/REGISTRAR UN USUARIO (POST) ---
export const registerUser = functions.https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).send('Método no permitido. Solo POST.');
    }

    try {
        const app = getApp();
        const auth = getAuth(app);
        const db = getFirestore(app);

        const userData = req.body;

        // *** Validación de datos de entrada ***
        if (!userData || typeof userData !== 'object' || !userData.cedula || !userData.clave || !userData.name || !userData.email) {
            return res.status(400).json({ message: 'Datos de usuario inválidos. Se requieren cédula, clave, nombre y email.' });
        }
        if (typeof userData.cedula !== 'string' || userData.cedula.trim() === '') {
            return res.status(400).json({ message: 'La cédula es requerida y debe ser una cadena de texto no vacía.' });
        }
        if (typeof userData.clave !== 'string' || userData.clave.length < 6) {
            return res.status(400).json({ message: 'La clave es requerida y debe tener al menos 6 caracteres.' });
        }
        if (typeof userData.name !== 'string' || userData.name.trim() === '') {
            return res.status(400).json({ message: 'El nombre es requerido y debe ser una cadena de texto no vacía.' });
        }
        if (typeof userData.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
            return res.status(400).json({ message: 'El email es requerido y debe ser una dirección de correo válida.' });
        }

        // 1. Verificar si la cédula ya existe en Firestore para evitar duplicados
        const cedulaSnapshot = await db.collection('user_credentials').where('cedula', '==', userData.cedula).get();
        if (!cedulaSnapshot.empty) {
            return res.status(409).json({ message: 'La cédula ya está registrada.' });
        }

        // 2. Crear el usuario en Firebase Authentication con el EMAIL REAL
        let firebaseAuthUid;
        try {
            const userRecord = await auth.createUser({
                email: `id-${userData.cedula}@campana.com`, // <--- ¡EMAIL REAL AQUÍ!
                password: userData.cedula, // La clave se envía a Firebase Auth
                displayName: userData.name
            });
            firebaseAuthUid = userRecord.uid;
        } catch (authError) {
            console.error('Error al crear usuario en Firebase Authentication (email real):', authError);
            if (authError.code === 'auth/email-already-exists') {
                return res.status(409).json({ message: 'Ya existe un usuario registrado con este correo electrónico.' });
            }
            return res.status(500).json({ message: 'Error interno al registrar el usuario en autenticación.', error: authError.message });
        }

        // 3. (Opcional pero recomendado) Hashear la clave y guardarla en Firestore si se requiere verificación secundaria
        // O si quieres mantener un respaldo de clave hasheada para futuras migraciones.
        // Si Firebase Auth es la única fuente de la verdad para la contraseña, esta parte es menos crítica.
        // Pero para el flujo de cedula/clave, la necesitamos para el "loginWithCedula"
        const hashedPassword = await bcrypt.hash(userData.clave, saltRounds);

        // 4. Guardar las credenciales (cédula, UID de Auth, clave hasheada) en Firestore
        const userCredentialsData = {
            cedula: userData.cedula,
            firebaseAuthUid: firebaseAuthUid,
            hashedClave: hashedPassword, // Guardar la clave hasheada para verificación por cédula
            createdAt: new Date().toISOString()
        };
        await db.collection('user_credentials').doc(firebaseAuthUid).set(userCredentialsData); // Usa UID como ID de documento

        // 5. Guardar datos adicionales del perfil del usuario en la colección 'users' (si es diferente a user_credentials)
        const userProfileData = {
            name: userData.name,
            email: userData.email, // Email real del usuario
            cedula: userData.cedula,
            role: userData.role || 'user',
            registeredViaAuthUid: firebaseAuthUid,
            lastLogin: null,
            createdAt: new Date().toISOString()
        };
        await db.collection('users').doc(firebaseAuthUid).set(userProfileData);

        return res.status(201).json({
            message: 'Usuario registrado exitosamente',
            firebaseAuthUid: firebaseAuthUid,
            cedula: userData.cedula,
            email: userData.email // Devolver el email real
        });

    } catch (error) {
        console.error('Error en registerUser (general):', error);
        return res.status(500).json({
            message: 'Error interno del servidor al registrar el usuario.',
            error: error.message
        });
    }
});


// --- FUNCIÓN PARA INICIAR SESIÓN CON EMAIL Y CLAVE (POST - Verificador de Credenciales) ---
// Esta función ahora solo verifica las credenciales en Firestore por EMAIL.
// El frontend será responsable de llamar a signInWithEmailAndPassword.

export const loginWithEmail = functions.https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).send('Método no permitido. Solo POST.');
    }

    try {
        const app = getApp(); // Obtiene la aplicación de Firebase Admin ya inicializada
        const db = getFirestore(app);
        // const auth = getAuth(app); // No necesitamos la instancia de Auth aquí si solo generamos JWT personalizado

        // Obtener la clave secreta desde las variables de entorno de Firebase Functions
       const jwtSecret = process.env.BJS_APP_MI_CAMPANA_V2; // <-- ¡Este es el nombre correcto ahora!
        if (!jwtSecret) {
            console.error('JWT_SECRET no configurado en las variables de entorno de Firebase Functions.');
            return res.status(500).json({ message: 'Error de configuración del servidor. La clave JWT no está definida.' });
        }

        const { email, clave } = req.body; // Esperamos 'email' y 'clave' del frontend

        // 1. Buscar las credenciales del usuario en Firestore por CÉDULA (según tu código actual)
        // NOTA IMPORTANTE: Tu frontend envía 'email', pero aquí buscas por 'cedula'.
        // Si 'email' del frontend es en realidad la cédula, está bien.
        // Si el frontend envía un email real, deberías cambiar 'cedula' a 'email' en la consulta.
        const userCredentialSnapshot = await db.collection('user_credentials').where('cedula', '==', email).limit(1).get();

        if (userCredentialSnapshot.empty) {
            console.log('Intento de login: Credenciales no encontradas para email/cedula:', email);
            return res.status(401).json({ message: 'Credenciales incorrectas.' }); // Mensaje genérico por seguridad
        }

        const userCredentialDoc = userCredentialSnapshot.docs[0].data();
        const storedHashedClave = userCredentialDoc.hashedClave;
        const firebaseAuthUid = userCredentialDoc.firebaseAuthUid; // UID de Firebase Auth asociado

        // 2. Comparar la clave proporcionada con la clave hasheada almacenada
        const passwordMatch = await bcrypt.compare(clave, storedHashedClave);

        if (!passwordMatch) {
            console.log('Intento de login: Contraseña incorrecta para UID:', firebaseAuthUid);
            return res.status(401).json({ message: 'Credenciales incorrectas.' }); // Mensaje genérico por seguridad
        }

        // Obtener el documento del usuario de la colección 'users' usando el firebaseAuthUid
        const userDoc = await db.collection('users').doc(firebaseAuthUid).get();

        if (!userDoc.exists) {
            console.error(`Documento de usuario no encontrado en 'users' para UID: ${firebaseAuthUid}`);
            return res.status(404).json({ message: 'Perfil de usuario no encontrado en la base de datos.', firebaseAuthUid: firebaseAuthUid });
        }

        const userData = userDoc.data();
        const name = userData.name || null;
        const role = userData.role || null;
        const userEmail = userData.email || email; // Usa el email del perfil si existe, sino el de la entrada

        // Opcional: Actualizar lastLogin en el perfil del usuario en Firestore
        await db.collection('users').doc(firebaseAuthUid).update({
            lastLogin: new Date().toISOString()
        });

        // --- INICIO: Generar JWT Personalizado ---
        // Definir el payload (datos que contendrá tu token)
        const tokenPayload = {
            uid: firebaseAuthUid, // Identificador único del usuario
            email: userEmail,
            name: name,
            role: role,
            // Puedes añadir más datos relevantes aquí si los necesitas en el frontend
        };

        // Generar el token (válido por 1 hora, por ejemplo)
        const idToken = jwt.sign(tokenPayload, jwtSecret, { expiresIn: '1h' }); // <-- ¡AQUÍ SE CREA EL JWT!
        console.log('JWT Personalizado generado para UID:', firebaseAuthUid);
        // --- FIN: Generar JWT Personalizado ---

        // 3. Devolver la respuesta completa al frontend, incluyendo el JWT personalizado.
        return res.status(200).json({
            message: 'Credenciales verificadas exitosamente. Sesión personalizada iniciada.',
            firebaseAuthUid: firebaseAuthUid,
            email: userEmail,
            name: name,
            role: role,
            idToken: idToken, // <-- ¡EL JWT PERSONALIZADO SE AÑADE COMO 'idToken'!
        });

    } catch (error) {
        console.error('Error en loginWithEmail (JWT):', error);
        return res.status(500).json({
            message: 'Error interno del servidor al intentar iniciar sesión (JWT).',
            error: error.message
        });
    }
});


// --- FUNCIÓN PARA OBTENER USUARIOS DE FORMA SEGURA (GET) ---
// Requiere un ID Token de Firebase Auth del usuario ya logueado en el frontend.
export const getSecureUsers = functions.https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    if (req.method !== 'GET') {
        return res.status(405).send('Método no permitido. Solo GET.');
    }

    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
        console.error('No se proporcionó encabezado de autorización o formato inválido.');
        return res.status(401).json({ message: 'No autorizado. Se requiere token de autenticación Bearer.' });
    }

    const idToken = authorizationHeader.split('Bearer ')[1];

    try {
        const app = getApp();
        const auth = getAuth(app);
        const db = getFirestore(app);

        const decodedToken = await auth.verifyIdToken(idToken);
        const uid = decodedToken.uid;
        console.log('Petición GET autenticada por UID:', uid);

        const usersCollectionRef = db.collection('users');
        const snapshot = await usersCollectionRef.get();

        const users = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return res.status(200).json({
            message: 'Usuarios obtenidos exitosamente (autenticado) desde Firestore',
            data: users
        });

    } catch (error) {
        console.error('Error en getSecureUsers (verificación de token o Firestore):', error);
        return res.status(403).json({ message: 'Acceso denegado. Token inválido/expirado o error de autenticación.' });
    }
});
