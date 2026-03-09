// @vitest-environment jsdom
import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import { FiAlertTriangle } from 'react-icons/fi';
import SafeIcon from './SafeIcon';

expect.extend(matchers);

const CustomIcon = (props) => <svg data-testid="custom-icon" {...props} />;

describe('SafeIcon', () => {
  it('renders the provided icon component', () => {
    const { getByTestId } = render(<SafeIcon icon={CustomIcon} className="test-class" />);
    const icon = getByTestId('custom-icon');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('test-class');
  });

  it('renders the fallback icon (FiAlertTriangle) when icon prop is missing', () => {
    const { container } = render(<SafeIcon className="fallback-class" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('fallback-class');
    expect(svg.innerHTML).toContain('<path');
  });

  it('renders the fallback icon when icon prop is null', () => {
    const { container } = render(<SafeIcon icon={null} className="fallback-class-null" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('fallback-class-null');
    expect(svg.innerHTML).toContain('<path');
  });

  it('renders the fallback icon when icon prop is undefined', () => {
    const { container } = render(<SafeIcon icon={undefined} className="fallback-class-undefined" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('fallback-class-undefined');
    expect(svg.innerHTML).toContain('<path');
  });

  it('renders the fallback icon when icon prop is false', () => {
    const { container } = render(<SafeIcon icon={false} className="fallback-class-false" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('fallback-class-false');
    expect(svg.innerHTML).toContain('<path');
  });

  it('renders a string icon component (HTML element)', () => {
    const { container } = render(<SafeIcon icon="span" className="string-icon" />);
    const span = container.querySelector('span.string-icon');
    expect(span).toBeInTheDocument();
  });

  it('forwards all additional props to the custom icon component', () => {
    const { getAllByTestId } = render(
      <SafeIcon
        icon={CustomIcon}
        size={24}
        color="red"
        data-custom-attr="test-value"
      />
    );
    const icons = getAllByTestId('custom-icon');
    const icon = icons[icons.length - 1]; // get the one we just rendered
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('size', '24');
    expect(icon).toHaveAttribute('color', 'red');
    expect(icon).toHaveAttribute('data-custom-attr', 'test-value');
  });

  it('forwards all additional props to the fallback icon when icon is missing', () => {
    const { getByTestId } = render(
      <SafeIcon
        size={32}
        color="blue"
        data-testid="unique-fallback-icon"
        aria-label="Warning"
      />
    );
    const svg = getByTestId('unique-fallback-icon');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '32'); // react-icons maps size to width and height
    expect(svg).toHaveAttribute('height', '32');
    expect(svg).toHaveAttribute('color', 'blue');
    expect(svg).toHaveAttribute('data-testid', 'unique-fallback-icon');
    expect(svg).toHaveAttribute('aria-label', 'Warning');
  });

  it('throws an error when an invalid object is passed as the icon prop', () => {
    // Silence console.error for this expected error test to keep output clean
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // In React 18 / jsdom, jsdom will also fire 'error' events on window that log to console.
    // We prevent default so it doesn't log the uncaught exception to the test output.
    const errorHandler = (e) => e.preventDefault();
    window.addEventListener('error', errorHandler);

    class ErrorBoundary extends React.Component {
      constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
      }
      static getDerivedStateFromError(error) {
        return { hasError: true, error };
      }
      componentDidCatch(error, errorInfo) {}
      render() {
        if (this.state.hasError) {
          return <div data-testid="error-message">{this.state.error.message}</div>;
        }
        return this.props.children;
      }
    }

    // An invalid element type (like an empty object) will cause React.createElement to throw.
    // We catch it in an error boundary so Vitest doesn't consider it an unhandled exception.
    const { getByTestId } = render(
      <ErrorBoundary>
        <SafeIcon icon={{ invalid: 'object' }} />
      </ErrorBoundary>
    );

    expect(getByTestId('error-message')).toHaveTextContent(/is invalid/);

    window.removeEventListener('error', errorHandler);
    consoleErrorSpy.mockRestore();
  });

  it('renders a react-icons component correctly', () => {
    const { container } = render(<SafeIcon icon={FiAlertTriangle} className="real-icon" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('real-icon');
  });
});
