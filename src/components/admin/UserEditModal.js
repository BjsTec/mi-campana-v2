// components/admin/UserEditModal.js
import React, { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'

const UserEditModal = ({ isOpen, onClose, user, onSave }) => {
  const [formData, setFormData] = useState({})
  const { idToken } = useAuth()

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        cedula: user.cedula || '',
        // Agrega aquí los campos que el admin puede editar
        phone: user.phone || '',
        whatsapp: user.whatsapp || '',
      })
    }
  }, [user])

  if (!isOpen || !user) {
    return null
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    // Aquí iría la lógica para llamar al endpoint de actualización de perfil
    try {
      // Reemplaza con tu endpoint de actualización de perfil
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_UPDATE_USER_PROFILE_URL}/${user.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ updates: formData }),
        },
      )
      if (!response.ok) {
        throw new Error('Error al actualizar el usuario.')
      }
      onSave(user.id, formData)
    } catch (error) {
      console.error('Error al guardar cambios:', error)
      alert('Hubo un error al guardar los cambios.')
    }
  }

  return (
    <div className="fixed inset-0 bg-neutral-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg">
        <h3 className="text-xl font-bold text-neutral-800 mb-4">
          Editar Usuario: {user.name}
        </h3>
        <div className="space-y-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-neutral-600">
              Nombre
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-neutral-600">
              Cédula
            </label>
            <input
              type="text"
              name="cedula"
              value={formData.cedula}
              disabled
              className="mt-1 block w-full rounded-md border-neutral-300 bg-neutral-100 cursor-not-allowed"
            />
          </div>
          {/* Añade más campos de edición aquí */}
        </div>
        <div className="mt-6 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-neutral-300 text-neutral-700 hover:bg-neutral-100"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  )
}

export default UserEditModal
