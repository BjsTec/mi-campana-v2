// src/components/ui/SkeletonCard.jsx
'use client'

import React from 'react'

export default function SkeletonCard() {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-neutral-200 animate-pulse">
      <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-neutral-200 rounded w-full mb-1"></div>
      <div className="h-3 bg-neutral-200 rounded w-5/6 mb-1"></div>
      <div className="h-3 bg-neutral-200 rounded w-1/2 mb-3"></div>
      <div className="h-8 bg-neutral-300 rounded-full w-full"></div>
    </div>
  )
}