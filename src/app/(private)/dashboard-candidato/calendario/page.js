// src/app/(private)/dashboard-candidato/calendario/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link'; // Se mantiene la importación de Link por si se necesita más adelante, si no se usa en ninguna parte del archivo, Next.js podría indicar que se puede quitar.

export default function CalendarioPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([
    { id: 'e1', date: '2025-07-10', title: 'Reunión de Estrategia' },
    { id: 'e2', date: '2025-07-15', title: 'Evento de Recolección de Votos' },
    { id: 'e3', date: '2025-07-22', title: 'Capacitación para Voluntarios' },
  ]);

  const [showEventModal, setShowEventModal] = useState(false);
  const [newEventData, setNewEventData] = useState({
    title: '',
    date: '',
    time: '',
  });
  const [modalMessage, setModalMessage] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  // --- Lógica del Calendario ---
  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay(); // 0=Domingo, 1=Lunes...

  const renderCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);

    const days = [];
    // Días vacíos al inicio para alinear con el día de la semana
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2 border border-neutral-200 bg-neutral-50"></div>);
    }

    // Días del mes
    for (let day = 1; day <= totalDays; day++) {
      const fullDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = events.filter(event => event.date === fullDate);
      const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

      days.push(
        <div 
          key={day} 
          className={`p-2 border border-neutral-200 flex flex-col justify-between items-start 
                      ${isToday ? 'bg-primary.light text-white font-bold' : 'bg-white hover:bg-neutral-100'} 
                      min-h-[100px] transition-colors duration-200`}
        >
          <span className={`${isToday ? 'text-white' : 'text-neutral-800'} font-semibold text-lg`}>{day}</span>
          <div className="text-xs space-y-1 w-full mt-1">
            {dayEvents.length > 0 ? (
              dayEvents.map((event, idx) => (
                <div key={event.id || idx} className={`bg-secondary.light text-secondary.dark rounded-sm px-1 py-0.5 whitespace-nowrap overflow-hidden text-ellipsis ${isToday ? 'bg-white text-primary.dark font-semibold' : ''}`}>
                  {event.title}
                </div>
              ))
            ) : (
              <span className="text-neutral-500"></span>
            )}
          </div>
        </div>
      );
    }
    return days;
  };

  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // --- Lógica del Modal y Eventos ---
  const handleOpenEventModal = () => {
    setShowEventModal(true);
    setNewEventData({ title: '', date: '', time: '' }); // Limpiar formulario
    setModalMessage('');
  };

  const handleCloseEventModal = () => {
    setShowEventModal(false);
  };

  const handleEventInputChange = (e) => {
    const { name, value } = e.target;
    setNewEventData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCreateEventSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalMessage('');

    if (!newEventData.title || !newEventData.date || !newEventData.time) {
      setModalMessage('❌ Por favor, rellena todos los campos.');
      setModalLoading(false);
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newId = `e${Date.now()}`;
      const newEvent = {
        id: newId,
        title: newEventData.title,
        date: newEventData.date,
        time: newEventData.time,
      };

      setEvents((prevEvents) => [...prevEvents, newEvent]);
      setModalMessage('🎉 Reunión creada con éxito (simulado)!');
      
      setTimeout(() => {
        setShowEventModal(false);
      }, 1000);

    } catch (error) {
      console.error('Error al crear la reunión:', error);
      setModalMessage('❌ Ocurrió un error al crear la reunión.');
    } finally {
      setModalLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-primary.light to-neutral-200 flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-5xl border border-neutral-200 transform transition-all duration-300 hover:scale-[1.005]">
        <h1 className="text-4xl font-extrabold text-primary.dark mb-6 text-center">
          Calendario de Eventos
        </h1>

        {/* Controles del Calendario */}
        <div className="flex justify-between items-center mb-6 px-4 py-2 bg-neutral-100 rounded-lg shadow-inner">
          <button
            onClick={goToPrevMonth}
            className="text-primary.DEFAULT hover:text-primary.dark transition-colors duration-200 p-2 rounded-full hover:bg-neutral-200"
          >
            <span className="material-icons">chevron_left</span>
          </button>
          <h2 className="text-2xl font-bold text-neutral-800">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={goToNextMonth}
            className="text-primary.DEFAULT hover:text-primary.dark transition-colors duration-200 p-2 rounded-full hover:bg-neutral-200"
          >
            <span className="material-icons">chevron_right</span>
          </button>
        </div>

        {/* Días de la semana */}
        <div className="grid grid-cols-7 text-center font-bold text-primary.dark mb-2">
          {dayNames.map(day => (
            <div key={day} className="p-2 border-b-2 border-primary.light">{day}</div>
          ))}
        </div>

        {/* Cuadrícula de días del calendario */}
        <div className="grid grid-cols-7 border-t border-l border-neutral-200">
          {renderCalendarDays()}
        </div>

        {/* Botones de acción */}
        <div className="mt-8 text-center"> 
          {/* Botón para agregar nueva reunión */}
          <button
            onClick={handleOpenEventModal}
            className="inline-flex items-center px-6 py-2 border border-transparent text-base font-semibold rounded-md shadow-sm text-white bg-primary.DEFAULT hover:bg-primary.dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary.DEFAULT transition-all duration-200"
          >
            Agregar Reunión
          </button>
          {/* El botón "Volver a Foros" ha sido eliminado en una interacción anterior */}
        </div>
      </div>

      {/* --- MODAL PARA AGREGAR NUEVA REUNIÓN --- */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md relative animate-fade-in-up border-4 border-primary.DEFAULT">
            {/* Botón de cerrar modal */}
            <button
              onClick={handleCloseEventModal}
              className="absolute top-4 right-4 text-neutral-600 hover:text-neutral-800 transition-colors duration-200 text-3xl font-bold p-2 rounded-full hover:bg-neutral-100"
            >
              &times;
            </button>
            <h3 className="text-3xl font-bold text-primary.dark mb-6 text-center">
              Crear Nueva Reunión
            </h3>
            <form onSubmit={handleCreateEventSubmit} className="space-y-5">
              <div>
                <label htmlFor="eventTitle" className="block text-base font-medium text-neutral-700 mb-1">
                  Título de la Reunión
                </label>
                <input
                  type="text"
                  name="title"
                  id="eventTitle"
                  value={newEventData.title}
                  onChange={handleEventInputChange}
                  required
                  className="mt-1 block w-full px-4 py-2 border border-neutral-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary.light focus:border-primary.light sm:text-base transition-all duration-200"
                />
              </div>
              <div>
                <label htmlFor="eventDate" className="block text-base font-medium text-neutral-700 mb-1">
                  Fecha
                </label>
                <input
                  type="date"
                  name="date"
                  id="eventDate"
                  value={newEventData.date}
                  onChange={handleEventInputChange}
                  required
                  className="mt-1 block w-full px-4 py-2 border border-neutral-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary.light focus:border-primary.light sm:text-base transition-all duration-200"
                />
              </div>
              <div>
                <label htmlFor="eventTime" className="block text-base font-medium text-neutral-700 mb-1">
                  Hora
                </label>
                <input
                  type="time"
                  name="time"
                  id="eventTime"
                  value={newEventData.time}
                  onChange={handleEventInputChange}
                  required
                  className="mt-1 block w-full px-4 py-2 border border-neutral-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary.light focus:border-primary.light sm:text-base transition-all duration-200"
                />
              </div>

              {modalMessage && (
                <p className={`text-center text-sm font-semibold py-2 rounded-md ${
                  modalMessage.includes('éxito') ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                }`}>
                  {modalMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={modalLoading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-base font-semibold text-white ${
                  modalLoading
                    ? 'bg-neutral-300 text-neutral-600 cursor-not-allowed'
                    : 'bg-primary.DEFAULT hover:bg-primary.dark focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-primary.light transition-all duration-300 ease-in-out transform hover:-translate-y-1'
                }`}
              >
                {modalLoading ? 'Creando Reunión...' : 'Crear Reunión'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}