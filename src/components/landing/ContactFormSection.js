// src/components/landing/ContactFormSection.js
'use client'; // Necesario para manejo de estado del formulario

import { useState } from 'react';
// Importar la Server Action (a crear en Tarea 1.6)
// import { submitCommercialLead } from '@/app/actions/commercialLeads';

export default function ContactFormSection() {
  const [status, setStatus] = useState({ loading: false, success: false, error: null });
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: null });
    try {
      // --- Lógica de Server Action (Descomentar cuando se cree) ---
      // const result = await submitCommercialLead(formData);
      // if (result.error) {
      //   throw new Error(result.error.message || 'Ocurrió un error al enviar.');
      // }
      // setStatus({ loading: false, success: true, error: null });
      // setFormData({ name: '', email: '', phone: '', message: '' }); // Limpiar formulario

      // --- Placeholder mientras se crea la Action ---
      console.log("Formulario enviado (simulado):", formData);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular espera
      setStatus({ loading: false, success: true, error: null });
      setFormData({ name: '', email: '', phone: '', message: '' });
      // --- Fin Placeholder ---

    } catch (error) {
      console.error("Error submitting form:", error);
      setStatus({ loading: false, success: false, error: error.message || 'Error desconocido.' });
    }
  };

  return (
    <div id="contact" className="bg-primary-dark isolate px-6 py-24 sm:py-32 lg:px-8"> {/* Fondo azul muy oscuro */}
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-neutral-lightest sm:text-4xl"> {/* Texto blanco */}
          Contáctanos
        </h2>
        <p className="mt-2 text-lg leading-8 text-neutral-light"> {/* Texto gris claro */}
          ¿Tienes preguntas o quieres una demostración personalizada? Déjanos tus datos.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="mx-auto mt-16 max-w-xl sm:mt-20">
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
          {/* Nombre Completo */}
          <div className="sm:col-span-2">
            <label htmlFor="name" className="block text-sm font-semibold leading-6 text-neutral-lightest"> {/* Texto blanco */}
              Nombre Completo
            </label>
            <div className="mt-2.5">
              <input
                type="text"
                name="name"
                id="name"
                autoComplete="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="block w-full rounded-md border-0 bg-white/5 px-3.5 py-2 text-neutral-lightest shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-secondary sm:text-sm sm:leading-6" /* Estilo input oscuro */
              />
            </div>
          </div>
          {/* Email */}
          <div className="sm:col-span-2">
            <label htmlFor="email" className="block text-sm font-semibold leading-6 text-neutral-lightest">
              Correo Electrónico
            </label>
            <div className="mt-2.5">
              <input
                type="email"
                name="email"
                id="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="block w-full rounded-md border-0 bg-white/5 px-3.5 py-2 text-neutral-lightest shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-secondary sm:text-sm sm:leading-6"
              />
            </div>
          </div>
          {/* Teléfono (Opcional) */}
          <div className="sm:col-span-2">
            <label htmlFor="phone" className="block text-sm font-semibold leading-6 text-neutral-lightest">
              Teléfono <span className="text-neutral-medium">(Opcional)</span>
            </label>
            <div className="mt-2.5">
              <input
                type="tel"
                name="phone"
                id="phone"
                autoComplete="tel"
                value={formData.phone}
                onChange={handleChange}
                className="block w-full rounded-md border-0 bg-white/5 px-3.5 py-2 text-neutral-lightest shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-secondary sm:text-sm sm:leading-6"
              />
            </div>
          </div>
          {/* Mensaje */}
          <div className="sm:col-span-2">
            <label htmlFor="message" className="block text-sm font-semibold leading-6 text-neutral-lightest">
              Mensaje
            </label>
            <div className="mt-2.5">
              <textarea
                name="message"
                id="message"
                rows={4}
                required
                value={formData.message}
                onChange={handleChange}
                className="block w-full rounded-md border-0 bg-white/5 px-3.5 py-2 text-neutral-lightest shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-secondary sm:text-sm sm:leading-6"
              />
            </div>
          </div>
        </div>
        <div className="mt-10">
          <button
            type="submit"
            disabled={status.loading}
            className="block w-full rounded-md bg-secondary px-3.5 py-2.5 text-center text-sm font-semibold text-primary shadow-sm hover:bg-secondary-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary disabled:opacity-50" // Botón dorado
          >
            {status.loading ? 'Enviando...' : 'Enviar Mensaje'}
          </button>
        </div>
        {/* Mensajes de estado */}
        {status.success && (
          <p className="mt-4 text-center text-sm text-success">¡Mensaje enviado con éxito!</p>
        )}
        {status.error && (
          <p className="mt-4 text-center text-sm text-error">{status.error}</p>
        )}
      </form>
    </div>
  );
}