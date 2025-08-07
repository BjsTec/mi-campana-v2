// src/components/ui/FormGroup.jsx
'use client' // Componente de cliente

import React from 'react'

const FormGroup = ({
  label, // Texto de la etiqueta (ej. "Cédula", "Contraseña")
  htmlFor, // ID del input al que se asocia esta etiqueta (para accesibilidad)
  children, // El componente de entrada real (Input, Select, Textarea, etc.)
  error = '', // Mensaje de error para mostrar debajo del input
  helpText = '', // Texto de ayuda opcional
  className = '', // Clases adicionales para el div principal del FormGroup
  labelClassName = '', // Clases adicionales para la etiqueta
  errorClassName = '', // Clases adicionales para el mensaje de error
  required = false, // Indica si el campo es requerido (añade un *)
  ...props // Cualquier otra prop que quieras pasar al div contenedor
}) => {
  const baseErrorClasses = 'mt-1 text-sm text-error-600'
  const baseHelpTextClasses = 'mt-1 text-sm text-neutral-500'

  return (
    <div className={`mb-4 ${className}`} {...props}>
      {label && (
        <label
          htmlFor={htmlFor}
          className={`block text-sm font-medium text-neutral-600 mb-1 ${labelClassName}`}
        >
          {label}
          {/* CORRECCIÓN: El asterisco se añade solo si el campo es requerido */}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p
          id={`${htmlFor}-error`}
          className={`${baseErrorClasses} ${errorClassName}`}
          role="alert"
        >
          {error}
        </p>
      )}
      {!error && helpText && <p className={baseHelpTextClasses}>{helpText}</p>}
    </div>
  )
}

export default FormGroup