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
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 * ------------------------------------------------------------------
 * File   : LabelSidebarLayout.ts
 * Author : Sesh Ragavachari
 * Date   : 2025-04-30
 * Version: 1.0
 * ------------------------------------------------------------------
 * Purpose
 *  Flexbox-only layout helpers for the Explorer/LabelSidebar pane.
 *  Adds a small extra top-padding so the first tree row is visually
 *  separated from the panel edge.
 * ------------------------------------------------------------------ */

import styled from "styled-components";
import { SimpleTreeView as TreeView } from "@mui/x-tree-view/SimpleTreeView";

/* fixed sidebar width (px) --------------------------------------- */
export const SIDEBAR_W = 300;

/* outer container: vertical flex column -------------------------- */
export const SidebarContainer = styled.div`
  width: ${SIDEBAR_W}px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

/* tree wrapper: scrollable, with extra padding-top ---------------- */
export const TreeWrapper = styled(TreeView)`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 18px;
  padding-top: 20px; /* 14 px visual gap above first row (8 + 6) */
`;
