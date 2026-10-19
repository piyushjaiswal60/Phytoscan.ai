import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ImageUpload } from '../components/ImageUpload';

describe('ImageUpload Component', () => {
  const mockSetImage = vi.fn();
  const mockSetPreview = vi.fn();
  const mockSetError = vi.fn();

  const defaultProps = {
    image: null,
    setImage: mockSetImage,
    preview: null,
    setPreview: mockSetPreview,
    error: null,
    setError: mockSetError,
  };

  it('renders the upload label initially', () => {
    render(<ImageUpload {...defaultProps} />);
    expect(screen.getByText(/Click to upload or drag & drop/i)).toBeInTheDocument();
  });

  it('renders the preview image when preview prop is provided', () => {
    render(<ImageUpload {...defaultProps} preview="mock-url" />);
    expect(screen.getByAltText('Preview')).toBeInTheDocument();
    expect(screen.queryByText(/Click to upload or drag & drop/i)).not.toBeInTheDocument();
  });

  it('calls setImage and setPreview when a valid image is uploaded', async () => {
    render(<ImageUpload {...defaultProps} />);

    const file = new File(['(binary content)'], 'leaf.png', { type: 'image/png' });
    const input = screen.getByTestId('image-upload-input') as HTMLInputElement;

    fireEvent.change(input, {
      target: { files: [file] },
    });

    expect(mockSetImage).toHaveBeenCalledWith(file);
    expect(mockSetPreview).toHaveBeenCalled();
  });

  it('calls setError when an invalid file type is uploaded', async () => {
    render(<ImageUpload {...defaultProps} />);

    const file = new File(['hello world'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByTestId('image-upload-input') as HTMLInputElement;

    fireEvent.change(input, {
      target: { files: [file] },
    });

    expect(mockSetError).toHaveBeenCalledWith(expect.stringContaining('Invalid file type'));
  });

  it('calls setError when file size exceeds 5MB', async () => {
    render(<ImageUpload {...defaultProps} />);

    const largeFile = new File([new ArrayBuffer(6 * 1024 * 1024)], 'large.png', { type: 'image/png' });
    const input = screen.getByTestId('image-upload-input') as HTMLInputElement;

    fireEvent.change(input, {
      target: { files: [largeFile] },
    });

    expect(mockSetError).toHaveBeenCalledWith(expect.stringContaining('Image too large'));
  });
});