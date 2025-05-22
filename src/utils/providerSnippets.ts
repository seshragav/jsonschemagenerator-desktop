/* ------------------------------------------------------------------
 * providerSnippets.ts — v1.3 (Anthropic • tools API, no hard-coding)
 * ------------------------------------------------------------------ */

export function buildMainTemplate(
    provider: string,
    id: string,          // safe base name, e.g. "_10q"
    modelCls: string,    // top-level Pydantic class
    hasArray: boolean,   // does the schema contain at least one array?
    layout: string,      // static tree layout (for banner)
): string {
    switch (provider) {
        /* ───────────────────────────────  OpenAI  ───────────────────── */
        case "openai":
            return `
"""Tiny self-contained demo (OpenAI SDK)

• Validates JSON output against \`${id}.json\`
• Pretty-prints the validated data
• Shows *static* model layout (see below)
• Prints the first element from every list (if any)

—— STATIC MODEL LAYOUT —————————————————————————
${layout.trim()}
—————————————————————————————————————————————————"""
import os, json, logging
from openai import OpenAI, OpenAIError
from pydantic import BaseModel
from typing import Any
from ${id}_model import ${modelCls}

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

with open("${id}.json", encoding="utf-8") as f:
    schema = json.load(f)

with open("${id}_content.txt", encoding="utf-8") as f:
    content = f.read()

try:
    completion = client.beta.chat.completions.parse(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user",   "content": content},
        ],
        response_format=schema,
    )

    msg     = completion.choices[0].message
    payload = msg.parsed if msg.parsed else json.loads(msg.content)
    result  : ${modelCls} = ${modelCls}.model_validate(payload)

    try:
        print("\\n✅ Pretty JSON\\n",
              result.model_dump_json(indent=2, ensure_ascii=False))
    except TypeError:              # Pydantic v1 fallback
        print("\\n✅ Pretty JSON\\n",
              json.dumps(result.model_dump(), indent=2, ensure_ascii=False))
${hasArray ? `\
    def _dump_first(obj: BaseModel, path: str = "") -> None:
        for field, val in obj:
            full = f"{path}.{field}" if path else field
            if isinstance(val, list) and val:
                print(f"{full}[0] →", val[0])
                if isinstance(val[0], BaseModel):
                    _dump_first(val[0], f"{full}[0]")
            elif isinstance(val, BaseModel):
                _dump_first(val, full)

    print("\\n🗂️  First samples from every list")
    _dump_first(result)
` : ""}
except OpenAIError as e:
    logging.error("OpenAI API error: %s", e)
`;

        /* ───────────────────────────  Anthropic  ───────────────────── */
        case "anthropic":
            return `
"""Tiny self-contained demo (Anthropic SDK • tools param)

• Sends JSON-Schema via the *tools* parameter
• Validates the tool-call payload with Pydantic
• Pretty-prints the validated data
• Prints the first element from every list (if any)

—— STATIC MODEL LAYOUT —————————————————————————
${layout.trim()}
—————————————————————————————————————————————————"""
import json, logging
from typing   import Any
from anthropic import Anthropic, APIError          # SDK ≥ 0.23
from pydantic  import BaseModel
from ${id}_model import ${modelCls}

client = Anthropic(api_key="YOUR_API_KEY_HERE")

# ── 1 . Load JSON Schema + user content ───────────────────────────
with open("${id}_anthropic.json", encoding="utf-8") as f:
    schema: dict[str, Any] = json.load(f)

with open("${id}_content.txt", encoding="utf-8") as f:
    content: str = f.read()

tool_name = schema.get("name", "${id}")   # no hard-coding

# ── 2 . Call Claude with *tools* param ────────────────────────────
try:
    msg = client.messages.create(
        model="claude-3-5-sonnet-20240620",
        max_tokens=4096,
        temperature=0,
        tools=[schema],                       # pass full schema object
        tool_choice={"type": "tool", "name": tool_name},
        messages=[{"role": "user", "content": content}],
    )
except APIError as e:
    logging.error("Anthropic API error: %s", e)
    raise SystemExit(1)

# ── 3 . Extract the tool_use block and payload ───────────────────
tool_block = next(
    blk for blk in msg.content
    if getattr(blk, "type", None) == "tool_use"
)
payload: Any = tool_block.input

# ── 4 . Validate with Pydantic ───────────────────────────────────
data: ${modelCls} = ${modelCls}.model_validate(payload)

# ── 5 . Pretty-print & optional sampling ─────────────────────────
print("\\n✅ Pretty JSON (validated)\\n",
      json.dumps(payload, indent=2, ensure_ascii=False))
${hasArray ? `\
def _dump_first(obj: BaseModel, path: str = "") -> None:
    for field, val in obj:
        full = f"{path}.{field}" if path else field
        if isinstance(val, list) and val:
            print(f"{full}[0] →", val[0])
            if isinstance(val[0], BaseModel):
                _dump_first(val[0], f"{full}[0]")
        elif isinstance(val, BaseModel):
            _dump_first(val, full)

print("\\n🗂️  First samples from every list")
_dump_first(data)
` : ""}
`;

        /* ──────────────────────────  Fallback  ─────────────────────── */
        default:
            return `# ⚠️  Provider "${provider}" not supported yet.`;
    }
}
