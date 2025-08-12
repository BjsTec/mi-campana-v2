'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Lottie from 'lottie-react'

// Componentes de los pasos
import Step1 from '@/components/registration/Step1'
import Step2 from '@/components/registration/Step2'
import Step3 from '@/components/registration/Step3'

// Hook de lógica
import { useRegistrationForm } from '@/hooks/useRegistrationForm'

// Iconos y Animaciones
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline'
import loginLoadingAnimation from '@/animations/loginOne.json'

// Componentes de UI comunes
import BackButton from '@/components/ui/BackButton'

export default function RegistroDemoPage() {
  const {
    step,
    setStep,
    formData,
    loading,
    success,
    generalError,
    departments,
    cities,
    isDeptLoading,
    isCityLoading,
    deptError,
    cityError,
    handleGoBack,
    handleChange,
    handleStep1Submit,
    handleStep2Submit,
    handleStep3Submit,
  } = useRegistrationForm()

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Step1
            formData={formData}
            handleChange={handleChange}
            handleStep1Submit={handleStep1Submit}
            loading={loading}
          />
        )
      case 2:
        return (
          <Step2
            formData={formData}
            handleChange={handleChange}
            handleStep2Submit={handleStep2Submit}
            setStep={setStep}
            loading={loading}
          />
        )
      case 3:
        return (
          <Step3
            formData={formData}
            handleChange={handleChange}
            handleStep3Submit={handleStep3Submit}
            setStep={setStep}
            loading={loading}
            departments={departments}
            cities={cities}
            isDeptLoading={isDeptLoading}
            isCityLoading={isCityLoading}
            deptError={deptError}
            cityError={cityError}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col-reverse lg:flex-row min-h-screen bg-neutral-900 font-body overflow-hidden">
      {loading && (
        <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm">
          <Lottie
            animationData={loginLoadingAnimation}
            loop={true}
            autoplay={true}
            style={{ width: 200, height: 200 }}
          />
        </div>
      )}

      {/* Columna de Formulario - Se desplaza hacia la izquierda */}
      <div
        className={`w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 bg-white relative z-20 transition-transform duration-700 ease-in-out ${step > 1 ? '-translate-x-full lg:translate-x-0' : ''}`}
      >
        <div className="rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
          <div className="lg:hidden bg-primary-dark p-6 flex justify-center items-center">
            <div className="w-32">
              <Image
                src="/logo.png"
                alt="Autoridad Política Logo"
                layout="responsive"
                width={150}
                height={50}
              />
            </div>
          </div>
          <div className="bg-white p-6 sm:p-8 text-center">
            <h1 className="text-3xl font-bold text-neutral-800 mb-2 font-headings">
              Registro de Cuenta Demo
            </h1>
            <p className="text-neutral-600 mb-8 font-body">Paso {step} de 3</p>

            {success && (
              <div className="rounded-md bg-green-50 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <CheckCircleIcon
                      className="h-5 w-5 text-green-400"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      ¡Registro exitoso!
                    </h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>
                        Tu cuenta demo ha sido creada. Serás redirigido en
                        breve.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {generalError && (
              <div className="rounded-md bg-red-50 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <ExclamationCircleIcon
                      className="h-5 w-5 text-red-400"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="ml-3 text-left">
                    <h3 className="text-sm font-medium text-red-800">
                      Hubo un error
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{generalError}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <form>{renderStep()}</form>
          </div>
        </div>
      </div>

      {/* Columna de Branding - Se desplaza hacia la derecha */}
      <div
        className={`w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-primary-dark to-primary-800 relative z-10 transition-transform duration-700 ease-in-out ${step > 1 ? 'translate-x-full lg:translate-x-0' : ''}`}
      >
        <div className="absolute inset-0 z-0 opacity-10">
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid slice"
            fill="none"
          >
            <circle
              cx="20"
              cy="20"
              r="15"
              fill="currentColor"
              className="text-secondary-DEFAULT opacity-20 animate-pulse-slow"
            />
            <rect
              x="70"
              y="10"
              width="15"
              height="15"
              fill="currentColor"
              className="text-secondary-DEFAULT opacity-20 animate-pulse-slow delay-1000"
            />
            <polygon
              points="50,80 60,95 40,95"
              fill="currentColor"
              className="text-secondary-DEFAULT opacity-20 animate-pulse-slow delay-2000"
            />
            <path
              d="M10 50 Q 30 30, 50 50 T 90 50"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-neutral-50 opacity-10 animate-fade-in"
            />
          </svg>
        </div>
        <div className="relative z-10 text-white text-center flex flex-col items-center justify-center">
          <div className="mb-8 w-48 md:w-64 lg:w-72">
            <Image
              src="/logo.png"
              alt="Autoridad Política Logo"
              layout="responsive"
              width={300}
              height={100}
            />
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 font-headings">
            ¡Bienvenido!
          </h2>
          <p className="text-xl md:text-2xl leading-relaxed max-w-sm">
            Empieza a gestionar tu campaña con la plataforma líder.
          </p>
        </div>
      </div>
    </div>
  )
}
