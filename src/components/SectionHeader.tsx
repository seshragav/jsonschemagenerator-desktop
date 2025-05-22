/* ------------------------------------------------------------------
 * MIT License
 * Copyright (c) 2025  Sesh Ragavachari
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the “Software”), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify,
 * merge, publish, distribute, sublicense, and/or sell copies of the
 * Software, and to permit persons to whom the Software is furnished
 * to do so, subject to the following conditions:
 *
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF, OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 * ------------------------------------------------------------------
 * File   : SectionHeader.tsx
 * Author : Sesh Ragavachari
 * Date   : 2025-04-30
 * Version: 1.0
 * ------------------------------------------------------------------
 * Purpose
 *  Re-usable slate-grey column header bar.  Always stretches to the
 *  full width of its parent flex column and optionally renders a
 *  right-hand element (icon, button, select, etc.).
 * ------------------------------------------------------------------ */

import React from "react";
import { Box, Typography } from "@mui/material";

/* design tokens – edit once to propagate across the UI */
export const SECTION_BAR_HEIGHT = 40;           // px
const SECTION_BAR_BG            = "#566071";    // slate-700

interface Props {
  title : string;
  /** Optional right-hand element (icon, menu, <Select>, …) */
  right?: React.ReactNode;
}

const SectionHeader: React.FC<Props> = ({ title, right }) => (
  <Box
    sx={{
      width: "100%",
      boxSizing: "border-box",
      height: SECTION_BAR_HEIGHT,
      px: 2,
      bgcolor: SECTION_BAR_BG,
      color: "common.white",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexShrink: 0,        // prevent shrink in flex layouts
    }}
  >
    <Typography
      variant="subtitle2"
      sx={{ fontSize: 14, fontWeight: 600, lineHeight: 1 }}
    >
      {title}
    </Typography>
    {right}
  </Box>
);

export default SectionHeader;
