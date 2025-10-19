
import React from "react";
import { Container, Typography, Grid, Alert } from "@mui/material";
import { NewsCard, NewsItem } from "@/components/NewsCard";

async function getData(): Promise<{date:string; count:number; items:NewsItem[]}>{
  try{
    const res = await fetch(`/api/highlights`, { cache: "no-store" });
    if(!res.ok) return { date: "", count: 0, items: [] };
    const txt = await res.text();
    try { return JSON.parse(txt); } catch { return { date: "", count: 0, items: [] }; }
  }catch{
    return { date: "", count: 0, items: [] };
  }
}

export default async function Page(){
  const data = await getData();
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 800 }}>전날 하이라이트 뉴스</Typography>
      <Typography variant="body2" sx={{ mb: 3, opacity: 0.7 }}>집계일: {data.date || "수집 대기"} · 소스: NAVER/DAUM 인기뉴스</Typography>
      {data.count===0 && <Alert severity="info">현재 불러올 수 있는 하이라이트가 없습니다. 잠시 후 다시 시도해 주세요.</Alert>}
      <Grid container spacing={2}>
        {data.items?.map((it, idx)=> (
          <Grid item xs={12} key={idx}><NewsCard item={it}/></Grid>
        ))}
      </Grid>
    </Container>
  );
}
