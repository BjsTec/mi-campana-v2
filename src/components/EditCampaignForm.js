'use client'

import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

const EditCampaignForm = ({ isOpen, onClose, campaign, onCampaignUpdated }) => {
  const [plan, setPlan] = useState('');
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (campaign) {
      setPlan(campaign.plan);
      setStatus(campaign.status);
    }
  }, [campaign]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!plan || !status) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ plan, status })
        .eq('id', campaign.id);

      if (error) throw error;

      alert('Campaña actualizada exitosamente!');
      onCampaignUpdated();
      onClose();

    } catch (error) {
      console.error('Error updating campaign:', error);
      alert('Error al actualizar la campaña.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Editar Campaña</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="editPlan" className="block text-gray-700">Plan</label>
            <select
              id="editPlan"
              className="w-full p-2 border rounded"
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
            >
              <option value="Demo">Demo</option>
              <option value="Gratuita">Gratuita</option>
              <option value="Pago">Pago</option>
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="editStatus" className="block text-gray-700">Estado</label>
            <select
              id="editStatus"
              className="w-full p-2 border rounded"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="active">Activa</option>
              <option value="inactive">Inactiva</option>
              <option value="paused">Pausada</option>
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
              {isSubmitting ? 'Actualizando...' : 'Actualizar Campaña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCampaignForm;