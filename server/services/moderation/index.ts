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

// Basic heuristic moderation engine
const KEYWORDS: Record<ModerationCategory, string[]> = {
  HATE_SPEECH: ['nefret', 'irkci', 'pislik', 'geber', 'asagilik', 'kopek', 'serefsiz', 'pic', 'o.c', 'orospu'],
  HARASSMENT: ['gerizekali', 'aptal', 'salak', 'mal', 'beyinsiz', 'cirkin', 'koyun', 'cahil'],
  EXPLICIT_CONTENT: ['porno', 'ciplak', 'seks', 'nsfw', 'xxx', 'escort', 'sik', 'amk', 'amcik', 'meme', 'yarak', 'sokuk'],
  VIOLENCE: ['oldur', 'kan', 'bicakla', 'silah', 'vur', 'keserim', 'bombalar', 'gebert', 'kanini'],
  SPAM: ['tikla', 'kazan', 'ucretsiz hediye', 'bedava para', 'linke git', 'bitcoin kazan', 'kripto yatirim', 'cekilis', 'kolay para', 'sende kazan'],
  SCAM: ['kredi kartsiz', 'sifreni gonder', 'hesap calma', 'hack', 'bedava iphone', 'tc kimlik'],
  SELF_HARM: ['intihar', 'kendimi asacagim', 'yasamak istemiyorum', 'kendime zarar', 'jilet', 'olmek istiyorum'],
  SAFE: []
};

// Map Turkish chars to ascii for robust matching

function cleanZalgoAndEvasion(text: string): string {
  // 1. Zalgo text (Combining Diacritical Marks)
  let cleaned = text.replace(/[\u0300-\u036f\u1dc0-\u1dff\u20d0-\u20ff\ufe20-\ufe2f]/g, '');
  // 2. Zero-width and invisible characters
  cleaned = cleaned.replace(/[\u200B-\u200D\uFEFF\u200E\u200F]/g, '');
  return cleaned;
}

function normalizeTurkish(text: string) {
  return text
    .toLocaleLowerCase('tr-TR')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');
}

export async function moderateContent(text: string): Promise<ModerationResult> {
  if (!text || text.trim() === '') return { riskLevel: 'SAFE', category: 'SAFE', score: 0 };
  
  // Anti-bypass normalizations
  let cleanedText = cleanZalgoAndEvasion(text);
  let normalizedText = normalizeTurkish(cleanedText)
    .replace(/[1!]/g, 'i')
    .replace(/@/g, 'a')
    .replace(/0/g, 'o')
    .replace(/3/g, 'e')
    // Remove repeated characters (e.g. piiiislik -> pislik)
    .replace(/(.)\1{2,}/g, '$1$1')
    // Replace punctuation with space to prevent bypass like p.i.s.l.i.k
    .replace(/[.,_*/\-\\+!?()\[\]{}|<>="':;]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const noSpaceText = normalizedText.replace(/\s+/g, '');
  
  let maxScore = 0;
  let topCategory: ModerationCategory = 'SAFE';
  
  for (const [category, words] of Object.entries(KEYWORDS)) {
    if (category === 'SAFE') continue;
    
    let matchCount = 0;
    for (const word of words) {
      // Whole word matching
      const regex = new RegExp(`(?:^|\\s)${word}(?:\\s|$)`, 'i');
      if (regex.test(normalizedText)) {
        matchCount += 1.0;
      } else if (word.length >= 5 && noSpaceText.includes(word)) {
        // Safe partial match for long words (catches spaced out words like p i s l i k)
        matchCount += 0.8;
      }
    }
    
    if (matchCount > 0) {
      let score = matchCount * 0.5; // Two matches = 1.0
      if (score > 1) score = 1;
      
      if (score > maxScore) {
        maxScore = score;
        topCategory = category as ModerationCategory;
      }
    }
  }

  // Spam detection heuristics
  const urls = text.match(/https?:\/\/[^\s]+/g) || [];
  if (urls.length > 2 && text.length < 200) {
    // Too many links for short text
    if (maxScore < 0.8) {
      maxScore = 0.8;
      topCategory = 'SPAM';
    }
  }

  // Repeated words/phrases spam
  const wordsList = normalizedText.split(' ');
  const uniqueWords = new Set(wordsList);
  if (wordsList.length > 10 && uniqueWords.size < wordsList.length * 0.3) {
    // 70% of words are repeated
    if (maxScore < 0.6) {
      maxScore = 0.6;
      topCategory = 'SPAM';
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
    reason: riskLevel !== 'SAFE' ? `Heuristic anahtar kelime motoru tarafından '${topCategory}' kategorisinde değerlendirildi. Not: Bu sistem basit metin eşleşmesi kullanır, yanlış pozitifler (false-positive) üretebilir ve kesin bir ihlal tespiti (enforcement) değildir, inceleme (review) amaçlıdır.` : undefined
  };
}
