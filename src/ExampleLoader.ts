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
 * File   : ExampleLoader.ts
 * Author : Sesh Ragavachari
 * Date   : 2025-04-30
 * Version: 1.0
 * ------------------------------------------------------------------
 * Purpose
 *  Centralised registry for all static “example” assets bundled at
 *  build-time: schema JSON, sample AI output, sample LLM content, and
 *  (optionally) fully-fledged demo React apps.
 *
 *  When adding a new example:
 *    1. Drop files into /src/examples/…            (schema JSON)
 *    2. Drop assets into /src/examples/assets/…    (output / content)
 *    3. Optionally add a React app under …/app/…   (index.tsx entry)
 *    4. Import them below and extend the constant maps.
 * ------------------------------------------------------------------ */

/* === 1) example schema JSON ======================================== */
import tenQSchema   from "./examples/10q.json";
import helloSchema  from "./examples/helloworld.json";
import labSchema    from "./examples/labresults.json";

/* === 2) bundled “AI output” JSON =================================== */
import tenQOutput   from "./examples/assets/10q/10q_output.json";
import helloOutput  from "./examples/assets/helloworld/helloworld_output.json";
import labOutput    from "./examples/assets/labresults/labresults_output.json";

/* === 3) bundled “LLM content” TXT ( ?raw → plain string) =========== */
import tenQContent  from "./examples/assets/10q/10q_content.txt?raw";
import helloContent from "./examples/assets/helloworld/helloworld_content.txt?raw";
import labContent   from "./examples/assets/labresults/labresults_content.txt?raw";

/* === 4) optional demo React-app importers (lazy) =================== */
const helloAppImporter = () =>
  import("./examples/assets/helloworld/app/index.tsx");

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */
export const schemaFiles = {
  "10q"       : tenQSchema,
  helloworld  : helloSchema,
  labresults  : labSchema,
} as const;

export const outputFiles = {
  "10q"       : tenQOutput,
  helloworld  : helloOutput,
  labresults  : labOutput,
} as const;

export const contentFiles = {
  "10q"       : tenQContent,
  helloworld  : helloContent,
  labresults  : labContent,
} as const;

/** Only examples that truly ship a React demo app get an importer. */
export const appImporters: Record<ExampleKey, (() => Promise<any>) | undefined> =
{
  "10q"      : undefined,
  helloworld : helloAppImporter,
  labresults : undefined,
};

export type ExampleKey = keyof typeof schemaFiles; // "10q" | "helloworld" | "labresults"
