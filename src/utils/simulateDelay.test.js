import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { simulateDelay } from './simulateDelay';

describe('simulateDelay', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should resolve after the specified delay', async () => {
    const promise = simulateDelay(1000);
    let resolved = false;

    promise.then(() => {
      resolved = true;
    });

    // Advance time by slightly less than the delay to ensure it hasn't resolved
    vi.advanceTimersByTime(999);
    await Promise.resolve(); // flush microtasks
    expect(resolved).toBe(false);

    // Advance time to meet the delay
    vi.advanceTimersByTime(1);
    await Promise.resolve(); // flush microtasks
    expect(resolved).toBe(true);
  });
});
