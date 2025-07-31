// src/components/ui/Input.jsx
'use client' // Componente de cliente

import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react' // Íconos de ojo para mostrar/ocultar contraseña

const Input = ({
  label,
  id,
  name,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  error = '', // Mensaje de error para mostrar
  disabled = false,
  readOnly = false,
  required = false,
  className = '', // Clases para el input en sí
  labelClassName = '', // Clases para la etiqueta
  containerClassName = '', // Clases para el div contenedor (label + input)
  IconComponent = null, // Componente de ícono opcional (ej. Search)
  iconPosition = 'left', // Posición del ícono: 'left' o 'right'
  showPasswordToggle = false, // Habilitar el botón de mostrar/ocultar contraseña (solo para type="password")
  inputMode, // Para teclados móviles (ej. "numeric", "email")
  step, // Para input type="number"
  min, // Para input type="number"
  max, // Para input type="number"
  ...props // Todas las demás props estándar de input
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  // Determina el tipo de input real si hay toggle de contraseña
  const inputType = type === 'password' && isPasswordVisible ? 'text' : type

  const baseInputClasses =
    'block w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none transition-colors duration-200'

  const colorClasses = error
    ? 'border-error-500 focus:ring-error-500 focus:border-error-500 text-error-800'
    : 'border-neutral-300 focus:ring-primary-500 focus:border-primary-500 text-neutral-800'

  const disabledClasses = disabled
    ? 'bg-neutral-100 cursor-not-allowed opacity-70'
    : ''

  const iconWrapperClasses = IconComponent
    ? `relative ${iconPosition === 'left' ? 'pl-10' : 'pr-10'}` // Padding para el icono
    : ''

  const iconClasses = IconComponent
    ? 'w-5 h-5 text-neutral-500 absolute top-1/2 -translate-y-1/2'
    : ''
  const iconPositionClasses = IconComponent
    ? iconPosition === 'left'
      ? 'left-3'
      : 'right-3'
    : ''

  return (
    <div className={`mb-4 ${containerClassName}`}>
      {label && (
        <label
          htmlFor={id || name}
          className={`block text-sm font-medium text-neutral-600 mb-1 ${labelClassName}`}
        >
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {IconComponent && (
          <IconComponent className={`${iconClasses} ${iconPositionClasses}`} />
        )}
        <input
          id={id || name}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          className={`${baseInputClasses} ${colorClasses} ${disabledClasses} ${iconWrapperClasses} ${className} ${type === 'password' && showPasswordToggle ? 'pr-10' : ''}`}
          aria-describedby={error ? `${id || name}-error` : undefined}
          inputMode={inputMode}
          step={step}
          min={min}
          max={max}
          {...props}
        />

        {type === 'password' && showPasswordToggle && (
          <button
            type="button"
            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-600 hover:text-primary-DEFAULT focus:outline-none"
            aria-label={
              isPasswordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'
            }
          >
            {isPasswordVisible ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
      {error && (
        <p
          id={`${id || name}-error`}
          className="mt-1 text-sm text-error-600"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  )
}

export default Input
