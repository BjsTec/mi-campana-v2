// src/components/ui/Button.jsx
'use client'

import React from 'react'
import { Loader2 } from 'lucide-react' // Importar el icono de carga de Lucide React

const Button = ({
  children,
  onClick,
  type = 'button',
  disabled = false,
  loading = false,
  variant = 'solid',
  color = 'primary', // Usará tu paleta de colores definida en tailwind.config.js
  size = 'md',
  className = '',
  IconComponent = null, // Componente de ícono opcional
  iconPosition = 'left', // Posición del ícono
  ...props
}) => {
  // Clases base para el botón
  const baseClasses =
    'inline-flex items-center justify-center font-semibold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'

  // Clases de tamaño
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-2.5 text-lg',
    xl: 'px-6 py-3 text-xl',
  }[size]

  // Clases de color y variante
  const variantClasses = {
    solid: `bg-${color}-DEFAULT text-white hover:bg-${color}-600 focus:ring-${color}-500`,
    outline: `bg-transparent border border-${color}-DEFAULT text-${color}-DEFAULT hover:bg-${color}-50 focus:ring-${color}-500`,
    text: `bg-transparent text-${color}-DEFAULT hover:bg-${color}-50 focus:ring-${color}-500`,
    link: `bg-transparent text-${color}-DEFAULT hover:underline focus:ring-${color}-500 p-0`, // Sin padding extra para link
  }[variant]

  // Clases para estado deshabilitado/cargando
  const disabledOrLoadingClasses =
    disabled || loading ? 'opacity-50 cursor-not-allowed' : ''

  // Clases para el icono
  const iconClasses = {
    sm: IconComponent ? 'w-4 h-4' : '',
    md: IconComponent ? 'w-5 h-5' : '',
    lg: IconComponent ? 'w-6 h-6' : '',
    xl: IconComponent ? 'w-7 h-7' : '',
  }[size]

  const iconMarginClasses = children
    ? iconPosition === 'left'
      ? 'mr-2'
      : 'ml-2'
    : '' // Solo margen si hay texto

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${disabledOrLoadingClasses} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2
          className={`animate-spin ${iconClasses} ${children ? 'mr-2' : ''}`}
        />
      ) : (
        IconComponent &&
        iconPosition === 'left' && (
          <IconComponent className={`${iconClasses} ${iconMarginClasses}`} />
        )
      )}
      {children}
      {!loading && IconComponent && iconPosition === 'right' && (
        <IconComponent className={`${iconClasses} ${iconMarginClasses}`} />
      )}
    </button>
  )
}

export default Button
