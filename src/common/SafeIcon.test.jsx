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
});
