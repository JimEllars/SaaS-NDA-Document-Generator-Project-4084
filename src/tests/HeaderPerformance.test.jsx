// @vitest-environment jsdom
import { useState } from 'react';
import { render, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Header from '../components/Header';

// Mock SafeIcon to track renders
// Must be hoisted or use `vi.mock` which is hoisted automatically
vi.mock('../common/SafeIcon', () => {
  return {
    default: vi.fn(() => <div data-testid="safe-icon">Icon</div>)
  };
});

import SafeIcon from '../common/SafeIcon';

describe('Header Performance', () => {
  it('should not re-render when unrelated props change', () => {
    // Clear mock calls before test
    vi.clearAllMocks();

    function Parent() {
      const [count, setCount] = useState(0);
      // Simulate props that are structurally stable but referentially different
      const onClear = () => {};
      const onStartOver = () => {};

      return (
        <div>
          <button data-testid="increment" onClick={() => setCount(c => c + 1)}>Increment</button>
          <Header isPaid={false} onClear={onClear} onStartOver={onStartOver} />
        </div>
      );
    }

    const { getByTestId } = render(<Parent />);

    // Initial render: Header calls SafeIcon 2 times (Logo + Reset Button)
    expect(SafeIcon).toHaveBeenCalledTimes(2);

    // Trigger update
    act(() => {
        getByTestId('increment').click();
    });

    // If optimized, Header should not re-render, so SafeIcon should not be called again.
    // Total calls should remain 2.
    expect(SafeIcon).toHaveBeenCalledTimes(2);
  });
});
