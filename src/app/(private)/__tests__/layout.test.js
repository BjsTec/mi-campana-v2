import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DashboardLayout from '../layout';
import { useAuth } from '../../../context/AuthContext';

// Mock the AuthContext
jest.mock('../../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock Next.js components
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  usePathname: () => '/',
}));
jest.mock('next/link', () => ({ children, href }) => <a href={href}>{children}</a>);
jest.mock('next/image', () => (props) => <img {...props} />);


describe('DashboardLayout', () => {

  const mockCommonAuthState = {
    logout: jest.fn(),
    isLoading: false,
    activeCampaign: { campaignId: '1' },
    setActiveCampaignId: jest.fn(),
    idToken: 'fake-token',
  };

  test('renders correct navigation links for platform_owner role', () => {
    useAuth.mockReturnValue({
      ...mockCommonAuthState,
      user: { role: 'platform_owner', name: 'Platform Owner User' },
    });

    render(<DashboardLayout><div>Child Content</div></DashboardLayout>);

    // Check for the correct link
    const dashboardLink = screen.getByRole('link', { name: /Dashboard/i });
    expect(dashboardLink).toBeInTheDocument();
    expect(dashboardLink).toHaveAttribute('href', '/dashboard-platform-owner');

    // Ensure other roles' links are not present
    expect(screen.queryByRole('link', { name: /Mi Panel/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Configuración Global/i })).not.toBeInTheDocument();
  });

  test('renders correct navigation links for admin (webmaster) role', () => {
    useAuth.mockReturnValue({
      ...mockCommonAuthState,
      user: { role: 'admin', name: 'Admin User' },
    });

    render(<DashboardLayout><div>Child Content</div></DashboardLayout>);

    // Check for some of the admin links
    expect(screen.getByRole('link', { name: /Inicio/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Panel Platform Owner/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Clientes/i })).toBeInTheDocument();

    // Check for the "Global Settings" link
    const globalSettingsLink = screen.getByRole('link', { name: /Configuración Global/i });
    expect(globalSettingsLink).toBeInTheDocument();
    expect(globalSettingsLink).toHaveAttribute('href', '/dashboard-admin/global-settings');
  });

  test('displays loading message when auth is loading', () => {
    useAuth.mockReturnValue({
      ...mockCommonAuthState,
      user: null,
      isLoading: true,
    });

    render(<DashboardLayout><div>Child Content</div></DashboardLayout>);
    expect(screen.getByText('Verificando sesión y cargando datos...')).toBeInTheDocument();
  });

  test('renders children content when authenticated', () => {
     useAuth.mockReturnValue({
      ...mockCommonAuthState,
      user: { role: 'platform_owner', name: 'Test User' },
    });

    render(<DashboardLayout><div>My Test Content</div></DashboardLayout>);
    expect(screen.getByText('My Test Content')).toBeInTheDocument();
  });
});