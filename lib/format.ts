/**
 * Format a species name as proper binomial nomenclature:
 * "Abelmoschus Esculentus" → "Abelmoschus esculentus"
 * "curcuma_longa" → "Curcuma longa"
 * Only the genus (first word) is capitalized; all others are lowercase.
 */
export function formatSpeciesName(raw: string | null | undefined): string {
  if (!raw) return '';
  const cleaned = raw.replace(/_/g, ' ').trim();
  const words = cleaned.split(/\s+/);
  if (!words.length) return raw;
  return [
    words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase(),
    ...words.slice(1).map((w) => w.toLowerCase()),
  ].join(' ');
}
