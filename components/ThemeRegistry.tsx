
"use client";
import React from "react";
import { createTheme, ThemeProvider, CssBaseline, PaletteMode } from "@mui/material";
import { ThemeToggle } from "@/components/ThemeToggle";

type Mode = "light" | "dark" | "night";

function getTheme(mode: Mode) {
  const base = (mode === "light") ? {
    palette: { mode: "light" as PaletteMode, background: { default: "#fafafa", paper: "#ffffff" }, text: { primary: "#222" } }
  } : (mode === "dark") ? {
    palette: { mode: "dark" as PaletteMode, background: { default: "#0d1117", paper: "#161b22" }, text: { primary: "#e6edf3" } }
  } : {
    palette: { mode: "dark" as PaletteMode, background: { default: "#0b0f14", paper: "#11161c" }, text: { primary: "#e0e6ee" }, secondary: { main: "#86a3c3" }, primary: { main: "#7fb2ff" } }
  };
  return createTheme({ shape: { borderRadius: 16 }, typography: { fontFamily: "Pretendard, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, Apple SD Gothic Neo, Noto Sans KR, sans-serif" }, ...base });
}

export function ThemeRegistry({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = React.useState<Mode>(() => (typeof window !== "undefined" ? (localStorage.getItem("theme-mode") as Mode) : "dark") || "dark");
  const theme = React.useMemo(() => getTheme(mode), [mode]);
  const onChange = (m: Mode) => { setMode(m); if (typeof window !== "undefined") localStorage.setItem("theme-mode", m); };
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div style={{ position: "fixed", top: 12, right: 12, zIndex: 1000 }}>
        <ThemeToggle mode={mode} onChange={onChange} />
      </div>
      {children}
    </ThemeProvider>
  );
}
