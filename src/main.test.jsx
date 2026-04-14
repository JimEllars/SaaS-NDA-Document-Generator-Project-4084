/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('react-dom/client', () => {
  const mockRender = vi.fn();
  return {
    createRoot: vi.fn(() => ({
      render: mockRender
    }))
  };
});

describe('main.jsx', () => {
  beforeEach(() => {
    vi.resetModules();
    document.body.innerHTML = '<div id="root"></div>';
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  it('renders App inside StrictMode', async () => {
    const { createRoot } = await import('react-dom/client');
    const React = await import('react');
    const { default: App } = await import('./App.jsx');

    await import('./main.jsx');

    expect(createRoot).toHaveBeenCalledWith(document.getElementById('root'));
    expect(createRoot).toHaveBeenCalledTimes(1);

    const mockRender = createRoot.mock.results[0].value.render;
    expect(mockRender).toHaveBeenCalledTimes(1);

    const renderArg = mockRender.mock.calls[0][0];
    expect(renderArg.type).toBe(React.StrictMode);
    expect(renderArg.props.children.type).toBe(App);
  });
});
