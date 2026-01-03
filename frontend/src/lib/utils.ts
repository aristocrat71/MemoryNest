// Utility functions for MemoryNest

/**
 * Generates a random secret slug for board URLs
 * Format: word-word-word (easier to share and remember)
 */
export function generateSecretSlug(): string {
  const words = [
    'happy', 'sunny', 'bright', 'warm', 'gentle', 'sweet', 'calm', 'cozy',
    'peaceful', 'joyful', 'loving', 'tender', 'soft', 'light', 'pure',
    'dreamy', 'lovely', 'starry', 'golden', 'silver', 'ocean', 'river',
    'mountain', 'forest', 'garden', 'meadow', 'sunset', 'sunrise', 'moon',
    'cloud', 'sky', 'breeze', 'whisper', 'memory', 'moment', 'treasure'
  ];
  
  const randomWord = () => words[Math.floor(Math.random() * words.length)];
  const randomNum = Math.floor(Math.random() * 1000);
  
  return `${randomWord()}-${randomWord()}-${randomNum}`;
}

/**
 * Generates a random color for notes
 */
export function getRandomNoteColor(): string {
  const colors = [
    '#FEF3C7', // yellow
    '#DBEAFE', // blue
    '#FCE7F3', // pink
    '#D1FAE5', // green
    '#E0E7FF', // indigo
    '#FED7AA', // orange
    '#E9D5FF', // purple
    '#F3F4F6', // gray
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Clamps a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Gets the highest z-index from items array
 */
export function getMaxZIndex(items: { z_index: number }[]): number {
  if (items.length === 0) return 0;
  return Math.max(...items.map(item => item.z_index));
}

/**
 * Formats a date to a friendly string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}

/**
 * Extracts metadata from a URL (basic implementation)
 */
export async function getLinkMetadata(url: string): Promise<{
  title: string;
  description?: string;
  favicon?: string;
}> {
  try {
    // For MVP, just return the URL as title
    // In production, you'd want to use an API or server-side scraping
    const urlObj = new URL(url);
    return {
      title: urlObj.hostname,
      description: url,
      favicon: `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`
    };
  } catch {
    return {
      title: url,
      description: url
    };
  }
}
