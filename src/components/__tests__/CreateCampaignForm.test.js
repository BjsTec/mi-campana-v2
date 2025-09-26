import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CreateCampaignForm from '../CreateCampaignForm';
import { supabase } from '../../../supabaseClient';

// Mock supabase client
jest.mock('../../../supabaseClient', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

const mockProfiles = [
  { id: 'uuid-3', full_name: 'Candidato Tres' },
  { id: 'uuid-4', full_name: 'Candidato Cuatro' },
];

describe('CreateCampaignForm', () => {
  let mockOnClose;
  let mockOnCampaignCreated;

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnClose = jest.fn();
    mockOnCampaignCreated = jest.fn();

    // Setup mocks with proper chaining
    const profilesChain = {
      select: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: mockProfiles, error: null }),
    };
    const campaignsChain = {
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { id: 99 }, error: null }),
    };
    const membersChain = {
      insert: jest.fn().mockResolvedValue({ error: null }),
    };

    supabase.from.mockImplementation((tableName) => {
      if (tableName === 'profiles') return profilesChain;
      if (tableName === 'campaigns') return campaignsChain;
      if (tableName === 'campaign_members') return membersChain;
      return {}; // Default empty mock
    });
  });

  test('renders all form fields when open', () => {
    render(<CreateCampaignForm isOpen={true} onClose={mockOnClose} onCampaignCreated={mockOnCampaignCreated} />);
    expect(screen.getByLabelText('Nombre de la Campaña')).toBeInTheDocument();
    expect(screen.getByLabelText('Asignar Candidato')).toBeInTheDocument();
    expect(screen.getByLabelText('Plan')).toBeInTheDocument();
  });

  test('searches for candidates and displays results', async () => {
    render(<CreateCampaignForm isOpen={true} onClose={mockOnClose} onCampaignCreated={mockOnCampaignCreated} />);

    const searchInput = screen.getByPlaceholderText('Buscar por nombre...');
    fireEvent.change(searchInput, { target: { value: 'Candidato' } });

    await waitFor(() => {
      expect(supabase.from('profiles').ilike).toHaveBeenCalledWith('full_name', '%Candidato%');
      expect(screen.getByText('Candidato Tres')).toBeInTheDocument();
      expect(screen.getByText('Candidato Cuatro')).toBeInTheDocument();
    });
  });

  test('submits the form and creates a campaign', async () => {
    render(<CreateCampaignForm isOpen={true} onClose={mockOnClose} onCampaignCreated={mockOnCampaignCreated} />);

    // Fill the form
    fireEvent.change(screen.getByLabelText('Nombre de la Campaña'), { target: { value: 'Mi Campaña Demo' } });

    const searchInput = screen.getByPlaceholderText('Buscar por nombre...');
    fireEvent.change(searchInput, { target: { value: 'Candidato' } });
    await waitFor(() => {
        // user selects a candidate
        fireEvent.click(screen.getByText('Candidato Tres'));
    });

    await waitFor(() => {
        expect(searchInput.value).toBe('Candidato Tres');
    });

    fireEvent.change(screen.getByLabelText('Plan'), { target: { value: 'Demo' } });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: 'Crear Campaña' }));

    await waitFor(() => {
      // Check campaign insertion
      expect(supabase.from('campaigns').insert).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Mi Campaña Demo',
        candidate_id: 'uuid-3',
        plan: 'Demo',
      }));

      // Check campaign member insertion
      expect(supabase.from('campaign_members').insert).toHaveBeenCalledWith({
        campaign_id: 99,
        user_id: 'uuid-3',
        role: 'candidato',
      });

      expect(mockOnCampaignCreated).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});