// @vitest-environment jsdom

import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import ErrorBoundary from '../components/ErrorBoundary';

expect.extend(matchers);

// A simple component that throws an error for testing
const ProblemChild = () => {
  throw new Error('Test error');
};

const preventError = (e) => e.preventDefault();

describe('ErrorBoundary Component', () => {
  beforeEach(() => {
    // Suppress console.error during tests to keep output clean
    vi.spyOn(console, 'error').mockImplementation(() => {});

    // In JSDOM/React 18, also attach this to prevent global error event from polluting
    window.addEventListener('error', preventError);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    window.removeEventListener('error', preventError);
  });

  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div data-testid="safe-child">I am a safe child component</div>
      </ErrorBoundary>
    );

    expect(screen.getByTestId('safe-child')).toBeInTheDocument();
    expect(screen.getByText('I am a safe child component')).toBeInTheDocument();
  });

  it('should render the fallback UI when a child throws an error', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );

    // Ensure the fallback UI is displayed
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(
      screen.getByText(/We encountered an unexpected error/i)
    ).toBeInTheDocument();

    // Verify the error text is rendered in development mode (which is default for tests)
    expect(screen.getByText(/Error: Test error/)).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('should reload the page when the refresh button is clicked', async () => {
    const user = userEvent.setup();

    // Mock window.location.reload
    const originalLocation = window.location;
    delete window.location;
    window.location = { reload: vi.fn() };

    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );

    const refreshButton = screen.getByRole('button', { name: /Refresh Page/i });
    expect(refreshButton).toBeInTheDocument();

    await user.click(refreshButton);

    expect(window.location.reload).toHaveBeenCalledTimes(1);

    // Restore window.location
    window.location = originalLocation;
  });
});
