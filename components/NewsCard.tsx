
"use client";
import * as React from "react";
import { Card, CardContent, CardHeader, Chip, Stack, Typography, Link as MLink, CardActions, Button } from "@mui/material";

export type NewsItem = {
  title: string;
  url: string;
  source: string;
  category?: string;
  summary?: string;
  rank?: number;
  publishedAt?: string;
  thumbnail?: string;
  viewCount?: number;
  commentCount?: number;
  score?: number;
};

export function NewsCard({ item }: { item: NewsItem }){
  return (
    <Card sx={{ borderRadius: 3, overflow: "hidden" }} variant="outlined">
      <CardHeader
        title={<MLink href={item.url} target="_blank" rel="noopener noreferrer">{item.title}</MLink>}
        subheader={<Stack direction="row" spacing={1} alignItems="center">
          {item.rank ? <Chip size="small" label={`#${item.rank}`} /> : null}
          {item.category ? <Chip size="small" label={item.category} /> : null}
          {typeof item.viewCount === 'number' ? <Chip size="small" label={`조회 ${item.viewCount.toLocaleString()}`}/> : null}
          {typeof item.commentCount === 'number' ? <Chip size="small" label={`댓글 ${item.commentCount.toLocaleString()}`}/> : null}
          <Typography variant="body2" color="text.secondary">{item.source}</Typography>
          {item.publishedAt ? <Typography variant="body2" color="text.secondary">· {item.publishedAt}</Typography> : null}
        </Stack>}
      />
      <CardContent>
        <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>{item.summary || "요약 생성 중..."}</Typography>
      </CardContent>
      <CardActions>
        <Button href={item.url} target="_blank" rel="noopener noreferrer">원문 보기</Button>
      </CardActions>
    </Card>
  );
}
