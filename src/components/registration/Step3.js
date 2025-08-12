// src/components/registration/Step3.js
import React from 'react'
import FormGroup from '@/components/ui/FormGroup'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'

const Step3 = ({
  formData,
  handleChange,
  handleStep3Submit,
  setStep,
  loading,
  departments,
  cities,
  isDeptLoading,
  isCityLoading,
  deptError,
  cityError,
}) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-neutral-800 text-left w-full mt-8">
        Detalles de la Campaña
      </h2>
      <FormGroup
        label="Nombre de la Campaña (Opcional)"
        htmlFor="campaignName"
        labelClassName="text-neutral-700 text-left w-full"
      >
        <Input
          id="campaignName"
          name="campaignName"
          type="text"
          placeholder="Ej: Campaña por la Dignidad"
          value={formData.campaignName}
          onChange={handleChange}
        />
      </FormGroup>

      <h2 className="text-xl font-semibold text-neutral-800 text-left w-full mt-8">
        Ubicación
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormGroup
          label="Departamento"
          htmlFor="state"
          labelClassName="text-neutral-700 text-left w-full"
        >
          <Select
            id="state"
            name="state"
            value={formData.location.state}
            onChange={handleChange}
            required
            loading={isDeptLoading}
            error={deptError}
          >
            <option value="">
              {isDeptLoading ? 'Cargando...' : 'Selecciona...'}
            </option>
            {departments &&
              departments.map((dept) => (
                <option key={dept.id} value={dept.name}>
                  {dept.name}
                </option>
              ))}
          </Select>
        </FormGroup>
        <FormGroup
          label="Ciudad"
          htmlFor="city"
          labelClassName="text-neutral-700 text-left w-full"
        >
          <Select
            id="city"
            name="city"
            value={formData.location.city}
            onChange={handleChange}
            required
            disabled={!formData.location.state || isCityLoading}
            loading={isCityLoading}
            error={cityError}
          >
            <option value="">
              {isCityLoading ? 'Cargando...' : 'Selecciona...'}
            </option>
            {cities &&
              cities.map((city) => (
                <option key={city.id} value={city.name}>
                  {city.name}
                </option>
              ))}
          </Select>
        </FormGroup>
      </div>

      <div className="flex justify-between space-x-4">
        <Button
          type="button"
          onClick={() => setStep(2)}
          className="w-1/2 bg-gray-500 hover:bg-gray-600 text-white shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
          size="md" // Cambiado de "lg" a "md"
        >
          Atrás
        </Button>
        <Button
          type="submit"
          className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          size="md" // Cambiado de "lg" a "md"
          onClick={handleStep3Submit}
          loading={loading}
          disabled={loading}
        >
          Finalizar
        </Button>
      </div>
    </div>
  )
}

export default Step3
