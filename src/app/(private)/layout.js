'use client';

<<<<<<< HEAD
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
=======
import Link from 'next/link' // Usar Link para navegación interna
import { useRouter, usePathname } from 'next/navigation' // Para redirección, ej. después del logout
import { useState, useEffect } from 'react'

import { useAuth } from '@/context/AuthContext' // Para acceder al usuario y la función de logout
>>>>>>> b68e7cf63a3c7f30535209adbc37e3b3c76f4d1a

export default function ExternalClientDashboardLayout({ children }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const { user, logout, loading: authLoading } = useAuth();

    const [activeCampaign, setActiveCampaign] = useState(null);
    const [campaignLoading, setCampaignLoading] = useState(true);
    const [activeCampaignId, setActiveCampaignId] = useState(null);

    // 1. Efecto para determinar la campaña activa
    useEffect(() => {
        if (user && user.campaignMemberships && user.campaignMemberships.length > 0) {
            const savedCampaignId = localStorage.getItem('activeCampaignId');
            const firstMembership = user.campaignMemberships[0];
            const campaignToLoad = savedCampaignId && user.campaignMemberships.some(c => c.campaignId === savedCampaignId) ? savedCampaignId : firstMembership.campaignId;
            
            if (activeCampaignId !== campaignToLoad) {
                setActiveCampaignId(campaignToLoad);
                localStorage.setItem('activeCampaignId', campaignToLoad);
            }
        }
    }, [user, activeCampaignId]);

    // 2. Efecto para obtener los datos de la campaña activa
    useEffect(() => {
        const fetchActiveCampaign = async () => {
            if (activeCampaignId) {
                setCampaignLoading(true);
                try {
                    const getCampaignUrl = process.env.NEXT_PUBLIC_GET_CAMPAIGN_URL;
                    if (!getCampaignUrl) throw new Error("URL no configurada.");
                    
                    const response = await fetch(`${getCampaignUrl}?id=${activeCampaignId}`);
                    if (!response.ok) throw new Error('No se pudo cargar la campaña activa.');
                    
                    const data = await response.json();
                    setActiveCampaign(data);
                } catch (error) {
                    console.error("Error fetching active campaign:", error);
                } finally {
                    setCampaignLoading(false);
                }
            } else {
                setCampaignLoading(false);
            }
        };

        if (!authLoading && user) {
            fetchActiveCampaign();
        } else if (!authLoading && !user) {
             setCampaignLoading(false);
        }
    }, [user, authLoading, activeCampaignId]);
    
    // 3. Definir los colores de la campaña o usar los por defecto de tu tailwind.config.js
    const campaignColors = {
        primary: activeCampaign?.colors?.primary || '#3084F2', // Tu azul principal por defecto
        accent: activeCampaign?.colors?.accent || '#FFFFFF',   // Blanco por defecto
    };

    // Hook para redirigir si el usuario no está autenticado
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    // Cierra el menú hamburguesa cada vez que la ruta cambia
    useEffect(() => {
        if (isMenuOpen) {
            setIsMenuOpen(false);
        }
    }, [pathname]);

    const handleCampaignChange = (e) => {
        const newId = e.target.value;
        setActiveCampaignId(newId);
        localStorage.setItem('activeCampaignId', newId);
    };

    // Muestra un estado de carga general
    if (authLoading || campaignLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <p className="text-gray-700">Cargando...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <p className="text-gray-700">Redirigiendo al login...</p>
            </div>
        );
    }

    return (
        <>
            {/* 4. Inyectar las variables de color en el documento */}
            <style jsx global>{`
                :root {
                    --color-primary: ${campaignColors.primary};
                    --color-accent: ${campaignColors.accent};
                }
            `}</style>

<<<<<<< HEAD
            <div className="min-h-screen flex flex-col bg-gray-50">
                <header className="bg-white shadow-md py-4 px-6 flex justify-between items-center z-20">
                    <div className="flex items-center">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-accent)' }}
                            className="md:hidden mr-4 p-2 rounded-md focus:outline-none focus:ring-2"
                            aria-label="Toggle menu"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}></path></svg>
                        </button>
                        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>La Campaña</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        {/* Selector de Campaña */}
                        {user.campaignMemberships && user.campaignMemberships.length > 1 && (
                            <div className="hidden md:block">
                                <select
                                    value={activeCampaignId || ''}
                                    onChange={handleCampaignChange}
                                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                >
                                    {user.campaignMemberships.map(membership => (
                                        <option key={membership.campaignId} value={membership.campaignId}>
                                            {membership.campaignName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <span className="hidden sm:inline text-lg text-neutral-600">
                            Hola, <span className="font-semibold">{user.name || user.email}!</span>
                        </span>
                        <button onClick={logout} className="hidden md:flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200">
                            Cerrar Sesión
                        </button>
                    </div>
                </header>
                <div className="flex flex-grow">
                    <aside
                        style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-accent)' }}
                        className={`fixed top-0 left-0 h-full w-64 p-6 flex flex-col transition-transform duration-300 ease-in-out z-30 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 md:flex md:flex-col md:shadow-lg`}
                    >
                        <div className="flex items-center justify-between md:hidden mb-6">
                            <h2 className="text-xl font-bold">Menú</h2>
                            <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded-md" aria-label="Cerrar menú">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                        <div className="mb-8 text-center">
                            <p className="text-xl font-bold">{user.name}</p>
                            <p className="text-sm capitalize opacity-80">{user.role === 'admin' ? 'Web Master' : user.role}</p>
                        </div>
                        <nav className="flex flex-col gap-2.5 flex-grow overflow-y-auto">
                            {user.role === 'admin' && (
                                <>
                                    <Link href="/dashboard-admin/nueva-campana" className="flex items-center px-3 py-2 rounded-md hover:bg-white/20 font-medium">Nueva Campaña</Link>
                                    <Link href="/dashboard-admin/lista-campanas" className="flex items-center px-3 py-2 rounded-md hover:bg-white/20 font-medium">Lista de Campañas</Link>
                                </>
                            )}
                            {/* --- INICIO DE LA CORRECCIÓN: Botones restaurados --- */}
                            {user.role === 'candidato' && (
                                <>
                                    <Link href="/dashboard-candidato" className="flex items-center px-3 py-2 rounded-md hover:bg-white/20 font-medium">Mi Panel</Link>
                                    <Link href="/dashboard-candidato/editar-campana" className="flex items-center px-3 py-2 rounded-md hover:bg-white/20 font-medium">Gestionar Campaña</Link>
                                    <Link href="/dashboard-candidato/voto-opinion" className="flex items-center px-3 py-2 rounded-md hover:bg-white/20 font-medium">Voto Opinión</Link>
                                    <Link href="/dashboard-candidato/galeria" className="flex items-center px-3 py-2 rounded-md hover:bg-white/20 font-medium">Galería</Link>
                                    <Link href="/dashboard-candidato/nuevo-gerente" className="flex items-center px-3 py-2 rounded-md hover:bg-white/20 font-medium">Nuevo Gerente</Link>
                                </>
                            )}
                             {/* --- FIN DE LA CORRECCIÓN --- */}
                        </nav>
                        <button onClick={logout} className="md:hidden mt-auto flex items-center px-3 py-2 rounded-md hover:bg-red-500/50 font-medium w-full">
                            Cerrar Sesión
                        </button>
                    </aside>
                    <main className="flex-grow p-4 sm:p-6 md:p-8">
                        {children}
                    </main>
                </div>
            </div>
        </>
    );
=======
  // Si la carga terminó y AÚN no hay usuario, el useEffect se encargará de redirigir.
  // Este es un estado intermedio para evitar mostrar el dashboard por un instante.
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-gray-700">Redirigiendo al login...</p>
      </div>
    )
  }
  // --- FIN DE LA CORRECCIÓN ---

  // Función para cerrar sesión
  const handleLogout = async () => {
    await logout()
    // La redirección ya está manejada dentro de la función logout del contexto
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-md py-4 px-6 flex justify-between items-center z-20">
        <div className="flex items-center">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden mr-4 p-2 rounded-md bg-primary text-white focus:outline-none focus:ring-2 focus:ring-primary-light"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-primary-dark">La Campaña</h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="hidden sm:inline text-lg text-neutral-600">
            Hola,{' '}
            <span className="font-semibold">{user.name || user.email}!</span>
          </span>
          <button
            onClick={handleLogout}
            className="hidden md:flex items-center px-4 py-2 text-sm font-medium text-error bg-red-100 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-error"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Cerrar Sesión
          </button>
        </div>
      </header>
      <div className="flex flex-grow">
        <aside
          className={`fixed top-0 left-0 h-full w-64 bg-primary-dark text-white p-6 flex flex-col transition-transform duration-300 ease-in-out z-30
            ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 md:flex md:flex-col md:shadow-lg`}
        >
          <div className="flex items-center justify-between md:hidden mb-6">
            <h2 className="text-xl font-bold text-white">Menú</h2>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 rounded-md hover:bg-primary"
              aria-label="Cerrar menú"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="mb-8 text-center">
            <p className="text-xl font-bold">{user.name}</p>
            <p className="text-primary-light text-sm capitalize">
              {user.role === 'admin' ? 'Web Master' : user.role}
            </p>
          </div>
          <nav className="flex flex-col gap-2.5 flex-grow overflow-y-auto">
            {/* --- OPCIONES DE MENÚ BASADAS EN EL ROL (ADMIN) --- */}
            {user.role === 'admin' && (
              <>
                <Link
                  href="/dashboard-admin/nueva-campana"
                  className="flex items-center px-3 py-2 rounded-md text-neutral-100 hover:bg-primary hover:text-white font-medium"
                >
                  Nueva Campaña
                </Link>
                <Link
                  href="/dashboard-admin/lista-campanas"
                  className="flex items-center px-3 py-2 rounded-md text-neutral-100 hover:bg-primary hover:text-white font-medium"
                >
                  Lista de Campañas
                </Link>
              </>
            )}
            {/* --- OPCIONES DE MENÚ BASADAS EN EL ROL (CANDIDATO) --- */}
            {user.role === 'candidato' && (
              <>
                <Link
                  href="/dashboard-candidato"
                  className="flex items-center px-3 py-2 rounded-md text-neutral-100 hover:bg-primary hover:text-white font-medium"
                >
                  Mi Panel
                </Link>
                <Link
                  href="/dashboard-candidato/editar-campana"
                  className="flex items-center px-3 py-2 rounded-md text-neutral-100 hover:bg-primary hover:text-white font-medium"
                >
                  Gestionar Campaña
                </Link>
                <Link
                  href="/dashboard-candidato/voto-opinion"
                  className="flex items-center px-3 py-2 rounded-md text-neutral-100 hover:bg-primary hover:text-white font-medium"
                >
                  voto opinon
                </Link>
                <Link
                  href="/dashboard-candidato/galeria"
                  className="flex items-center px-3 py-2 rounded-md text-neutral-100 hover:bg-primary hover:text-white font-medium"
                >
                  Galeria
                </Link>
                <Link
                  href="/dashboard-candidato/nuevo-gerente"
                  className="flex items-center px-3 py-2 rounded-md text-neutral-100 hover:bg-primary hover:text-white font-medium"
                >
                  nuevo gerente
                </Link>
              </>
            )}
            {/* ... Agrega más enlaces según sea necesario */}
          </nav>
          <button
            onClick={handleLogout}
            className="md:hidden mt-auto flex items-center px-3 py-2 rounded-md text-red-300 hover:bg-error hover:text-white font-medium w-full"
          >
            <svg
              className="w-5 h-5 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Cerrar Sesión
          </button>
        </aside>
        <main className="flex-grow p-4 sm:p-6 md:p-8">{children}</main>
      </div>
    </div>
  )
>>>>>>> b68e7cf63a3c7f30535209adbc37e3b3c76f4d1a
}
