// src/components/admin/campaigns/CandidateInfoStep.js
import React, { useEffect, useCallback, useRef, useState } from 'react';

const CandidateInfoStep = ({
  formData,
  handleInputChange,
  departamentos,
  candidateCiudades, // Ciudades específicas para el candidato
  setMessage,
  dispatch,
  GET_CITIES_BY_DEPARTMENT_URL,
  GET_USER_BY_CEDULA_URL,
  setCandidateCiudades, // Asegúrate de pasar este setter desde page.js
}) => {
  // Estados para la búsqueda de usuario por cédula
  const [foundUser, setFoundUser] = useState(null); // Almacena el usuario encontrado
  const [isSearching, setIsSearching] = useState(false); // Estado de carga de la búsqueda
  const debounceTimeoutRef = useRef(null); // Para el debounce
  const [showPassword, setShowPassword] = useState(false); // Nuevo estado para mostrar/ocultar contraseña

  // Cargar ciudades para la ubicación del candidato
  useEffect(() => {
    const fetchCandidateCiudades = async () => {
      if (formData.candidateLocation.state) {
        try {
          if (!GET_CITIES_BY_DEPARTMENT_URL) {
            throw new Error('URL para obtener ciudades por departamento no configurada.');
          }
          const response = await fetch(`${GET_CITIES_BY_DEPARTMENT_URL}?departmentId=${formData.candidateLocation.state}`);
          if (!response.ok) {
            throw new Error('No se pudieron cargar las ciudades del candidato.');
          }
          const data = await response.json();
          setCandidateCiudades(data); // Usar el setter pasado por props
          // Limpiar ciudad si el departamento cambia y la ciudad actual no pertenece
          if (!data.some(c => c.id === formData.candidateLocation.city)) {
            dispatch({ type: 'UPDATE_FIELD', field: 'candidateLocation.city', value: '' });
          }
        } catch (error) {
          console.error('Error al obtener ciudades del candidato:', error);
          setMessage({ text: `❌ Error al cargar ciudades del candidato: ${error.message}`, type: 'error' });
        }
      } else {
        setCandidateCiudades([]); // Limpiar ciudades si no hay departamento seleccionado
        dispatch({ type: 'UPDATE_FIELD', field: 'candidateLocation.city', value: '' });
      }
    };
    fetchCandidateCiudades();
  }, [formData.candidateLocation.state, GET_CITIES_BY_DEPARTMENT_URL, setCandidateCiudades, setMessage, formData.candidateLocation.city, dispatch]);


  const handleInputChangeLocal = (e) => {
    handleInputChange(e); // Llama al handler del padre

    // Lógica de búsqueda por cédula con debounce
    if (e.target.name === 'candidateCedula') {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      debounceTimeoutRef.current = setTimeout(() => {
        if (e.target.value.trim().length >= 7) { // Mínimo 7 dígitos para buscar
          handleCedulaSearch(e.target.value.trim());
        } else {
          setFoundUser(null); // Limpiar usuario encontrado si la cédula es muy corta
          setIsSearching(false);
          setMessage({ text: '', type: '' }); // Limpiar mensaje de búsqueda
        }
      }, 500); // Debounce de 500ms
    }
  };

  // Función para buscar usuario por cédula
  const handleCedulaSearch = useCallback(async (cedula) => {
    setIsSearching(true);
    setFoundUser(null); // Limpiar cualquier usuario previamente encontrado
    setMessage({ text: '', type: '' }); // Limpiar mensajes anteriores

    try {
      if (!GET_USER_BY_CEDULA_URL) {
        throw new Error('URL para buscar usuario por cédula no configurada.');
      }
      const response = await fetch(`${GET_USER_BY_CEDULA_URL}?cedula=${cedula}`);
      if (!response.ok) {
        throw new Error('Error al buscar usuario por cédula.');
      }
      const result = await response.json();

      if (result.user) {
        setFoundUser(result.user);
        setMessage({ text: `✅ Usuario encontrado: ${result.user.name} (${result.user.email}).`, type: 'success' });
      } else {
        setMessage({ text: 'ℹ️ No se encontró ningún usuario con esa cédula. Puedes registrar uno nuevo.', type: 'info' });
      }
    } catch (error) {
      console.error('Error en handleCedulaSearch:', error);
      setMessage({ text: `❌ Error al buscar usuario: ${error.message}`, type: 'error' });
    } finally {
      setIsSearching(false);
    }
  }, [GET_USER_BY_CEDULA_URL, setMessage]);

  // Función para precargar el formulario con los datos del usuario encontrado
  const handlePreloadUser = useCallback(() => {
    if (foundUser) {
      dispatch({ 
        type: 'SET_FORM_DATA', 
        payload: {
          ...formData, // Mantener los datos actuales del formulario
          candidateName: foundUser.name || '',
          candidateEmail: foundUser.email || '', 
          whatsapp: foundUser.whatsapp || '',
          phone: foundUser.phone || '',
          sexo: foundUser.sexo || '',
          dateBirth: foundUser.dateBirth ? foundUser.dateBirth.split('T')[0] : '', // Formato YYYY-MM-DD
          candidateLocation: {
            country: foundUser.location?.country || 'Colombia',
            state: foundUser.location?.state || '',
            city: foundUser.location?.city || '',
          },
          puestoVotacion: foundUser.location?.votingStation || '',
        }
      });
      setMessage({ text: '✅ Datos del usuario precargados. Revisa y completa la información.', type: 'success' });
      setFoundUser(null); // Ocultar la sugerencia después de precargar
    }
  }, [foundUser, formData, dispatch, setMessage]);


  return (
    <div className="space-y-6 animate-fade-in">
      <h3 className="text-lg font-medium leading-6 text-gray-900">
        Datos del Candidato
      </h3>
      <div>
        <label
          htmlFor="candidateCedula"
          className="block text-sm font-medium text-gray-700"
        >
          Cédula del Candidato *
        </label>
        <input
          type="text"
          name="candidateCedula"
          id="candidateCedula"
          value={formData.candidateCedula}
          onChange={handleInputChangeLocal} // Usar el handler local
          onBlur={() => { // También se puede activar en onBlur para búsquedas finales
            if (formData.candidateCedula.trim().length >= 7 && !isSearching) {
              handleCedulaSearch(formData.candidateCedula.trim());
            }
          }}
          required
          className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-gray-900" // Añadido text-gray-900
        />
        {isSearching && (
          <p className="text-sm text-primary-600 mt-1">Buscando usuario...</p> 
        )}
        {foundUser && (
          <div className="mt-2 p-2 bg-primary-50 border border-primary-200 rounded-md flex items-center justify-between"> {/* Usando primary-50 y primary-200 */}
            <p className="text-sm text-primary-800"> {/* Usando primary-800 */}
              Usuario encontrado: <strong>{foundUser.name}</strong> ({foundUser.email})
            </p>
            <button
              type="button"
              onClick={handlePreloadUser}
              className="ml-4 px-3 py-1 bg-primary-600 text-white text-xs font-medium rounded-md hover:bg-primary-700" // Usando primary-600 y primary-700
            >
              Precargar Datos
            </button>
          </div>
        )}
      </div>
      <div>
        <label
          htmlFor="candidateName"
          className="block text-sm font-medium text-gray-700"
        >
          Nombre Completo del Candidato *
        </label>
        <input
          type="text"
          name="candidateName"
          id="candidateName"
          value={formData.candidateName}
          onChange={handleInputChange}
          required
          className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-gray-900" // Añadido text-gray-900
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="candidateEmail"
            className="block text-sm font-medium text-gray-700"
          >
            Email del Candidato *
          </label>
          <input
            type="email"
            name="candidateEmail"
            id="candidateEmail"
            value={formData.candidateEmail}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-gray-900" // Añadido text-gray-900
          />
        </div>
        <div className="relative"> {/* Añadido relative para posicionar el botón de ojo */}
          <label
            htmlFor="candidatePassword"
            className="block text-sm font-medium text-gray-700"
          >
            Contraseña Inicial para el Candidato *
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            name="candidatePassword"
            id="candidatePassword"
            value={formData.candidatePassword}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md pr-10 text-gray-900" // Añadido pr-10 para espacio del botón
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)} // Toggle del estado
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 top-6" // Posicionamiento del botón
          >
            {showPassword ? (
              // Icono de ojo abierto
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
            ) : (
              // Icono de ojo tachado
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414L5.586 8H4a1 1 0 000 2h2.586l-1.414 1.414a1 1 0 001.414 1.414L8 11.414V14a1 1 0 102 0v-2.586l1.414 1.414a1 1 0 001.414-1.414L11.414 10H14a1 1 0 000-2h-2.586l1.414-1.414a1 1 0 00-1.414-1.414L10 8.586V6a1 1 0 10-2 0v2.586L3.707 2.293zM10 14a4 4 0 00-4-4h-1.172l-1.414-1.414a1 1 0 00-1.414 1.414L.458 10C1.732 14.057 5.522 17 10 17s8.268-2.943 9.542-7c-.068-.214-.135-.428-.202-.641L17 10a7 7 0 00-7-7c-.41 0-.82.016-1.226.046L8.586 6H6a1 1 0 000 2h2.586l-1.414 1.414a1 1 0 001.414 1.414L10 11.414V14z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
      </div>
      {/* Nuevos campos de usuario */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700">
            WhatsApp
          </label>
          <input
            type="tel"
            name="whatsapp"
            id="whatsapp"
            value={formData.whatsapp}
            onChange={handleInputChange}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-gray-900" // Añadido text-gray-900
            placeholder="Ej: +57 3XX YYY ZZZZ"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Teléfono Fijo
          </label>
          <input
            type="tel"
            name="phone"
            id="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-gray-900" // Añadido text-gray-900
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="sexo" className="block text-sm font-medium text-gray-700">
            Sexo *
          </label>
          <select
            name="sexo"
            id="sexo"
            value={formData.sexo}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md text-gray-900" // Ajustado focus:ring y focus:border a primary, añadido text-gray-900
          >
            <option value="">Seleccione</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
            <option value="O">Otro</option>
          </select>
        </div>
        <div>
          <label htmlFor="dateBirth" className="block text-sm font-medium text-gray-700">
            Fecha de Nacimiento *
          </label>
          <input
            type="date"
            name="dateBirth"
            id="dateBirth"
            value={formData.dateBirth}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-gray-900" // Añadido text-gray-900
          />
        </div>
      </div>
      {/* Ubicación del Candidato */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label htmlFor="candidateLocation.country" className="block text-sm font-medium text-gray-700">
            País (Candidato) *
          </label>
          <select
            name="candidateLocation.country"
            id="candidateLocation.country"
            value={formData.candidateLocation.country}
            onChange={handleInputChange}
            required
            disabled // Por ahora, solo Colombia
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-gray-50 text-gray-900" // Ajustado focus:ring y focus:border a primary, añadido text-gray-900
          >
            <option value="Colombia">Colombia</option>
          </select>
        </div>
        <div>
          <label htmlFor="candidateLocation.state" className="block text-sm font-medium text-gray-700">
            Departamento (Candidato) *
          </label>
          <select
            name="candidateLocation.state"
            id="candidateLocation.state"
            value={formData.candidateLocation.state}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900" // Ajustado focus:ring y focus:border a primary, añadido text-gray-900
          >
            <option value="">Seleccione un departamento</option>
            {departamentos.map(dep => (
              <option key={dep.id} value={dep.id}>
                {dep.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="candidateLocation.city" className="block text-sm font-medium text-gray-700">
            Ciudad (Candidato) *
          </label>
          <select
            name="candidateLocation.city"
            id="candidateLocation.city"
            value={formData.candidateLocation.city}
            onChange={handleInputChange}
            required
            disabled={!formData.candidateLocation.state}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900" // Ajustado focus:ring y focus:border a primary, añadido text-gray-900
          >
            <option value="">Seleccione una ciudad</option>
            {candidateCiudades.map(ciu => ( // Usar candidateCiudades
              <option key={ciu.id} value={ciu.id}>
                {ciu.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="puestoVotacion" className="block text-sm font-medium text-gray-700">
          Puesto de Votación
        </label>
        <input
          type="text"
          name="puestoVotacion"
          id="puestoVotacion"
          value={formData.puestoVotacion}
          onChange={handleInputChange}
          className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-gray-900" // Añadido text-gray-900
        />
      </div>
    </div>
  );
};

export default CandidateInfoStep;
