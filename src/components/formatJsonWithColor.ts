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
 * File   : formatJsonWithColor.ts
 * Author : Sesh Ragavachari
 * Date   : 2025-04-30
 * Version: 1.0
 * ------------------------------------------------------------------
 * Purpose
 *  Returns a syntax-highlighted HTML string from a raw JSON string.
 *  Intended for quick, client-side previews where a full Prism/HLJS
 *  pipeline would be overkill.
 *
 *  Colour scheme
 *    • Keys          – #c5a5c5
 *    • String values – #8dc891
 *    • Booleans/null – #ffa07a
 *    • Numbers       – #f08d49
 * ------------------------------------------------------------------ */

/**
 * Converts a JSON string to an HTML string with inline-coloured spans.
 *
 * @param jsonStr Raw JSON (pretty-printed or minified)
 * @returns HTML string ready for `dangerouslySetInnerHTML`.
 */
export function formatJsonWithColor(jsonStr: string): string {
  if (!jsonStr.trim()) return "";

  return jsonStr
    /* keys vs. string values --------------------------------------- */
    .replace(
      /("(\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"(\s*:)?)/g,
      match =>
        /:$/.test(match)               // ends with “:”
          ? `<span style="color:#c5a5c5;">${match}</span>`
          : `<span style="color:#8dc891;">${match}</span>`,
    )
    /* booleans / null ---------------------------------------------- */
    .replace(
      /\b(true|false|null)\b/g,
      `<span style="color:#ffa07a;">$1</span>`,
    )
    /* numbers ------------------------------------------------------- */
    .replace(
      /\b\d+(\.\d+)?\b/g,
      `<span style="color:#f08d49;">$&</span>`,
    );
}
