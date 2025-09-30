export function generateLexoRank(after?: string, before?: string): string {
  // Minimal placeholder: increment after or use midpoint. For production, replace with true LexoRank.
  if (after && before) {
    return `${after}|${before}`; // deterministic between keys
  }
  if (after) {
    return `${after}0`;
  }
  if (before) {
    return `0|${before}`;
  }
  return '0|000000';
}
