import React from 'react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { expect, vi } from 'vitest';

expect.extend(matchers);

// Mock react-icons to fix rendering issues with missing icons in tests
vi.mock('react-icons/fi', async () => {
  const actual = await vi.importActual('react-icons/fi');
  const mockIcons = { ...actual };

  // Ensure we mock specific missing icons or just create a dynamic mock fallback
  const createMockIcon = (name) => (props) => <div data-testid={`mock-icon-${name}`} {...props} />;

  ['FiSearch', 'FiMessageSquare', 'FiBookOpen', 'FiShield', 'FiCpu', 'FiActivity', 'FiInfo', 'FiBriefcase', 'FiX', 'FiCheck', 'FiAlertCircle', 'FiLock', 'FiUnlock', 'FiRefreshCw', 'FiCalendar', 'FiAlertTriangle', 'FiArrowLeft', 'FiArrowRight'].forEach(name => {
      mockIcons[name] = createMockIcon(name);
  });

  return mockIcons;
});
