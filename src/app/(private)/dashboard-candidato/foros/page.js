// src/app/(private)/dashboard-candidato/foros/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PlusCircleIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

// Datos mockeados para simular temas de foros con descripción y link de WhatsApp
const temasForoInicialMock = [
  {
    id: 'f001',
    titulo: 'Discusión sobre la Campaña 2025',
    descripcion: 'Espacio para debatir estrategias y objetivos de la campaña electoral 2025.',
    autor: 'Admin Yopal',
    fecha: '2025-07-01',
    respuestas: 15,
    ult_act: '2025-07-07',
    whatsappLink: 'https://wa.me/573001234567?text=Hola%20quiero%20unirme%20al%20foro%20de%20Campa%C3%B1a',
    activo: true, // Añadido para la funcionalidad de Activar/Desactivar
  },
  {
    id: 'f002',
    titulo: 'Ideas para el alcance de votantes en Casanare',
    descripcion: 'Compartamos tácticas efectivas para llegar a más votantes en la región de Casanare.',
    autor: 'Líder Equipo A',
    fecha: '2025-06-28',
    respuestas: 8,
    ult_act: '2025-07-06',
    whatsappLink: 'https://wa.me/573001234568?text=Hola%20quiero%20unirme%20al%20foro%20de%20Votantes',
    activo: false, // Añadido
  },
  {
    id: 'f003',
    titulo: 'Feedback sobre el formulario de registro de Gerentes',
    descripcion: 'Tus comentarios sobre la usabilidad y mejoras del formulario de registro de Gerentes.',
    autor: 'Equipo de Desarrollo',
    fecha: '2025-07-05',
    respuestas: 3,
    ult_act: '2025-07-07',
    whatsappLink: 'https://wa.me/573001234569?text=Hola%20quiero%20unirme%20al%20foro%20de%20Feedback',
    activo: true, // Añadido
  },
  {
    id: 'f004',
    titulo: 'Preguntas frecuentes sobre el proceso de votación',
    descripcion: 'Un espacio para resolver dudas comunes sobre cómo funciona el proceso de votación.',
    autor: 'Soporte',
    fecha: '2025-06-20',
    respuestas: 22,
    ult_act: '2025-07-08',
    whatsappLink: 'https://wa.me/573001234570?text=Hola%20quiero%20unirme%20al%20foro%20de%20Preguntas',
    activo: true, // Añadido
  },
];

