'use client'

import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../../../supabaseClient';
import CampaignsTable from '../../../components/CampaignsTable';
import CreateCampaignForm from '../../../components/CreateCampaignForm';

const PlatformOwnerDashboard = () => {
  const [activeCampaigns, setActiveCampaigns] = useState(0);
  const [demoCampaigns, setDemoCampaigns] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  // State to trigger a refresh in the campaigns table
  const [refreshCampaigns, setRefreshCampaigns] = useState(false);

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);

      const { count: activeCount, error: activeError } = await supabase
        .from('campaigns')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');
      if (activeError) throw activeError;
      setActiveCampaigns(activeCount);

      const { count: demoCount, error: demoError } = await supabase
        .from('campaigns')
        .select('*', { count: 'exact', head: true })
        .eq('plan', 'Demo');
      if (demoError) throw demoError;
      setDemoCampaigns(demoCount);

      const { count: usersCount, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      if (usersError) throw usersError;
      setTotalUsers(usersCount);

    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const handleCampaignCreated = () => {
    // Refresh metrics and trigger table refresh
    fetchMetrics();
    setRefreshCampaigns(prev => !prev);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Platform Owner Dashboard</h1>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Nueva Campaña
        </button>
      </div>

      {loading ? (
        <p>Cargando métricas...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold">Campañas Activas</h2>
            <p className="text-3xl font-bold">{activeCampaigns}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold">Campañas en Demo</h2>
            <p className="text-3xl font-bold">{demoCampaigns}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold">Total de Usuarios</h2>
            <p className="text-3xl font-bold">{totalUsers}</p>
          </div>
        </div>
      )}

      <CampaignsTable refreshKey={refreshCampaigns} />

      <CreateCampaignForm
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCampaignCreated={handleCampaignCreated}
      />
    </div>
  );
};

export default PlatformOwnerDashboard;