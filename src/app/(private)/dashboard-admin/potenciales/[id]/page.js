// src/app/(private)/dashboard-admin/potenciales/[id]/page.js
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../../../../context/AuthContext' // Ajusta la ruta si es necesario
import { useRouter, useParams } from 'next/navigation' // Para obtener el ID de la URL y navegar
import Link from 'next/link' // Para el botón de regresar

// Iconos (puedes reemplazarlos con Heroicons o Lucide React si los tienes)
const BackIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 mr-2"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 19l-7-7m0 0l7-7m-7 7h18"
    />
  </svg>
)
const EditIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 ml-2"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
    />
  </svg>
)
const SaveIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 ml-2"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
)
const AddNoteIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 mr-2"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
)

export default function LeadDetailPage() {
  const { idToken, authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const leadId = params.id // Obtener el ID del lead de la URL

  const [lead, setLead] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditingStatus, setIsEditingStatus] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [newNote, setNewNote] = useState('')
  const [updateStatus, setUpdateStatus] = useState('') // 'success', 'error', 'loading' for updates

  // Función para formatear la fecha/hora
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A'
    const date = timestamp._seconds
      ? new Date(timestamp._seconds * 1000)
      : new Date(timestamp)
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Opciones de estado para el selector
  const statusOptions = [
    { value: 'nuevo', label: 'Nuevo' },
    { value: 'contactado', label: 'Contactado' },
    { value: 'en_seguimiento', label: 'En Seguimiento' },
    { value: 'calificado', label: 'Calificado' },
    { value: 'convertido', label: 'Convertido' },
    { value: 'descartado', label: 'Descartado' },
  ]

  // --- Cargar datos del Lead ---
  const fetchLead = useCallback(async () => {
    if (authLoading || !idToken || !leadId) {
      if (!authLoading && !idToken) {
        setError('No autenticado. Por favor, inicia sesión.')
        setLoading(false)
      }
      return
    }
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(
        `https://us-central1-micampanav2.cloudfunctions.net/getLeadById?id=${leadId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${idToken}`,
            'Content-Type': 'application/json',
          },
        },
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.message || 'Error al obtener el cliente potencial.',
        )
      }

      const data = await response.json()
      setLead(data)
      setNewStatus(data.status) // Inicializar el selector de estado
    } catch (err) {
      console.error('Error fetching lead details:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [idToken, authLoading, leadId])

  useEffect(() => {
    fetchLead()
  }, [fetchLead])

  // --- Actualizar Estado del Lead ---
  const handleUpdateStatus = async () => {
    if (!idToken || !leadId || !newStatus || newStatus === lead.status) return

    setUpdateStatus('loading')
    try {
      const response = await fetch(
        'https://us-central1-micampanav2.cloudfunctions.net/updateLead',
        {
          method: 'POST', // O PATCH, según tu función
          headers: {
            Authorization: `Bearer ${idToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: leadId, updates: { status: newStatus } }),
        },
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al actualizar el estado.')
      }

      setUpdateStatus('success')
      setIsEditingStatus(false) // Cerrar edición
      fetchLead() // Recargar los datos del lead
    } catch (err) {
      console.error('Error updating lead status:', err)
      setUpdateStatus('error')
      setError(err.message) // Mostrar error general
    }
  }

  // --- Añadir Nueva Nota ---
  const handleAddNote = async () => {
    if (!idToken || !leadId || newNote.trim() === '') return

    setUpdateStatus('loading') // Usar el mismo estado para feedback de UI
    try {
      const response = await fetch(
        'https://us-central1-micampanav2.cloudfunctions.net/updateLead',
        {
          method: 'POST', // O PATCH, según tu función
          headers: {
            Authorization: `Bearer ${idToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: leadId, newNote: newNote.trim() }),
        },
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al añadir la nota.')
      }

      setUpdateStatus('success')
      setNewNote('') // Limpiar el campo de nota
      fetchLead() // Recargar los datos del lead para ver la nueva nota
    } catch (err) {
      console.error('Error adding note:', err)
      setUpdateStatus('error')
      setError(err.message) // Mostrar error general
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-100 text-primary-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-DEFAULT"></div>
        <p className="ml-4">Cargando perfil del cliente...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 bg-neutral-100 min-h-screen flex items-center justify-center">
        <div className="bg-error text-white p-4 rounded-md shadow-md">
          <p>{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 bg-white text-error px-4 py-2 rounded-md hover:bg-neutral-100"
          >
            Volver
          </button>
        </div>
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="p-8 bg-neutral-100 min-h-screen flex items-center justify-center">
        <div className="bg-neutral-50 text-neutral-800 p-6 rounded-md shadow-md">
          <p>Cliente potencial no encontrado.</p>
          <button
            onClick={() => router.back()}
            className="mt-4 bg-primary-DEFAULT text-neutral-50 px-4 py-2 rounded-md hover:bg-primary-dark"
          >
            Volver
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-100 p-8">
      <div className="container mx-auto max-w-4xl bg-white rounded-lg shadow-xl p-8">
        {/* Encabezado y botón de regreso */}
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h1 className="text-3xl font-bold text-primary-dark">
            Perfil de Cliente Potencial
          </h1>
          <Link
            href="/dashboard-admin/potenciales"
            className="inline-flex items-center bg-neutral-200 text-neutral-800 px-4 py-2 rounded-full text-sm font-semibold hover:bg-neutral-300 transition-colors duration-200"
          >
            <BackIcon /> Volver a la Lista
          </Link>
        </div>

        {/* Detalles del Lead */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <p className="text-neutral-600 text-sm font-semibold">Nombre:</p>
            <p className="text-primary-dark text-lg font-medium">{lead.name}</p>
          </div>
          <div>
            <p className="text-neutral-600 text-sm font-semibold">Email:</p>
            <p className="text-primary-dark text-lg font-medium">
              {lead.email}
            </p>
          </div>
          <div>
            <p className="text-neutral-600 text-sm font-semibold">Teléfono:</p>
            <p className="text-primary-dark text-lg font-medium">
              {lead.phone || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-neutral-600 text-sm font-semibold">
              Interesado en:
            </p>
            <p className="text-primary-dark text-lg font-medium">
              {lead.interestedIn || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-neutral-600 text-sm font-semibold">Fuente:</p>
            <p className="text-primary-dark text-lg font-medium">
              {lead.source || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-neutral-600 text-sm font-semibold">Recibido:</p>
            <p className="text-primary-dark text-lg font-medium">
              {formatTimestamp(lead.timestamp)}
            </p>
          </div>
        </div>

        {/* Sección de Estado y Acciones */}
        <div className="mb-8 p-6 bg-neutral-50 rounded-lg border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-primary-dark">
              Estado Actual:
              <span
                className={`ml-2 font-bold 
                ${lead.status === 'nuevo' ? 'text-secondary-DEFAULT' : ''}
                ${lead.status === 'contactado' ? 'text-primary-DEFAULT' : ''}
                ${lead.status === 'en_seguimiento' ? 'text-blue-500' : ''}
                ${lead.status === 'calificado' ? 'text-green-500' : ''}
                ${lead.status === 'convertido' ? 'text-success' : ''}
                ${lead.status === 'descartado' ? 'text-error' : ''}
              `}
              >
                {lead.status
                  ? lead.status.replace(/_/g, ' ').toUpperCase()
                  : 'N/A'}
              </span>
            </h3>
            <button
              onClick={() => setIsEditingStatus(!isEditingStatus)}
              className="bg-neutral-300 text-neutral-800 px-4 py-2 rounded-full text-sm font-semibold hover:bg-neutral-400 transition-colors duration-200"
            >
              <EditIcon /> Cambiar Estado
            </button>
          </div>

          {isEditingStatus && (
            <div className="flex items-center gap-4 mt-4">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="flex-1 p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                onClick={handleUpdateStatus}
                disabled={updateStatus === 'loading'}
                className="bg-primary-DEFAULT text-neutral-50 px-4 py-2 rounded-full text-sm font-semibold hover:bg-primary-dark transition-colors duration-200"
              >
                {updateStatus === 'loading' ? (
                  'Guardando...'
                ) : (
                  <>
                    <SaveIcon /> Guardar
                  </>
                )}
              </button>
              <button
                onClick={() => setIsEditingStatus(false)}
                className="bg-neutral-300 text-neutral-800 px-4 py-2 rounded-full text-sm font-semibold hover:bg-neutral-400 transition-colors duration-200"
              >
                Cancelar
              </button>
            </div>
          )}
          {updateStatus === 'success' && (
            <p className="text-success text-sm mt-2">¡Estado actualizado!</p>
          )}
          {updateStatus === 'error' && (
            <p className="text-error text-sm mt-2">
              Error al actualizar estado.
            </p>
          )}
        </div>

        {/* Sección de Notas */}
        <div className="mb-8 p-6 bg-neutral-50 rounded-lg border border-neutral-200 shadow-sm">
          <h3 className="text-xl font-semibold text-primary-dark mb-4">
            Historial de Notas
          </h3>
          <div className="max-h-60 overflow-y-auto border border-neutral-200 rounded-md p-3 bg-white mb-4">
            {lead.notes && lead.notes.length > 0 ? (
              lead.notes.map((note, index) => (
                <div
                  key={index}
                  className="mb-3 pb-3 border-b border-neutral-100 last:border-b-0"
                >
                  <p className="text-neutral-800 text-sm">{note.text}</p>
                  <p className="text-neutral-500 text-xs mt-1">
                    {formatTimestamp(note.timestamp)} por{' '}
                    {note.adminId || 'Admin'}
                    {note.type === 'status_change' && (
                      <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                        Cambio de Estado
                      </span>
                    )}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-neutral-600 text-sm">
                No hay notas registradas para este cliente potencial.
              </p>
            )}
          </div>

          <div className="mt-4">
            <label
              htmlFor="newNote"
              className="block text-neutral-800 text-sm font-bold mb-2"
            >
              Añadir Nueva Nota
            </label>
            <textarea
              id="newNote"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows="3"
              className="w-full p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-neutral-800"
              placeholder="Escribe una nueva nota de seguimiento..."
            ></textarea>
            <button
              onClick={handleAddNote}
              disabled={updateStatus === 'loading' || newNote.trim() === ''}
              className="mt-3 bg-secondary-DEFAULT text-primary-dark px-6 py-2 rounded-full text-sm font-semibold hover:bg-secondary-dark transition-colors duration-200"
            >
              <AddNoteIcon />{' '}
              {updateStatus === 'loading' ? 'Añadiendo...' : 'Añadir Nota'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
