// src/app/(private)/dashboard-candidato/testigo-electoral/page.js
'use client';

import { useState, useRef } from 'react';
import Link from 'next/link'; // Se mantiene la importación de Link por si se necesita más adelante.

// --- DATOS MOCKEADOS DE EXCEL ---
const mockExcelData = [
  { id: 't001', nombre: 'Juan Pérez', cedula: '123456789', ciudad: 'Yopal', municipio: 'Yopal', puestoVotacion: 'Colegio Braulio' },
  { id: 't002', nombre: 'María López', cedula: '987654321', ciudad: 'Bogotá', municipio: 'Bogotá D.C.', puestoVotacion: 'Liceo Nacional' },
  { id: 't003', nombre: 'Carlos García', cedula: '456789123', ciudad: 'Villavicencio', municipio: 'Villavicencio', puestoVotacion: 'Unicentro' },
  { id: 't004', nombre: 'Ana Díaz', cedula: '789123456', ciudad: 'Medellín', municipio: 'Medellín', puestoVotacion: 'Universidad Nacional' },
  { id: 't005', nombre: 'Pedro Ramírez', cedula: '112233445', ciudad: 'Cali', municipio: 'Cali', puestoVotacion: 'Colegio Americano' },
  { id: 't006', nombre: 'Laura M. Suarez', cedula: '667788990', ciudad: 'Barranquilla', municipio: 'Barranquilla', puestoVotacion: 'Universidad del Norte' },
];

