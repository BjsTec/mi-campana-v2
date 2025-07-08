// src/components/admin/variables/PromoBonusSection.js
import React from 'react'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

const PromoBonusSection = ({
  promoBonus,
  onSavePromoBonus,
  onToggleBonusActive,
  setPromoBonus,
}) => {
  const handleBonusChange = (e) => {
    const { name, value, type, checked } = e.target
    setPromoBonus((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  return (
    <section className="bg-white p-3 sm:p-5 rounded-lg shadow-md mb-6 sm:mb-8 border border-neutral-200">
      <h2 className="text-lg sm:text-2xl font-semibold text-neutral-800 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <span>Bono/Descuento para Home Principal</span>
        <button
          onClick={() => onToggleBonusActive(promoBonus)} // Pasa el objeto promoBonus completo
          className={`mt-2 sm:mt-0 inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm ${promoBonus?.isActive ? 'text-white bg-success hover:bg-success-dark' : 'text-neutral-700 bg-neutral-200 hover:bg-neutral-300'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-success transition-colors duration-200`}
        >
          {promoBonus?.isActive ? (
            <>
              <EyeIcon className="-ml-0.5 mr-2 h-5 w-5" /> Activo
            </>
          ) : (
            <>
              <EyeSlashIcon className="-ml-0.5 mr-2 h-5 w-5" /> Inactivo
            </>
          )}
        </button>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4">
        <div>
          <label
            htmlFor="bonusTitle"
            className="block text-xs sm:text-sm font-medium text-neutral-700"
          >
            Título del Bono
          </label>
          <input
            type="text"
            id="bonusTitle"
            name="title"
            value={promoBonus?.title || ''}
            onChange={handleBonusChange}
            placeholder="Ej: ¡20% OFF en Plan Premium!"
            className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-1.5 px-2 sm:py-2 sm:px-3 focus:outline-none focus:ring-primary focus:border-primary text-xs sm:text-sm text-neutral-800"
          />
        </div>
        <div>
          <label
            htmlFor="bonusDiscountPercentage"
            className="block text-xs sm:text-sm font-medium text-neutral-700"
          >
            Porcentaje de Descuento (%)
          </label>
          <input
            type="number"
            id="bonusDiscountPercentage"
            name="discountPercentage"
            value={promoBonus?.discountPercentage || 0}
            onChange={handleBonusChange}
            placeholder="Ej: 20"
            className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-1.5 px-2 sm:py-2 sm:px-3 focus:outline-none focus:ring-primary focus:border-primary text-xs sm:text-sm text-neutral-800"
          />
        </div>
        <div className="md:col-span-2 lg:col-span-1">
          <label
            htmlFor="bonusAppliesTo"
            className="block text-xs sm:text-sm font-medium text-neutral-700"
          >
            Aplica a
          </label>
          <input
            type="text"
            id="bonusAppliesTo"
            name="appliesTo"
            value={promoBonus?.appliesTo || ''}
            onChange={handleBonusChange}
            placeholder="Ej: Planes Premium"
            className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-1.5 px-2 sm:py-2 sm:px-3 focus:outline-none focus:ring-primary focus:border-primary text-xs sm:text-sm text-neutral-800"
          />
        </div>
        <div className="md:col-span-2 lg:col-span-3">
          <label
            htmlFor="bonusDescription"
            className="block text-xs sm:text-sm font-medium text-neutral-700"
          >
            Descripción Detallada
          </label>
          <textarea
            id="bonusDescription"
            name="description"
            value={promoBonus?.description || ''}
            onChange={handleBonusChange}
            placeholder="Ej: Válido para nuevas suscripciones hasta el 31/12/2025."
            rows="2"
            className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-1.5 px-2 sm:py-2 sm:px-3 focus:outline-none focus:ring-primary focus:border-primary text-xs sm:text-sm text-neutral-800"
          />
        </div>
        <div>
          <label
            htmlFor="bonusCtaText"
            className="block text-xs sm:text-sm font-medium text-neutral-700"
          >
            Texto de Botón (CTA)
          </label>
          <input
            type="text"
            id="bonusCtaText"
            name="ctaText"
            value={promoBonus?.ctaText || ''}
            onChange={handleBonusChange}
            placeholder="Ej: ¡Compra Ya!"
            className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-1.5 px-2 sm:py-2 sm:px-3 focus:outline-none focus:ring-primary focus:border-primary text-xs sm:text-sm text-neutral-800"
          />
        </div>
        <div>
          <label
            htmlFor="bonusCtaLink"
            className="block text-xs sm:text-sm font-medium text-neutral-700"
          >
            Enlace del Botón (CTA)
          </label>
          <input
            type="text"
            id="bonusCtaLink"
            name="ctaLink"
            value={promoBonus?.ctaLink || ''}
            onChange={handleBonusChange}
            placeholder="Ej: /planes-de-suscripcion"
            className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-1.5 px-2 sm:py-2 sm:px-3 focus:outline-none focus:ring-primary focus:border-primary text-xs sm:text-sm text-neutral-800"
          />
        </div>
        <div className="md:col-span-2 lg:col-span-1">
          <label
            htmlFor="bonusImageUrl"
            className="block text-xs sm:text-sm font-medium text-neutral-700"
          >
            URL de Imagen (Opcional)
          </label>
          <input
            type="text"
            id="bonusImageUrl"
            name="imageUrl"
            value={promoBonus?.imageUrl || ''}
            onChange={handleBonusChange}
            placeholder="https://ejemplo.com/bono.jpg"
            className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-1.5 px-2 sm:py-2 sm:px-3 focus:outline-none focus:ring-primary focus:border-primary text-xs sm:text-sm text-neutral-800"
          />
        </div>
        <div>
          <label
            htmlFor="bonusStartDate"
            className="block text-xs sm:text-sm font-medium text-neutral-700"
          >
            Fecha de Inicio
          </label>
          <input
            type="date"
            id="bonusStartDate"
            name="startDate"
            value={promoBonus?.startDate || ''}
            onChange={handleBonusChange}
            className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-1.5 px-2 sm:py-2 sm:px-3 focus:outline-none focus:ring-primary focus:border-primary text-xs sm:text-sm text-neutral-800"
          />
        </div>
        <div>
          <label
            htmlFor="bonusEndDate"
            className="block text-xs sm:text-sm font-medium text-neutral-700"
          >
            Fecha de Fin
          </label>
          <input
            type="date"
            id="bonusEndDate"
            name="endDate"
            value={promoBonus?.endDate || ''}
            onChange={handleBonusChange}
            className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-1.5 px-2 sm:py-2 sm:px-3 focus:outline-none focus:ring-primary focus:border-primary text-xs sm:text-sm text-neutral-800"
          />
        </div>
        <div>
          <label
            htmlFor="bonusBackgroundColor"
            className="block text-xs sm:text-sm font-medium text-neutral-700"
          >
            Color de Fondo (Opcional)
          </label>
          <input
            type="color"
            id="bonusBackgroundColor"
            name="backgroundColor"
            value={promoBonus?.backgroundColor || '#FFFFFF'}
            onChange={handleBonusChange}
            className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-1.5 px-2 sm:py-2 sm:px-3 focus:outline-none focus:ring-primary focus:border-primary text-xs sm:text-sm h-8 sm:h-10"
          />
        </div>
        <div>
          <label
            htmlFor="bonusTextColor"
            className="block text-xs sm:text-sm font-medium text-neutral-700"
          >
            Color de Texto (Opcional)
          </label>
          <input
            type="color"
            id="bonusTextColor"
            name="textColor"
            value={promoBonus?.textColor || '#000000'}
            onChange={handleBonusChange}
            className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-1.5 px-2 sm:py-2 sm:px-3 focus:outline-none focus:ring-primary focus:border-primary text-xs sm:text-sm h-8 sm:h-10"
          />
        </div>
      </div>
      <button
        onClick={() => onSavePromoBonus(promoBonus)} // Pasa el objeto promoBonus completo
        className="mt-6 inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
      >
        Guardar Cambios del Bono
      </button>
    </section>
  )
}

export default PromoBonusSection
