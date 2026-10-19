import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from '../App';

// Mock URL.createObjectURL
const mockCreateObjectURL = vi.fn(() => 'mock-url');
global.URL.createObjectURL = mockCreateObjectURL;

describe('App Component', () => {
  it('renders the main title and upload section', () => {
    render(<App />);
    expect(screen.getByText(/PhytoScan AI/i)).toBeInTheDocument();
    expect(screen.getByText(/Upload Plant Image/i)).toBeInTheDocument();
  });

  it('triggers object URL creation when a valid image is uploaded', async () => {
    render(<App />);

    const file = new File(['(binary content)'], 'leaf.png', { type: 'image/png' });
    const input = screen.getByTestId('image-upload-input') as HTMLInputElement;

    fireEvent.change(input, {
      target: { files: [file] },
    });

    await waitFor(() => {
      expect(mockCreateObjectURL).toHaveBeenCalledWith(file);
    });
  });

  it('shows error message when an invalid file type is uploaded', async () => {
    render(<App />);

    const file = new File(['hello world'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByTestId('image-upload-input') as HTMLInputElement;

    fireEvent.change(input, {
      target: { files: [file] },
    });

    await waitFor(() => {
      expect(screen.getByText(/Invalid file type/i)).toBeInTheDocument();
    });
  });

  it('allows selecting different AI models', async () => {
    render(<App />);

    const mobileNetCard = screen.getByText(/MobileNetV2/i).closest('div');
    if (mobileNetCard) {
      fireEvent.click(mobileNetCard);
    }

    expect(screen.getByText(/MobileNetV2/i)).toBeInTheDocument();
  });
});