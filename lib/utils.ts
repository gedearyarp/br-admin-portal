import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatUrl(url: string): string {
  if (!url) return url
  
  // If the URL already starts with http:// or https://, return it as is
  if (url.match(/^https?:\/\//i)) {
    return url
  }
  
  // Otherwise, add https:// prefix
  return `https://${url}`
}
