import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

test('renders navigation after initial loading', async () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );
  // Wait for the loading placeholder to appear then disappear
  expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  await waitFor(() => {
    // Navbar brand should be present (alt text Hackathon Logo)
    const logo = screen.getByAltText(/Hackathon Logo/i);
    expect(logo).toBeInTheDocument();
  });
});
