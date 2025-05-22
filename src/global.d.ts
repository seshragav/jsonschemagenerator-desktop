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
 * File   : global.d.ts
 * Author : Sesh Ragavachari
 * Date   : 2025-04-30
 * Version: 1.0
 * ------------------------------------------------------------------
 * Purpose
 *  Application-wide TypeScript augmentations and module shims for
 *  libraries that ship without their own type declarations.
 * ------------------------------------------------------------------ */

/* ----- Un-typed third-party ESM packages ---------------------------- */
declare module "leo-profanity";
declare module "react-simple-maps";
declare module "react-syntax-highlighter/dist/esm/styles/prism";

/* ----- Vite client types & raw-loader helper ----------------------- */
/// <reference types="vite/client" />

declare module "*.txt?raw" {
  const txt: string;
  export default txt;
}

/* ----- Augment Vite’s ImportMeta with glob helpers ----------------- */
interface ImportMeta {
  glob<T = unknown>(
    pattern: string,
    options?: { eager?: boolean },
  ): Record<string, T>;
}
