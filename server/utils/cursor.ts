export function encodeCursor(createdAt: Date, id: number): string {
  return Buffer.from(`${createdAt.toISOString()}_${id}`).toString('base64');
}

export function decodeCursor(cursor: string): { createdAt: Date, id: number } | null {
  try {
    const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
    const [dateStr, idStr] = decoded.split('_');
    if (!dateStr || !idStr) return null;
    return { createdAt: new Date(dateStr), id: parseInt(idStr, 10) };
  } catch (e) {
    return null;
  }
}
