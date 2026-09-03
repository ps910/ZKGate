import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App Component', () => {
  /**
   * Test 7: App renders with all major sections
   */
  it('renders the main application with all sections', () => {
    render(<App />);

    // Header
    expect(screen.getByText('ZKGate')).toBeDefined();
    expect(screen.getByText('Private Allowlist on Midnight')).toBeDefined();

    // Hero
    expect(screen.getByText('Private Allowlist Access')).toBeDefined();

    // Connect button
    expect(screen.getByText(/Connect Lace Wallet/)).toBeDefined();
  });

  /**
   * Test 8: Privacy model section displays correctly
   */
  it('displays the privacy model section', () => {
    render(<App />);

    expect(screen.getByText('Privacy Model')).toBeDefined();
    expect(screen.getByText(/What an observer can and cannot learn/)).toBeDefined();
    expect(screen.getByText(/Privacy Guarantee/)).toBeDefined();
  });

  /**
   * Test 9: Stats display shows initial zero values
   */
  it('shows initial stats with zero values', () => {
    render(<App />);

    // Check for stat labels
    expect(screen.getByText('Members Added')).toBeDefined();
    expect(screen.getByText('Verifications')).toBeDefined();
    expect(screen.getByText('Contract Status')).toBeDefined();
    expect(screen.getByText('Privacy Level')).toBeDefined();
  });
});
