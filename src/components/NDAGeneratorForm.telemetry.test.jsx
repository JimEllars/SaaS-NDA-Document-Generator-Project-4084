import { render, screen, act, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import NDAGeneratorForm from './NDAGeneratorForm';
import { ToastProvider } from '../context/ToastContext';
import { MemoryRouter } from 'react-router-dom';

describe('Telemetry Queue Stress-Testing', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    global.fetch = vi.fn(() => Promise.resolve({ ok: true }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <ToastProvider>
          <NDAGeneratorForm
            formData={{ strictness: 'standard', industry: 'general', type: 'unilateral', includeReturn: false, includeNonSolicitation: false, disclosing: 'A', receiving: 'B', jurisdiction: 'Delaware', term: '3', effectiveDate: '2024-01-01' }}
            setFormData={vi.fn()}
            currentStep={1}
            setCurrentStep={vi.fn()}
            onPurchase={vi.fn()}
            isEditing={false}
            onUpdate={vi.fn()}
          />
        </ToastProvider>
      </MemoryRouter>
    );
  };

  it('buffers rapid sequential clicks and flushes as exactly one cohesive batch array payload after 10 seconds', async () => {
    renderComponent();

    const nextButton = screen.getByText(/Next Step/i);

    // Rapid sequential clicks
    fireEvent.click(nextButton); // Step 1 to 2
    fireEvent.click(nextButton); // Step 2 to 3

    // No fetch should have been called yet
    expect(global.fetch).not.toHaveBeenCalled();

    // Advance by 9 seconds
    act(() => {
      vi.advanceTimersByTime(9000);
    });

    expect(global.fetch).not.toHaveBeenCalled();

    // Advance to 10 seconds
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // flush telemetry
    expect(global.fetch).toHaveBeenCalledTimes(1);

    const callArgs = global.fetch.mock.calls[0];
    expect(callArgs[0]).toBe('/api/v1/telemetry/events');
    const payload = JSON.parse(callArgs[1].body);

    expect(payload.batch.length).toBe(2);
    expect(payload.batch[0].event).toBe('nda_step_1_completed');
    expect(payload.batch[1].event).toBe('nda_step_1_completed');
  });

  it('flushes immediately on beforeunload', async () => {
    renderComponent();

    const nextButton = screen.getByText(/Next Step/i);

    fireEvent.click(nextButton);

    expect(global.fetch).not.toHaveBeenCalled();

    // Trigger beforeunload
    const event = new Event('beforeunload');
    act(() => {
      window.dispatchEvent(event);
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const callArgs = global.fetch.mock.calls[0];
    const payload = JSON.parse(callArgs[1].body);
    expect(payload.batch.length).toBe(1);
    expect(payload.batch[0].event).toBe('nda_step_1_completed');
  });
});
