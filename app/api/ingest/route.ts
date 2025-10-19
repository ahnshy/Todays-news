
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request){
  const url = new URL(req.url);
  const sec = process.env.CRON_SECRET;
  const given = url.searchParams.get("secret");
  if (sec && given !== sec) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const res = await fetch(new URL("/api/highlights", url).toString(), { cache: "no-store" });
  const json = await res.json();
  return NextResponse.json({ ok: true, refreshed: json?.count ?? 0 });
}
