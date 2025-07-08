// src/components/ui/Alert.js
import React, { useEffect, useState } from 'react'

const Alert = ({ message, type, onClose }) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Ocultar la alerta automáticamente después de 3 segundos
    const timer = setTimeout(() => {
      setIsVisible(false)
      if (onClose) {
        onClose()
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [onClose])

  if (!isVisible) return null

  const alertClasses = {
    success: 'bg-green-100 border-green-400 text-green-700',
    error: 'bg-red-100 border-red-400 text-red-700',
    warning: 'bg-yellow-100 border-yellow-400 text-yellow-700',
    info: 'bg-blue-100 border-blue-400 text-blue-700',
  }

  const title = {
    success: 'Éxito',
    error: 'Error',
    warning: 'Advertencia',
    info: 'Información',
  }

  return (
    <div
      className={`p-3 rounded-md border ${alertClasses[type || 'info']} shadow-lg z-50 transition-opacity duration-300 ease-in-out`}
      role="alert"
      style={{ opacity: isVisible ? 1 : 0 }}
    >
      <div className="flex items-center justify-between">
        <p className="font-bold">{title[type || 'info']}</p>
        <button
          onClick={() => {
            setIsVisible(false)
            if (onClose) onClose()
          }}
          className="text-current opacity-70 hover:opacity-100"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      </div>
      <p className="text-sm mt-1">{message}</p>
    </div>
  )
}

export default Alert
