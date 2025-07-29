// src/app/(private)/dashboard-admin/potenciales/page.js
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../../context/AuthContext'; // Corrected path!
import { useRouter } from 'next/navigation'; // For programmatic navigation

// Definir URLs de funciones desde variables de entorno
const GET_LEADS_URL = process.env.NEXT_PUBLIC_GET_LEADS_URL;

// Component for an individual Lead card
const LeadCard = ({ lead }) => {
  const router = useRouter();

  const handleViewDetails = () => {
    router.push(`/dashboard-admin/potenciales/${lead.id}`);
  };

  // Function to format the date
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    // Firebase Timestamps can be { _seconds, _nanoseconds } objects
    const date = timestamp._seconds ? new Date(timestamp._seconds * 1000) : new Date(timestamp);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-neutral-50 p-4 rounded-lg shadow-md border border-neutral-200 flex flex-col justify-between transform hover:scale-[1.02] transition-transform duration-200 ease-in-out"> {/* Changed background to neutral-50 */}
      <div>
        <h3 className="text-lg font-semibold text-primary-dark mb-1 truncate">{lead.name}</h3> {/* Smaller title, truncate */}
        <p className="text-neutral-800 text-xs mb-0.5 truncate">Email: {lead.email}</p> {/* Changed text to neutral-800 */}
        <p className="text-neutral-800 text-xs mb-0.5">Teléfono: {lead.phone || 'N/A'}</p>
        <p className="text-neutral-800 text-xs mb-0.5 truncate">Interesado en: {lead.interestedIn || 'N/A'}</p>
        <p className="text-neutral-800 text-xs mb-0.5 truncate">Fuente: {lead.source || 'N/A'}</p>
        <p className="text-neutral-800 text-xs mb-1">Estado: 
          <span className={`font-bold ml-1 
            ${lead.status === 'nuevo' ? 'text-secondary-DEFAULT' : ''}
            ${lead.status === 'contactado' ? 'text-primary-DEFAULT' : ''}
            ${lead.status === 'en_seguimiento' ? 'text-blue-500' : ''}
            ${lead.status === 'convertido' ? 'text-success' : ''}
            ${lead.status === 'descartado' ? 'text-error' : ''}
          `}>
            {lead.status ? lead.status.replace(/_/g, ' ').toUpperCase() : 'N/A'}
          </span>
        </p>
        <p className="text-neutral-600 text-xs mt-1">Recibido: {formatTimestamp(lead.timestamp)}</p> {/* Changed text to neutral-600 */}
      </div>
      <div className="mt-3"> {/* Reduced margin-top */}
        <button
          onClick={handleViewDetails}
          className="bg-secondary-DEFAULT text-primary-dark px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-secondary-dark transition-colors duration-200 w-full visible" /* Changed button colors */
        >
          Ver Detalles
        </button>
      </div>
    </div>
  );
};

