
import { parse as parseCT } from "content-type";
import iconv from "iconv-lite";

export async function fetchText(url: string, init?: RequestInit): Promise<string> {
  const res = await fetch(url, init as any);
  const buf = Buffer.from(await res.arrayBuffer());

  let charset = "utf-8";
  const ct = res.headers.get("content-type");
  if (ct) {
    try {
      const parsed = parseCT(ct);
      const cs = (parsed.parameters?.charset || "").toLowerCase();
      if (cs) charset = cs;
    } catch {}
  }

  if (charset === "utf-8") {
    const head = buf.slice(0, 2048).toString("ascii").toLowerCase();
    if (head.includes("charset=euc-kr") || head.includes("charset=ks_c_5601-1987") || head.includes("charset=cp949")) {
      charset = "euc-kr";
    }
  }

  if (charset.includes("euc-kr") || charset.includes("ks_c_5601") || charset.includes("cp949")) {
    return iconv.decode(buf, "euc-kr");
  }
  return buf.toString("utf-8");
}
