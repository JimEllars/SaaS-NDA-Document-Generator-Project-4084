// @vitest-environment jsdom
import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
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
});
