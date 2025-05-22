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
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
 * BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * ------------------------------------------------------------------
 * File   : GeneratedSchemaPanelLayout.ts
 * Author : Sesh Ragavachari
 * Date   : 2025-04-30
 * Version: 1.0
 * ------------------------------------------------------------------
 * Purpose
 *  Styled-components layout helpers for <GeneratedSchemaPanel>.  The
 *  right-hand column already has a 1-px border supplied by AppLayout,
 *  so no additional borders are applied here to avoid a double edge.
 * ------------------------------------------------------------------ */

import styled from "styled-components";

/* ------------------------------------------------------------------ */
/* Root container: full height, vertical flex                         */
/* ------------------------------------------------------------------ */
export const PanelRoot = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 0; /* allow flex item to shrink */
`;

/* ------------------------------------------------------------------ */
/* Provider row: dropdown + copy/download buttons                     */
/* ------------------------------------------------------------------ */
export const ProviderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  flex-shrink: 0;
`;

/* ------------------------------------------------------------------ */
/* Main body: code/JSON viewer                                        */
/*   NOTE: no border — SchemaCol already draws one                    */
/* ------------------------------------------------------------------ */
export const PanelBody = styled.div`
  flex: 1;
  display: flex;
  min-height: 0; /* inner <pre> can scroll */
`;

/* ------------------------------------------------------------------ */
/* Scrollable JSON / code area                                        */
/* ------------------------------------------------------------------ */
export const JsonArea = styled.div`
  flex: 1;
  overflow: auto;
  min-height: 0;
  padding: 0 12px 12px;
`;
