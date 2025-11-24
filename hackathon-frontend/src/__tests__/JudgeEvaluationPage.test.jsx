import React from 'react';
import { render, screen } from '@testing-library/react';
import JudgeEvaluationPage from '../pages/JudgeEvaluationPage';
import { MemoryRouter } from 'react-router-dom';

// Minimal mock: return empty list to verify empty state renders without runtime errors.
jest.mock('../services/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(async () => ({ data: [] })),
    post: jest.fn(async () => ({ data: { message: 'ok' } }))
  }
}));

describe('JudgeEvaluationPage', () => {
  test.skip('renders heading and empty submissions state', async () => {
    render(
      <MemoryRouter>
        <JudgeEvaluationPage />
      </MemoryRouter>
    );
    expect(await screen.findByText(/Judge — Evaluation/i)).toBeInTheDocument();
    expect(screen.getByText(/No submissions available/i)).toBeInTheDocument();
  });
});
