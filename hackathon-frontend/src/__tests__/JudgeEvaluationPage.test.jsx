import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

// Prepare mock submission and override API methods after importing real module.
const mockSubmission = {
  id: 101,
  team_id: 55,
  team_name: 'Team Nova',
  innovation_score: null,
  technical_score: null,
  presentation_score: null,
  comments: null,
  evaluation_id: null
};

import api from '../services/api';
import JudgeEvaluationPage from '../pages/JudgeEvaluationPage';

beforeEach(() => {
  api.get = jest.fn(async (route) => {
    if (route === '/judge/submissions') return { data: [mockSubmission] };
    return { data: [] };
  });
  api.post = jest.fn(async () => ({ data: { message: 'ok' } }));
});

// Minimal mock: return empty list to verify empty state renders without runtime errors.

describe('JudgeEvaluationPage', () => {
  test('renders a submission, allows entering scores and posts evaluation', async () => {

    render(
      <MemoryRouter>
        <JudgeEvaluationPage />
      </MemoryRouter>
    );

    // Heading should appear
  expect(await screen.findByText(/Judge .* Evaluation/)).toBeInTheDocument();

    // The mocked submission should render team name
    expect(screen.getByText(/Team Nova/)).toBeInTheDocument();

  // Collect inputs (number inputs act as spinbuttons role)
  const [innovationInput, technicalInput, presentationInput] = screen.getAllByRole('spinbutton');
  const commentsArea = screen.getByPlaceholderText(/Optional qualitative/i);

    await userEvent.clear(innovationInput);
    await userEvent.type(innovationInput, '8');
    await userEvent.clear(technicalInput);
    await userEvent.type(technicalInput, '7');
    await userEvent.clear(presentationInput);
    await userEvent.type(presentationInput, '9');
    await userEvent.type(commentsArea, 'Great work');

    const button = screen.getByRole('button', { name: /Submit Evaluation/i });
    await userEvent.click(button);

    // Assert POST called with numeric scores
    expect(api.post).toHaveBeenCalledTimes(1);
    const [route, body] = api.post.mock.calls[0];
    expect(route).toBe(`/judge/evaluate/${mockSubmission.id}`);
    expect(body).toMatchObject({
      innovation_score: 8,
      technical_score: 7,
      presentation_score: 9,
      comments: 'Great work'
    });
  });
});
