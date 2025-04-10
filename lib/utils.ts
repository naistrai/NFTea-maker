import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats an Ethereum address to a shortened version
 * Example: 0x1234567890123456789012345678901234567890 -> 0x1234...7890
 */
export function formatAddress(address: string | null): string {
  if (!address) return ""
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}
