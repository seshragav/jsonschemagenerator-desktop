/* ------------------------------------------------------------------
 * MIT License
 * Copyright (c) 2025  Sesh Ragavachari
 * ------------------------------------------------------------------
 * File   : ideHelperGenerator.ts   (v1.1 – provider-aware)
 * ------------------------------------------------------------------
 * Purpose
 *  Produces two Python helper files from a live-generated JSON Schema:
 *
 *    1. <schema>_model.py   – Pydantic model tree
 *    2. <schema>_main.py    – Provider-specific stub
 *
 *  NEW: Works for providers that wrap the schema differently
 *       (OpenAI → json_schema.schema, Anthropic → input_schema, …)
 * ------------------------------------------------------------------ */

import { buildMainTemplate } from "./providerSnippets";

/* ------------------------------------------------------------------ */
/* Public interface                                                   */
/* ------------------------------------------------------------------ */
export interface HelperFiles {
  modelCode     : string;
  mainCode      : string;
  filenameModel : string;
  filenameMain  : string;
}

/* ------------------------------------------------------------------ */
/* Provider-specific adapters                                         */
/* ------------------------------------------------------------------ */
type Adapter = {
  getName   : (root: any) => string | undefined;
  getSchema : (root: any) => any | undefined;
};

/** Add new providers here – just two lambdas each. */
const ADAPTERS: Record<string, Adapter> = {
  openai: {
    getName  : r => r?.json_schema?.name,
    getSchema: r => r?.json_schema?.schema,
  },
  anthropic: {
    getName  : r => r?.name,
    getSchema: r => r?.input_schema,
  },
  // fallback – try a couple of common keys before giving up
  default: {
    getName  : r => r?.name ?? r?.json_schema?.name,
    getSchema: r =>
        r?.schema ??
        r?.json_schema?.schema ??
        r?.input_schema,
  },
};

/* ------------------------------------------------------------------ */
/* Tiny utils                                                         */
/* ------------------------------------------------------------------ */
const IND = "    ";

const safePy = (s: string) =>
    (/^[A-Za-z_]/.test(s) ? s : `_${s}`).replace(/[^0-9A-Za-z_]/g, "_");

const toClass = (s: string) =>
    safePy(s).replace(/(?:^|_)(\w)/g, (_, c: string) => c.toUpperCase());

/* ------------------------------------------------------------------ */
/* Build Pydantic model + static “layout” comment                     */
/* ------------------------------------------------------------------ */
function buildModel(
    schema: any,
    rootId: string,
): { code: string; hasArray: boolean; layout: string } {
  const header = [
    "from pydantic import BaseModel",
    "from typing    import List\n",
  ];

  const classLines: string[] = [];
  const layoutLines: string[] = [];
  let   hasArray = false;

  function walk(node: any, name: string, depth = 0) {
    const cls   = toClass(name);
    const props = node?.items?.properties || node?.properties || {};
    const attr  : string[] = [];
    const pref  = "  ".repeat(depth);

    layoutLines.push(`${pref}- ${safePy(name)}: (${cls})`);

    Object.entries(props).forEach(([propName, def]: any) => {
      let typ = "str";

      if (def.type === "array") {
        hasArray = true;
        if (def.items?.type === "object") {
          const childCls = toClass(`${name}_${propName}_item`);
          walk(def.items, `${name}_${propName}_item`, depth + 1);
          typ = `List[${childCls}]`;
        } else {
          typ = "List[str]";
        }
      } else if (def.type === "object") {
        const childCls = toClass(`${name}_${propName}`);
        walk(def, `${name}_${propName}`, depth + 1);
        typ = childCls;
      }

      attr.push(
          `${IND}${safePy(propName)}: ${typ}` +
          (def.description ? `  # ${def.description}` : ""),
      );
    });

    classLines.push(`\nclass ${cls}(BaseModel):`);
    classLines.push(attr.length ? attr.join("\n") : `${IND}pass`);
  }

  walk(schema, rootId);

  return {
    code   : header.join("\n") + classLines.join("\n") + "\n",
    hasArray,
    layout : layoutLines.join("\n"),
  };
}

/* ------------------------------------------------------------------ */
/* Public generator – returns both file texts + filenames             */
/* ------------------------------------------------------------------ */
export function generateHelperFiles(
    schemaJson: string,
    provider = "openai",
): HelperFiles {
  const parsed   = JSON.parse(schemaJson);
  const adapter  = ADAPTERS[provider] ?? ADAPTERS.default;
  console.log("Adapter Provider...", provider);
  /** —— where’s the actual Draft-7-ish schema? */
  const schema   = adapter.getSchema(parsed);
  if (!schema)
    throw new Error(`Schema not found for provider "${provider}"`);

  /** —— pick a base name (safe Py identifier) */
  const rawName  = adapter.getName(parsed) ?? "schema";
  const id       = safePy(rawName);
  const modelCls = toClass(id);

  /** —— generate */
  const { code: modelCode, hasArray, layout } = buildModel(schema, id);
  const mainCode = buildMainTemplate(
      provider, id, modelCls, hasArray, layout,
  );

  return {
    modelCode,
    mainCode,
    filenameModel: `${id}_model.py`,
    filenameMain : `${id}_main.py`,
  };
}

/* ------------------------------------------------------------------ */
/* Browser download helper                                            */
/* ------------------------------------------------------------------ */
export function downloadHelperFiles({
                                      modelCode,
                                      mainCode,
                                      filenameModel,
                                      filenameMain,
                                    }: HelperFiles) {
  [
    [filenameModel, modelCode],
    [filenameMain, mainCode],
  ].forEach(([name, text]) => {
    const url = URL.createObjectURL(
        new Blob([text], { type: "text/x-python" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  });
}
