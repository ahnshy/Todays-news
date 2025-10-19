
import * as cheerio from "cheerio";
import { fetchText } from "@/lib/fetchText";

export type RawNews = { title: string; url: string; source: string; category?: string; rank?: number; };

const UA = { headers: { "User-Agent": "Mozilla/5.0 KR-Daily-News-Highlights/0.1 (+https://example.com)" } } as any;

function abs(base: string, href: string): string {
  if (!href) return base;
  try { return href.startsWith("http") ? href : new URL(href, base).toString(); } catch { return href; }
}

export async function fetchDaumPopular(_dateStr: string): Promise<RawNews[]>{
  const url = "https://news.daum.net/ranking/popular";
  const html = await fetchText(url, UA);
  const $ = cheerio.load(html);
  const items: RawNews[] = [];
  $(".list_news2 .cont_thumb").each((i,el)=>{
    const a = $(el).find("a.link_txt");
    const t = a.text().trim();
    const href = a.attr("href") || "";
    const press = $(el).find(".info_news .link_cp").text().trim() || "Daum";
    if (t && href) items.push({ title: t, url: abs(url, href), source: press, category: "종합", rank: i+1 });
  });
  return items.slice(0, 30);
}

export async function fetchNaverRanking(dateStr: string): Promise<RawNews[]>{
  const url = `https://news.naver.com/main/ranking/popularDay.naver?date=${dateStr}`;
  const html = await fetchText(url, UA);
  const $ = cheerio.load(html);
  const items: RawNews[] = [];
  $(".rankingnews_box").each((_i, box)=>{
    const press = $(box).find(".rankingnews_name").text().trim() || "NAVER";
    $(box).find("li a").each((j, a)=>{
      const t = $(a).text().trim();
      const href = $(a).attr("href") || "";
      if (t && href) {
        const u = href.startsWith("http") ? href : `https://news.naver.com${href}`;
        items.push({ title: t, url: u, source: press, rank: j+1 });
      }
    });
  });
  return items.slice(0, 50);
}
