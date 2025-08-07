// src/components/ui/SearchInput.js
import React from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

const SearchInput = ({ placeholder, ...props }) => {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <MagnifyingGlassIcon
          className="h-5 w-5 text-gray-400"
          aria-hidden="true"
        />
      </div>
      <input
        type="text"
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-gray-900"
        placeholder={placeholder}
        {...props}
      />
    </div>
  )
}

export default SearchInput
