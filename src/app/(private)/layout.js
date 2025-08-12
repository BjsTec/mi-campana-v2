// src/app/(private)/layout.js
'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import Image from 'next/image'

// Importar iconos para una mejor UX
import {
  Home,
  Users,
  Briefcase,
  ChartBar,
  ClipboardList,
  Upload,
  CalendarDays,
  Settings,
  User,
  PowerOff,
  Menu,
  X,
} from 'lucide-react'

// Objeto de configuración centralizado para la navegación
const navLinksByRole = {
  admin: [
    { href: '/dashboard-admin/home-wm', label: 'Inicio', icon: <Home /> },
    {
      href: '/dashboard-admin/potenciales',
      label: 'Clientes',
      icon: <Users />,
    },
    {
      href: '/dashboard-admin/nueva-campana',
      label: 'Nueva Campaña',
      icon: <Briefcase />,
    },
    {
      href: '/dashboard-admin/lista-campanas',
      label: 'Lista de Campañas',
      icon: <Briefcase />,
    },
    {
      href: '/dashboard-admin/lista-users',
      label: 'Lista de usuarios',
      icon: <Users />,
    },
    {
      href: '/dashboard-admin/variables',
      label: 'Variables del Sistema',
      icon: <Settings />,
    },
  ],
  candidato: [
    {
      href: '/dashboard-candidato/panel',
      label: 'Mi Panel',
      icon: <ChartBar />,
    },
    // {
    //   href: '/dashboard-candidato/equipo',
    //   label: 'Mi Equipo',
    //   icon: <Users />,
    // },
    // {
    //   href: '/dashboard-candidato/escrutinio',
    //   label: 'Escrutinio',
    //   icon: <ClipboardList />,
    // },
    // {
    //   href: '/dashboard-candidato/voto-opinion',
    //   label: 'Voto de Opinión',
    //   icon: <User />,
    // },
    // {
    //   href: '/dashboard-candidato/mi-campana',
    //   label: 'Configuraciones',
    //   icon: <Settings />,
    // },
  ],
  manager: [
    { href: '/dashboard-manager/panel', label: 'Mi Panel', icon: <ChartBar /> },
    { href: '/dashboard-manager/equipo', label: 'Mi Equipo', icon: <Users /> },
    {
      href: '/dashboard-manager/escrutinio',
      label: 'Escrutinio',
      icon: <ClipboardList />,
    },
    {
      href: '/dashboard-manager/voto-opinion',
      label: 'Voto de Opinión',
      icon: <User />,
    },
    {
      href: '/dashboard-manager/mis-votantes',
      label: 'Mis Votantes',
      icon: <User />,
    },
  ],
  anillo: [
    { href: '/dashboard-anillo/panel', label: 'Mi Panel', icon: <ChartBar /> },
    { href: '/dashboard-anillo/equipo', label: 'Mi Equipo', icon: <Users /> },
    {
      href: '/dashboard-anillo/escrutinio',
      label: 'Escrutinio',
      icon: <ClipboardList />,
    },
    {
      href: '/dashboard-anillo/voto-opinion',
      label: 'Voto de Opinión',
      icon: <User />,
    },
  ],
  votante: [
    { href: '/dashboard-votante/panel', label: 'Mi Panel', icon: <ChartBar /> },
    {
      href: '/dashboard-votante/escrutinio',
      label: 'Escrutinio',
      icon: <ClipboardList />,
    },
  ],
  public_lead: [],
}

