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
 * File   : SchemaDesignerLayout.ts
 * Author : Sesh Ragavachari
 * Date   : 2025-04-30
 * Version: 1.0
 * ------------------------------------------------------------------
 * Purpose
 *  Pure “layout shells” for `<SchemaDesigner>`—no business logic.
 *  Keeps flex/grid rules out of the component to make CSS concerns
 *  explicit and reusable.
 * ------------------------------------------------------------------ */

import styled from "styled-components";

/* design tokens --------------------------------------------------- */
export const GAP          = 16;   // spacing between columns (px)
export const JSON_PANEL_W = 480;  // width of RHS generated-schema pane (px)

/* root: full-height flex column ----------------------------------- */
export const Root = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

/* header row: holds section header(s) ----------------------------- */
export const HeaderRow = styled.div`
  display: flex;
  width: 100%;
`;

/* work area: editor + preview ------------------------------------ */
export const WorkRow = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  gap: ${GAP}px;
  padding: ${GAP}px;
`;

/* left column – field editor ------------------------------------- */
export const EditorCol = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0; /* allow internal scrolling */
`;

/* right column – live JSON preview ------------------------------- */
export const SideCol = styled.div`
  width: ${JSON_PANEL_W}px;
  border-left: 1px solid #ccc;
  display: flex;
  flex-direction: column;
  min-height: 0; /* code box can scroll */
`;
