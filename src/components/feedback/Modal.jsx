// src/components/feedback/Modal.jsx
// Asumiendo que @headlessui/react y lucide-react están instalados
'use client'

import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { X } from 'lucide-react' // Icono de cerrar

import IconButton from '@/components/ui/IconButton' // Importar tu nuevo IconButton

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer = null,
  size = 'md',
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }[size]

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose} {...props}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          {/* Overlay de fondo oscuro */}
          <div className="fixed inset-0 bg-neutral-900 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={`w-full transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all ${sizeClasses} ${className}`}
              >
                {/* Encabezado del Modal */}
                <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
                  <Dialog.Title
                    as="h3"
                    className="text-xl font-semibold text-neutral-800"
                  >
                    {title}
                  </Dialog.Title>
                  <IconButton
                    IconComponent={X} // Icono X de lucide-react
                    onClick={onClose}
                    aria-label="Cerrar modal"
                    variant="text"
                    color="neutral"
                    size="sm"
                  />
                </div>

                {/* Contenido del Modal */}
                <div className="mt-4 text-neutral-700">{children}</div>

                {/* Pie de página del Modal (opcional) */}
                {footer && (
                  <div className="mt-6 pt-4 border-t border-neutral-200 flex justify-end gap-x-3">
                    {footer}
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

export default Modal
