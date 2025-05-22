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
 * File   : GeneratedSchemaPanel.tsx
 * Author : Sesh Ragavachari
 * Date   : 2025-04-30
 * Version: 1.0
 * ------------------------------------------------------------------
 * Purpose
 *  Right-hand pane of the StructOut workbench.  Displays a live JSON
 *  Schema, provider-specific helper code, demo app, and bundled AI
 *  outputs.  Also offers clipboard copy and file-download utilities.
 *  Heavy assets (demo React apps) are dynamically imported on demand.
 * ------------------------------------------------------------------ */

import React, {
  useCallback, useEffect, useState, useMemo, Suspense,
} from "react";
import {
  Box, FormControl, IconButton, InputLabel, Link,
  MenuItem, Select, Tooltip, Typography,
  Snackbar, Alert,
} from "@mui/material";
import ContentCopyIcon  from "@mui/icons-material/ContentCopy";
import DownloadIcon     from "@mui/icons-material/Download";
import CheckCircleIcon  from "@mui/icons-material/CheckCircle";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

import SectionHeader from "./components/SectionHeader";
import {
  PanelRoot, ProviderRow, PanelBody, JsonArea,
} from "./style/GeneratedSchemaPanelLayout";

import {
  generateHelperFiles, downloadHelperFiles, HelperFiles,
} from "./utils/ideHelperGenerator";
import {
  outputFiles, contentFiles, appImporters, ExampleKey,
} from "./ExampleLoader";

/* ---------- types ------------------------------------------------ */
export type ProviderId = "openai" | "anthropic";
type ViewMode =
  | "schema" | "output" | "content"
  | "helper:model" | "helper:main" | "app";

interface Props {
  jsonSchema      : string;
  llmProvider     : ProviderId;
  onProviderChange: (p: ProviderId) => void;
  exampleName?    : ExampleKey;
}

/* ---------- shared code-block style ------------------------------ */
const codeStyle = {
  background:"#f5f5f5", borderRadius:4, padding:16,
  fontSize:13, lineHeight:1.4,
} as const;