export default function ForosPage() {
  const [foros, setForos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [newForoData, setNewForoData] = useState({
    id: null,
    titulo: '',
    whatsappLink: '',
    descripcion: '',
    activo: true, // Se añade por defecto activo al crear/editar
  });
  const [modalMessage, setModalMessage] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchForos = async () => {
      try {
        setCargando(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setForos(temasForoInicialMock);
      } catch (err) {
        console.error('Error al cargar los foros:', err);
        setError('No se pudieron cargar los temas del foro.');
      } finally {
        setCargando(false);
      }
    };

    fetchForos();
  }, []);

  const handleAgregarClick = () => {
    setIsEditing(false);
    setShowModal(true);
    setNewForoData({ id: null, titulo: '', whatsappLink: '', descripcion: '', activo: true }); // Por defecto activo
    setModalMessage('');
  };

  const handleEditClick = (foro) => {
    setIsEditing(true);
    setShowModal(true);
    setNewForoData({
      id: foro.id,
      titulo: foro.titulo,
      whatsappLink: foro.whatsappLink,
      descripcion: foro.descripcion,
      activo: foro.activo, // Mantener el estado de activo al editar
    });
    setModalMessage('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsEditing(false);
  };

  const handleModalInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewForoData((prevData) => ({
      ...prevData,
      [`${name}`]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalMessage('');

    if (!newForoData.titulo || !newForoData.whatsappLink || !newForoData.descripcion) {
      setModalMessage('❌ Por favor, rellena todos los campos.');
      setModalLoading(false);
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (isEditing) {
        setForos((prevForos) =>
          prevForos.map((foro) =>
            foro.id === newForoData.id
              ? {
                  ...foro,
                  titulo: newForoData.titulo,
                  whatsappLink: newForoData.whatsappLink,
                  descripcion: newForoData.descripcion,
                  activo: newForoData.activo, // Actualizar estado activo
                  ult_act: new Date().toISOString().split('T')[0],
                }
              : foro
          )
        );
        setModalMessage('✅ Foro modificado con éxito (simulado)!');
      } else {
        const newForo = {
          id: `f${Date.now()}`,
          titulo: newForoData.titulo,
          descripcion: newForoData.descripcion,
          autor: 'Usuario Actual',
          fecha: new Date().toISOString().split('T')[0],
          respuestas: 0,
          ult_act: new Date().toISOString().split('T')[0],
          whatsappLink: newForoData.whatsappLink,
          activo: newForoData.activo, // Incluir estado activo en nuevo foro
        };
        setForos((prevForos) => [newForo, ...prevForos]);
        setModalMessage('🎉 Foro añadido con éxito (simulado)!');
      }

      setTimeout(() => {
        setShowModal(false);
        setIsEditing(false);
      }, 1000);
    } catch (error) {
      console.error('Error al procesar el foro:', error);
      setModalMessage('❌ Error al procesar el foro.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteClick = (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este foro? Esta acción no se puede deshacer.')) {
      setForos((prevForos) => prevForos.filter((foro) => foro.id !== id));
      alert('🗑️ Foro eliminado con éxito (simulado)!');
    }
  };

  // Manejador para activar/desactivar foro (similar a la imagen del ojo)
  const handleToggleActivo = (id) => {
    setForos((prevForos) =>
      prevForos.map((foro) =>
        foro.id === id ? { ...foro, activo: !foro.activo } : foro
      )
    );
    alert('Estado de actividad del foro actualizado (simulado)!');
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <p className="text-xl text-neutral-600">Cargando foros...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <p className="text-xl text-error">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-4 sm:p-8 font-sans">
      <div className="bg-white p-8 rounded-lg shadow-xl border border-neutral-200 w-full max-w-4xl mx-auto">
        {/* Título principal y descripción */}
        <h1 className="text-3xl font-bold text-neutral-800 mb-2 text-left">
          Foros de Discusión
        </h1>
        <p className="text-left text-neutral-600 text-base mb-6">
          Participa en las discusiones y comparte tus ideas.
        </p>

        {/* Botón AGREGAR FORO */}
        <div className="mb-6 text-right">
          <button
            onClick={handleAgregarClick}
            className="inline-flex items-center px-6 py-2 border border-transparent text-base font-semibold rounded-md shadow-sm text-white bg-primary.DEFAULT hover:bg-primary.dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary.DEFAULT transition-all duration-200"
          >
            Agregar Foro
          </button>
        </div>

        {foros.length === 0 ? (
          <p className="text-center text-neutral-600 text-lg py-8">
            No hay temas de foro disponibles para mostrar. ¡Sé el primero en agregar uno!
          </p>
        ) : (
          <div className="overflow-x-auto border border-neutral-200 rounded-lg">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-100">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider"
                  >
                    NOMBRE DEL FORO
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider"
                  >
                    DESCRIPCIÓN
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider"
                  >
                    WHATSAPP
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider"
                  >
                    ACCIONES
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {foros.map((tema) => (
                  <tr key={tema.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-800">
                      {tema.titulo}
                      <div className="text-xs text-neutral-500 mt-1">
                        Por: {tema.autor} | Respuestas: {tema.respuestas}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {tema.descripcion}
                    </td>
                    {/* Celda del icono de WhatsApp */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {tema.whatsappLink && (
                        <a
                          href={tema.whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center h-8 w-8 rounded-full text-white bg-success hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-success transition-all duration-200"
                          title="Unirse al chat de WhatsApp"
                        >
                          <InformationCircleIcon className="h-5 w-5" aria-hidden="true" />
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                      {/* Icono de Editar (Lápiz) */}
                      <button
                        onClick={() => handleEditClick(tema)}
                        className="text-blue-400 hover:text-blue-500 p-1 rounded-full hover:bg-neutral-100 transition-colors duration-150"
                        title="Modificar"
                      >
                        <PencilIcon className="h-5 w-5" aria-hidden="true" />
                      </button>
                      {/* Icono de Activar/Desactivar (Check/X) */}
                      <button
                        onClick={() => handleToggleActivo(tema.id)}
                        className={`p-1 rounded-full hover:bg-neutral-100 transition-colors duration-150 ${
                          tema.activo ? 'text-green-500 hover:text-green-600' : 'text-red-500 hover:text-red-600'
                        }`}
                        title={tema.activo ? "Desactivar" : "Activar"}
                      >
                        {tema.activo ? (
                          <CheckCircleIcon className="h-5 w-5" aria-hidden="true" />
                        ) : (
                          <XCircleIcon className="h-5 w-5" aria-hidden="true" />
                        )}
                      </button>
                      {/* Icono de Eliminar (Basura) */}
                      <button
                        onClick={() => handleDeleteClick(tema.id)}
                        className="text-neutral-500 hover:text-neutral-600 p-1 rounded-full hover:bg-neutral-100 transition-colors duration-150"
                        title="Eliminar"
                      >
                        <TrashIcon className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- MODAL PARA AGREGAR/MODIFICAR FORO --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md relative animate-fade-in-up border-4 border-primary.DEFAULT">
            {/* Botón de cerrar modal */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-neutral-600 hover:text-neutral-800 transition-colors duration-200 text-3xl font-bold p-2 rounded-full hover:bg-neutral-100"
            >
              &times;
            </button>
            <h3 className="text-3xl font-bold text-primary.dark mb-6 text-center">
              {isEditing ? 'Modificar Foro' : 'Agregar Nuevo Foro'}
            </h3>
            <form onSubmit={handleModalSubmit} className="space-y-5">
              <div>
                <label htmlFor="titulo" className="block text-base font-medium text-neutral-700 mb-1">
                  Nombre del Foro
                </label>
                <input
                  type="text"
                  name="titulo"
                  id="titulo"
                  value={newForoData.titulo}
                  onChange={handleModalInputChange}
                  required
                  className="mt-1 block w-full px-4 py-2 border border-neutral-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary.light focus:border-primary.light sm:text-base transition-all duration-200"
                />
              </div>
              <div>
                <label htmlFor="descripcion" className="block text-base font-medium text-neutral-700 mb-1">
                  Descripción del Foro
                </label>
                <textarea
                  name="descripcion"
                  id="descripcion"
                  value={newForoData.descripcion}
                  onChange={handleModalInputChange}
                  required
                  rows="4"
                  className="mt-1 block w-full px-4 py-2 border border-neutral-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary.light focus:border-primary.light sm:text-base transition-all duration-200"
                ></textarea>
              </div>
              <div>
                <label htmlFor="whatsappLink" className="block text-base font-medium text-neutral-700 mb-1">
                  Link de WhatsApp
                </label>
                <input
                  type="url"
                  name="whatsappLink"
                  id="whatsappLink"
                  value={newForoData.whatsappLink}
                  onChange={handleModalInputChange}
                  required
                  className="mt-1 block w-full px-4 py-2 border border-neutral-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary.light focus:border-primary.light sm:text-base transition-all duration-200"
                  placeholder="Ej: https://wa.me/573001234567"
                />
              </div>
              {/* Checkbox para estado 'Activo' en el modal */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="activo"
                  id="activo"
                  checked={newForoData.activo}
                  onChange={handleModalInputChange}
                  className="h-4 w-4 text-primary.DEFAULT focus:ring-primary.DEFAULT border-neutral-300 rounded"
                />
                <label htmlFor="activo" className="ml-2 block text-sm font-medium text-neutral-700">
                  Activo
                </label>
              </div>

              {modalMessage && (
                <p className={`text-center text-sm font-semibold py-2 rounded-md ${
                  modalMessage.includes('éxito') ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                }`}>
                  {modalMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={modalLoading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-base font-semibold text-white ${
                  modalLoading
                    ? 'bg-neutral-300 text-neutral-600 cursor-not-allowed'
                    : 'bg-primary.DEFAULT hover:bg-primary.dark focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-primary.light transition-all duration-300 ease-in-out transform hover:-translate-y-1'
                }`}
              >
                {modalLoading ? (isEditing ? 'Guardando Cambios...' : 'Añadiendo...') : (isEditing ? 'Guardar Cambios' : 'Agregar')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}