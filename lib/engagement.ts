
export type Engagement = { viewCount?: number; commentCount?: number };

function pickMax(nums: Array<number | undefined>): number | undefined {
  const arr = nums.filter((n): n is number => typeof n === "number" && Number.isFinite(n));
  if (arr.length === 0) return undefined;
  return Math.max(...arr);
}

export function extractEngagement(html: string): Engagement {
  const out: Engagement = {};

  // JSON-LD
  const jsonLds = Array.from(html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)).map(m=>m[1]);
  const jsonViews: number[] = [];
  const jsonComments: number[] = [];
  for (const block of jsonLds) {
    try {
      const candidates = block.trim().startsWith("[") ? JSON.parse(block) : [JSON.parse(block)];
      for (const c of candidates) {
        const stats = c.interactionStatistic || c.interactionCount || [];
        const arr = Array.isArray(stats) ? stats : [stats];
        for (const s of arr) {
          const itype = (s.interactionType && (s.interactionType['@type'] || s.interactionType) || "").toString().toLowerCase();
          const name = (s.name || "").toString().toLowerCase();
          const count = Number(s.userInteractionCount ?? s.interactionCount ?? s.userComments ?? s.userCommentsCount ?? s.commentCount);
          if (!Number.isFinite(count)) continue;
          if (itype.includes("comment") || name.includes("comment")) jsonComments.push(count);
          if (itype.includes("view") || name.includes("view") || name.includes("read")) jsonViews.push(count);
        }
        if (typeof c.commentCount === "number") jsonComments.push(c.commentCount);
        if (typeof c.commentsCount === "number") jsonComments.push(c.commentsCount);
        if (typeof c.viewCount === "number") jsonViews.push(c.viewCount);
        if (typeof c.views === "number") jsonViews.push(c.views);
      }
    } catch {}
  }

  // Meta tags
  const metaComment = Array.from(html.matchAll(/<meta[^>]+(?:name|property)=["'](?:og:comments|article:comment_count|commentCount)["'][^>]+content=["'](\d+)["']/gi)).map(m=>Number(m[1]));
  const metaViews = Array.from(html.matchAll(/<meta[^>]+(?:name|property)=["'](?:og:views|article:view_count|viewCount)["'][^>]+content=["'](\d+)["']/gi)).map(m=>Number(m[1]));

  // Inline labels
  const labelComments = Array.from(html.matchAll(/(?:댓글|코멘트|리플)[^\d]{0,10}(\d{1,6})/gi)).map(m=>Number(m[1]));
  const labelViews = Array.from(html.matchAll(/(?:조회수|열람|읽음)[^\d]{0,10}(\d{1,9})/gi)).map(m=>Number(m[1]));

  out.commentCount = pickMax([...jsonComments, ...metaComment, ...labelComments]);
  out.viewCount = pickMax([...jsonViews, ...metaViews, ...labelViews]);
  return out;
}
