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
 * File   : LabelSidebar.tsx
 * Author : Sesh Ragavachari
 * Date   : 2025-04-30
 * Version: 1.0
 * ------------------------------------------------------------------
 * Purpose
 *  Explorer panel on the left-hand side of the workbench.  Shows two
 *  folders:
 *    • Example Schemas  (bundled at build-time)
 *    • Saved  Schemas   (user-created → LocalStorage)
 *
 *  Features
 *    • Debounced LocalStorage listener (200 ms) keeps list in sync
 *      across tabs without UI jank.
 *    • Palette-aware icon colour for dark/light themes.
 *    • Callbacks wrapped in `useCallback` to avoid unnecessary re-renders.
 * ------------------------------------------------------------------ */

import React, {
  useEffect, useMemo, useState, useCallback, useRef,
} from "react";
import { TreeItem, TreeItemProps } from "@mui/x-tree-view/TreeItem";
import ExpandMoreIcon   from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import FolderIcon       from "@mui/icons-material/Folder";
import { styled, useTheme } from "@mui/material/styles";

import {
  SidebarContainer,
  TreeWrapper,
} from "../style/LabelSidebarLayout";

/* ------------------------------------------------------------------ */
/* Styled components                                                  */
/* ------------------------------------------------------------------ */

const SpacedTreeItem = styled((props: TreeItemProps) => <TreeItem {...props} />)(
  () => ({ "& .MuiTreeItem-content": { marginBottom: 6 } }),
);

/* ------------------------------------------------------------------ */
/* Types & helpers                                                    */
/* ------------------------------------------------------------------ */

interface LabelSidebarProps {
  onSelectTemplate : (templateId: string) => void;
  onSelectExample  : (exampleId : string) => void;
}

const PREFIX = "schema_metadata_";
const listTemplates = () =>
  Object.keys(localStorage)
    .filter(k => k.startsWith(PREFIX))
    .map(k => k.slice(PREFIX.length))
    .sort();

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

const LabelSidebar: React.FC<LabelSidebarProps> = ({
  onSelectTemplate,
  onSelectExample,
}) => {
  /* folder icon colour derives from current MUI palette */
  const theme  = useTheme();
  const Folder = <FolderIcon htmlColor={theme.palette.primary.main} sx={{ mr:0.5 }} />;

  /* -------- Saved-schema list (debounced) --------------------------- */
  const [templates, setTemplates] = useState<string[]>(listTemplates);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    const refresh = () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      debounceRef.current = window.setTimeout(() => {
        setTemplates(listTemplates());
        debounceRef.current = null;
      }, 200);
    };
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, []);

  /* -------- Example list (statically bundled) ---------------------- */
  const examples = useMemo(() => {
    const mods = import.meta.glob("/src/examples/*.json", { eager:true });
    return Object.keys(mods)
      .map(p => p.split("/").pop()!.replace(/\.json$/, ""))
      .sort();
  }, []);

  /* -------- Stable click handlers ---------------------------------- */
  const handleTplClick = useCallback(
    (tpl: string) => () => onSelectTemplate(tpl),
    [onSelectTemplate],
  );
  const handleExClick = useCallback(
    (name: string) => () => onSelectExample(name),
    [onSelectExample],
  );

  /* -------- Render -------------------------------------------------- */
  return (
    <SidebarContainer>
      <TreeWrapper
        defaultExpandedItems={[]}
        slots={{ collapseIcon: ExpandMoreIcon, expandIcon: ChevronRightIcon }}
      >
        {/* Example Schemas */}
        <SpacedTreeItem itemId="examples" label={<>{Folder}Example Schemas</>}>
          {examples.length === 0 ? (
            <SpacedTreeItem itemId="examples-empty" label="(none)" disabled />
          ) : (
            examples.map(name => (
              <SpacedTreeItem
                key={name}
                itemId={`ex-${name}`}
                label={name}
                onClick={handleExClick(name)}
              />
            ))
          )}
        </SpacedTreeItem>

        {/* Saved Schemas */}
        <SpacedTreeItem itemId="schemas" label={<>{Folder}Saved Schemas</>}>
          {templates.length === 0 ? (
            <SpacedTreeItem itemId="schemas-empty" label="(none)" disabled />
          ) : (
            templates.map(tpl => (
              <SpacedTreeItem
                key={tpl}
                itemId={`tpl-${tpl}`}
                label={tpl}
                onClick={handleTplClick(tpl)}
              />
            ))
          )}
        </SpacedTreeItem>
      </TreeWrapper>
    </SidebarContainer>
  );
};

export default LabelSidebar;
