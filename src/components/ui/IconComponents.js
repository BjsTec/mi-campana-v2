// src/components/ui/IconComponents.js
import React from 'react'
import {
  CheckCircleIcon as HeroCheckCircleIcon,
  PencilSquareIcon as HeroEditIcon,
} from '@heroicons/react/24/outline'

export const CampaignIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-2.236 9.168-5.514M15 11l-1 1"
    />
  </svg>
)

export const EditIcon = ({ className }) => (
  <HeroEditIcon className={className} />
)

export const CheckCircleIcon = ({ className }) => (
  <HeroCheckCircleIcon className={className} />
)
