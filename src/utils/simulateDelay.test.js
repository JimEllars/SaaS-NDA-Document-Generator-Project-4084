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
    const delayMs = 1000;
    const promise = simulateDelay(delayMs);

    // Advance the timers by exactly the delay amount
    vi.advanceTimersByTime(delayMs);

    // Ensure the promise resolves
    await expect(promise).resolves.toBeUndefined();
  });
});
