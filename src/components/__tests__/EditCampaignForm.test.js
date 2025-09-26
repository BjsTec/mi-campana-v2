import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EditCampaignForm from '../EditCampaignForm';
import { supabase } from '../../../supabaseClient';

// Mock supabase client
jest.mock('../../../supabaseClient', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

const mockCampaign = {
  id: 1,
  name: 'Campaña a Editar',
  plan: 'Pago',
  status: 'active',
};

describe('EditCampaignForm', () => {
  let mockOnClose;
  let mockOnCampaignUpdated;

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnClose = jest.fn();
    mockOnCampaignUpdated = jest.fn();

    // Mock supabase update
    const mockUpdateChain = {
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ error: null }),
    };
    supabase.from.mockReturnValue(mockUpdateChain);
  });

  test('renders the form with pre-filled campaign data when open', () => {
    render(
      <EditCampaignForm
        isOpen={true}
        onClose={mockOnClose}
        campaign={mockCampaign}
        onCampaignUpdated={mockOnCampaignUpdated}
      />
    );

    expect(screen.getByText('Editar Campaña')).toBeInTheDocument();
    expect(screen.getByLabelText('Plan')).toHaveValue(mockCampaign.plan);
    expect(screen.getByLabelText('Estado')).toHaveValue(mockCampaign.status);
  });

  test('does not render when closed', () => {
    render(
      <EditCampaignForm
        isOpen={false}
        onClose={mockOnClose}
        campaign={mockCampaign}
        onCampaignUpdated={mockOnCampaignUpdated}
      />
    );
    expect(screen.queryByText('Editar Campaña')).not.toBeInTheDocument();
  });

  test('updates form fields on user input', () => {
    render(
      <EditCampaignForm
        isOpen={true}
        onClose={mockOnClose}
        campaign={mockCampaign}
        onCampaignUpdated={mockOnCampaignUpdated}
      />
    );

    const planSelect = screen.getByLabelText('Plan');
    const statusSelect = screen.getByLabelText('Estado');

    fireEvent.change(planSelect, { target: { value: 'Demo' } });
    fireEvent.change(statusSelect, { target: { value: 'paused' } });

    expect(planSelect).toHaveValue('Demo');
    expect(statusSelect).toHaveValue('paused');
  });

  test('submits the form and calls the update function', async () => {
    render(
      <EditCampaignForm
        isOpen={true}
        onClose={mockOnClose}
        campaign={mockCampaign}
        onCampaignUpdated={mockOnCampaignUpdated}
      />
    );

    // Change values
    fireEvent.change(screen.getByLabelText('Plan'), { target: { value: 'Gratuita' } });
    fireEvent.change(screen.getByLabelText('Estado'), { target: { value: 'inactive' } });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: 'Actualizar Campaña' }));

    await waitFor(() => {
      // Check that supabase.update was called with the correct data
      expect(supabase.from('campaigns').update).toHaveBeenCalledWith({
        plan: 'Gratuita',
        status: 'inactive',
      });
      // Check that it was targeted at the correct campaign
      expect(supabase.from('campaigns').update().eq).toHaveBeenCalledWith('id', mockCampaign.id);

      // Check that callbacks were fired
      expect(mockOnCampaignUpdated).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  test('shows an alert if submission fails', async () => {
    // Mock a failed update
    const error = { message: 'Update failed' };
    supabase.from('campaigns').update().eq.mockResolvedValue({ error });

    // Mock window.alert
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <EditCampaignForm
        isOpen={true}
        onClose={mockOnClose}
        campaign={mockCampaign}
        onCampaignUpdated={mockOnCampaignUpdated}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Actualizar Campaña' }));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Error al actualizar la campaña.');
      expect(mockOnCampaignUpdated).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    alertSpy.mockRestore();
  });
});