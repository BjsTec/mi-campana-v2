// src/components/ui/SearchInput.jsx
'use client'

import React from 'react'

export default function SearchInput({ searchTerm, setSearchTerm, placeholder = 'Buscar...' }) {
  return (
    <div className="relative w-full">
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-3 pl-10 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT shadow-sm text-body"
      />
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg className="h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </div>
    </div>
  )
}