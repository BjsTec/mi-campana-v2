// src/app/dashboard-admin/campaigns/[id]/page.js
'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import CampaignDetailHeader from '@/components/admin/campaigns/CampaignDetailHeader';
import CampaignMembersList from '@/components/admin/campaigns/CampaignMembersList';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Alert from '@/components/ui/Alert';

const CampaignDetailsPage = ({ params }) => {
  const { id } = use(params);
  const router = useRouter();
  const { idToken, user } = useAuth();
  const [campaign, setCampaign] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'info' });

  // URLs de las funciones de Firebase (del .env.local)
  const GET_CAMPAIGN_BY_ID_URL = process.env.NEXT_PUBLIC_GET_CAMPAIGN_BY_ID_URL;
  const UPDATE_CAMPAIGN_URL = process.env.NEXT_PUBLIC_UPDATE_CAMPAIGN_URL;
  const UPDATE_CAMPAIGN_STATUS_URL = process.env.NEXT_PUBLIC_UPDATE_CAMPAIGN_STATUS_URL;
  // NUEVA URL del backend para obtener los miembros
  const GET_CAMPAIGN_MEMBERS_URL = process.env.NEXT_PUBLIC_GET_CAMPAIGN_MEMBERS_URL;

  const fetchCampaignData = useCallback(async () => {
    if (!idToken || !id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Petición 1: Obtener los detalles de la campaña
      const campaignResponse = await fetch(`${GET_CAMPAIGN_BY_ID_URL}?id=${id}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (!campaignResponse.ok) {
        const errData = await campaignResponse.json();
        throw new Error(errData.message || 'Error al cargar la información de la campaña.');
      }
      const campaignData = await campaignResponse.json();
      setCampaign(campaignData);

      // Petición 2: Obtener los miembros de la campaña usando la nueva API
      const membersResponse = await fetch(`${GET_CAMPAIGN_MEMBERS_URL}?campaignId=${id}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (!membersResponse.ok) {
        throw new Error('Error al cargar la lista de miembros de la campaña.');
      }
      const membersData = await membersResponse.json();
      setMembers(membersData.campaignMembers);
    } catch (err) {
      console.error('Error fetching campaign data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, idToken, GET_CAMPAIGN_BY_ID_URL, GET_CAMPAIGN_MEMBERS_URL]);

  useEffect(() => {
    if (idToken && id) {
      fetchCampaignData();
    }
  }, [idToken, id, fetchCampaignData]); 
  
  const handleToggleStatus = useCallback(async () => {
    if (!campaign) return;
    try {
      if (!UPDATE_CAMPAIGN_STATUS_URL || !idToken) {
        throw new Error('No se puede actualizar el estado sin la URL o el token de autenticación.');
      }
      const newStatus = campaign.status === 'activo' ? 'inactivo' : 'activo';
      const response = await fetch(UPDATE_CAMPAIGN_STATUS_URL, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId: id, status: newStatus }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Error al actualizar el estado de la campaña.');
      }
      setCampaign(prev => ({ ...prev, status: newStatus }));
      setAlert({ show: true, message: `Estado de la campaña actualizado a '${newStatus}' exitosamente.`, type: 'success' });
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      setAlert({ show: true, message: `Error al cambiar estado: ${err.message}`, type: 'error' });
    }
  }, [campaign, idToken, id, UPDATE_CAMPAIGN_STATUS_URL]);

  const handleEditCampaign = useCallback(async (updatedFields) => {
    if (!campaign) return;
    try {
      if (!UPDATE_CAMPAIGN_URL || !idToken) {
        throw new Error('No se puede editar la campaña sin la URL o el token de autenticación.');
      }
      const response = await fetch(UPDATE_CAMPAIGN_URL, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId: id, updates: updatedFields }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Error al editar la campaña.');
      }
      await fetchCampaignData();
      setAlert({ show: true, message: `Campaña actualizada exitosamente.`, type: 'success' });
    } catch (err) {
      console.error('Error al editar campaña:', err);
      setAlert({ show: true, message: `Error al editar campaña: ${err.message}`, type: 'error' });
    }
  }, [campaign, idToken, id, UPDATE_CAMPAIGN_URL, fetchCampaignData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert message={error} type="error" />
      </div>
    );
  }

  if (!campaign) {
    return <div className="p-6 text-center">Campaña no encontrada.</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-neutral-100 min-h-screen">
      {alert.show && (
        <div className="fixed top-4 right-4 z-50">
          <Alert message={alert.message} type={alert.type} onClose={() => setAlert({ ...alert, show: false })} />
        </div>
      )}

      {showConfirmModal && (
        <ConfirmModal
          title="Confirmar Cambio de Estado"
          message={`¿Estás seguro de cambiar el estado de la campaña a '${campaign.status === 'activo' ? 'inactivo' : 'activo'}'? Esta acción afectará su visibilidad.`}
          onConfirm={() => {
            setShowConfirmModal(false);
            handleToggleStatus();
          }}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}

      <CampaignDetailHeader
        campaign={campaign}
        onToggleStatus={() => setShowConfirmModal(true)}
        onEditCampaign={handleEditCampaign}
        loading={loading}
      />
      
      <div className="mt-8">
        <CampaignMembersList members={members} loading={loading} />
      </div>
    </div>
  );
};

export default CampaignDetailsPage;