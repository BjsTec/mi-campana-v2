'use client'

import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';

const CreateCampaignForm = ({ isOpen, onClose, onCampaignCreated }) => {
  const [name, setName] = useState('');
  const [candidateSearch, setCandidateSearch] = useState('');
  const [searchedProfiles, setSearchedProfiles] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [plan, setPlan] = useState('Demo');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCandidateSearch = async (e) => {
    setCandidateSearch(e.target.value);
    if (e.target.value.length > 2) {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .ilike('full_name', `%${e.target.value}%`)
        .limit(5);
      if (data) {
        setSearchedProfiles(data);
      }
    } else {
      setSearchedProfiles([]);
    }
  };

  const handleSelectCandidate = (profile) => {
    setSelectedCandidate(profile);
    setCandidateSearch(profile.full_name);
    setSearchedProfiles([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !selectedCandidate || !plan) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    setIsSubmitting(true);
    let demoExpiresAt = null;
    if (plan === 'Demo') {
      const date = new Date();
      date.setDate(date.getDate() + 7);
      demoExpiresAt = date.toISOString();
    }

    try {
      // Insert into campaigns table
      const { data: campaignData, error: campaignError } = await supabase
        .from('campaigns')
        .insert({
          name,
          candidate_id: selectedCandidate.id,
          plan,
          status: 'active',
          demo_expires_at: demoExpiresAt,
        })
        .select()
        .single();

      if (campaignError) throw campaignError;

      // Insert into campaign_members table
      const { error: memberError } = await supabase
        .from('campaign_members')
        .insert({
          campaign_id: campaignData.id,
          user_id: selectedCandidate.id,
          role: 'candidato',
        });

      if (memberError) throw memberError;

      alert('Campaña creada exitosamente!');
      onCampaignCreated();
      onClose();

    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Error al crear la campaña.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Crear Nueva Campaña</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="campaignName" className="block text-gray-700">Nombre de la Campaña</label>
            <input
              id="campaignName"
              type="text"
              className="w-full p-2 border rounded"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="candidateSearch" className="block text-gray-700">Asignar Candidato</label>
            <input
              id="candidateSearch"
              type="text"
              className="w-full p-2 border rounded"
              value={candidateSearch}
              onChange={handleCandidateSearch}
              placeholder="Buscar por nombre..."
              required
            />
            {searchedProfiles.length > 0 && (
              <ul className="border rounded mt-1">
                {searchedProfiles.map(profile => (
                  <li
                    key={profile.id}
                    className="p-2 hover:bg-gray-200 cursor-pointer"
                    onClick={() => handleSelectCandidate(profile)}
                  >
                    {profile.full_name}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="mb-4">
            <label htmlFor="plan" className="block text-gray-700">Plan</label>
            <select
              id="plan"
              className="w-full p-2 border rounded"
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
            >
              <option value="Demo">Demo</option>
              <option value="Gratuita">Gratuita</option>
              <option value="Pago">Pago</option>
            </select>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded mr-2"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creando...' : 'Crear Campaña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCampaignForm;