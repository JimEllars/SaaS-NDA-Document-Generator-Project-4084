/** @vitest-environment jsdom */
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import ErrorBoundary from './ErrorBoundary';

expect.extend(matchers);

const ProblemChild = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div data-testid="safe-child">I am a safe child component</div>;
};

const preventError = (e) => e.preventDefault();

describe('ErrorBoundary Component', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
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
        <ProblemChild />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('safe-child')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('should render the fallback UI when a child throws an error', () => {
    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/We encountered an unexpected error/i)).toBeInTheDocument();
    expect(console.error).toHaveBeenCalled();
  });

  it('should display error details in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Error: Test error/)).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('should not display error details in production mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.queryByText(/Error: Test error/)).not.toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('should reload the page when the refresh button is clicked', async () => {
    const user = userEvent.setup();
    const originalLocation = window.location;

    // Mock window.location.reload
    delete window.location;
    window.location = { ...originalLocation, reload: vi.fn() };

    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    );

    const refreshButton = screen.getByRole('button', { name: /Refresh Page/i });
    await user.click(refreshButton);

    expect(window.location.reload).toHaveBeenCalledTimes(1);

    window.location = originalLocation;
  });
});
