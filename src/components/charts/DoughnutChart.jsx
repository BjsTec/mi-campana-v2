'use client'

import React from 'react'
import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js'

// Registrar los componentes necesarios de Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, Title)

// Importa los colores de marca definidos en el código original
import { chartBrandColors } from '@/lib/mockupData'

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        color: chartBrandColors.neutral800,
      },
    },
    title: {
      display: true,
      text: '', // Se sobreescribe por la prop 'title'
      color: chartBrandColors.neutral800,
    },
    tooltip: {
      backgroundColor: chartBrandColors.neutral800,
      titleColor: chartBrandColors.neutral100,
      bodyColor: chartBrandColors.neutral100,
    },
  },
}

export default function DoughnutChart({ data, title }) {
  const options = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      title: {
        ...chartOptions.plugins.title,
        text: title,
      },
    },
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-neutral-200">
           {' '}
      <h2 className="text-lg font-semibold text-neutral-800 mb-3">{title}</h2> 
         {' '}
      <div className="relative h-64">
                <Doughnut data={data} options={options} />     {' '}
      </div>
         {' '}
    </div>
  )
}