export default function LeadsListPage() {
  const { idToken, authLoading } = useAuth(); // Get idToken from AuthContext
  const [allLeads, setAllLeads] = useState([]);
  const [uncontactedLeads, setUncontactedLeads] = useState([]);
  const [contactedLeads, setContactedLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('uncontacted'); // 'uncontacted' or 'contacted'

  useEffect(() => {
    const fetchLeads = async () => {
      if (authLoading || !idToken) {
        // Wait for authentication to be ready and a token to be available
        // if authLoading completes and NO idToken, it means the user is not logged in.
        if (!authLoading && !idToken) {
          setError("Not authenticated. Please log in to view potential customers.");
          setLoading(false);
        }
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(GET_LEADS_URL, { // Usando variable de entorno
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error fetching potential customers.');
        }

        const data = await response.json();
        const sortedData = data.sort((a, b) => {
          // Order by timestamp: oldest first
          const timestampA = a.timestamp && a.timestamp._seconds ? a.timestamp._seconds : 0;
          const timestampB = b.timestamp && b.timestamp._seconds ? b.timestamp._seconds : 0;
          return timestampA - timestampB;
        });

        setAllLeads(sortedData);

        // Filter for the two lists
        setUncontactedLeads(sortedData.filter(lead => lead.status === 'nuevo'));
        setContactedLeads(sortedData.filter(lead => lead.status !== 'nuevo'));

      } catch (err) {
        console.error('Error fetching leads:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [idToken, authLoading]); // Executes when idToken or authLoading change

  // Filter leads for the UI based on search term
  const filterLeads = (leads) => {
    if (!searchTerm) {
      return leads;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return leads.filter(lead =>
      lead.name.toLowerCase().includes(lowerCaseSearchTerm) ||
      lead.email.toLowerCase().includes(lowerCaseSearchTerm) ||
      (lead.phone && lead.phone.toLowerCase().includes(lowerCaseSearchTerm)) ||
      (lead.interestedIn && lead.interestedIn.toLowerCase().includes(lowerCaseSearchTerm)) ||
      (lead.source && lead.source.toLowerCase().includes(lowerCaseSearchTerm)) || // Added filter by source
      (lead.status && lead.status.toLowerCase().includes(lowerCaseSearchTerm))    // Added filter by status
    );
  };

  const displayedLeads = activeTab === 'uncontacted' 
    ? filterLeads(uncontactedLeads) 
    : filterLeads(contactedLeads);

  return (
    <div className="min-h-screen bg-neutral-100 p-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-primary-dark mb-6">Potential Customer Management</h1>

        {/* Search Bar and Create New Button */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full md:w-1/2"> {/* Container for the search bar */}
            <input
              type="text"
              placeholder="Search by name, email, source, status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 pl-10 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT shadow-sm"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
          </div>
          <Link href="/dashboard-admin/potenciales/new" className="bg-secondary-DEFAULT text-primary-dark px-6 py-3 rounded-full font-semibold hover:bg-secondary-dark transition-colors duration-200 shadow-md whitespace-nowrap">
            + Create New Customer
          </Link>
        </div>

        {/* Contacted / Uncontacted Tabs */}
        {/* Diseño de pestañas mejorado: con selección clara y fondo distinto */}
        <div className="flex bg-neutral-200 rounded-lg p-1 mb-6 w-full max-w-md mx-auto shadow-inner"> 
          <button
            onClick={() => setActiveTab('uncontacted')}
            className={`flex-1 py-2 px-4 text-sm font-semibold rounded-lg transition-all duration-300 
              ${activeTab === 'uncontacted' 
                ? 'bg-primary-dark text-neutral-50 shadow-md' // Seleccionado: Fondo azul oscuro, texto blanco, sombra
                : 'text-neutral-800 hover:bg-neutral-300'} 
            `}
          >
            Sin Contactar ({uncontactedLeads.length})
          </button>
          <button
            onClick={() => setActiveTab('contacted')}
            className={`flex-1 py-2 px-4 text-sm font-semibold rounded-lg transition-all duration-300 
              ${activeTab === 'contacted' 
                ? 'bg-primary-dark text-neutral-50 shadow-md' // Seleccionado: Fondo azul oscuro, texto blanco, sombra
                : 'text-neutral-800 hover:bg-neutral-300'} 
            `}
          >
            Contactados ({contactedLeads.length})
          </button>
        </div>

        {loading && <p className="text-center text-primary-dark text-lg py-10">Loading potential customers...</p>}
        {error && <p className="text-center text-error text-lg py-10">Error: {error}</p>}

        {!loading && !error && displayedLeads.length === 0 && (
          <p className="text-center text-neutral-600 text-lg py-10">No potential customers found in this list.</p>
        )}

        {/* List of Customer Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"> {/* More columns, smaller gap */}
          {!loading && !error && displayedLeads.map(lead => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </div>
      </div>
    </div>
  );
}
