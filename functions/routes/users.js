// functions/routes/users.js

import * as functions from 'firebase-functions';
import { getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { defineSecret } from 'firebase-functions/params';

// Configuración para bcrypt
const saltRounds = 10;

// Se usa el nombre del secreto original y definitivo
const JWT_SECRET_PARAM = defineSecret('BJS_APP_MI_CAMPANA_V2');


// --- FUNCIÓN DE PRUEBA DE CONEXIÓN ---
export const testUsersModuleConnection = functions.https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
    if (req.method !== 'GET') { return res.status(405).send('Método no permitido.'); }
    try {
        const db = getFirestore(getApp());
        const testDocRef = db.collection('test_users_module').doc('connection_status');
        await testDocRef.set({ timestamp: new Date().toISOString(), message: 'Conexión exitosa desde users.js' });
        const data = (await testDocRef.get()).data();
        return res.status(200).json({ message: 'Firestore accesible desde users.js.', statusData: data });
    } catch (error) {
        console.error('Error en prueba de conexión (users.js):', error);
        return res.status(500).json({ message: 'Error al conectar con Firestore.', error: error.message });
    }
});


// --- FUNCIÓN PARA CREAR/REGISTRAR UN USUARIO (POST) ---
// Esta función es para registros genéricos, no para la creación de campañas.
export const registerUser = functions.https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
    if (req.method !== 'POST') { return res.status(405).send('Método no permitido.'); }

    try {
        const auth = getAuth(getApp());
        const db = getFirestore(getApp());
        const userData = req.body;

        // Validaciones...
        if (!userData || !userData.cedula || !userData.clave || !userData.name || !userData.email) {
            return res.status(400).json({ message: 'Datos de usuario inválidos.' });
        }
        
        const cedulaSnapshot = await db.collection('user_credentials').where('cedula', '==', userData.cedula).get();
        if (!cedulaSnapshot.empty) {
            return res.status(409).json({ message: 'La cédula ya está registrada.' });
        }

        const userRecord = await auth.createUser({
            email: userData.email, // Usamos el email real
            password: userData.clave,
            displayName: userData.name,
        });
        const firebaseAuthUid = userRecord.uid;

        const hashedPassword = await bcrypt.hash(userData.clave, saltRounds);
        const userCredentialsData = {
            cedula: userData.cedula,
            firebaseAuthUid: firebaseAuthUid,
            hashedClave: hashedPassword,
            createdAt: new Date().toISOString(),
        };
        await db.collection('user_credentials').doc(firebaseAuthUid).set(userCredentialsData);

        const userProfileData = {
            name: userData.name,
            email: userData.email,
            cedula: userData.cedula,
            role: userData.role || 'user', // Rol por defecto
            registeredViaAuthUid: firebaseAuthUid,
            lastLogin: null,
            createdAt: new Date().toISOString(),
        };
        await db.collection('users').doc(firebaseAuthUid).set(userProfileData);

        return res.status(201).json({
            message: 'Usuario registrado exitosamente',
            firebaseAuthUid: firebaseAuthUid,
        });
    } catch (error) {
        console.error('Error en registerUser:', error);
        return res.status(500).json({ message: 'Error interno al registrar el usuario.', error: error.message });
    }
});


// --- FUNCIÓN PARA INICIAR SESIÓN CON CÉDULA Y CLAVE (POST) ---
export const loginWithEmail = functions.https.onRequest({ secrets: [JWT_SECRET_PARAM] }, async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
    if (req.method !== 'POST') { return res.status(405).send('Método no permitido.'); }

    try {
        const db = getFirestore(getApp());
        const jwtSecretValue = JWT_SECRET_PARAM.value();
        if (!jwtSecretValue) {
            return res.status(500).json({ message: 'Error de configuración del servidor.' });
        }
        const cleanedJwtSecret = jwtSecretValue.trim();

        const { email, clave } = req.body; // 'email' aquí es la cédula
        const userCredentialSnapshot = await db.collection('user_credentials').where('cedula', '==', email).limit(1).get();

        if (userCredentialSnapshot.empty) {
            return res.status(401).json({ message: 'Credenciales incorrectas.' });
        }

        const userCredentialDoc = userCredentialSnapshot.docs[0].data();
        const passwordMatch = await bcrypt.compare(clave, userCredentialDoc.hashedClave);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Credenciales incorrectas.' });
        }

        const firebaseAuthUid = userCredentialDoc.firebaseAuthUid;
        const userDoc = await db.collection('users').doc(firebaseAuthUid).get();
        if (!userDoc.exists) {
            return res.status(404).json({ message: 'Perfil de usuario no encontrado.' });
        }
        
        const userData = userDoc.data();
        await db.collection('users').doc(firebaseAuthUid).update({ lastLogin: new Date().toISOString() });

        // --- INICIO DE LA CORRECCIÓN ---
        // Se añade el campo 'campaignMemberships' al payload del token.
        const tokenPayload = {
            uid: firebaseAuthUid,
            email: userData.email,
            name: userData.name,
            role: userData.role,
            campaignMemberships: userData.campaignMemberships || [], // <-- LÍNEA CLAVE AÑADIDA
        };
        // --- FIN DE LA CORRECCIÓN ---

        const idToken = jwt.sign(tokenPayload, cleanedJwtSecret, {
            algorithm: 'HS256',
            expiresIn: '1h',
        });

        return res.status(200).json({
            message: 'Credenciales verificadas exitosamente.',
            idToken: idToken,
        });
    } catch (error) {
        console.error('Error en loginWithEmail:', error);
        return res.status(500).json({ message: 'Error interno al iniciar sesión.', error: error.message });
    }
});


// --- FUNCIÓN PARA OBTENER USUARIOS (PROTEGIDA) ---
export const getSecureUsers = functions.https.onRequest({ secrets: [JWT_SECRET_PARAM] }, async (req, res) => {
    // ... (código existente, no requiere cambios por ahora)
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
    if (req.method !== 'GET') { return res.status(405).send('Método no permitido.'); }

    // Lógica de autorización...
});

