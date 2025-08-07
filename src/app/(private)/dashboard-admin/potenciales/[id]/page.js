// src/app/(private)/dashboard-admin/potenciales/[id]/page.js
'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '../../../../../context/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import StatusSelector from '../../../../../components/admin/StatusSelector.jsx'

// Importamos los iconos de Heroicons
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  CheckIcon,
  PlusCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'

const GET_LEAD_BY_ID_URL = process.env.NEXT_PUBLIC_GET_LEAD_BY_ID_URL
const UPDATE_LEAD_URL = process.env.NEXT_PUBLIC_UPDATE_LEAD_URL

export default function LeadDetailPage() {
  const { idToken, authLoading, user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const leadId = params.id

  const [lead, setLead] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditingStatus, setIsEditingStatus] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [newNote, setNewNote] = useState('')
  const [updateStatus, setUpdateStatus] = useState('')

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

  const statusColors = useMemo(() => {
    switch (lead?.status) {
      case 'nuevo':
        return 'text-secondary-DEFAULT'
      case 'contactado':
        return 'text-primary-DEFAULT'
      case 'en_seguimiento':
        return 'text-blue-500'
      case 'calificado':
        return 'text-green-500'
      case 'convertido':
        return 'text-success'
      case 'descartado':
        return 'text-error'
      default:
        return 'text-neutral-600'
    }
  }, [lead])

  const fetchLead = useCallback(async () => {
    if (authLoading || !idToken || !leadId) {
      if (!authLoading && !idToken) {
        setError('No autenticado. Por favor, inicia sesión.')
      }
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${GET_LEAD_BY_ID_URL}?id=${leadId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al obtener el cliente potencial.')
      }
      const data = await response.json()
      setLead(data)
      setNewStatus(data.status)
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

  const handleUpdateStatus = async () => {
    if (!idToken || !leadId || !newStatus || newStatus === lead.status) return
    setUpdateStatus('loading')
    try {
      const response = await fetch(UPDATE_LEAD_URL, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: leadId, updates: { status: newStatus } }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al actualizar el estado.')
      }
      setUpdateStatus('success')
      setIsEditingStatus(false)
      fetchLead()
    } catch (err) {
      console.error('Error updating lead status:', err)
      setUpdateStatus('error')
      setError(err.message)
    }
  }

  const handleAddNote = async () => {
    if (!idToken || !leadId || newNote.trim() === '') return
    setUpdateStatus('loading')
    try {
      const newNoteObject = {
        text: newNote.trim(),
        timestamp: new Date().toISOString(),
        adminId: user?.id,
      }
      const updatedNotes = [...(lead.notes || []), newNoteObject]
      const response = await fetch(UPDATE_LEAD_URL, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: leadId, updates: { notes: updatedNotes } }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al añadir la nota.')
      }
      setUpdateStatus('success')
      setNewNote('')
      fetchLead()
    } catch (err) {
      console.error('Error adding note:', err)
      setUpdateStatus('error')
      setError(err.message)
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-100 text-neutral-600">
        <p>Verificando autenticación...</p>
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-100 text-red-600">
        <p>Acceso denegado. Solo administradores pueden ver esta página.</p>
      </div>
    )
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
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h1 className="text-3xl font-bold text-primary-dark">
            Perfil de Cliente Potencial
          </h1>
          <Link
            href="/dashboard-admin/potenciales"
            className="inline-flex items-center bg-neutral-200 text-neutral-800 px-4 py-2 rounded-full text-sm font-semibold hover:bg-neutral-300 transition-colors duration-200"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" /> Volver a la Lista
          </Link>
        </div>

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

        <div className="mb-8 p-6 bg-neutral-50 rounded-lg border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-primary-dark">
              Estado Actual:
              <span className={`ml-2 font-bold ${statusColors}`}>
                {lead.status
                  ? lead.status.replace(/_/g, ' ').toUpperCase()
                  : 'N/A'}
              </span>
            </h3>
            <button
              onClick={() => setIsEditingStatus(!isEditingStatus)}
              className="inline-flex items-center bg-neutral-300 text-neutral-800 px-4 py-2 rounded-full text-sm font-semibold hover:bg-neutral-400 transition-colors duration-200"
            >
              <PencilSquareIcon className="h-5 w-5 mr-2" /> Cambiar Estado
            </button>
          </div>

          {isEditingStatus && (
            <div className="flex items-center gap-4 mt-4">
              <StatusSelector selectedStatus={newStatus} onSelect={setNewStatus} />
              <button
                onClick={handleUpdateStatus}
                disabled={updateStatus === 'loading'}
                className="inline-flex items-center bg-primary-DEFAULT text-neutral-50 px-4 py-2 rounded-full text-sm font-semibold hover:bg-primary-dark transition-colors duration-200"
              >
                {updateStatus === 'loading' ? (
                  <ArrowPathIcon className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <CheckIcon className="h-5 w-5 mr-2" />
                )}
                {updateStatus === 'loading' ? 'Guardando...' : 'Guardar'}
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
              className="mt-3 inline-flex items-center bg-secondary-DEFAULT text-primary-dark px-6 py-2 rounded-full text-sm font-semibold hover:bg-secondary-dark transition-colors duration-200"
            >
              <PlusCircleIcon className="h-5 w-5 mr-2" />
              {updateStatus === 'loading' ? 'Añadiendo...' : 'Añadir Nota'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}