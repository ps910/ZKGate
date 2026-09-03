/**
 * ShroudWar Game & Midnight Network Configuration (Preprod)
 */

export const NETWORK_CONFIG = {
  networkId: (import.meta.env.VITE_MIDNIGHT_NETWORK as string) || 'preprod',
  indexerUrl:
    (import.meta.env.VITE_MIDNIGHT_INDEXER_URL as string) ||
    'https://indexer.preprod.midnight.network',
  nodeUrl:
    (import.meta.env.VITE_MIDNIGHT_NODE_URL as string) ||
    'https://rpc.preprod.midnight.network',
  proofServerUrl:
    (import.meta.env.VITE_MIDNIGHT_PROOF_SERVER_URL as string) ||
    'http://localhost:6300',
  contractAddress:
    (import.meta.env.VITE_CONTRACT_ADDRESS as string) ||
    '0x8b3f4c2e1a9d7e6c5b4a3f2e1d0c9b8a7f6e5d4c',
};

export const GAME_CONFIG = {
  gridSize: 10,
  unitsPerPlayer: 4,
  moveSpeed: 2, // Chebyshev max(dx, dy) <= 2
  combatRange: 1, // Adjacent including diagonal
  scoutWindow: 3, // Actions deadline
};
