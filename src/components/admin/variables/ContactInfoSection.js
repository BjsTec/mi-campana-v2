// src/components/admin/variables/ContactInfoSection.js
import React, { useState } from 'react'

// Recibe triggerAlert como prop
const ContactInfoSection = ({
  contactInfo,
  onSaveContactInfo,
  setContactInfo,
  triggerAlert,
}) => {
  // Estado para el modal de confirmación (se mantiene local para esta sección)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const handleContactInfoChange = (e) => {
    const { name, value } = e.target
    setContactInfo((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveClick = () => {
    setShowConfirmModal(true) // Mostrar el modal de confirmación
  }

  const handleConfirmSave = async () => {
    setShowConfirmModal(false) // Cerrar el modal de confirmación
    try {
      // onSaveContactInfo es una prop que viene de variables/page.js
      // Esta función (en el padre) ya manejará el triggerAlert de éxito/error.
      await onSaveContactInfo(contactInfo)
      // NO LLAMAR A triggerAlert AQUÍ para evitar redundancia.
      // triggerAlert('Información de contacto guardada exitosamente.', 'success');
    } catch (error) {
      // Si onSaveContactInfo lanza un error, el padre lo capturará y mostrará la alerta.
      // Sin embargo, si quieres una alerta inmediata específica de este componente (antes de que el padre la maneje),
      // podrías dejar esta línea. Pero para evitar la doble alerta, la quitamos.
      // console.error("Error en ContactInfoSection al guardar:", error);
      // triggerAlert(`Error al guardar: ${error.message}`, 'error'); // REMOVIDA PARA EVITAR REDUNDANCIA
    }
  }

  const handleCancelSave = () => {
    setShowConfirmModal(false) // Cerrar el modal
  }

  return (
    <section className="bg-white p-3 sm:p-5 rounded-lg shadow-md mb-6 sm:mb-8 border border-neutral-200">
      <h2 className="text-lg sm:text-2xl font-semibold text-neutral-800 mb-4">
        Información de Contacto del Software
      </h2>

      {/* La alerta personalizada ahora se renderiza en el componente padre (variables/page.js) */}
      {/* <AlertaPersonalizada /> */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {/* Email de Soporte */}
        <div>
          <label
            htmlFor="supportEmail"
            className="block text-xs sm:text-sm font-medium text-neutral-700"
          >
            Email de Soporte
          </label>
          <input
            type="email"
            id="supportEmail"
            name="supportEmail"
            value={contactInfo?.supportEmail || ''}
            onChange={handleContactInfoChange}
            className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-1.5 px-2 sm:py-2 sm:px-3 focus:outline-none focus:ring-primary focus:border-primary text-xs sm:text-sm text-neutral-800"
          />
        </div>
        {/* WhatsApp de Soporte */}
        <div>
          <label
            htmlFor="supportWhatsapp"
            className="block text-xs sm:text-sm font-medium text-neutral-700"
          >
            WhatsApp de Soporte
          </label>
          <input
            type="text"
            id="supportWhatsapp"
            name="supportWhatsapp"
            value={contactInfo?.supportWhatsapp || ''}
            onChange={handleContactInfoChange}
            className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-1.5 px-2 sm:py-2 sm:px-3 focus:outline-none focus:ring-primary focus:border-primary text-xs sm:text-sm text-neutral-800"
          />
        </div>
        {/* Email de Ventas */}
        <div>
          <label
            htmlFor="salesEmail"
            className="block text-xs sm:text-sm font-medium text-neutral-700"
          >
            Email de Ventas
          </label>
          <input
            type="email"
            id="salesEmail"
            name="salesEmail"
            value={contactInfo?.salesEmail || ''}
            onChange={handleContactInfoChange}
            className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-1.5 px-2 sm:py-2 sm:px-3 focus:outline-none focus:ring-primary focus:border-primary text-xs sm:text-sm text-neutral-800"
          />
        </div>
        {/* WhatsApp de Ventas */}
        <div>
          <label
            htmlFor="salesWhatsapp"
            className="block text-xs sm:text-sm font-medium text-neutral-700"
          >
            WhatsApp de Ventas
          </label>
          <input
            type="text"
            id="salesWhatsapp"
            name="salesWhatsapp"
            value={contactInfo?.salesWhatsapp || ''}
            onChange={handleContactInfoChange}
            className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-1.5 px-2 sm:py-2 sm:px-3 focus:outline-none focus:ring-primary focus:border-primary text-xs sm:text-sm text-neutral-800"
          />
        </div>

        {/* Nuevos campos añadidos */}
        {/* Email General */}
        <div>
          <label
            htmlFor="email"
            className="block text-xs sm:text-sm font-medium text-neutral-700"
          >
            Email General
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={contactInfo?.email || ''}
            onChange={handleContactInfoChange}
            className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-1.5 px-2 sm:py-2 sm:px-3 focus:outline-none focus:ring-primary focus:border-primary text-xs sm:text-sm text-neutral-800"
          />
        </div>
        {/* Teléfono */}
        <div>
          <label
            htmlFor="phone"
            className="block text-xs sm:text-sm font-medium text-neutral-700"
          >
            Teléfono
          </label>
          <input
            type="text"
            id="phone"
            name="phone"
            value={contactInfo?.phone || ''}
            onChange={handleContactInfoChange}
            className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-1.5 px-2 sm:py-2 sm:px-3 focus:outline-none focus:ring-primary focus:border-primary text-xs sm:text-sm text-neutral-800"
          />
        </div>
        {/* Dirección */}
        <div>
          <label
            htmlFor="address"
            className="block text-xs sm:text-sm font-medium text-neutral-700"
          >
            Dirección
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={contactInfo?.address || ''}
            onChange={handleContactInfoChange}
            className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-1.5 px-2 sm:py-2 sm:px-3 focus:outline-none focus:ring-primary focus:border-primary text-xs sm:text-sm text-neutral-800"
          />
        </div>
        {/* Instagram */}
        <div>
          <label
            htmlFor="instagram"
            className="block text-xs sm:text-sm font-medium text-neutral-700"
          >
            Instagram (URL)
          </label>
          <input
            type="url"
            id="instagram"
            name="instagram"
            value={contactInfo?.instagram || ''}
            onChange={handleContactInfoChange}
            className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-1.5 px-2 sm:py-2 sm:px-3 focus:outline-none focus:ring-primary focus:border-primary text-xs sm:text-sm text-neutral-800"
          />
        </div>
        {/* Twitter */}
        <div>
          <label
            htmlFor="twitter"
            className="block text-xs sm:text-sm font-medium text-neutral-700"
          >
            Twitter (URL)
          </label>
          <input
            type="url"
            id="twitter"
            name="twitter"
            value={contactInfo?.twitter || ''}
            onChange={handleContactInfoChange}
            className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-1.5 px-2 sm:py-2 sm:px-3 focus:outline-none focus:ring-primary focus:border-primary text-xs sm:text-sm text-neutral-800"
          />
        </div>
      </div>
      <button
        onClick={handleSaveClick}
        className="mt-6 inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
      >
        Guardar Información de Contacto
      </button>

      {/* Modal de Confirmación (se mantiene local para esta sección) */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">
              Confirmar Guardar Cambios
            </h3>
            <p className="text-sm text-neutral-600 mb-6">
              ¿Estás seguro de que quieres guardar esta información de contacto?
              Esta acción actualizará los datos.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelSave}
                className="px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-200 rounded-md hover:bg-neutral-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmSave}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default ContactInfoSection
