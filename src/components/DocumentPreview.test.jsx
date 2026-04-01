/** @vitest-environment jsdom */
import React from 'react';
import { render, screen, waitFor, cleanup, act, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
expect.extend(matchers);

import DocumentPreview from './DocumentPreview';
import { useToast } from '../context/ToastContext';
import { generatePlainText } from '../utils/documentGenerator';

// Mock dependencies
vi.mock('../common/SafeIcon', () => {
    return {
        default: ({ icon, title }) => <span data-testid="safe-icon" title={title}>{icon?.name || 'Icon'}</span>
    };
});

vi.mock('../context/ToastContext', () => ({
    useToast: vi.fn()
}));

vi.mock('../utils/documentGenerator', () => ({
    generatePlainText: vi.fn()
}));

describe('DocumentPreview', () => {
    const mockAddToast = vi.fn();

    const mockFormData = {
        type: 'mutual',
        disclosing: 'Alice',
        receiving: 'Bob',
    };

    const mockDocumentData = {
        title: 'Mutual Non-Disclosure Agreement',
        effectiveDate: '2023-01-01',
        intro: 'This is an intro.',
        sections: [
            {
                title: 'Article 1: Section',
                content: [
                    { type: 'paragraph', text: 'Paragraph text.' },
                    { type: 'list', number: '1.1', title: 'List Title', text: 'List text.' }
                ]
            }
        ]
    };

    let originalClipboard;
    let mockWriteText;

    beforeEach(() => {
        vi.clearAllMocks();
        cleanup();
        vi.mocked(useToast).mockReturnValue({ addToast: mockAddToast });
        vi.mocked(generatePlainText).mockReturnValue('Mocked plain text content');

        // Store original clipboard and mock it
        originalClipboard = navigator.clipboard;
        mockWriteText = vi.fn();

        // Define navigator.clipboard property
        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            writable: true,
            value: {
                writeText: mockWriteText,
            },
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
        cleanup();
        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            writable: true,
            value: originalClipboard,
        });
        vi.useRealTimers();
    });

    it('renders the document preview correctly', () => {
        render(<DocumentPreview formData={mockFormData} documentData={mockDocumentData} onDownload={vi.fn()} onEdit={vi.fn()} />);

        expect(screen.getByText('Payment Successful!')).toBeInTheDocument();
        expect(screen.getByText('Document Preview')).toBeInTheDocument();
        expect(screen.getByText('Mutual Non-Disclosure Agreement')).toBeInTheDocument();
        expect(screen.getByText('PARTY 1:')).toBeInTheDocument();
        expect(screen.getByText('PARTY 2:')).toBeInTheDocument();
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
        expect(screen.getByText('1.1. List Title')).toBeInTheDocument();
        expect(screen.getByText('List text.')).toBeInTheDocument();
    });

    it('renders standard NDA fields and empty party name fallbacks correctly', () => {
        const standardFormData = {
            type: 'standard',
            disclosing: '',
            receiving: '',
        };
        render(<DocumentPreview formData={standardFormData} documentData={mockDocumentData} onDownload={vi.fn()} onEdit={vi.fn()} />);

        expect(screen.getByText('DISCLOSING PARTY:')).toBeInTheDocument();
        expect(screen.getByText('RECEIVING PARTY:')).toBeInTheDocument();
        expect(screen.getAllByText('[Party Name]')).toHaveLength(2);
    });

    it('handles successful clipboard copy', async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        mockWriteText.mockReturnValue(Promise.resolve());

        render(<DocumentPreview formData={mockFormData} documentData={mockDocumentData} onDownload={vi.fn()} onEdit={vi.fn()} />);

        const copyButton = screen.getAllByTitle('Copy text to clipboard')[0];

        await act(async () => {
            fireEvent.click(copyButton);
        });

        expect(generatePlainText).toHaveBeenCalledWith(mockDocumentData, mockFormData);
        expect(mockWriteText).toHaveBeenCalledWith('Mocked plain text content');

        await waitFor(() => {
            expect(mockAddToast).toHaveBeenCalledWith('Text copied to clipboard', 'success');
        });

        // Check text change to COPIED
        expect(screen.getByText('COPIED')).toBeInTheDocument();

        // Advance timers to trigger setTimeout
        await act(async () => {
            vi.advanceTimersByTime(2500);
        });

        await waitFor(() => {
            expect(screen.getAllByText('COPY TEXT').length).toBeGreaterThan(0);
        });
    });

    it('handles error during clipboard copy (Promise rejection)', async () => {
        const mockError = new Error('Clipboard error');
        mockWriteText.mockReturnValue(Promise.reject(mockError));

        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        render(<DocumentPreview formData={mockFormData} documentData={mockDocumentData} onDownload={vi.fn()} onEdit={vi.fn()} />);

        const copyButton = screen.getAllByTitle('Copy text to clipboard')[0];

        await act(async () => {
            fireEvent.click(copyButton);
        });

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to copy: ', mockError);
            expect(mockAddToast).toHaveBeenCalledWith('Failed to copy to clipboard', 'error');
        });
    });

    it('handles missing clipboard API', async () => {
        // Cache original to restore later
        const cachedClipboard = navigator.clipboard;

        // Temporarily delete clipboard API
        delete navigator.clipboard;

        render(<DocumentPreview formData={mockFormData} documentData={mockDocumentData} onDownload={vi.fn()} onEdit={vi.fn()} />);

        const copyButton = screen.getAllByTitle('Copy text to clipboard')[0];

        await act(async () => {
            fireEvent.click(copyButton);
        });

        expect(mockAddToast).toHaveBeenCalledWith('Clipboard access not available', 'error');

        // Restore clipboard
        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            writable: true,
            value: cachedClipboard,
        });
    });
});
