// src/components/registration/Step2.js
import React from 'react'
import FormGroup from '@/components/ui/FormGroup'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'

const Step2 = ({
  formData,
  handleChange,
  handleStep2Submit,
  setStep,
  loading,
}) => {
  return (
    <div className="space-y-4">
      {' '}
      {/* Espaciado para el Step 2 */}
      <h2 className="text-xl font-semibold text-neutral-800 text-left w-full mt-8">
        Información del Candidato
      </h2>
      <FormGroup
        label="Nombre"
        htmlFor="candidateName"
        labelClassName="text-neutral-700 text-left w-full"
      >
        <Input
          id="candidateName"
          name="candidateName"
          type="text"
          required
          placeholder="Ej: María Rodríguez"
          value={formData.candidateName}
          onChange={handleChange}
        />
      </FormGroup>
      <FormGroup
        label="Correo Electrónico"
        htmlFor="candidateEmail"
        labelClassName="text-neutral-700 text-left w-full"
      >
        <Input
          id="candidateEmail"
          name="candidateEmail"
          type="email"
          required
          placeholder="Ej: maria.rodriguez@email.com"
          value={formData.candidateEmail}
          onChange={handleChange}
        />
      </FormGroup>
      <FormGroup
        label="Contraseña"
        htmlFor="candidatePassword"
        labelClassName="text-neutral-700 text-left w-full"
      >
        <Input
          id="candidatePassword"
          name="candidatePassword"
          type="password"
          required
          placeholder="••••••••"
          value={formData.candidatePassword}
          onChange={handleChange}
          showPasswordToggle={true}
        />
      </FormGroup>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormGroup
          label="Teléfono"
          htmlFor="phone"
          labelClassName="text-neutral-700 text-left w-full"
        >
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="Ej: +573001234567"
            value={formData.phone}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup
          label="WhatsApp"
          htmlFor="whatsapp"
          labelClassName="text-neutral-700 text-left w-full"
        >
          <Input
            id="whatsapp"
            name="whatsapp"
            type="tel"
            placeholder="Ej: +573001234567"
            value={formData.whatsapp}
            onChange={handleChange}
          />
        </FormGroup>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormGroup
          label="Fecha de Nacimiento"
          htmlFor="dateBirth"
          labelClassName="text-neutral-700 text-left w-full"
        >
          <Input
            id="dateBirth"
            name="dateBirth"
            type="date"
            value={formData.dateBirth}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup
          label="Sexo"
          htmlFor="sexo"
          labelClassName="text-neutral-700 text-left w-full"
        >
          <Select
            id="sexo"
            name="sexo"
            value={formData.sexo}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona...</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
            <option value="Otro">Otro</option>
          </Select>
        </FormGroup>
      </div>
      <div className="flex justify-between space-x-4">
        <Button
          type="button"
          onClick={() => setStep(1)}
          className="w-1/2 bg-gray-500 hover:bg-gray-600 text-white shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
          size="lg"
        >
          Atrás
        </Button>
        <Button
          type="submit"
          className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          size="lg"
          onClick={handleStep2Submit}
          loading={loading}
          disabled={loading}
        >
          Siguiente
        </Button>
      </div>
    </div>
  )
}

export default Step2
