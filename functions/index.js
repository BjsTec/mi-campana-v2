// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Inicializa la aplicación de Firebase Admin.
admin.initializeApp();

exports.getUsers = functions.https.onRequest(async (req, res) => {
    // Configuración de CORS
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Manejo de peticiones OPTIONS (preflight requests) para CORS
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    // Asegurarse de que solo se manejen peticiones GET para esta función.
    if (req.method !== 'GET') {
        return res.status(405).send('Método no permitido. Solo GET.');
    }

    try {
        // Datos simulados de usuarios
        const users = [
            { id: 'user1', name: 'Juan Pérez', email: 'juan.perez@example.com', role: 'admin' },
            { id: 'user2', name: 'María García', email: 'maria.garcia@example.com', role: 'user' },
            { id: 'user3', name: 'Carlos Ruiz', email: 'carlos.ruiz@example.com', role: 'editor' },
        ];

        // Envía los datos como respuesta JSON
        return res.status(200).json({
            message: 'Usuarios obtenidos exitosamente',
            data: users
        });

    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        return res.status(500).json({
            message: 'Error interno del servidor al obtener usuarios.',
            error: error.message
        });
    }
});