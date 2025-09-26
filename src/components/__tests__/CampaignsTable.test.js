import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CampaignsTable from '../CampaignsTable';
import { supabase } from '../../../supabaseClient';

// Mock supabase client
jest.mock('../../../supabaseClient', () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn(),
  },
}));

// Mock child components
jest.mock('../EditCampaignForm', () => ({ isOpen }) => isOpen ? <div data-testid="edit-campaign-form">Edit Form</div> : null);
jest.mock('next/link', () => ({ children, href }) => <a href={href}>{children}</a>);


const mockCampaigns = [
  { id: 1, name: 'Campaña Alpha', plan: 'Pago', status: 'active', candidate_id: 'uuid-1', profile: { full_name: 'Candidato Uno' } },
  { id: 2, name: 'Campaña Beta', plan: 'Demo', status: 'active', candidate_id: 'uuid-2', profile: { full_name: 'Candidato Dos' } },
];

const mockCampaignMembers = {
  '1': { id: 101 },
  '2': { id: 102 },
};

const mockPyramidMetrics = {
  '101': { total_pyramid_members: 50 },
  '102': { total_pyramid_members: 10 },
};

describe('CampaignsTable', () => {

  beforeEach(() => {
    jest.clearAllMocks();

    const queryBuilder = {
      eq: jest.fn().mockResolvedValue({ data: [mockCampaigns[1]], error: null }),
      ilike: jest.fn().mockResolvedValue({ data: [mockCampaigns[0]], error: null }),
      then: (resolve) => resolve({ data: mockCampaigns, error: null }),
    };

    supabase.from.mockImplementation((tableName) => {
      if (tableName === 'campaigns') {
        return {
          select: jest.fn(() => queryBuilder),
        };
      }
      if (tableName === 'campaign_members') {
        const memberChain = {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn(),
        };
        memberChain.eq.mockImplementation((col, val) => {
          memberChain.single.mockResolvedValue({ data: mockCampaignMembers[val], error: null });
          return memberChain;
        });
        return memberChain;
      }
      return {};
    });

    supabase.rpc.mockImplementation(async (funcName, { member_id_input }) => {
      if (funcName === 'get_pyramid_metrics') {
        return { data: mockPyramidMetrics[member_id_input], error: null };
      }
      return { data: {}, error: null };
    });
  });

  test('shows loading state and then displays data', async () => {
    render(<CampaignsTable />);
    expect(screen.getByText('Cargando campañas...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Campaña Alpha')).toBeInTheDocument();
      expect(screen.getByText('Campaña Beta')).toBeInTheDocument();
    });
  });

  test('filters campaigns by plan', async () => {
    render(<CampaignsTable />);
    await waitFor(() => expect(screen.getByText('Campaña Alpha')).toBeInTheDocument());

    const planFilter = screen.getByRole('combobox');
    fireEvent.change(planFilter, { target: { value: 'Demo' } });

    await waitFor(() => {
      const queryBuilder = supabase.from('campaigns').select();
      expect(queryBuilder.eq).toHaveBeenCalledWith('plan', 'Demo');
      expect(screen.queryByText('Campaña Alpha')).not.toBeInTheDocument();
      expect(screen.getByText('Campaña Beta')).toBeInTheDocument();
    });
  });

  test('searches campaigns by name', async () => {
    render(<CampaignsTable />);
    await waitFor(() => expect(screen.getByText('Campaña Alpha')).toBeInTheDocument());

    const searchInput = screen.getByPlaceholderText('Buscar por nombre...');
    fireEvent.change(searchInput, { target: { value: 'Alpha' } });

    await waitFor(() => {
      const queryBuilder = supabase.from('campaigns').select();
      expect(queryBuilder.ilike).toHaveBeenCalledWith('name', '%Alpha%');
       expect(screen.getByText('Campaña Alpha')).toBeInTheDocument();
      expect(screen.queryByText('Campaña Beta')).not.toBeInTheDocument();
    });
  });
});