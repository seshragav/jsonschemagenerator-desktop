/* ------------------------------------------------------------------
 * MIT License (c) 2025  Sesh Ragavachari
 * ------------------------------------------------------------------
 * File   : LegalLinks.tsx
 * Purpose: About · Privacy · Terms links + GitHub-style Markdown dialog
 * ------------------------------------------------------------------ */

import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/* ↓ one import = full GitHub markdown styles */
import "github-markdown-css/github-markdown-light.css";

type DocKey = "about" | "privacy" | "terms";

const DOC_FILE: Record<DocKey, string> = {
    about:   "ABOUT.md",
    privacy: "PRIVACY_POLICY.md",
    terms:   "TERMS_OF_USE.md",
};

export default function LegalLinks(): JSX.Element {
    const [markdown, setMarkdown] = useState<string | null>(null);

    /** fetch + open the selected document */
    const open = async (key: DocKey) => {
        // @ts-ignore
        const base = import.meta.env.BASE_URL;               // "/" on web, "./" in Tauri
        const text = await fetch(`${base}legal/${DOC_FILE[key]}`).then(r => r.text());
        setMarkdown(text);
    };

    return (
        <>
            <nav style={{ display: "flex", gap: "1rem", padding: "4px 8px" }}>
                <button className="link-button" onClick={() => open("about")}>About</button>
                <button className="link-button" onClick={() => open("privacy")}>Privacy&nbsp;Policy</button>
                <button className="link-button" onClick={() => open("terms")}>Terms&nbsp;of&nbsp;Use</button>
                <a
                    className="link-button"
                    href="https://github.com/seshragav/structout/blob/main/docs/license.md"
                    target="_blank"
                    rel="noreferrer"
                >
                    MIT&nbsp;License
                </a>
            </nav>

            <Dialog
                open={Boolean(markdown)}
                onClose={() => setMarkdown(null)}
                maxWidth="md"
                fullWidth
                scroll="paper"
            >
                {markdown && (
                    <DialogContent sx={{ p: 3 }}>
                        {/* GitHub styles apply to .markdown-body */}
                        <article className="markdown-body">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
                        </article>
                    </DialogContent>
                )}
            </Dialog>

            {/* button reset */}
            <style>{`
        .link-button {
          background: none;
          border: none;
          padding: 0;
          font-size: 0.75rem;
          cursor: pointer;
          color: var(--accent-color, #1d70fe);
        }
        .link-button:hover { text-decoration: underline; }
      `}</style>
        </>
    );
}
