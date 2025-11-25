import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import JudgeSchedulePage from '../pages/JudgeSchedulePage';
import api from '../services/api';

// Mock now during first slot
const FIXED_NOW = new Date('2025-11-21T10:05:00Z').getTime();
const RealDateNow = Date.now;

beforeAll(()=>{
  Date.now = () => FIXED_NOW; // override for component's interval comparisons
});
afterAll(()=>{ Date.now = RealDateNow; });

beforeEach(()=>{
  // Presentations aggregate event 10:00-14:00 local time
  api.get = jest.fn(async (route) => {
    if (route === '/users/schedule') {
      return { data: [
        { id: 1, event_name: 'Opening Ceremony', description: '', start_time: '2025-11-20T09:00:00Z', end_time: '2025-11-20T10:00:00Z', location: 'Main' },
        { id: 7, event_name: 'Presentations & Judging', description: 'Teams present (10 min each)', start_time: '2025-11-21T10:00:00Z', end_time: '2025-11-21T14:00:00Z', location: 'Auditorium' }
      ]};
    }
    if (route === '/judge/assignments/me') {
      return { data: [
        { team_id: 1, team_name: 'Team Phoenix', submission_id: 101 },
        { team_id: 2, team_name: 'Team Dragons', submission_id: 102 }
      ]};
    }
    return { data: [] };
  });
});

describe('JudgeSchedulePage', () => {
  test('renders derived slots and highlights current live slot', async () => {
    render(<MemoryRouter><JudgeSchedulePage /></MemoryRouter>);

    // Wait for heading
    expect(await screen.findByText(/Judge — Presentation Schedule/i)).toBeInTheDocument();

    // Should default to showMine true (derived slots) after loading
    expect(await screen.findByText(/Team Phoenix/)).toBeInTheDocument();
    expect(screen.getByText(/Team Dragons/)).toBeInTheDocument();

    // Live slot badge for first slot (Team Phoenix) because time 10:05 is within 10:00-10:10
    const liveBadges = screen.getAllByText(/Live Slot/i);
    // One appears in subtitle, one in actual badge; filter to find the badge span
    const badge = liveBadges.find(el => el.tagName === 'SPAN');
    expect(badge).toBeInTheDocument();

    // Switch to all events view
    const allEventsBtn = screen.getByRole('button', { name: /All Events/i });
    await userEvent.click(allEventsBtn);
    expect(screen.getByText(/Presentations & Judging/)).toBeInTheDocument();
  });
});
