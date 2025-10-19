
"use client";
import React from "react";
import { ToggleButton, ToggleButtonGroup, Paper } from "@mui/material";
import NightlightRoundIcon from "@mui/icons-material/NightlightRound";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

export function ThemeToggle({ mode, onChange }: { mode: "light"|"dark"|"night"; onChange:(m:any)=>void }){
  return (
    <Paper elevation={6} sx={{ p: 0.5, borderRadius: 3 }}>
      <ToggleButtonGroup size="small" exclusive value={mode} onChange={(_,v)=>v&&onChange(v)}>
        <ToggleButton value="light" aria-label="라이트"><LightModeIcon fontSize="small"/></ToggleButton>
        <ToggleButton value="dark" aria-label="다크"><DarkModeIcon fontSize="small"/></ToggleButton>
        <ToggleButton value="night" aria-label="나이트"><NightlightRoundIcon fontSize="small"/></ToggleButton>
      </ToggleButtonGroup>
    </Paper>
  );
}