export default function TestigoElectoralPage() {
  const [excelData, setExcelData] = useState([]);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [cargandoExcel, setCargandoExcel] = useState(false);
  const fileInputRef = useRef(null);

  const [manualFormData, setManualFormData] = useState({
    nombre: '',
    cedula: '',
    ciudad: '',
    municipio: '',
    puestoVotacion: '',
  });
  const [manualMessage, setManualMessage] = useState('');
  const [manualLoading, setManualLoading] = useState(false);

  const handleExcelUpload = async () => {
    if (fileInputRef.current && fileInputRef.current.files.length > 0) {
      setCargandoExcel(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setExcelData(mockExcelData); 
      setCargandoExcel(false);
      alert('Archivo Excel "cargado" y datos mostrados!');
      fileInputRef.current.value = '';
    } else {
      alert('Por favor, selecciona un archivo Excel para cargar.');
    }
  };

  const handleManualInputChange = (e) => {
    const { name, value } = e.target;
    setManualFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setManualLoading(true);
    setManualMessage('');

    if (!manualFormData.nombre || !manualFormData.cedula || !manualFormData.ciudad || !manualFormData.municipio || !manualFormData.puestoVotacion) {
      setManualMessage('❌ Por favor, rellena todos los campos.');
      setManualLoading(false);
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
    setExcelData(prev => [...prev, { ...manualFormData, id: `manual-${Date.now()}` }]); 
    setManualMessage('🎉 Datos ingresados manualmente con éxito!');
    setManualFormData({ nombre: '', cedula: '', ciudad: '', municipio: '', puestoVotacion: '' });
    setManualLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary.light to-primary.dark flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-5xl border border-neutral-100 transform transition-all duration-500 hover:scale-[1.005] hover:shadow-3xl">
        <h1 className="text-5xl font-extrabold text-primary.dark mb-8 text-center tracking-tight">
          Gestión de Testigos Electorales
        </h1>

        {/* Botones de Modo */}
        <div className="flex justify-center gap-6 mb-10">
          <button
            onClick={() => setShowManualEntry(false)}
            className={`px-8 py-3 rounded-full text-lg font-bold transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg 
              ${!showManualEntry ? 'bg-primary.DEFAULT text-white shadow-xl scale-105' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`
            }
          >
            Cargar Excel
          </button>
          <button
            onClick={() => setShowManualEntry(true)}
            className={`px-8 py-3 rounded-full text-lg font-bold transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg 
              ${showManualEntry ? 'bg-primary.DEFAULT text-white shadow-xl scale-105' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`
            }
          >
            Ingresar Datos Manualmente
          </button>
        </div>

        {/* --- Sección de Carga de Excel --- */}
        {!showManualEntry && (
          <div className="border border-primary.light rounded-xl p-8 mb-10 text-center bg-primary.light/10 shadow-inner-lg animate-fade-in">
            <h2 className="text-3xl font-bold text-primary.dark mb-6">Cargar Testigos desde Excel</h2>
            <input 
              type="file" 
              ref={fileInputRef}
              accept=".xlsx, .xls" 
              className="block w-full text-lg text-neutral-700 file:mr-5 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-lg file:font-semibold file:bg-secondary.DEFAULT file:text-neutral-900 hover:file:bg-secondary.dark cursor-pointer transition-colors duration-300"
            />
            <button
              onClick={handleExcelUpload}
              disabled={cargandoExcel}
              className="mt-8 px-10 py-4 bg-secondary.DEFAULT text-neutral-900 font-extrabold rounded-full shadow-lg hover:bg-secondary.dark transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
              {cargandoExcel ? 'Cargando Excel...' : 'Cargar Excel'}
            </button>
          </div>
        )}

        {/* --- Sección de Ingreso Manual --- */}
        {showManualEntry && (
          <div className="border border-primary.light rounded-xl p-8 mb-10 bg-primary.light/10 shadow-inner-lg animate-fade-in">
            <h2 className="text-3xl font-bold text-primary.dark mb-6 text-center">Ingresar Testigo Manualmente</h2>
            <form onSubmit={handleManualSubmit} className="space-y-6">
              <div>
                <label htmlFor="nombre" className="block text-base font-medium text-neutral-700 mb-2">Nombre Completo</label>
                <input type="text" name="nombre" id="nombre" value={manualFormData.nombre} onChange={handleManualInputChange} required className="mt-1 block w-full px-4 py-2 border border-neutral-300 rounded-lg shadow-sm focus:ring-primary.DEFAULT focus:border-primary.DEFAULT transition-all duration-200 text-lg" />
              </div>
              <div>
                <label htmlFor="cedula" className="block text-base font-medium text-neutral-700 mb-2">Cédula</label>
                <input type="text" name="cedula" id="cedula" value={manualFormData.cedula} onChange={handleManualInputChange} required className="mt-1 block w-full px-4 py-2 border border-neutral-300 rounded-lg shadow-sm focus:ring-primary.DEFAULT focus:border-primary.DEFAULT transition-all duration-200 text-lg" />
              </div>
              <div>
                <label htmlFor="ciudad" className="block text-base font-medium text-neutral-700 mb-2">Ciudad</label>
                <input type="text" name="ciudad" id="ciudad" value={manualFormData.ciudad} onChange={handleManualInputChange} required className="mt-1 block w-full px-4 py-2 border border-neutral-300 rounded-lg shadow-sm focus:ring-primary.DEFAULT focus:border-primary.DEFAULT transition-all duration-200 text-lg" />
              </div>
              <div>
                <label htmlFor="municipio" className="block text-base font-medium text-neutral-700 mb-2">Municipio</label>
                <input type="text" name="municipio" id="municipio" value={manualFormData.municipio} onChange={handleManualInputChange} required className="mt-1 block w-full px-4 py-2 border border-neutral-300 rounded-lg shadow-sm focus:ring-primary.DEFAULT focus:border-primary.DEFAULT transition-all duration-200 text-lg" />
              </div>
              <div>
                <label htmlFor="puestoVotacion" className="block text-base font-medium text-neutral-700 mb-2">Puesto de Votación</label>
                <input type="text" name="puestoVotacion" id="puestoVotacion" value={manualFormData.puestoVotacion} onChange={handleManualInputChange} required className="mt-1 block w-full px-4 py-2 border border-neutral-300 rounded-lg shadow-sm focus:ring-primary.DEFAULT focus:border-primary.DEFAULT transition-all duration-200 text-lg" />
              </div>
              {manualMessage && (
                <p className={`text-center text-base font-semibold py-3 rounded-lg ${
                  manualMessage.includes('éxito') ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                } transition-opacity duration-300 animate-fade-in`}>
                  {manualMessage}
                </p>
              )}
              <button
                type="submit"
                disabled={manualLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-xl font-bold text-white 
                  bg-primary.DEFAULT hover:bg-primary.dark focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-primary.light 
                  transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              >
                {manualLoading ? 'Guardando Testigo...' : 'Guardar Testigo'}
              </button>
            </form>
          </div>
        )}

        {/* --- Tabla de Datos de Testigos --- */}
        <h2 className="text-3xl font-bold text-primary.dark mb-6 text-center">Listado de Testigos</h2>
        {excelData.length === 0 ? (
          <p className="text-center text-neutral-600 text-xl py-12 bg-neutral-50 rounded-lg shadow-inner">
            No hay datos de testigos para mostrar. Carga un Excel o ingresa datos manualmente.
          </p>
        ) : (
          <div className="overflow-x-auto border border-neutral-200 rounded-lg shadow-lg">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-primary.DEFAULT">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Nombre</th>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Cédula</th>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Ciudad</th>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Municipio</th>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Puesto de Votación</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-100">
                {excelData.map((testigo, index) => (
                  <tr key={testigo.id || index} className="hover:bg-primary.light/10 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-neutral-800">{testigo.nombre}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-neutral-700">{testigo.cedula}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-neutral-700">{testigo.ciudad}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-neutral-700">{testigo.municipio}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-neutral-700">{testigo.puestoVotacion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}