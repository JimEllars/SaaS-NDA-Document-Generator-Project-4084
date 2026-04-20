/** @vitest-environment jsdom */
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import IntelligenceHub from './IntelligenceHub';
import { useVectorSearch } from '../hooks/useVectorSearch';

// Mock useVectorSearch hook
vi.mock('../hooks/useVectorSearch', () => ({
  useVectorSearch: vi.fn()
}));

describe('IntelligenceHub component', () => {
  const mockSearch = vi.fn();

  beforeEach(() => {
    useVectorSearch.mockReturnValue({
      search: mockSearch,
      results: [],
      isSearching: false,
      error: null
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders correctly with initial state', () => {
    render(<IntelligenceHub />);

    expect(screen.getByText(/Vector Intelligence Hub/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e.g., How did we resolve/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  it('updates input value on user typing', async () => {
    const user = userEvent.setup();
    render(<IntelligenceHub />);

    const input = screen.getByPlaceholderText(/e.g., How did we resolve/i);
    await user.type(input, 'Cloudflare');

    expect(input.value).toBe('Cloudflare');
  });

  it('calls search function on form submission', async () => {
    const user = userEvent.setup();
    render(<IntelligenceHub />);

    const input = screen.getByPlaceholderText(/e.g., How did we resolve/i);
    await user.type(input, 'Cloudflare');

    const searchButton = screen.getByRole('button', { name: /search/i });
    await user.click(searchButton);

    expect(mockSearch).toHaveBeenCalledWith('Cloudflare');
  });

  it('shows loading state when searching', () => {
    useVectorSearch.mockReturnValue({
      search: mockSearch,
      results: [],
      isSearching: true,
      error: null
    });

    render(<IntelligenceHub />);

    const searchButton = screen.getByRole('button', { name: /querying/i });
    expect(searchButton).toBeDisabled();
    expect(searchButton).toHaveTextContent(/querying/i);
  });

  it('renders search results correctly', () => {
    const mockResults = [
      {
        id: '1',
        type: 'Resolution',
        content: 'Fixed the cache spike',
        similarity: 0.95,
        timestamp: '2023-10-14T08:23:00Z'
      },
      {
        id: '2',
        type: 'Knowledge Base',
        content: 'API documentation updated',
        similarity: 0.88,
        timestamp: '2023-10-12T14:15:00Z'
      },
      {
        id: '3',
        type: 'Discussion',
        content: 'System architecture review',
        similarity: 0.75,
        timestamp: '2023-10-10T10:00:00Z'
      }
    ];

    useVectorSearch.mockReturnValue({
      search: mockSearch,
      results: mockResults,
      isSearching: false,
      error: null
    });

    render(<IntelligenceHub />);

    expect(screen.getByText('Semantic Matches')).toBeInTheDocument();
    expect(screen.getByText('Fixed the cache spike')).toBeInTheDocument();
    expect(screen.getByText('API documentation updated')).toBeInTheDocument();
    expect(screen.getByText('System architecture review')).toBeInTheDocument();
    expect(screen.getByText('Resolution')).toBeInTheDocument();
    expect(screen.getByText('Knowledge Base')).toBeInTheDocument();
    expect(screen.getByText('Discussion')).toBeInTheDocument();
    expect(screen.getByText('95%')).toBeInTheDocument();
    expect(screen.getByText('88%')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('displays error message when search fails', () => {
    useVectorSearch.mockReturnValue({
      search: mockSearch,
      results: [],
      isSearching: false,
      error: 'Network error occurred'
    });

    render(<IntelligenceHub />);

    expect(screen.getByText('Network error occurred')).toBeInTheDocument();
  });

  it('shows empty results message when no matches found', async () => {
    const user = userEvent.setup();
    useVectorSearch.mockReturnValue({
      search: mockSearch,
      results: [],
      isSearching: false,
      error: null
    });

    render(<IntelligenceHub />);

    const input = screen.getByPlaceholderText(/e.g., How did we resolve/i);
    await user.type(input, 'unmatched query');

    expect(screen.getByText(/No semantic matches found for your query/i)).toBeInTheDocument();
  });

  it('disables search button when query is empty or whitespace', async () => {
    const user = userEvent.setup();
    render(<IntelligenceHub />);

    const input = screen.getByPlaceholderText(/e.g., How did we resolve/i);
    const searchButton = screen.getByRole('button', { name: /search/i });

    expect(searchButton).toBeDisabled();

    await user.type(input, '   ');
    expect(searchButton).toBeDisabled();

    await user.clear(input);
    await user.type(input, 'valid query');
    expect(searchButton).not.toBeDisabled();
  });
});
