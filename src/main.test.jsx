/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as ReactDOMClient from 'react-dom/client';
import { StrictMode } from 'react';
import App from './App.jsx';

// Mock react-dom/client
vi.mock('react-dom/client', () => ({
  createRoot: vi.fn(() => ({ render: vi.fn() })),
}));

// Mock App component to simplify the render check
vi.mock('./App.jsx', () => ({
  default: () => <div>Mock App</div>,
}));

describe('main.jsx', () => {
  let rootElement;

  beforeEach(() => {
    // Reset module registry so main.jsx can be evaluated again
    vi.resetModules();

    // Setup DOM
    rootElement = document.createElement('div');
    rootElement.id = 'root';
    document.body.appendChild(rootElement);
  });

  afterEach(() => {
    // Cleanup DOM
    if (document.body.contains(rootElement)) {
      document.body.removeChild(rootElement);
    }
    vi.clearAllMocks();
  });

  it('renders the App component inside StrictMode into the root element', async () => {
    const mockRender = vi.fn();
    vi.mocked(ReactDOMClient.createRoot).mockReturnValue({ render: mockRender });

    // Import main.jsx to trigger the side effect
    await import('./main.jsx');

    expect(ReactDOMClient.createRoot).toHaveBeenCalledWith(rootElement);
    expect(mockRender).toHaveBeenCalledOnce();

    const renderCall = mockRender.mock.calls[0][0];
    expect(renderCall.type).toBe(StrictMode);
    expect(renderCall.props.children.type).toBe(App);
  });

  it('throws an error or handles gracefully if root element is missing', async () => {
     // Remove root element
     document.body.removeChild(rootElement);

     const mockRender = vi.fn();
     vi.mocked(ReactDOMClient.createRoot).mockReturnValue({ render: mockRender });

     await import('./main.jsx');

     expect(ReactDOMClient.createRoot).toHaveBeenCalledWith(null);
  });
});
