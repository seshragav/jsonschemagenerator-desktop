/* ------------------------------------------------------------------
 * MIT License 2025  Sesh Ragavachari
 * ------------------------------------------------------------------
 * Workbench.tsx – three-pane workspace + header + footer links
 * ------------------------------------------------------------------ */

import React, { useRef, useState, useEffect } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline  from "@mui/material/CssBaseline";
import Snackbar     from "@mui/material/Snackbar";
import Alert        from "@mui/material/Alert";

import SchemaDesigner, {
  SchemaDesignerHandle,
  ProviderId,
} from "./SchemaDesigner";
import GeneratedSchemaPanel   from "./GeneratedSchemaPanel";
import LabelSidebar           from "./components/LabelSidebar";
import SectionHeader          from "./components/SectionHeader";
import LegalLinks             from "./components/LegalLinks";
import { loadProviderConfig } from "./utils/loadProviderConfig";
import { ExampleKey, schemaFiles } from "./ExampleLoader";

import {
  Root, BrandWrap, BrandName, TagLine,
  Frame, ExplorerCol, DesignerCol, SchemaCol, ScrollArea,
} from "./style/AppLayout";

/* ---------- global MUI theme ------------------------------------ */
const theme = createTheme({
  palette   : { mode: "light" },
  typography: { fontFamily: "Roboto, Helvetica, Arial, sans-serif" },
});

/* built-in examples (compile-time) -------------------------------- */
const VALID_EXAMPLES = Object.keys(schemaFiles) as ExampleKey[];

/* ================================================================ */
const Workbench: React.FC = () => {
  /* state --------------------------------------------------------- */
  const [providerId,  setProviderId]  = useState<ProviderId>("openai");
  const [headerRule,  setHeaderRule]  = useState<string>("[]");
  const [jsonSchema,  setJsonSchema]  = useState("");
  const [exampleName, setExampleName] = useState<ExampleKey | undefined>();
  const [errToast,    setErrToast]    = useState<string>();

  /* imperative handle to <SchemaDesigner> ------------------------- */
  const designerRef = useRef<SchemaDesignerHandle>(null);

  /* -------- Saved-schema loader --------------------------------- */
  const handleSelectTemplate = (tplId: string) => {
    try {
      const raw = localStorage.getItem(`schema_metadata_${tplId}`);
      if (!raw) return;
      designerRef.current?.setSchemaState(JSON.parse(raw));
      setExampleName(undefined);
    } catch {
      console.error("Bad template JSON");
      setErrToast("Failed to load stored schema.");
    }
  };

  /* -------- Example loader -------------------------------------- */
  const handleSelectExample = (name: string) => {
    if (!VALID_EXAMPLES.includes(name as ExampleKey)) return;
    const key = name as ExampleKey;
    designerRef.current?.setSchemaState(schemaFiles[key]);
    setExampleName(key);
  };

  /* -------- Provider change ------------------------------------- */
  const loadProvider = async (id: ProviderId) => {
    try {
      const cfg = await loadProviderConfig(id);
      setProviderId(id);
      setHeaderRule(cfg.llmSchemaHeader ?? "[]");
    } catch {
      console.error("Provider JSON failed to load");
      setHeaderRule("[]");
      setErrToast("Provider configuration failed to load.");
    }
  };

  /* load default provider once ----------------------------------- */
  useEffect(() => { loadProvider(providerId); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* -------- render ---------------------------------------------- */
  return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Root>

          {/* ─── header row – brand left, legal links right ────────── */}
          <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 24px",
                borderBottom: "1px solid #e5e7eb",
              }}
          >
            <BrandWrap>
              <BrandName>
                Struct<span>Out</span>
              </BrandName>
              <TagLine>Structured Output Designer for LLM APIs</TagLine>
            </BrandWrap>

            <LegalLinks />
          </div>

          {/* ─── three-pane workspace ─────────────────────────────── */}
          <Frame>
            {/* Explorer ------------------------------------------------ */}
            <ExplorerCol>
              <SectionHeader title="Explorer" />
              <ScrollArea>
                <LabelSidebar
                    onSelectTemplate={handleSelectTemplate}
                    onSelectExample={handleSelectExample}
                />
              </ScrollArea>
            </ExplorerCol>

            {/* Designer ------------------------------------------------ */}
            <DesignerCol>
              <ScrollArea style={{ padding: "0 16px 16px" }}>
                <SchemaDesigner
                    ref={designerRef}
                    headerRule={headerRule}
                    onJsonSchemaGenerated={setJsonSchema}
                    exampleName={exampleName}
                />
              </ScrollArea>
            </DesignerCol>

            {/* Generated Schema ---------------------------------------- */}
            <SchemaCol>
              <GeneratedSchemaPanel
                  jsonSchema={jsonSchema}
                  llmProvider={providerId}
                  onProviderChange={loadProvider}
                  exampleName={exampleName}
              />
            </SchemaCol>
          </Frame>

          {/* ─── footer links – sits right under the panes ─────────── */}
          <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                padding: "8px 24px",
                borderTop: "1px solid #e5e7eb",
              }}
          >
            <LegalLinks />
          </div>

          {/* global error snackbar ------------------------------------ */}
          <Snackbar
              open={!!errToast}
              autoHideDuration={4000}
              onClose={() => setErrToast(undefined)}
              anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <Alert
                severity="error"
                variant="filled"
                onClose={() => setErrToast(undefined)}
                sx={{ width: "100%" }}
            >
              {errToast}
            </Alert>
          </Snackbar>
        </Root>
      </ThemeProvider>
  );
};

export default Workbench;