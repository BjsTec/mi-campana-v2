// src/components/admin/campaigns/CandidateInfoStep.js
import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import Input from '@/components/ui/Input.jsx'
import Combobox from '@/components/ui/Combobox.js'

const CandidateInfoStep = ({
  formData,
  handleInputChange,
  departamentos,
  candidateCiudades,
  setMessage,
  dispatch,
  GET_CITIES_BY_DEPARTMENT_URL,
  GET_USER_BY_CEDULA_URL,
  setCandidateCiudades,
  validationErrors,
}) => {
  const [foundUser, setFoundUser] = useState(null)
  const [isSearching, setIsSearching] = useState(false)
  const debounceTimeoutRef = useRef(null)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    const fetchCandidateCiudades = async () => {
      if (formData.candidateLocation.state) {
        try {
          if (!GET_CITIES_BY_DEPARTMENT_URL) {
            throw new Error('URL para obtener ciudades por departamento no configurada.')
          }
          const response = await fetch(`${GET_CITIES_BY_DEPARTMENT_URL}?departmentId=${formData.candidateLocation.state}`)
          if (!response.ok) {
            throw new Error('No se pudieron cargar las ciudades del candidato.')
          }
          const data = await response.json()
          setCandidateCiudades(data)
          if (!data.some((c) => c.id === formData.candidateLocation.city)) {
            dispatch({ type: 'UPDATE_FIELD', field: 'candidateLocation.city', value: '' })
          }
        } catch (error) {
          console.error('Error al obtener ciudades del candidato:', error)
          setMessage({ text: `❌ Error al cargar ciudades del candidato: ${error.message}`, type: 'error' })
        }
      } else {
        setCandidateCiudades([])
        dispatch({ type: 'UPDATE_FIELD', field: 'candidateLocation.city', value: '' })
      }
    }
    fetchCandidateCiudades()
  }, [formData.candidateLocation.state, GET_CITIES_BY_DEPARTMENT_URL, setCandidateCiudades, setMessage, formData.candidateLocation.city, dispatch])

  const handleInputChangeLocal = (e) => {
    handleInputChange(e)
    if (e.target.name === 'candidateCedula') {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
      debounceTimeoutRef.current = setTimeout(() => {
        if (e.target.value.trim().length >= 7) {
          handleCedulaSearch(e.target.value.trim())
        } else {
          setFoundUser(null)
          setIsSearching(false)
          setMessage({ text: '', type: '' })
        }
      }, 500)
    }
  }

  const handleCedulaSearch = useCallback(async (cedula) => {
    setIsSearching(true)
    setFoundUser(null)
    setMessage({ text: '', type: '' })
    try {
      if (!GET_USER_BY_CEDULA_URL) {
        throw new Error('URL para buscar usuario por cédula no configurada.')
      }
      const response = await fetch(`${GET_USER_BY_CEDULA_URL}?cedula=${cedula}`)
      if (!response.ok) {
        throw new Error('Error al buscar usuario por cédula.')
      }
      const result = await response.json()
      if (result.user) {
        setFoundUser(result.user)
        setMessage({ text: `✅ Usuario encontrado: ${result.user.name} (${result.user.email}).`, type: 'success' })
      } else {
        setMessage({ text: 'ℹ️ No se encontró ningún usuario con esa cédula. Puedes registrar uno nuevo.', type: 'info' })
      }
    } catch (error) {
      console.error('Error en handleCedulaSearch:', error)
      setMessage({ text: `❌ Error al buscar usuario: ${error.message}`, type: 'error' })
    } finally {
      setIsSearching(false)
    }
  }, [GET_USER_BY_CEDULA_URL, setMessage])

  const handlePreloadUser = useCallback(() => {
    if (foundUser) {
      dispatch({
        type: 'SET_FORM_DATA',
        payload: {
          ...formData,
          candidateName: foundUser.name || '',
          candidateEmail: foundUser.email || '',
          whatsapp: foundUser.whatsapp || '',
          phone: foundUser.phone || '',
          sexo: foundUser.sexo || '',
          dateBirth: foundUser.dateBirth ? foundUser.dateBirth.split('T')[0] : '',
          candidateLocation: {
            country: foundUser.location?.country || 'Colombia',
            state: foundUser.location?.state || '',
            city: foundUser.location?.city || '',
          },
          puestoVotacion: foundUser.location?.votingStation || '',
        },
      })
      setMessage({ text: '✅ Datos del usuario precargados. Revisa y completa la información.', type: 'success' })
      setFoundUser(null)
    }
  }, [foundUser, formData, dispatch, setMessage])

  const sexoOptions = useMemo(() => [
    { value: '', label: 'Seleccione' },
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Femenino' },
    { value: 'O', label: 'Otro' }
  ], []);

  const departamentosOptions = useMemo(() => [{ value: '', label: 'Seleccione un departamento' }, ...departamentos.map(dep => ({ value: dep.id, label: dep.name }))], [departamentos]);
  const ciudadesOptions = useMemo(() => [{ value: '', label: 'Seleccione una ciudad' }, ...candidateCiudades.map(ciu => ({ value: ciu.id, label: ciu.name }))], [candidateCiudades]);

  return (
    <div className="space-y-6 animate-fade-in">
      <h3 className="text-lg font-medium leading-6 text-gray-900">
        Datos del Candidato
      </h3>
      <div>
        <label htmlFor="candidateCedula" className="block text-sm font-medium text-gray-700">
          Cédula del Candidato <span className="text-red-500">*</span>
        </label>
        <div className="mt-1">
          <input
            type="text"
            name="candidateCedula"
            id="candidateCedula"
            value={formData.candidateCedula}
            onChange={handleInputChangeLocal}
            onBlur={() => {
              if (formData.candidateCedula.trim().length >= 7 && !isSearching) {
                handleCedulaSearch(formData.candidateCedula.trim())
              }
            }}
            required
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-gray-900"
          />
        </div>
        {isSearching && (
          <p className="text-sm text-primary-DEFAULT mt-1">Buscando usuario...</p>
        )}
        {foundUser && (
          <div className="mt-2 p-2 bg-primary-50 border border-primary-200 rounded-md flex items-center justify-between">
            <p className="text-sm text-primary-dark">
              Usuario encontrado: <strong>{foundUser.name}</strong> ({foundUser.email})
            </p>
            <button
              type="button"
              onClick={handlePreloadUser}
              className="ml-4 px-3 py-1 bg-primary-DEFAULT text-white text-xs font-medium rounded-md hover:bg-primary-dark"
            >
              Precargar Datos
            </button>
          </div>
        )}
      </div>
      <div>
        <label htmlFor="candidateName" className="block text-sm font-medium text-gray-700">
          Nombre Completo del Candidato <span className="text-red-500">*</span>
        </label>
        <div className="mt-1">
          <input
            type="text"
            name="candidateName"
            id="candidateName"
            value={formData.candidateName}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-gray-900"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="candidateEmail" className="block text-sm font-medium text-gray-700">
            Email del Candidato <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input
              type="email"
              name="candidateEmail"
              id="candidateEmail"
              value={formData.candidateEmail}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-gray-900"
            />
          </div>
        </div>
        <div>
          <label htmlFor="candidatePassword" className="block text-sm font-medium text-gray-700">
            Contraseña Inicial para el Candidato <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="candidatePassword"
              id="candidatePassword"
              value={formData.candidatePassword}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-gray-900 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-blue-600"
            >
              {showPassword ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7S3.732 16.057 2.458 12z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.057 10.057 0 0112 19c-4.478 0-8.268-2.943-9.542-7 1.274-4.057 5.064-7 9.542-7 1.052 0 2.062.158 3.018.455m-4.226 7.74a3 3 0 11-4.243-4.243M16 12a4 4 0 11-8 0 4 4 0 018 0zM6 18L18 6" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7S3.732 16.057 2.458 12zM6 18L18 6" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700">
            WhatsApp
          </label>
          <div className="mt-1">
            <input
              type="tel"
              name="whatsapp"
              id="whatsapp"
              value={formData.whatsapp}
              onChange={handleInputChange}
              placeholder="Ej: +57 3XX YYY ZZZZ"
              className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-gray-900"
            />
          </div>
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Teléfono Fijo
          </label>
          <div className="mt-1">
            <input
              type="tel"
              name="phone"
              id="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-gray-900"
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="sexo" className="block text-sm font-medium text-gray-700">
            Sexo <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <select
              id="sexo"
              name="sexo"
              value={formData.sexo}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-gray-900"
            >
              <option value="">Seleccione</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
              <option value="O">Otro</option>
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="dateBirth" className="block text-sm font-medium text-gray-700">
            Fecha de Nacimiento <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input
              type="date"
              name="dateBirth"
              id="dateBirth"
              value={formData.dateBirth}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-gray-900"
            />
          </div>
        </div>
      </div>
      <h3 className="text-lg font-medium leading-6 text-gray-900 pt-4">
        Ubicación del Candidato
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label htmlFor="candidateLocation.country" className="block text-sm font-medium text-gray-700">
            País (Candidato) <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="candidateLocation.country"
              id="candidateLocation.country"
              value={formData.candidateLocation.country}
              onChange={handleInputChange}
              required
              disabled
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm bg-gray-100 text-gray-900"
            />
          </div>
        </div>
        <div>
          <label htmlFor="candidateLocation.state" className="block text-sm font-medium text-gray-700">
            Departamento (Candidato) <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <select
              id="candidateLocation.state"
              name="candidateLocation.state"
              value={formData.candidateLocation.state}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-gray-900"
            >
              <option value="">Seleccione un departamento</option>
              {departamentos.map(dep => (
                <option key={dep.id} value={dep.id}>{dep.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="candidateLocation.city" className="block text-sm font-medium text-gray-700">
            Ciudad (Candidato) <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <select
              id="candidateLocation.city"
              name="candidateLocation.city"
              value={formData.candidateLocation.city}
              onChange={handleInputChange}
              required
              disabled={!formData.candidateLocation.state}
              className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-gray-900"
            >
              <option value="">Seleccione una ciudad</option>
              {candidateCiudades.map(ciu => (
                <option key={ciu.id} value={ciu.id}>{ciu.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div>
        <label htmlFor="puestoVotacion" className="block text-sm font-medium text-gray-700">
          Puesto de Votación
        </label>
        <div className="mt-1">
          <input
            type="text"
            name="puestoVotacion"
            id="puestoVotacion"
            value={formData.puestoVotacion}
            onChange={handleInputChange}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-gray-900"
          />
        </div>
      </div>
    </div>
  )
}

export default CandidateInfoStep