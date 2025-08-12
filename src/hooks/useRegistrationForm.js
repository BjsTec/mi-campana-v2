'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { jwtDecode } from 'jwt-decode'
import { useAuth } from '@/context/AuthContext'

export const useRegistrationForm = () => {
  const router = useRouter()
  const { login } = useAuth()

  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    campaignName: '',
    candidateName: '',
    candidateCedula: '',
    candidateEmail: '',
    candidatePassword: '',
    sexo: '',
    dateBirth: '',
    phone: '',
    whatsapp: '',
    location: {
      country: 'Colombia',
      state: '',
      city: '',
    },
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [generalError, setGeneralError] = useState(null)
  const [departments, setDepartments] = useState([])
  const [cities, setCities] = useState([])
  const [isDeptLoading, setIsDeptLoading] = useState(false)
  const [isCityLoading, setIsCityLoading] = useState(false)
  const [deptError, setDeptError] = useState(null)
  const [cityError, setCityError] = useState(null)

  // Carga los departamentos una sola vez al montar el componente.
  useEffect(() => {
    async function fetchDepartments() {
      setIsDeptLoading(true)
      setDeptError(null)
      try {
        const response = await fetch(
          process.env.NEXT_PUBLIC_GET_DEPARTMENTS_URL,
        )
        const data = await response.json()
        if (response.ok && data) {
          setDepartments(data)
        } else {
          setDeptError('No se pudieron cargar los departamentos.')
        }
      } catch (err) {
        console.error('Error fetching departments:', err)
        setDeptError('Error de conexión con la API de departamentos.')
      } finally {
        setIsDeptLoading(false)
      }
    }
    fetchDepartments()
  }, [])

  // Carga las ciudades de un departamento específico
  const fetchCities = async (departmentId) => {
    if (!departmentId) {
      setCities([])
      return
    }
    setIsCityLoading(true)
    setCityError(null)
    try {
      const response = await fetch(
        `https://getcitiesbydepartment-sfa54lzvpa-uc.a.run.app?departmentId=${departmentId}`,
      )
      const data = await response.json()
      if (response.ok && data) {
        setCities(data)
      } else {
        setCities([])
        setCityError('No se pudieron cargar las ciudades.')
      }
    } catch (err) {
      console.error('Error fetching cities:', err)
      setCities([])
      setCityError('Error de conexión con la API de ciudades.')
    } finally {
      setIsCityLoading(false)
    }
  }
  const handleGoBack = () => {
    if (step > 1) {
      setStep(step - 1)
    } else {
      router.push('/')
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'state') {
      setFormData((prevData) => ({
        ...prevData,
        location: {
          ...prevData.location,
          state: value,
          city: '',
        },
      }))
      const selectedDepartment = departments.find((d) => d.name === value)
      if (selectedDepartment) {
        fetchCities(selectedDepartment.id)
      }
    } else if (name === 'city') {
      setFormData((prevData) => ({
        ...prevData,
        location: {
          ...prevData.location,
          city: value,
        },
      }))
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }))
    }
  }

  const handleStep1Submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setGeneralError(null)

    if (!formData.candidateCedula) {
      setGeneralError('Por favor, ingresa tu número de cédula.')
      setLoading(false)
      return
    }

    try {
      const checkUserUrl = `${process.env.NEXT_PUBLIC_GET_USER_BY_CEDULA_URL}?cedula=${formData.candidateCedula}`
      const response = await fetch(checkUserUrl)
      const data = await response.json()

      if (response.ok && data?.user) {
        if (data.user.role === 'candidato') {
          setGeneralError(
            'Esta cédula ya está registrada como candidato en una campaña. No puedes crear una nueva campaña demo.',
          )
        } else {
          setFormData((prev) => ({
            ...prev,
            candidateName: data.user.name || prev.candidateName,
            candidateEmail: data.user.email || prev.candidateEmail,
            sexo: data.user.sexo || prev.sexo,
            dateBirth: data.user.dateBirth || prev.dateBirth,
            phone: data.user.phone || prev.phone,
            whatsapp: data.user.whatsapp || prev.whatsapp,
          }))
          setGeneralError(
            '¡Bienvenido de nuevo! Hemos precargado tus datos. Por favor, continúa con tu registro.',
          )
          setStep(2)
        }
      } else {
        setGeneralError(null)
        setStep(2)
      }
    } catch (err) {
      console.error('Error durante la validación de cédula:', err)
      setGeneralError('Ocurrió un error inesperado al validar tu cédula.')
    } finally {
      setLoading(false)
    }
  }

  const handleStep2Submit = (e) => {
    e.preventDefault()
    if (
      !formData.candidateName ||
      !formData.candidateEmail ||
      !formData.candidatePassword ||
      !formData.sexo ||
      !formData.dateBirth
    ) {
      setGeneralError(
        'Por favor, completa todos los campos obligatorios del paso 2.',
      )
      return
    }
    setGeneralError(null)
    setStep(3)
  }

  const handleStep3Submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setGeneralError(null)

    if (!formData.location.state || !formData.location.city) {
      setGeneralError('Por favor, completa todos los campos de ubicación.')
      setLoading(false)
      return
    }

    const createDemoCampaignAndCandidatoUrl =
      process.env.NEXT_PUBLIC_CREATE_DEMO_CAMPAIGN_URL

    if (!createDemoCampaignAndCandidatoUrl) {
      setGeneralError('URL de la API de registro demo no configurada.')
      setLoading(false)
      return
    }

    try {
      const response = await fetch(createDemoCampaignAndCandidatoUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          campaignName:
            formData.campaignName || `${formData.candidateName}'s Campaign`,
          location: {
            ...formData.location,
            country: 'Colombia',
          },
        }),
      })

      const data = await response.json()

      if (response.ok && data?.idToken) {
        const cookieResponse = await fetch('/api/set-session-cookie', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken: data.idToken }),
        })

        if (!cookieResponse.ok) {
          throw new Error(
            'Error al establecer la sesión del usuario. Por favor, intenta de nuevo.',
          )
        }

        const decodedUserData = jwtDecode(data.idToken)
        login(decodedUserData, data.idToken)

        setSuccess(true)
        console.log('Registro y auto-login exitosos:', decodedUserData)

        setTimeout(() => router.push('/dashboard-candidato'), 1500)
      } else {
        setGeneralError(
          data.message || 'Error desconocido al registrar la campaña demo.',
        )
      }
    } catch (err) {
      console.error('Error durante el proceso de registro demo:', err)
      setGeneralError(
        err.message ||
          'Ocurrió un error inesperado al conectar con el servidor.',
      )
    } finally {
      setLoading(false)
    }
  }

  return {
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
  }
}
