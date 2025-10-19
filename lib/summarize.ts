
export function summarizeKR(text: string, maxSentences = 2): string {
  if(!text) return "";
  const sentences = text.split(/(?<=[\.!\?]|[다요죠]\s)/).map(s=>s.trim()).filter(Boolean);
  if (sentences.length <= maxSentences) return sentences.join(" ");
  const scored = sentences.map((s,i)=>({s, score: (s.length/100) + Math.max(0, 1 - i*0.1)}));
  scored.sort((a,b)=>b.score-a.score);
  const selected = scored.slice(0, maxSentences).map(x=>x.s);
  return selected.join(" ");
}
