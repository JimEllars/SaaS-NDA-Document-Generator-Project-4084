// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../App';
import * as matchers from '@testing-library/jest-dom/matchers';
expect.extend(matchers);

let renderCount = 0;

vi.mock('../components/NDAGeneratorForm', () => {
  const MockForm = (props) => {
    renderCount++;
    return (
      <div data-testid="mock-nda-form" data-rendercount={renderCount}>
        <button onClick={props.onPurchase} data-testid="mock-purchase">Purchase</button>
      </div>
    );
  };
  return {
    default: React.memo(MockForm)
  };
});

describe('App Render Optimization', () => {
  beforeEach(() => {
    renderCount = 0;
  });

  it('measures optimized re-renders', async () => {
    await act(async () => {
      render(<App />);
    });

    const initialRenderCount = renderCount;

    // Trigger something that changes state in App, like clicking Reset
    const startOverBtn = screen.getByText(/Reset/i);
    await act(async () => {
      fireEvent.click(startOverBtn);
    });

    const newRenderCount = renderCount;

    // Check if clicking close on checkout triggers a re-render
    const checkoutBtn = screen.getByTestId('mock-purchase');
    await act(async () => {
        fireEvent.click(checkoutBtn);
    });

    const checkoutRenderCount = renderCount;

    expect(newRenderCount).toBe(initialRenderCount);
    expect(checkoutRenderCount).toBe(newRenderCount);
  });
});
