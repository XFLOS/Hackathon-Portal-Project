import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

test('renders app heading', () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );
  // App contains a hero title 'GUS Hackathon Portal'
  const heading = screen.getByText(/GUS Hackathon Portal/i);
  expect(heading).toBeInTheDocument();
});
