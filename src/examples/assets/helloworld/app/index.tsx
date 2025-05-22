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
 * File   : index.tsx   (helloworld demo app entry)
 * Author : Sesh Ragavachari
 * Date   : 2025-04-30
 * Version: 1.0
 * ------------------------------------------------------------------
 * Purpose
 *  Lazy-loaded by `GeneratedSchemaPanel` to demonstrate how a schema
 *  can drive a fully-interactive React experience.  Renders the
 *  DessertWorldMap and some minimal Tailwind-styled chrome.
 * ------------------------------------------------------------------ */

import DessertWorldMap from "./DessertWorldMap";
import "./demo.css";

export default function HelloWorldDessertApp() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center p-6">
      <h1 className="mb-4 text-2xl font-semibold">
        Hello World of Desserts&nbsp;(LLM Demo)
      </h1>
      <DessertWorldMap />
    </main>
  );
}
