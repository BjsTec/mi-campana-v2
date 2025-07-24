// src/hooks/useScrollAnimation.js
'use client' // Este hook usa Hooks de React, por lo que debe ser un Client Component

import { useEffect, useRef, useState } from 'react'

/**
 * Hook para detectar si un elemento está visible en el viewport.
 * Utiliza Intersection Observer API para animaciones al hacer scroll.
 * @param {number} threshold - Un número entre 0 y 1 que indica el porcentaje del elemento que debe ser visible para activar el callback.
 * @returns {[React.RefObject, boolean]} - Un array que contiene la referencia del elemento y un booleano que indica si es visible.
 */
export const useScrollAnimation = (threshold = 0.1) => {
  const ref = useRef(null) // Crea una referencia para adjuntar al elemento DOM
  const [isVisible, setIsVisible] = useState(false) // Estado para controlar la visibilidad

  useEffect(() => {
    // Verifica si el navegador soporta Intersection Observer
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      // Fallback para SSR o navegadores antiguos: asume que es visible
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Si el elemento es visible (intersecting) y aún no ha sido marcado como visible
        // (esto evita que la animación se repita si el usuario hace scroll hacia arriba y abajo)
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
          // Opcionalmente, deja de observar después de que se vuelve visible
          // si la animación solo debe reproducirse una vez
          observer.unobserve(entry.target)
        }
      },
      { threshold }, // El porcentaje del elemento que debe ser visible
    )

    // Si la referencia está adjunta a un elemento, comienza a observarlo
    if (ref.current) {
      observer.observe(ref.current)
    }

    // Función de limpieza: desobserva el elemento cuando el componente se desmonta
    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [ref, threshold, isVisible]) // Dependencias del efecto: ref, threshold y isVisible

  return [ref, isVisible] // Retorna la referencia y el estado de visibilidad
}
