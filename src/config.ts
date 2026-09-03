/**
 * Network configuration for Midnight Network (Preprod / Preview / Local)
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
    '0x7c5cfc42b94a87e38a9d15c0e148281fa78bfa42',
};
