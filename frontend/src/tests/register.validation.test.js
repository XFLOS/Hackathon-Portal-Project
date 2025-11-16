/**
 * Basic client-side validation tests for the register page
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';

// Mock the AuthContext functions used by BaseRegister
jest.mock('../context/AuthContext', () => ({
  __esModule: true,
  registerWithEmail: jest.fn(() => Promise.resolve({ uid: 'u1', email: 'a@college.edu', displayName: 'A' })),
  useAuth: () => ({ user: null, role: null, loading: false }),
}));

// Render the register page and exercise validation
describe('BaseRegister client-side validation', () => {
  test('shows error for non-college email', async () => {
    const { default: BaseRegister } = await import('../pages/BaseRegister');
    render(
      <MemoryRouter>
        <BaseRegister />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), { target: { value: 'user@gmail.com' } });
    fireEvent.change(screen.getByPlaceholderText('Your name'), { target: { value: 'Test' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password1' } });

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => expect(screen.getByText(/Please use your college\/university email address/i)).toBeInTheDocument());
  });

  test('shows error for weak password', async () => {
    const { default: BaseRegister } = await import('../pages/BaseRegister');
    render(
      <MemoryRouter>
        <BaseRegister />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), { target: { value: 'student@college.edu' } });
    fireEvent.change(screen.getByPlaceholderText('Your name'), { target: { value: 'Test' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'short' } });

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => expect(screen.getByText(/Password must be at least 8 characters and include a number/i)).toBeInTheDocument());
  });
});
