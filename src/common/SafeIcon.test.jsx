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

  it('matches snapshot when rendering a custom icon', () => {
    const { asFragment } = render(<SafeIcon icon={CustomIcon} className="snapshot-custom" />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('matches snapshot when rendering the fallback icon', () => {
    const { asFragment } = render(<SafeIcon className="snapshot-fallback" />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders a React Class Component correctly', () => {
    class ClassIcon extends React.Component {
      render() {
        return <svg data-testid="class-icon" {...this.props} />;
      }
    }
    const { getByTestId } = render(<SafeIcon icon={ClassIcon} className="class-test" />);
    const icon = getByTestId('class-icon');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('class-test');
  });

  it('renders children correctly when passed', () => {
    const IconWithChildren = ({ children, ...props }) => (
      <svg data-testid="icon-with-children" {...props}>
        {children}
      </svg>
    );

    const { getByTestId, getByText } = render(
      <SafeIcon icon={IconWithChildren}>
        <title>Test Title</title>
      </SafeIcon>
    );

    const icon = getByTestId('icon-with-children');
    expect(icon).toBeInTheDocument();
    expect(getByText('Test Title')).toBeInTheDocument();
  });

  it('renders a React element directly passed as icon without crashing', () => {
    const ReactElementIcon = <svg data-testid="react-element-icon" />;
    const { getByTestId } = render(
      <SafeIcon icon={ReactElementIcon} className="added-class" />
    );
    const icon = getByTestId('react-element-icon');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('added-class');
  });

  it('merges props correctly when cloning a pre-instantiated React element', () => {
    const ReactElementIcon = <svg data-testid="react-element-icon-merge" className="original-class" fill="blue" />;
    const { getByTestId } = render(
      <SafeIcon icon={ReactElementIcon} className="added-class" fill="red" width="24" />
    );
    const icon = getByTestId('react-element-icon-merge');
    expect(icon).toBeInTheDocument();
    // React.cloneElement replaces primitive string props and merges className/style depending on implementation.
    // However, basic React.cloneElement simply overwrites `className` and `fill` with the new props.
    expect(icon).toHaveClass('added-class');
    expect(icon).not.toHaveClass('original-class'); // standard cloneElement overwrites className unless manually merged
    expect(icon).toHaveAttribute('fill', 'red');
    expect(icon).toHaveAttribute('width', '24');
  });

  it('renders the fallback icon when icon prop is an empty string', () => {
    const { container } = render(<SafeIcon icon="" className="fallback-class-empty-string" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('fallback-class-empty-string');
    expect(svg.innerHTML).toContain('<path');
  });

  it('renders the fallback icon when icon prop is 0 (falsy number)', () => {
    const { container } = render(<SafeIcon icon={0} className="fallback-class-zero" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('fallback-class-zero');
    expect(svg.innerHTML).toContain('<path');
  });

  it('handles rendering when passing an array of elements (should fallback or throw appropriately based on React element validity)', () => {
    // Suppress console.error if React warns about keys or invalid elements in certain contexts
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const errorHandler = (e) => e.preventDefault();
    window.addEventListener('error', errorHandler);

    class ErrorBoundary extends React.Component {
      constructor(props) {
        super(props);
        this.state = { hasError: false };
      }
      static getDerivedStateFromError() {
        return { hasError: true };
      }
      render() {
        if (this.state.hasError) {
          return <div data-testid="error-caught">Error caught</div>;
        }
        return this.props.children;
      }
    }

    // React.isValidElement([<div/>]) is false, so it falls through to React.createElement([<div/>], props),
    // which throws because an array is not a valid element type.
    const { getByTestId } = render(
      <ErrorBoundary>
        <SafeIcon icon={[<div key="1" />]} />
      </ErrorBoundary>
    );

    expect(getByTestId('error-caught')).toBeInTheDocument();

    window.removeEventListener('error', errorHandler);
    consoleErrorSpy.mockRestore();
  });
});
