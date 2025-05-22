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
 * File   : loadProviderConfig.ts
 * Author : Sesh Ragavachari
 * Date   : 2025-04-30
 * Version: 1.0
 * ------------------------------------------------------------------
 * Purpose
 *  Dynamic loader for `/src/api/*.json` provider-template files.
 *  Used by Workbench → GeneratedSchemaPanel to fetch the correct
 *  `llmSchemaHeader` rule set and any provider-specific metadata.
 * ------------------------------------------------------------------ */

export interface ProviderConfig {
  /** Human-readable identifier (“openai”, “anthropic”, …)           */
  provider: string;
  /** JSON-stringified rule array consumed by `jsonSchemaGenerator` */
  llmSchemaHeader: string;
  /** Example upload path used by demo `*_main.py` stubs             */
  genAIURLPathParameter: string;
  /* Extend with more fields (rateLimit, models[], etc.) as needed. */
}

/**
 * Load and parse `../api/<providerId>.json`.
 * Throws if the file is missing or the glob fails to return a match.
 */
export async function loadProviderConfig(
  providerId: string,
): Promise<ProviderConfig> {
  /* Vite’s glob import: Record<path, () => Promise<any>> ---------- */
  const modules = import.meta.glob("../api/*.json");

  const key = `../api/${providerId}.json`;
  const importer = modules[key] as
    | undefined
    | (() => Promise<{ default: ProviderConfig } | ProviderConfig>);

  if (!importer) {
    throw new Error(`No JSON file found for provider “${providerId}”`);
  }

  /* dev build → raw object | prod build → { default: obj } */
  const mod = await importer();
  return (mod as any).default ?? mod;
}
