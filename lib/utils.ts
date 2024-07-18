import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import keccak from 'keccak'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toChecksumAddress(address) {
  if (!address) {
    return address
  }

  let addy = address.toLowerCase().replace('0x', '')
  if (addy.length !== 40) {
    addy = addy.padStart(40, '0')
  }

  let hash = keccak('keccak256').update(addy as string).digest('hex')
  let ret = '0x'

  for (let i = 0; i < addy.length; i++) {
    if (parseInt(hash[i], 16) >= 8) {
      ret += addy[i].toUpperCase()
    } else {
      ret += addy[i]
    }
  }

  return ret
}
