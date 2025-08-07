// src/app/dashboard-admin/campaigns/page.js
'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useCampaigns } from '@/hooks/useCampaigns'
import Alert from '@/components/ui/Alert'
import ConfirmModal from '@/components/ui/ConfirmModal'
import StatCard from '@/components/ui/StatCard' // Nuevo componente
import CampaignCard from '@/components/admin/campaigns/CampaignCard' // Nuevo componente
import SearchInput from '@/components/ui/SearchInput' // Nuevo componente
import StatusSelector from '@/components/admin/campaigns/StatusSelector' // Nuevo componente

const ListaCampanasPage = () => {
  const { user, idToken } = useAuth()
  const [filters, setFilters] = useState({ type: '', status: '', search: '' })

  const { campaigns, campaignTypes, loading, error, refreshData } = useCampaigns()
  
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [campaignToToggle, setCampaignToToggle] = useState(null)
  const [alert, setAlert] = useState({ show: false, message: '', type: 'info' })

  const UPDATE_CAMPAIGN_STATUS_URL = process.env.NEXT_PUBLIC_UPDATE_CAMPAIGN_STATUS_URL
  const CAMPAIGN_TYPES_OPTIONS = useMemo(() => [
    { value: '', label: 'Todos los Tipos' },
    ...campaignTypes.map(type => ({ value: type.id, label: type.name }))
  ], [campaignTypes]);

  const STATUS_OPTIONS = [
    { value: '', label: 'Todos los Estados' },
    { value: 'activo', label: 'Activo' },
    { value: 'inactivo', label: 'Inactivo' },
    { value: 'archivado', label: 'Archivado' }
  ];

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(campaign => {
      const matchesType = filters.type === '' || campaign.type === filters.type;
      const matchesStatus = filters.status === '' || campaign.status === filters.status;
      const matchesSearch =
        filters.search === '' ||
        (campaign.campaignName && campaign.campaignName.toLowerCase().includes(filters.search.toLowerCase())) ||
        (campaign.candidateName && campaign.candidateName.toLowerCase().includes(filters.search.toLowerCase()));
      return matchesType && matchesStatus && matchesSearch;
    });
  }, [campaigns, filters]);

  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(c => c.status === 'activo').length;
  const inactiveCampaigns = campaigns.filter(c => c.status === 'inactivo').length;

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({ ...prevFilters, [name]: value }));
  };

  const handleOpenConfirmModal = useCallback((campaignId, currentStatus) => {
    setCampaignToToggle({ id: campaignId, currentStatus });
    setShowConfirmModal(true);
  }, []);

  const handleConfirmToggleStatus = useCallback(async () => {
    if (!campaignToToggle) return;
    const { id, currentStatus } = campaignToToggle;
    setShowConfirmModal(false);

    try {
      if (!UPDATE_CAMPAIGN_STATUS_URL) {
        throw new Error('URL para actualizar estado de campaña no configurada.');
      }
      if (!idToken) {
        throw new Error('No hay token de autenticación disponible.');
      }

      const newStatus = currentStatus === 'activo' ? 'inactivo' : 'activo';
      const response = await fetch(UPDATE_CAMPAIGN_STATUS_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ campaignId: id, status: newStatus }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Error al actualizar el estado de la campaña.');
      }

      await refreshData();
      setAlert({
        show: true,
        message: `Estado de la campaña actualizado a '${newStatus}' exitosamente.`,
        type: 'success',
      });
    } catch (err) {
      console.error('Error al cambiar estado de campaña:', err);
      setAlert({
        show: true,
        message: `Error al cambiar estado de campaña: ${err.message}`,
        type: 'error',
      });
    } finally {
      setCampaignToToggle(null);
    }
  }, [UPDATE_CAMPAIGN_STATUS_URL, idToken, refreshData, campaignToToggle]);

  const handleCancelToggleStatus = useCallback(() => {
    setShowConfirmModal(false);
    setCampaignToToggle(null);
  }, []);

  const handleCloseAlert = useCallback(() => {
    setAlert({ ...alert, show: false });
  }, [alert]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-100 text-neutral-600">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        <p className="ml-4 text-primary-600">Cargando campañas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-neutral-100 min-h-screen flex items-center justify-center">
        <Alert message={error} type="error" onClose={() => setAlert({ show: false, message: '', type: 'info' })} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-neutral-100 min-h-screen">
      {alert.show && (
        <div className="fixed top-4 right-4 z-50">
          <Alert message={alert.message} type={alert.type} onClose={handleCloseAlert} />
        </div>
      )}

      {showConfirmModal && campaignToToggle && (
        <ConfirmModal
          title="Confirmar Cambio de Estado"
          message={`¿Estás seguro de cambiar el estado de la campaña a '${campaignToToggle.currentStatus === 'activo' ? 'inactivo' : 'activo'}'? Esta acción afectará su visibilidad.`}
          onConfirm={handleConfirmToggleStatus}
          onCancel={handleCancelToggleStatus}
        />
      )}

      <h1 className="text-3xl font-bold text-neutral-800 mb-6">Gestión de Campañas</h1>
      <p className="text-neutral-600 mb-6">Aquí puedes ver y gestionar todas las campañas registradas en el sistema.</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total de Campañas" value={totalCampaigns} />
        <StatCard title="Campañas Activas" value={activeCampaigns} color="green" />
        <StatCard title="Campañas Inactivas" value={inactiveCampaigns} color="red" />
      </div>

      <div className="bg-white p-4 rounded-xl shadow-md mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1 w-full md:w-auto">
          <SearchInput
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Buscar por Nombre/Candidato"
          />
        </div>
        <div className="flex flex-col sm:flex-row items-stretch md:items-center gap-4 w-full md:w-auto">
          <select
            name="type"
            id="type"
            value={filters.type}
            onChange={handleFilterChange}
            className="block w-full pl-3 pr-10 py-2 text-base border-neutral-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md text-neutral-900"
          >
            {CAMPAIGN_TYPES_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <StatusSelector
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            options={STATUS_OPTIONS}
          />
        </div>
      </div>
      
      {!loading && !error && filteredCampaigns.length === 0 && (
        <div className="text-center py-8 text-neutral-600">
          <p>No se encontraron campañas con los filtros aplicados.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCampaigns.map((campaign, index) => (
          <CampaignCard
            key={campaign.id}
            campaign={campaign}
            onToggleStatus={handleOpenConfirmModal}
            loading={loading}
          />
        ))}
      </div>
    </div>
  );
};

export default ListaCampanasPage;