import React from 'react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { expect, vi } from 'vitest';

expect.extend(matchers);

// Mock react-icons to fix rendering issues with missing icons in tests
vi.mock('react-icons/fi', async () => {
  const actual = await vi.importActual('react-icons/fi');
  const mockIcons = { ...actual };

  // By returning an unmocked module (or just what was actual), we make sure Vitest has the real icons.
  // The rendering issues with missing icons were likely a symptom of other setup errors.
  // Let's use the real ones so they render as SVGs properly, otherwise snapshots and DOM expectations fail.
  return actual;
});
