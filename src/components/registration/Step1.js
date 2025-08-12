// src/components/registration/Step1.js
import React from 'react'
import FormGroup from '@/components/ui/FormGroup'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

const Step1 = ({ formData, handleChange, handleStep1Submit, loading }) => {
  return (
    <div className="space-y-6">
      {' '}
      {/* Espaciado para el Step 1 */}
      <h2 className="text-xl font-semibold text-neutral-800 text-left w-full mt-8">
        Verificación
      </h2>
      <p className="text-neutral-600 text-left w-full">
        Ingresa tu cédula para verificar si ya tienes una cuenta.
      </p>
      <FormGroup
        label="Cédula"
        htmlFor="candidateCedula"
        labelClassName="text-neutral-700 text-left w-full"
      >
        <Input
          id="candidateCedula"
          name="candidateCedula"
          type="text"
          required
          placeholder="Número de Cédula"
          value={formData.candidateCedula}
          onChange={handleChange}
        />
      </FormGroup>
      <Button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        size="lg"
        onClick={handleStep1Submit}
        loading={loading}
        disabled={loading}
      >
        Siguiente
      </Button>
    </div>
  )
}

export default Step1