export default function DashboardLayout({ children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const {
    user,
    activeCampaign,
    logout,
    isLoading: authLoading,
    setActiveCampaignId,
    idToken,
  } = useAuth()
  console.log(user)

  const currentRole = user?.role || 'public_lead'

  const canRegisterSubordinates = useMemo(() => {
    const membership = user?.campaignMemberships?.find(
      (m) => m.campaignId === activeCampaign?.campaignId,
    )
    return !(membership?.votoPromesa > 0)
  }, [user, activeCampaign])

  const isElectionDay = useMemo(() => {
    if (!activeCampaign?.electionDate) return false
    const electionDate = new Date(activeCampaign.electionDate)
    const today = new Date()
    const oneDayInMs = 24 * 60 * 60 * 1000
    return (
      today.getTime() >= electionDate.getTime() - oneDayInMs &&
      today.getTime() <= electionDate.getTime() + oneDayInMs
    )
  }, [activeCampaign])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (isMenuOpen) {
      setIsMenuOpen(false)
    }
  }, [pathname])

  const handleCampaignChange = (e) => {
    const newId = e.target.value
    setActiveCampaignId(newId)
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-gray-700">Verificando sesión y cargando datos...</p>
      </div>
    )
  }

  if (user && user.role === 'public_lead') {
    router.push('/registro-exitoso')
    return null
  }

  if (user && !activeCampaign && currentRole !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">
          ¡Aún no estás en una campaña activa!
        </h2>
        <p className="text-neutral-600 mb-6">
          Por favor, espera a que un administrador te asigne a una campaña o
          crea una campaña demo.
        </p>
        <Link
          href="/registro-publico"
          className="text-blue-600 hover:underline"
        >
          Crear Campaña Demo
        </Link>
      </div>
    )
  }

  const primaryColor = activeCampaign?.colors?.primary || '#3084F2'
  const accentColor = activeCampaign?.colors?.accent || '#FFFFFF'

  return (
    <>
      <style jsx global>{`
        :root {
          --color-primary: ${primaryColor};
          --color-accent: ${accentColor};
        }
      `}</style>

      <div className="min-h-screen flex flex-col bg-gray-50">
        <header className="bg-white shadow-md py-4 px-6 flex justify-between items-center z-20">
          <div className="flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden mr-4 p-2 rounded-md focus:outline-none focus:ring-2"
              aria-label="Toggle menu"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-accent)',
              }}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="h-10 w-auto relative">
              <Image
                src="/icon.png"
                alt="Icono"
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>
            <h1
              className="hidden sm:block text-2xl font-bold ml-4"
              style={{ color: 'var(--color-primary)' }}
            >
              La Campaña
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            {user?.campaignMemberships &&
              user.campaignMemberships.length > 1 && (
                <div className="hidden md:block">
                  <select
                    value={activeCampaign?.campaignId || ''}
                    onChange={handleCampaignChange}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none rounded-md"
                  >
                    {user.campaignMemberships.map((membership) => (
                      <option
                        key={membership.campaignId}
                        value={membership.campaignId}
                      >
                        {membership.campaignName}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            <span className="hidden sm:inline text-lg text-neutral-600">
              Hola,{' '}
              <span className="font-semibold">
                {user?.name || user?.nombre || user?.email}!
              </span>
            </span>
            <button
              onClick={logout}
              className="hidden md:flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200"
            >
              <PowerOff size={16} className="mr-2" />
              Cerrar Sesión
            </button>
          </div>
        </header>

        <div className="flex flex-grow">
          <aside
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-accent)',
            }}
            className={`fixed top-0 left-0 h-full w-64 p-6 flex flex-col transition-transform duration-300 ease-in-out z-30 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 md:flex md:flex-col md:shadow-lg`}
          >
            <div className="flex items-center justify-between md:hidden mb-6">
              <h2 className="text-xl font-bold">Menú</h2>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-md"
                aria-label="Cerrar menú"
              >
                <X size={24} />
              </button>
            </div>
            <div className="mb-8 text-center">
              <p className="text-xl font-bold">{user?.name || 'Usuario'}</p>
              <p className="text-sm capitalize opacity-80">
                {currentRole === 'admin' ? 'Web Master' : currentRole}
              </p>
            </div>
            <nav className="flex flex-col gap-2.5 flex-grow overflow-y-auto">
              {navLinksByRole[currentRole]?.map((link) => {
                const showLink =
                  (link.label !== 'Escrutinio' || isElectionDay) &&
                  ((link.label !== 'Voto de Opinión' &&
                    link.label !== 'Mi Equipo') ||
                    canRegisterSubordinates)

                return (
                  showLink && (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center px-3 py-2 rounded-md hover:bg-white/20 font-medium transition-colors"
                    >
                      {link.icon && <span className="mr-3">{link.icon}</span>}
                      {link.label}
                    </Link>
                  )
                )
              })}
            </nav>
            <button
              onClick={logout}
              className="md:hidden mt-auto flex items-center px-3 py-2 rounded-md hover:bg-red-500/50 font-medium w-full transition-colors"
            >
              <PowerOff size={16} className="mr-2" />
              Cerrar Sesión
            </button>
          </aside>

          <main className="flex-grow p-4 sm:p-6 md:p-8 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </>
  )
}
