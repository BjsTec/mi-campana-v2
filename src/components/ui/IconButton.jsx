// src/components/ui/IconButton.jsx
'use client'

import React from 'react'
// Asumimos que Lucide React o similar está instalado y los iconos se pasan como componentes

const IconButton = ({
  IconComponent, // Componente de icono requerido
  onClick,
  size = 'md',
  className = '',
  'aria-label': ariaLabel, // Propiedad requerida para accesibilidad
  variant = 'text',
  color = 'neutral',
  disabled = false,
  loading = false, // Aunque los icon-buttons rara vez tienen loading
  ...props
}) => {
  if (!IconComponent) {
    console.error('IconButton requiere un IconComponent.')
    return null
  }

  // Clases base para el botón
  const baseClasses =
    'inline-flex items-center justify-center rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'

  // Clases de tamaño (padding y tamaño del icono)
  const sizeClasses = {
    sm: 'p-1 text-base', // Icono de 16px
    md: 'p-2 text-lg', // Icono de 20px
    lg: 'p-3 text-xl', // Icono de 24px
    xl: 'p-4 text-2xl', // Icono de 28px
  }[size]

  // Clases para el tamaño del icono dentro del SVG
  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-7 h-7',
  }[size]

  // Clases de color y variante
  const variantClasses = {
    solid: `bg-${color}-DEFAULT text-white hover:bg-${color}-600 focus:ring-${color}-500`,
    outline: `bg-transparent border border-${color}-DEFAULT text-${color}-DEFAULT hover:bg-${color}-50 focus:ring-${color}-500`,
    text: `bg-transparent text-${color}-600 hover:bg-${color}-100 focus:ring-${color}-500`, // Colores de texto neutrales para texto variante
  }[variant]

  // Clases para estado deshabilitado/cargando
  const disabledOrLoadingClasses =
    disabled || loading ? 'opacity-50 cursor-not-allowed' : ''

  return (
    <button
      type="button" // Siempre 'button' para evitar submits accidentales
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${disabledOrLoadingClasses} ${className}`}
      aria-label={ariaLabel} // Importante para accesibilidad
      {...props}
    >
      {/* Si hay estado de carga, puedes añadir un spinner si es relevante */}
      {loading ? (
        // Asumiendo que también tienes Loader2 de lucide-react para loading spinner
        <Loader2 className={`animate-spin ${iconSizeClasses}`} />
      ) : (
        <IconComponent className={iconSizeClasses} />
      )}
    </button>
  )
}

export default IconButton