/* ================================================================ */
const GeneratedSchemaPanel: React.FC<Props> = ({
  jsonSchema, llmProvider, onProviderChange, exampleName,
}) => {
  /* UI state ---------------------------------------------------- */
  const [copied, setCopied] = useState(false);
  const [view,   setView  ] = useState<ViewMode>("schema");
  const [blob,   setBlob  ] = useState("");
  const [lang,   setLang  ] = useState<"json"|"text"|"python">("json");
  const [helpers,setHelpers] = useState<HelperFiles|null>(null);
  const [AppDemo,setAppDemo] =
    useState<React.ComponentType<any>|null>(null);
  const [toast,  setToast ] = useState<string|undefined>();

  /* reset when designer produces a new schema ------------------ */
  useEffect(() => {
    setHelpers(null); setAppDemo(null);
    setView("schema"); setBlob(""); setLang("json");
  }, [jsonSchema]);

  /* does this example have a bundled demo React app? ----------- */
  const hasApp = useMemo(
    () => !!exampleName && Boolean(appImporters[exampleName]),
    [exampleName],
  );

  /* Load bundled AI output / LLM content ----------------------- */
  const loadExampleFile = useCallback((kind:"output"|"content") => {
    if (!exampleName) return;

    if (kind === "output") {
      const data = outputFiles[exampleName];
      if (!data) {
        setBlob(`(no bundled output for “${exampleName}”)`);
        setLang("text");
      } else {
        setBlob(JSON.stringify(data, null, 2));
        setLang("json");
      }
    } else {
      const txt = contentFiles[exampleName];
      if (!txt) {
        setBlob(`(no bundled content for “${exampleName}”)`);
        setLang("text");
      } else {
        setBlob(txt);
        setLang("text");
      }
    }
    setView(kind);
  }, [exampleName]);

  /* Lazy-import the demo React app ----------------------------- */
  const loadExampleApp = useCallback(() => {
    if (!exampleName) return;
    const importer = appImporters[exampleName];
    if (!importer) return;                // guard for TypeScript

    importer()                            // <-- invoke the function
      .then(mod => {
        // default export or module itself
        setAppDemo(() => (mod as any).default ?? mod);
        setView("app");
      })
      .catch(err => {
        console.error("Demo app import failed", err);
        setToast("Demo app failed to load.");
      });
  }, [exampleName]);

  /* Generate helper files (model + main) ----------------------- */
  const showHelpers = useCallback((which:"model"|"main") => {
    if (!jsonSchema) return;
    console.log(jsonSchema);
    const f = generateHelperFiles(jsonSchema, llmProvider);
    setHelpers(f);
    setBlob(which === "model" ? f.modelCode : f.mainCode);
    setLang("python"); setView(`helper:${which}` as ViewMode);
  }, [jsonSchema, llmProvider]);

  /* Provider dropdown ------------------------------------------ */
  const providerSelect = (
    <FormControl variant="standard" size="small" sx={{ minWidth:130 }}>
      <InputLabel>Provider</InputLabel>
      <Select
        value={llmProvider}
        label="Provider"
        onChange={e => onProviderChange(e.target.value as ProviderId)}
      >
        <MenuItem value="openai">openai</MenuItem>
        <MenuItem value="anthropic">anthropic</MenuItem>
      </Select>
    </FormControl>
  );

  /* Clipboard & download handlers ------------------------------ */
  const isSchemaView = view === "schema";

  const copy = async () => {
    const txt =
      isSchemaView ? jsonSchema :
      view.startsWith("helper") ? blob : "";
    if (!txt) return;
    try {
      await navigator.clipboard.writeText(txt);
      setCopied(true); setTimeout(() => setCopied(false), 1500);
    } catch {
      setToast("Copy failed. Your browser blocked clipboard access.");
    }
  };

  const download = () => {
    if (view.startsWith("helper") && helpers) {
      downloadHelperFiles(helpers); return;
    }
    if (!isSchemaView || !jsonSchema) return;
    const url = URL.createObjectURL(
      new Blob([jsonSchema], { type:"application/json" }),
    );
    const a = document.createElement("a");
    a.href = url; a.download = "schema.json"; a.click();
    URL.revokeObjectURL(url);
  };

  /* --------------------------- render ------------------------- */
  return (
    <PanelRoot>
      <SectionHeader
        title={`Generated Schema${exampleName ? " (Example)" : ""}`}
      />

      {/* provider row */}
      <ProviderRow>
        {providerSelect}

        <Tooltip title="Copy">
          <span>
            <IconButton
              size="small"
              disabled={isSchemaView ? !jsonSchema : !blob}
              onClick={copy}
            >
              <ContentCopyIcon fontSize="inherit" />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip
          title={
            view.startsWith("helper")
              ? "Download JSON + helpers"
              : "Download JSON"
          }>
          <span>
            <IconButton
              size="small"
              disabled={
                (isSchemaView && !jsonSchema) ||
                (view.startsWith("helper") && !helpers)
              }
              onClick={download}
            >
              <DownloadIcon fontSize="inherit" />
            </IconButton>
          </span>
        </Tooltip>

        {copied && (
          <Typography
            variant="caption"
            sx={{ ml:1, display:"flex", alignItems:"center", gap:0.5 }}
            color="success.main"
          >
            <CheckCircleIcon fontSize="small" /> Copied
          </Typography>
        )}
      </ProviderRow>

      {/* link bar */}
      <Box sx={{ px:2, py:0.5, display:"flex", gap:2, flexWrap:"wrap" }}>
        <Link component="button" fontSize={13}
          underline={view==="schema" ? "always" : "hover"}
          onClick={() => setView("schema")}>JSON Schema</Link>

        {exampleName && (
          <>
            <Link component="button" fontSize={13}
              underline={view==="output" ? "always" : "hover"}
              onClick={() => loadExampleFile("output")}>AI Output</Link>
            <Link component="button" fontSize={13}
              underline={view==="content" ? "always" : "hover"}
              onClick={() => loadExampleFile("content")}>LLM Content</Link>
            {hasApp && (
              <Link component="button" fontSize={13}
                underline={view==="app" ? "always" : "hover"}
                onClick={loadExampleApp}>Demo App</Link>
            )}
          </>
        )}

        <Link component="button" fontSize={13}
          underline={view.startsWith("helper") ? "always" : "hover"}
          onClick={() => showHelpers("model")}>IDE Helpers</Link>

        {view.startsWith("helper") && (
          <>
            <Link component="button" fontSize={12} sx={{ ml:0.5 }}
              color="text.secondary"
              underline={view==="helper:model" ? "always" : "hover"}
              onClick={() => showHelpers("model")}>model</Link>
            <Link component="button" fontSize={12} sx={{ ml:0.5 }}
              color="text.secondary"
              underline={view==="helper:main" ? "always" : "hover"}
              onClick={() => showHelpers("main")}>main</Link>
          </>
        )}
      </Box>

      {/* viewer */}
      <PanelBody>
        {view === "app" && AppDemo && (
          <Suspense fallback={<Typography sx={{ p:2 }}>Loading app…</Typography>}>
            <AppDemo />
          </Suspense>
        )}

        {view !== "app" && (
          <JsonArea>
            {view === "schema" && jsonSchema && (
              <SyntaxHighlighter
                language="json" style={oneLight}
                customStyle={codeStyle}
                wrapLongLines>{jsonSchema}</SyntaxHighlighter>
            )}

            {view !== "schema" && (
              lang === "json" ? (
                <SyntaxHighlighter language="json" style={oneLight}
                  customStyle={codeStyle}
                  wrapLongLines>{blob}</SyntaxHighlighter>
              ) : lang === "python" ? (
                <SyntaxHighlighter language="python" style={oneLight}
                  customStyle={codeStyle}
                  wrapLongLines>{blob}</SyntaxHighlighter>
              ) : (
                <Typography component="pre"
                  sx={{ ...codeStyle,
                    whiteSpace:"pre-wrap", fontFamily:"monospace" }}>
                  {blob}
                </Typography>
              )
            )}
          </JsonArea>
        )}
      </PanelBody>

      {/* global toast */}
      <Snackbar
        open={!!toast}
        autoHideDuration={4000}
        onClose={() => setToast(undefined)}
        anchorOrigin={{ vertical:"bottom", horizontal:"center" }}
      >
        <Alert
          severity="error"
          variant="filled"
          onClose={() => setToast(undefined)}
          sx={{ width:"100%" }}
        >
          {toast}
        </Alert>
      </Snackbar>
    </PanelRoot>
  );
};

export default GeneratedSchemaPanel;