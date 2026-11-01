import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('renders Exp 1.2 by default with title and controls', () => {
  render(<App />);
  const titleElement = screen.getByText(/Social Media Post Composer/i);
  expect(titleElement).toBeInTheDocument();
  expect(screen.getByText(/Characters: 0 \/ 280/i)).toBeInTheDocument();
  expect(screen.getByText(/Ready to post/i)).toBeInTheDocument();
});

test('switches to Exp 1.1 when tab clicked', () => {
  render(<App />);
  const exp11Tab = screen.getByText(/Exp 1.1 \(Basic Composer\)/i);
  fireEvent.click(exp11Tab);

  const basicTitle = screen.getByRole('heading', { level: 1, name: 'Post Composer' });
  expect(basicTitle).toBeInTheDocument();
});

test('handles post typing and character limits', () => {
  render(<App />);
  const textarea = screen.getByPlaceholderText(/Type your post here.../i);
  fireEvent.change(textarea, { target: { value: 'Hello Twitter!' } });

  expect(screen.getByText(/Characters: 14 \/ 280/i)).toBeInTheDocument();
});

test('adds and deletes a draft in Exp 1.2', () => {
  render(<App />);
  const textarea = screen.getByPlaceholderText(/Type your post here.../i);
  fireEvent.change(textarea, { target: { value: 'Draft test content' } });

  const saveBtn = screen.getByRole('button', { name: /Save Draft/i });
  fireEvent.click(saveBtn);

  expect(screen.getByText('Draft test content')).toBeInTheDocument();

  const deleteBtn = screen.getByRole('button', { name: /Delete/i });
  fireEvent.click(deleteBtn);

  expect(screen.queryByText('Draft test content')).not.toBeInTheDocument();
});
