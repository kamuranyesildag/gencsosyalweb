export function extractMentions(text: string | null | undefined): string[] {
  if (!text) return [];
  // Match @ followed by 3-30 word characters (letters, numbers, underscore)
  // Negative lookbehind (?<!\w) ensures it's not part of an email or word.
  // We use [a-zA-Z0-9_] directly since that's what the username validator uses.
  const regex = /(?<![a-zA-Z0-9_])@([a-zA-Z0-9_]{3,30})(?![a-zA-Z0-9_])/g;
  const matches = [...text.matchAll(regex)];
  const mentions = matches.map(m => m[1]);
  // deduplicate and limit to 10 mentions to prevent abuse
  const uniqueMentions = [...new Set(mentions)];
  return uniqueMentions.slice(0, 10);
}
