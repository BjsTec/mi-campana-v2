import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PlatformOwnerDashboard from '../page';
import { supabase } from '../../../../../supabaseClient';
import { useAuth } from '@/context/AuthContext';

// Mock supabase client
jest.mock('../../../../../supabaseClient', () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn(),
  },
}));

// Mock AuthContext
jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock child components using path aliases
jest.mock('@/components/CampaignsTable', () => () => <div data-testid="campaigns-table">Campaigns Table</div>);
jest.mock('@/components/CreateCampaignForm', () => ({ isOpen }) => isOpen ? <div data-testid="create-campaign-form">Create Campaign Form</div> : null);


describe('PlatformOwnerDashboard', () => {
  beforeEach(() => {
    // Mock useAuth
    useAuth.mockReturnValue({
      user: { role: 'platform_owner' },
      isLoading: false,
    });

    // Reset mocks before each test
    jest.clearAllMocks();

    // A more specific mock for supabase.from
    supabase.from.mockImplementation((tableName) => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
      };

      if (tableName === 'campaigns') {
        mockChain.select.mockImplementation((_, options) => {
          if (options?.head) {
            // This is a count query
            mockChain.eq.mockImplementation((column, value) => {
              if (column === 'status' && value === 'active') {
                return Promise.resolve({ count: 5, error: null });
              }
              if (column === 'plan' && value === 'Demo') {
                return Promise.resolve({ count: 2, error: null });
              }
              return Promise.resolve({ count: 0, error: null }); // Default
            });
          } else {
            // This is a data query for the table
             mockChain.select.mockResolvedValue({ data: [], error: null });
          }
          return mockChain;
        });
      } else if (tableName === 'profiles') {
        mockChain.select.mockResolvedValue({ count: 150, error: null });
      } else if (tableName === 'campaign_members') {
         mockChain.select.mockResolvedValue({ data: [], error: null });
      }

      return mockChain;
    });

    // Default mock for rpc
    supabase.rpc.mockResolvedValue({ data: { total_pyramid_members: 0 }, error: null });
  });

  test('renders the dashboard title and "Nueva Campaña" button', async () => {
    render(<PlatformOwnerDashboard />);
    expect(screen.getByText('Platform Owner Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Nueva Campaña')).toBeInTheDocument();
  });

  test('fetches and displays the key metrics correctly', async () => {
    render(<PlatformOwnerDashboard />);

    // Wait for all metrics to be loaded and displayed
    await waitFor(() => {
      expect(screen.getByText('Campañas Activas')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Campañas en Demo')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Total de Usuarios')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();
    });
  });

  test('renders the CampaignsTable component', async () => {
    render(<PlatformOwnerDashboard />);
    // Wait for loading to finish
    await waitFor(() => expect(screen.queryByText('Cargando métricas...')).not.toBeInTheDocument());
    expect(screen.getByTestId('campaigns-table')).toBeInTheDocument();
  });

  test('opens the CreateCampaignForm modal when "Nueva Campaña" is clicked', async () => {
    render(<PlatformOwnerDashboard />);
    await waitFor(() => expect(screen.queryByText('Cargando métricas...')).not.toBeInTheDocument());

    const newCampaignButton = screen.getByText('Nueva Campaña');
    fireEvent.click(newCampaignButton);

    await waitFor(() => {
      expect(screen.getByTestId('create-campaign-form')).toBeInTheDocument();
    });
  });
});