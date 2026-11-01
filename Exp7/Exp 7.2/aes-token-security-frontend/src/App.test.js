import { render, screen } from '@testing-library/react';
import App from './App';

test('renders secure vault login form', () => {
  render(<App />);

  expect(screen.getByText(/secure token vault/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/enter username/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/enter password/i)).toBeInTheDocument();
});
