// src/components/ui/Input.jsx
'use client'

import React from 'react'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

export default function Input({
  label,
  id,
  name,
  type = 'text',
  value,
  onChange,
  required = false,
  placeholder = '',
  error = '',
  disabled = false,
  readOnly = false,
  className = '',
  labelClassName = '',
  containerClassName = '',
  IconComponent = null,
  iconPosition = 'left',
  showPasswordToggle = false,
  inputMode,
  step,
  min,
  max,
  ...props
}) {
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false)
  const inputType = type === 'password' && isPasswordVisible ? 'text' : type

  const baseInputClasses =
    'block w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none transition-colors duration-200'
  const colorClasses = error
    ? 'border-red-500 focus:ring-red-500 focus:border-red-500 text-red-800'
    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-gray-900'
  const disabledClasses = disabled
    ? 'bg-gray-100 cursor-not-allowed opacity-70'
    : ''
  const iconWrapperClasses = IconComponent
    ? `relative ${iconPosition === 'left' ? 'pl-10' : 'pr-10'}`
    : ''
  const iconClasses = IconComponent
    ? 'w-5 h-5 text-gray-500 absolute top-1/2 -translate-y-1/2'
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
          className={`block text-sm font-medium text-gray-700 mb-1 ${labelClassName}`}
        >
          {label}
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
          {...props}
        />
        {type === 'password' && showPasswordToggle && (
          <button
            type="button"
            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-blue-600 focus:outline-none"
            aria-label={
              isPasswordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'
            }
          >
            {isPasswordVisible ? (
              <EyeSlashIcon className="w-5 h-5" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
      {error && (
        <p
          id={`${id || name}-error`}
          className="mt-1 text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  )
}
