import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App Component — ShroudWar Fog-of-War UI', () => {
  it('renders the ShroudWar title and Midnight Preprod status', () => {
    render(<App />);

    expect(screen.getByText('ShroudWar')).toBeDefined();
    expect(screen.getByText(/On-Chain Fog-of-War Strategy · Midnight Level 4/)).toBeDefined();
    expect(screen.getByText(/MIDNIGHT PREPROD/)).toBeDefined();
    expect(screen.getByText(/Connect Lace Wallet/)).toBeDefined();
  });

  it('renders the 10x10 Fog-of-War Board with legend and coordinates', () => {
    render(<App />);

    expect(screen.getByText(/10x10 Fog-of-War Grid/)).toBeDefined();
    expect(screen.getByText(/Preprod Circuit: 0x8b3f...5d4c/)).toBeDefined();
    expect(screen.getByText(/Own Unit \(Shielded\)/)).toBeDefined();
    expect(screen.getByText(/Radar Ping \(Disclosed\)/)).toBeDefined();
    expect(screen.getByText(/Deep Fog/)).toBeDefined();
  });

  it('renders the Tactical Command Center with Move, Scout, and Combat actions', () => {
    render(<App />);

    expect(screen.getByText(/Tactical Command Center/)).toBeDefined();
    expect(screen.getByText(/1. ZK Move/)).toBeDefined();
    expect(screen.getByText(/2. Scout Cell/)).toBeDefined();
    expect(screen.getByText(/3. Claim Combat/)).toBeDefined();
    expect(screen.getByText(/Response Window: 3 Actions/)).toBeDefined();
  });

  it('renders the ShroudWar privacy model showing public ledger vs private witness', () => {
    render(<App />);

    expect(screen.getByText(/Midnight Privacy Model: ShroudWar vs Dark Forest/)).toBeDefined();
    expect(screen.getByText(/Visible on Midnight Ledger/)).toBeDefined();
    expect(screen.getByText(/Shielded in Client Witness/)).toBeDefined();
    expect(screen.getByText(/Compiler-Enforced disclose\(\)/)).toBeDefined();
  });

  it('displays roster status and action counter for Preprod deadlines', () => {
    render(<App />);

    expect(screen.getByText(/Player A \(You\)/)).toBeDefined();
    expect(screen.getByText(/Player B \(Opponent\)/)).toBeDefined();
    expect(screen.getAllByText(/Action Counter/).length).toBeGreaterThan(0);
  });
});
