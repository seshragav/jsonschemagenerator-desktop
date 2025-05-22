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
 * File   : jsonSchemaGenerator.ts
 * Author : Sesh Ragavachari
 * Date   : 2025-04-30
 * Version: 1.0
 * ------------------------------------------------------------------
 * Purpose
 *  Transforms a flat array of `SchemaField` rows (as edited in
 *  FieldEditor) into a fully-nested JSON-Schema document, whilst
 *  honouring provider-specific “header rule” directives
 *  (`llmSchemaHeaderRule`) such as:
 *      – additionalProperties, required lists, etc.
 *      – top-level name / description injection
 *      – per-object / per-array recursive constraints
 * ------------------------------------------------------------------ */

interface SchemaField {
  key: string;
  type: string;           // e.g. "string", "object", "array-object", etc.
  level: number;
  aiPrompt: string;
  parentKey: string | null;
  required: boolean;
}

/* ================================================================
   Entry point
   ================================================================ */
const jsonSchemaGenerator = (
  fields: SchemaField[],
  schemaName: string,
  schemaDescription: string,
  llmSchemaHeaderRule: string,
) => {
  /* ------------------------------------------------------------
   * A)  Build the provider header from rule directives
   * ---------------------------------------------------------- */
  interface IRule {
    key: string;
    type: "object" | "string" | "keyvalue" | "boolean" | "array";
    value?: unknown;
    sourceparam?: "schemaName" | "schemaDescription" | string;
    level: number;
    end?: boolean;
    action?: "include" | "exclude";
    actionLevel?: ("object" | "array")[];
  }

  function buildHeaderFromRule(
    llmRule: string,
    nameParam: string,
    descParam: string,
  ): { headerRoot: any; allRules: IRule[] } {
    let ruleArray: IRule[];
    try {
      ruleArray = JSON.parse(llmRule);
    } catch (err) {
      console.error("Invalid llmSchemaHeaderRule JSON:", err);
      return { headerRoot: {}, allRules: [] };
    }

    const root: any = {};
    const stack = [{ node: root, level: 0, nodeType: "object" as "object" | "array" }];
    for (const r of ruleArray) {
      while (stack.length && stack[stack.length - 1].level >= r.level) stack.pop();
      if (!stack.length) stack.push({ node: root, level: 0, nodeType: "object" });

      const { node: parent, nodeType: parentType } = stack[stack.length - 1];

      switch (r.type) {
        case "object":
          parent[r.key] = {};
          stack.push({ node: parent[r.key], level: r.level, nodeType: "object" });
          break;

        case "string":
          parent[r.key] =
            r.sourceparam === "schemaName"  ? nameParam :
            r.sourceparam === "schemaDescription" ? descParam : "";
          break;

        case "keyvalue":
          parent[r.key] = r.value;
          break;

        case "boolean":
          if (r.action === "include" && r.actionLevel?.includes(parentType))
            parent[r.key] = Boolean(r.value);
          break;

        case "array":
          if (r.action === "include" && r.actionLevel?.includes(parentType)) {
            if (r.value === "{keynames}") {
              if (parent.properties) {
                parent[r.key] = Object.keys(parent.properties);
              } else if (parent.items?.properties) {
                parent[r.key] = Object.keys(parent.items.properties);
              } else {
                parent[r.key] = [];
              }
            } else if (Array.isArray(r.value)) {
              parent[r.key] = r.value;
            } else {
              parent[r.key] = [];
            }
          }
          break;
      }

      if (r.end) stack.pop();
    }

    return { headerRoot: root, allRules: ruleArray };
  }

  /* ------------------------------------------------------------
   * B)  Build core schema from editable field rows
   * ---------------------------------------------------------- */
  function generateCoreSchema(allFields: SchemaField[], parentKey: string | null): any {
    const schema: any = { type: "object", properties: {} };
    const requiredFields: string[] = [];

    allFields
      .filter(f => f.parentKey === parentKey)
      .forEach(field => {
        const prop: any = { description: field.aiPrompt || "" };
        prop.type = deduceSchemaType(field.type);

        if (field.type === "array-object") {
          const kids = allFields.filter(cf => cf.parentKey === field.key);
          prop.items = kids.length ? generateCoreSchema(allFields, field.key)
                                   : { type: "object", properties: {} };
        } else if (field.type === "object") {
          const kids = allFields.filter(cf => cf.parentKey === field.key);
          if (kids.length) {
            const child = generateCoreSchema(allFields, field.key);
            prop.properties = child.properties;
            if (child.required?.length) prop.required = child.required;
          } else {
            prop.properties = {};
          }
        } else if (field.type === "array-string") {
          prop.items = { type: "string" };
        } else if (field.type === "array-number") {
          prop.items = { type: "number" };
        }

        if (field.required) requiredFields.push(field.key);
        schema.properties[field.key] = prop;
      });

    if (requiredFields.length) schema.required = Array.from(new Set(requiredFields));
    return schema;
  }

  const deduceSchemaType = (t: string) => t.startsWith("array-") ? "array" : t;

  /* ------------------------------------------------------------
   * C)  Merge core into provider header & apply recursive rules
   * ---------------------------------------------------------- */
  const { headerRoot, allRules } =
    buildHeaderFromRule(llmSchemaHeaderRule, schemaName, schemaDescription);

  const coreSchema = generateCoreSchema(fields, null);

  /* merge core properties into deepest “properties” node in header */
  const targetNode = findDeepestPropertiesNode(headerRoot);
  if (targetNode) {
    targetNode.properties = { ...targetNode.properties, ...coreSchema.properties };
    if (coreSchema.required) targetNode.required = coreSchema.required;
  } else {
    Object.assign(headerRoot, coreSchema);
  }

  /* cascade actionLevel rules across every object/array */
  applyRulesRecursively(headerRoot, allRules);

  return headerRoot;

  /* ---------- helper: locate deepest object with .properties ---- */
  function findDeepestPropertiesNode(obj: any): any | null {
    if (typeof obj !== "object" || !obj) return null;
    let found: any = null;

    if (obj.type === "object" && "properties" in obj) found = obj;
    for (const k of Object.keys(obj)) {
      const deeper = findDeepestPropertiesNode(obj[k]);
      if (deeper) found = deeper;
    }
    return found;
  }

  /* ---------- helper: BFS over final schema to enforce rules ---- */
  function applyRulesRecursively(rootNode: any, rules: IRule[]) {
    if (typeof rootNode !== "object" || !rootNode) return;
    const q: any[] = [rootNode];

    while (q.length) {
      const node = q.shift();
      const kind =
        node.type === "object" ? "object" :
        node.type === "array"  ? "array"  : "unknown";

      if (kind !== "unknown") {
        for (const r of rules) {
          if (r.action === "include" && r.actionLevel?.includes(kind)) {
            switch (r.type) {
              case "boolean": node[r.key] = Boolean(r.value); break;
              case "array":
                if (r.value === "{keynames}") {
                  const props = node.properties || node.items?.properties;
                  node[r.key] = props ? Object.keys(props) : [];
                } else if (Array.isArray(r.value)) {
                  node[r.key] = r.value;
                } else {
                  node[r.key] = [];
                }
                break;
              case "keyvalue": node[r.key] = r.value; break;
              case "string":   node[r.key] = String(r.value ?? ""); break;
              case "object":   if (!node[r.key]) node[r.key] = {}; break;
            }
          }
        }
      }

      for (const childKey of Object.keys(node)) {
        const child = node[childKey];
        if (typeof child === "object" && child) q.push(child);
      }
    }
  }
};

export default jsonSchemaGenerator;
