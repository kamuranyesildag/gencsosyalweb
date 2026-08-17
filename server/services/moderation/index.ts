export type RiskLevel = 'SAFE' | 'LOW_RISK' | 'MEDIUM_RISK' | 'HIGH_RISK';
export type ModerationCategory = 
  | 'HATE_SPEECH' 
  | 'HARASSMENT' 
  | 'EXPLICIT_CONTENT' 
  | 'VIOLENCE' 
  | 'SPAM' 
  | 'SCAM' 
  | 'SELF_HARM'
  | 'SAFE';

export interface ModerationResult {
  riskLevel: RiskLevel;
  category: ModerationCategory;
  score: number;
  reason?: string;
}

// Basic heuristic moderation engine for demonstration
const KEYWORDS: Record<ModerationCategory, string[]> = {
  HATE_SPEECH: ['nefret', 'ırkçı', 'pislik', 'geber', 'aşağılık'],
  HARASSMENT: ['gerizekalı', 'aptal', 'salak', 'mal', 'beyinsiz', 'çirkin'],
  EXPLICIT_CONTENT: ['porno', 'çıplak', 'seks', 'nsfw', 'xxx'],
  VIOLENCE: ['öldür', 'kan', 'bıçakla', 'silah', 'vur', 'keserim', 'bombalar'],
  SPAM: ['tıkla', 'kazan', 'ücretsiz hediye', 'bedava para', 'linke git', 'bitcoin kazan', 'kripto yatırım', 'çekiliş'],
  SCAM: ['kredi kartsız', 'şifreni gönder', 'hesap çalma', 'hack', 'bedava iphone'],
  SELF_HARM: ['intihar', 'kendimi asacağım', 'yaşamak istemiyorum', 'kendime zarar', 'jilet'],
  SAFE: []
};

export async function moderateContent(text: string): Promise<ModerationResult> {
  if (!text) return { riskLevel: 'SAFE', category: 'SAFE', score: 0 };
  
  const lowerText = text.toLowerCase();
  let maxScore = 0;
  let topCategory: ModerationCategory = 'SAFE';
  
  for (const [category, words] of Object.entries(KEYWORDS)) {
    if (category === 'SAFE') continue;
    
    let matchCount = 0;
    for (const word of words) {
      // Create a regex to match the word as a whole word to reduce false positives
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      if (regex.test(lowerText) || lowerText.includes(word)) { // includes fallback for Turkish specific matching issues with \b
        matchCount++;
      }
    }
    
    if (matchCount > 0) {
      let score = matchCount * 0.4;
      if (score > 1) score = 1; // Normalize to 0-1
      
      if (score > maxScore) {
        maxScore = score;
        topCategory = category as ModerationCategory;
      }
    }
  }
  
  let riskLevel: RiskLevel = 'SAFE';
  if (maxScore >= 0.8) riskLevel = 'HIGH_RISK';
  else if (maxScore >= 0.5) riskLevel = 'MEDIUM_RISK';
  else if (maxScore > 0) riskLevel = 'LOW_RISK';
  
  return {
    riskLevel,
    category: topCategory,
    score: maxScore,
    reason: riskLevel !== 'SAFE' ? `Otomatik sistem tarafından '${topCategory}' kategorisinde değerlendirildi.` : undefined
  };
}
