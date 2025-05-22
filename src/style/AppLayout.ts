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
 * File   : AppLayout.ts
 * Author : Sesh Ragavachari
 * Date   : 2025-04-30
 * Version: 1.0
 * ------------------------------------------------------------------
 * Purpose
 *  Top-level 3-column flex layout:
 *     • Explorer      (tree view)
 *     • Designer      (field editor)
 *     • Generated-Schema (JSON preview)
 *
 *  Percentages below **must add up to 100**.  They can be tweaked in
 *  one place without touching downstream components.
 * ------------------------------------------------------------------ */

import styled from "styled-components";

/* ------------------------------------------------------------------ */
/* Column widths – edit these three numbers so they sum to 100 (%)    */
/* ------------------------------------------------------------------ */
export const COL_EXPLORER = 20;
export const COL_DESIGNER = 45;
export const COL_SCHEMA   = 35;

/* ------------------------------------------------------------------ */
/* Outer wrapper: white-space around the whole app                    */
/* ------------------------------------------------------------------ */
export const Root = styled.div`
  height: 92vh;
  padding: 16px;
  display: flex;
  flex-direction: column;
`;

/* Page title + subtitle ------------------------------------------- */
export const Title = styled.h1`
  margin: 0 0 8px 4px;
  font-size: 1.3rem;
  font-weight: 600;
  font-family: inherit;
`;
export const SubTitle = styled.p`
  margin: 2px 0 12px 2px;
  font-size: 0.95rem;
  font-style: italic;
  color: #444;
`;

/* Grey frame around the workspace --------------------------------- */
export const Frame = styled.div`
  flex: 1;
  display: flex;
  min-height: 0; /* allow inner scrolling */
  border: 1px solid #ccc;
  border-radius: 4px;
`;

/* ------------------------------------------------------------------ */
/* Column shells                                                      */
/* ------------------------------------------------------------------ */
export const ExplorerCol = styled.div`
  flex: 0 0 ${COL_EXPLORER}%;
  max-width: ${COL_EXPLORER}%;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #ccc;
`;

export const DesignerCol = styled.div`
  flex: 0 0 ${COL_DESIGNER}%;
  max-width: ${COL_DESIGNER}%;
  min-width: 400px;            /* keep editor usable on small screens */
  display: flex;
  flex-direction: column;
  border-right: 1px solid #ccc;
`;

export const SchemaCol = styled.div`
  flex: 0 0 ${COL_SCHEMA}%;
  max-width: ${COL_SCHEMA}%;
  display: flex;
  flex-direction: column;
`;

/* Generic scroll helper used inside columns ----------------------- */
export const ScrollArea = styled.div`
  flex: 1;
  overflow: auto;
`;

/* ------------------------------------------------------------------ */
/* Optional “StructOut” branding banner                               */
/* ------------------------------------------------------------------ */
export const BrandWrap = styled.div`
  padding: 20px 0 12px;
  line-height: 1;
`;

export const BrandName = styled.h1`
  margin: 0;
  font-family: "Inter", sans-serif;
  font-weight: 600;
  font-size: 30px;
  letter-spacing: -0.5px;

  & > span {
    color: #2962ff;
  }
`;

export const TagLine = styled.p`
  margin: 4px 0 0;
  font-family: "Inter", sans-serif;
  font-weight: 500;
  font-size: 1rem;
  line-height: 1.65;
  letter-spacing: 0.25px;
  color: #64748b;
`;
