'use client'

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../supabaseClient';
import EditCampaignForm from './EditCampaignForm';

const CampaignsTable = ({ refreshKey }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  // Local state to trigger refresh without prop drilling
  const [localRefresh, setLocalRefresh] = useState(false);


  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        let query = supabase.from('campaigns').select(`
          id,
          name,
          plan,
          status,
          candidate_id,
          profile:profiles ( full_name )
        `);

        if (searchTerm) {
          query = query.ilike('name', `%${searchTerm}%`);
        }
        if (planFilter) {
          query = query.eq('plan', planFilter);
        }

        const { data, error } = await query;
        if (error) throw error;

        const campaignsWithMetrics = await Promise.all(
          data.map(async (campaign) => {
            const { data: candidateMember, error: memberError } = await supabase
              .from('campaign_members')
              .select('id')
              .eq('campaign_id', campaign.id)
              .eq('role', 'candidato')
              .single();

            let total_members = 1;

            if (candidateMember) {
              const { data: metrics, error: rpcError } = await supabase.rpc('get_pyramid_metrics', {
                member_id_input: candidateMember.id
              });

              if (metrics) {
                total_members += metrics.total_pyramid_members;
              }
            }

            return {
              ...campaign,
              total_members,
              candidate_name: campaign.profile?.full_name || 'N/A'
            };
          })
        );

        setCampaigns(campaignsWithMetrics);

      } catch (error) {
        console.error('Error fetching campaigns:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, [searchTerm, planFilter, refreshKey, localRefresh]);

  const handleEditClick = (campaign) => {
    setSelectedCampaign(campaign);
    setEditModalOpen(true);
  };

  const handleCampaignUpdated = () => {
    setLocalRefresh(prev => !prev);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mt-6">
      <h2 className="text-xl font-bold mb-4">Gestión de Campañas</h2>
      <div className="flex justify-between mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          className="p-2 border rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="p-2 border rounded"
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
        >
          <option value="">Todos los Planes</option>
          <option value="Demo">Demo</option>
          <option value="Gratuita">Gratuita</option>
          <option value="Pago">Pago</option>
        </select>
      </div>
      {loading ? (
        <p>Cargando campañas...</p>
      ) : (
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 text-left">Nombre Campaña</th>
              <th className="py-2 px-4 text-left">Candidato Asignado</th>
              <th className="py-2 px-4 text-left">Plan</th>
              <th className="py-2 px-4 text-left">Estado</th>
              <th className="py-2 px-4 text-left">Miembros Totales</th>
              <th className="py-2 px-4 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((campaign) => (
              <tr key={campaign.id} className="text-left border-t">
                <td className="py-2 px-4">{campaign.name}</td>
                <td className="py-2 px-4">{campaign.candidate_name}</td>
                <td className="py-2 px-4">{campaign.plan}</td>
                <td className="py-2 px-4">{campaign.status}</td>
                <td className="py-2 px-4">{campaign.total_members}</td>
                <td className="py-2 px-4">
                  <button
                    onClick={() => handleEditClick(campaign)}
                    className="text-blue-500 hover:underline mr-2"
                  >
                    Editar
                  </button>
                  <Link href={`/dashboard-candidato/view/${campaign.id}`} className="text-gray-500 hover:underline">
                    Ver Detalles
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <EditCampaignForm
        isOpen={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        campaign={selectedCampaign}
        onCampaignUpdated={handleCampaignUpdated}
      />
    </div>
  );
};

export default CampaignsTable;