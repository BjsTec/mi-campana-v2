'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useTeamData } from '@/hooks/useTeamData'
import { UserGroupIcon } from '@heroicons/react/24/outline'

export default function EquipoPage() {
  const { user } = useAuth()
  const { team, isLoading, error } = useTeamData()

  const [teamByRole, setTeamByRole] = useState({})

  useEffect(() => {
    // Verifica si `team` existe y no está vacío antes de procesarlo
    if (team && team.length > 0) {
      const groupedByRole = team.reduce((acc, member) => {
        ;(acc[member.rol] = acc[member.rol] || []).push(member)
        return acc
      }, {})
      setTeamByRole(groupedByRole)
    }
  }, [team])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <p className="text-xl text-neutral-600">Cargando equipo...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <p className="text-xl text-red-500">Error: {error}</p>
      </div>
    )
  }

  if (!team || team.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-100 p-4 sm:p-8 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-2xl text-center">
          <p className="text-neutral-600 text-lg">
            No hay personas registradas en tu equipo de campaña.
          </p>
        </div>
      </div>
    )
  }

  const roles = ['Gerente', 'Anillo', 'Votante']

  return (
    <div className="min-h-screen bg-neutral-100 p-4 sm:p-8">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-5xl mx-auto">
        <h2 className="text-4xl font-extrabold text-neutral-800 mb-8 text-center tracking-tight">
          <UserGroupIcon className="inline-block h-10 w-10 text-primary-default mr-2" />
          Nuestro Equipo de Trabajo
        </h2>
        <div className="space-y-8">
          {roles.map((rol) => {
            const members = teamByRole[rol]
            if (!members || members.length === 0) return null

            return (
              <div key={rol}>
                <h3 className="text-2xl font-bold text-primary-dark mb-4">
                  {rol}s
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {members.map((persona) => (
                    <div
                      key={persona.id}
                      className="bg-white rounded-xl shadow-lg p-6 border border-neutral-200 transform transition-all duration-300 hover:shadow-xl hover:scale-[1.02] flex flex-col justify-between"
                    >
                      <div className="mb-4">
                        <h4 className="text-xl font-bold text-neutral-800 tracking-tight">
                          {persona.nombre}
                        </h4>
                        <p
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            persona.rol === 'Gerente'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          } mt-1`}
                        >
                          {persona.rol}
                        </p>
                      </div>
                      <div className="space-y-3">
                        <p className="text-sm text-neutral-600 flex items-center">
                          <strong className="text-neutral-800">
                            Votos Totales:
                          </strong>{' '}
                          <span className="font-extrabold text-xl text-primary-default ml-2">
                            {persona.votosTotal || 0}
                          </span>
                        </p>
                        <p className="text-sm text-neutral-600 flex items-center">
                          <strong className="text-neutral-800">Ciudad:</strong>{' '}
                          {persona.ciudad}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/dashboard-candidato/nuevo-gerente"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-semibold rounded-lg shadow-md text-white bg-primary-default hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-default transition-all duration-200 ease-in-out transform hover:-translate-y-1"
          >
            Volver al Registro
          </Link>
        </div>
      </div>
    </div>
  )
}
