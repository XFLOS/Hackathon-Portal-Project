import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';

// Prevent real network/API calls
jest.mock('../services/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(() => Promise.resolve({ data: { role: 'student' } })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
  },
}));

import App from '../App';

describe('routing smoke tests', () => {
  test('public route /hackathons renders list', async () => {
    render(
      <MemoryRouter initialEntries={["/hackathons"]}>
        <App />
      </MemoryRouter>
    );
    expect(await screen.findByText(/Available Hackathons/i)).toBeInTheDocument();
  });

  test('unknown route shows 404 page', async () => {
    render(
      <MemoryRouter initialEntries={["/some-unknown-path"]}>
        <App />
      </MemoryRouter>
    );
    expect(await screen.findByText(/Page Not Found/i)).toBeInTheDocument();
  });
});

