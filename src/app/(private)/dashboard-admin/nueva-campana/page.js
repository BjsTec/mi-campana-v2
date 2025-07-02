// src/app/(private)/dashboard-admin/nueva-campana/page.js
'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext'; // Para mostrar info del usuario logueado
// Eliminadas las importaciones de Lottie:
// import Lottie from 'lottie-react';
// import successAnimation from '@/animations/success.json';
// import errorAnimation from '@/animations/error.json';

export default function NuevaCampanaPage() {
  const { user } = useAuth(); // Obtiene el usuario logueado del contexto

  // Estados para los campos del formulario
  const [nombreCampana, setNombreCampana] = useState('');
  const [emailContacto, setEmailContacto] = useState('');
  const [telefonoContacto, setTelefonoContacto] = useState('');
  const [whatsappContacto, setWhatsappContacto] = useState('');
  const [websiteCampana, setWebsiteCampana] = useState('');
  const [logoCampana, setLogoCampana] = useState(null); // Para el archivo de imagen

  // Estados para la UI
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' o 'error'

  // Manejador para el cambio de archivo del logo
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setLogoCampana(file);
    } else {
      setLogoCampana(null);
      setMessage('Por favor, selecciona un archivo de imagen válido para el logo.');
      setMessageType('error');
    }
  };

  // Manejador para el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(''); // Limpiar mensajes previos
    setMessageType('');

    // Validación básica (puedes añadir más si es necesario)
    if (!nombreCampana || !emailContacto || !telefonoContacto) {
      setMessage('Por favor, completa los campos obligatorios: Nombre, Email y Teléfono.');
      setMessageType('error');
      setLoading(false);
      return;
    }

    // Simulación de guardado
    console.log('Simulando guardado de nueva campaña...');
    const campaignData = {
      nombreCampana,
      emailContacto,
      telefonoContacto,
      whatsappContacto,
      websiteCampana,
      logoFileName: logoCampana ? logoCampana.name : 'No logo',
      // En un caso real, aquí enviarías el archivo del logo a un servicio de almacenamiento (Firebase Storage, S3, etc.)
    };
    console.log('Datos de la campaña a guardar:', campaignData);

    // Simular un retardo de red
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simular éxito o error aleatorio (para pruebas)
    const success = Math.random() > 0.2; // 80% de éxito

    if (success) {
      setMessage('¡Campaña creada exitosamente (simulado)!');
      setMessageType('success');
      // Limpiar formulario después de éxito
      setNombreCampana('');
      setEmailContacto('');
      setTelefonoContacto('');
      setWhatsappContacto('');
      setWebsiteCampana('');
      setLogoCampana(null);
    } else {
      setMessage('Error al crear la campaña (simulado). Inténtalo de nuevo.');
      setMessageType('error');
    }

    setLoading(false);
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Acceso Denegado:</strong>
        <span className="block sm:inline"> No tienes permisos para ver esta página.</span>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Crear Nueva Campaña</h1>
      <p className="text-gray-600 mb-6">
        Aquí puedes configurar los detalles de tu nueva campaña.
      </p>

      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campo: Nombre de la Campaña */}
          <div>
            <label htmlFor="nombreCampana" className="block text-sm font-medium text-gray-700">
              Nombre de la Campaña <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="nombreCampana"
              value={nombreCampana}
              onChange={(e) => setNombreCampana(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="Ej: Campaña Electoral 2025"
            />
          </div>

          {/* Campo: Email de Contacto */}
          <div>
            <label htmlFor="emailContacto" className="block text-sm font-medium text-gray-700">
              Email de Contacto <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="emailContacto"
              value={emailContacto}
              onChange={(e) => setEmailContacto(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="ejemplo@dominio.com"
            />
          </div>

          {/* Campo: Teléfono de Contacto */}
          <div>
            <label htmlFor="telefonoContacto" className="block text-sm font-medium text-gray-700">
              Teléfono de Contacto <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="telefonoContacto"
              value={telefonoContacto}
              onChange={(e) => setTelefonoContacto(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="Ej: +57 300 1234567"
            />
          </div>

          {/* Campo: WhatsApp */}
          <div>
            <label htmlFor="whatsappContacto" className="block text-sm font-medium text-gray-700">
              Número de WhatsApp
            </label>
            <input
              type="tel"
              id="whatsappContacto"
              value={whatsappContacto}
              onChange={(e) => setWhatsappContacto(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="Ej: +57 300 1234567"
            />
          </div>

          {/* Campo: Website */}
          <div>
            <label htmlFor="websiteCampana" className="block text-sm font-medium text-gray-700">
              Sitio Web
            </label>
            <input
              type="url"
              id="websiteCampana"
              value={websiteCampana}
              onChange={(e) => setWebsiteCampana(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="https://www.tucampana.com"
            />
          </div>

          {/* Campo: Logo (Imagen) */}
          <div>
            <label htmlFor="logoCampana" className="block text-sm font-medium text-gray-700">
              Logo de la Campaña
            </label>
            <input
              type="file"
              id="logoCampana"
              accept="image/*" // Solo acepta archivos de imagen
              onChange={handleLogoChange}
              className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-primary-light file:text-white
                hover:file:bg-primary-dark"
            />
            {logoCampana && (
              <p className="mt-2 text-sm text-gray-600">Archivo seleccionado: {logoCampana.name}</p>
            )}
          </div>

          {/* Mensajes de estado (éxito/error) - Ahora solo texto, sin Lottie */}
          {message && (
            <div className={`flex items-center p-4 rounded-md ${
              messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`} role="alert">
              <p className="font-medium">{message}</p>
            </div>
          )}

          {/* Botón de Enviar */}
          <button
            type="submit"
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-all duration-300 ${
              loading
                ? 'bg-primary-light cursor-not-allowed'
                : 'bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary'
            }`}
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Crear Campaña'}
          </button>
        </form>
      </div>

      {user && (
        <p className="mt-8 text-sm text-gray-500 text-center">
          Actualmente logueado como: <span className="font-semibold">{user.name}</span> (Rol: <span className="font-semibold">{user.role}</span>)
        </p>
      )}
    </div>
  );
}