import { BOT_CHAIN_EXPLORER } from './botChainConfig';

/**
 * Truncates an Ethereum address to format 0x1234...abcd
 */
export function truncateAddress(address) {
  if (!address) return '';
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Validates whether a string is a valid Ethereum/EVM hex address
 */
export function isValidAddress(address) {
  if (!address || typeof address !== 'string') return false;
  return /^0x[a-fA-F0-9]{40}$/.test(address.trim());
}

/**
 * Formats a Unix timestamp (seconds) into a readable date string
 */
export function formatTimestamp(timestamp) {
  if (!timestamp || Number(timestamp) === 0) return 'Never / Revoked';
  const num = Number(timestamp);
  // If timestamp is max uint256 or extremely far in future, treat as Permanent
  if (num > 10000000000 || num === 0) {
    return 'Permanent (No Expiry)';
  }
  return new Date(num * 1000).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Returns humanized remaining time or expired status
 */
export function formatRemainingTime(timestamp) {
  if (!timestamp || Number(timestamp) === 0) return 'Revoked';
  const num = Number(timestamp);
  if (num > 10000000000) return 'Permanent';

  const now = Math.floor(Date.now() / 1000);
  const diff = num - now;

  if (diff <= 0) return 'Expired';

  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
}

/**
 * Explorer links
 */
export function getExplorerAddressUrl(address) {
  return `${BOT_CHAIN_EXPLORER}/address/${address}`;
}

export function getExplorerTxUrl(txHash) {
  return `${BOT_CHAIN_EXPLORER}/tx/${txHash}`;
}

