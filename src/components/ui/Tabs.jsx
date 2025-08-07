// src/components/ui/Tabs.jsx
'use client'

import React from 'react'

export default function Tabs({ tabs, activeTab, onTabChange }) {
  return (
    <div className="flex bg-neutral-200 rounded-lg p-1 mb-6 w-full max-w-md mx-auto shadow-inner">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onTabChange(tab.value)}
          className={`flex-1 py-2 px-4 text-sm font-semibold rounded-lg transition-all duration-300 font-body
            ${
              activeTab === tab.value
                ? 'bg-primary-dark text-neutral-50 shadow-md'
                : 'text-neutral-800 hover:bg-neutral-300'
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
