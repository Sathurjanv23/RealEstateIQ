const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Resolves an image URL:
 * - If it's a Cloudinary or full HTTPS URL, returns as-is
 * - If it's a local disk upload (/uploads/...), prepends backend API URL
 * - Fallbacks safely
 */
export function resolveImageUrl(
  url: string | null | undefined,
  fallback = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'
): string {
  if (!url) return fallback;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/uploads')) {
    return `${API_URL}${url}`;
  }
  return url;
}
