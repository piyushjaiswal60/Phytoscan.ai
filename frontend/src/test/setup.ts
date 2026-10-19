import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock URL.createObjectURL because it's not implemented in jsdom
if (typeof window !== 'undefined') {
  window.URL.createObjectURL = vi.fn(() => 'mock-url');
  window.URL.revokeObjectURL = vi.fn();
}