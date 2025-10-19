
import dayjs from "dayjs";
import "dayjs/locale/ko";
import { NextResponse } from "next/server";
import { fetchDaumPopular, fetchNaverRanking, RawNews } from "@/lib/sources";
import { summarizeKR } from "@/lib/summarize";
import { extractEngagement } from "@/lib/engagement";
import { fetchText } from "@/lib/fetchText";

export const dynamic = "force-dynamic";

const W_VIEWS = Number(process.env.ENG_WEIGHT_VIEWS ?? 2);
const W_COMMENTS = Number(process.env.ENG_WEIGHT_COMMENTS ?? 3);

async function build(date: string){
  const srcPref = process.env.NEWS_SOURCE || "both";
  let raws: RawNews[] = [];

  try{ if (srcPref === "naver" || srcPref === "both"){ raws = raws.concat(await fetchNaverRanking(date)); } }catch{}
  try{ if (srcPref === "daum" || srcPref === "both" || raws.length===0){ raws = raws.concat(await fetchDaumPopular(date)); } }catch{}

  if (raws.length === 0){
    try{ raws = raws.concat(await fetchNaverRanking(dayjs().format("YYYYMMDD"))); }catch{}
    try{ raws = raws.concat(await fetchDaumPopular(dayjs().format("YYYYMMDD"))); }catch{}
  }

  const seen = new Set<string>();
  let uniq = raws.filter(x=>{
    const k = x.title;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  }).slice(0, 60);

  if (uniq.length === 0 && process.env.ALLOW_SAMPLE === "1"){
    uniq = [
      { title: "[샘플] 조회수 많은 기사 A", url: "https://news.naver.com/", source: "NAVER", rank: 1 },
      { title: "[샘플] 댓글 많은 기사 B", url: "https://news.daum.net/", source: "DAUM", rank: 2 },
      { title: "[샘플] 화제 기사 C", url: "https://news.naver.com/", source: "NAVER", rank: 3 }
    ];
  }

  const results: any[] = [];
  for (const item of uniq){
    try{
      const html = await fetchText(item.url, { headers: { "User-Agent": "Mozilla/5.0 KR-Daily-News-Highlights/0.1" } as any });
      const m = html.match(/<meta[^>]+name=[\"']description[\"'][^>]+content=[\"']([^\"']+)[\"']/i) ||
                html.match(/<meta[^>]+property=[\"']og:description[\"'][^>]+content=[\"']([^\"']+)[\"']/i);
      const desc = m ? m[1] : "";
      const summary = summarizeKR(desc || "");

      const eng = extractEngagement(html);
      const viewCount = eng.viewCount ?? 0;
      const commentCount = eng.commentCount ?? 0;
      const score = (viewCount * W_VIEWS) + (commentCount * W_COMMENTS) + (viewCount===0 && commentCount===0 ? Math.max(0, 100 - (item.rank ?? 100)) : 0);

      results.push({ ...item, summary, viewCount: eng.viewCount, commentCount: eng.commentCount, score });
    } catch {
      results.push({ ...item, score: Math.max(0, 100 - (item.rank ?? 100)) });
    }
  }

  results.sort((a,b)=> (b.score ?? 0) - (a.score ?? 0));
  return results;
}

export async function GET(){
  const now = dayjs().locale("ko");
  const dateStr = now.subtract(1, "day").format("YYYYMMDD");
  const data = await build(dateStr);
  return NextResponse.json({ date: dateStr, count: data.length, items: data });
}
