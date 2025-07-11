// src/components/ui/Combobox.js
import React, { useState, useRef, useEffect, useCallback } from 'react'

const Combobox = ({
  label,
  name,
  value,
  options,
  onChange,
  placeholder,
  required = false,
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState('')
  const [filteredOptions, setFilteredOptions] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  // Sincronizar input con el valor externo (si el valor cambia desde fuera)
  useEffect(() => {
    const selectedOption = options.find((option) => option.id === value)
    if (selectedOption) {
      setInputValue(selectedOption.name)
    } else if (value === '') {
      setInputValue('') // Limpiar input si el valor externo es vacío
    }
  }, [value, options])

  // Manejar el filtrado de opciones
  useEffect(() => {
    if (inputValue === '') {
      setFilteredOptions(options)
    } else {
      setFilteredOptions(
        options.filter((option) =>
          option.name.toLowerCase().includes(inputValue.toLowerCase()),
        ),
      )
    }
    setHighlightedIndex(-1) // Reset highlight on filter change
  }, [inputValue, options])

  // Manejar cambios en el input
  const handleInputChange = (e) => {
    setInputValue(e.target.value)
    setIsOpen(true)
  }

  // Manejar selección de una opción
  const handleOptionClick = (option) => {
    setInputValue(option.name)
    onChange({ target: { name, value: option.id } }) // Simular evento para el reducer
    setIsOpen(false)
  }

  // Manejar focus/blur para abrir/cerrar el dropdown
  const handleInputFocus = () => {
    setIsOpen(true)
    setFilteredOptions(options) // Mostrar todas las opciones al enfocar
  }

  const handleInputBlur = (e) => {
    // Retrasar el cierre para permitir el click en las opciones
    setTimeout(() => {
      if (
        !listRef.current ||
        !listRef.current.contains(document.activeElement)
      ) {
        setIsOpen(false)
        // Si el valor del input no coincide con ninguna opción, restablecerlo
        const selectedOption = options.find((option) => option.id === value)
        if (!selectedOption || selectedOption.name !== inputValue) {
          if (value) {
            // Si ya hay un valor seleccionado, restaurar su nombre
            setInputValue(selectedOption ? selectedOption.name : '')
          } else {
            // Si no hay valor seleccionado, limpiar el input
            setInputValue('')
          }
        }
      }
    }, 100) // Pequeño retraso
  }

  // Manejar navegación con teclado
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((prev) =>
        prev < filteredOptions.length - 1 ? prev + 1 : prev,
      )
      if (listRef.current && listRef.current.children[highlightedIndex + 1]) {
        listRef.current.children[highlightedIndex + 1].scrollIntoView({
          block: 'nearest',
        })
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0))
      if (listRef.current && listRef.current.children[highlightedIndex - 1]) {
        listRef.current.children[highlightedIndex - 1].scrollIntoView({
          block: 'nearest',
        })
      }
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlightedIndex !== -1 && filteredOptions[highlightedIndex]) {
        handleOptionClick(filteredOptions[highlightedIndex])
      } else if (inputValue && filteredOptions.length === 1) {
        handleOptionClick(filteredOptions[0]) // Si solo hay una opción, seleccionarla
      }
      setIsOpen(false)
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      inputRef.current.blur()
    }
  }

  return (
    <div className="relative">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        ref={inputRef}
        type="text"
        id={name}
        name={name}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete="off" // Deshabilitar autocompletado del navegador
        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
      />
      {isOpen && filteredOptions.length > 0 && (
        <ul
          ref={listRef}
          className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
          tabIndex="-1" // Permite enfocar la lista para el blur
        >
          {filteredOptions.map((option, index) => (
            <li
              key={option.id}
              className={`cursor-default select-none relative py-2 pl-3 pr-9 ${
                index === highlightedIndex
                  ? 'text-white bg-blue-600'
                  : 'text-gray-900'
              }`}
              onClick={() => handleOptionClick(option)}
              onMouseEnter={() => setHighlightedIndex(index)}
              role="option"
              aria-selected={index === highlightedIndex}
            >
              <span className="block truncate">{option.name}</span>
            </li>
          ))}
        </ul>
      )}
      {isOpen && filteredOptions.length === 0 && inputValue !== '' && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-2 px-3 text-sm text-gray-500">
          No se encontraron resultados.
        </div>
      )}
    </div>
  )
}

export default Combobox
