export function extractHashtags(text: string | null | undefined): string[] {
  if (!text) return [];
  // Match # followed by word characters or unicode word characters
  // \p{L} for letters, \p{N} for numbers, \p{M} for marks
  // Note: Node.js regex supports unicode property escapes with 'u' flag
  const regex = /#([\p{L}\p{N}\p{M}_]+)/gu;
  const matches = [...text.matchAll(regex)];
  const tags = matches.map(m => m[1]);
  // deduplicate and limit to 20
  const uniqueTags = [...new Set(tags)];
  return uniqueTags.slice(0, 20).filter(t => t.length <= 50);
}

export function normalizeHashtag(tag: string): string {
  return tag.toLocaleLowerCase('tr-TR');
}
