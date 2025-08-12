// src/components/ui/StatCard.jsx
import React from 'react'
import { UsersIcon } from '@heroicons/react/24/outline' // Importa los iconos que necesites

const StatCard = ({
  title,
  value,
  description,
  icon: IconComponent,
  color = 'text-primary-default',
}) => (
  <div className="bg-white p-4 sm:p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex-1 flex flex-col items-start border border-neutral-200">
    {IconComponent && (
      <IconComponent className={`h-6 w-6 sm:h-7 sm:w-7 ${color} mb-2`} />
    )}
    <h3 className="text-md sm:text-lg font-semibold text-neutral-800 mb-1">
      {title}
    </h3>
    <p className={`text-2xl sm:text-3xl font-bold ${color} mb-1`}>
      {value.toLocaleString()}
    </p>
    <p className="text-xs sm:text-sm text-neutral-600">{description}</p>
  </div>
)

export default StatCard
