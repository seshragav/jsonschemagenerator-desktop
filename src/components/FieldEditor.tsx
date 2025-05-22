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
 * File   : FieldEditor.tsx
 * Author : Sesh Ragavachari
 * Date   : 2025-04-30
 * Version: 1.0
 * ------------------------------------------------------------------
 * Purpose
 *  Editable tree-grid for schema fields inside the Designer pane.
 *  Provides add/move/delete, lock/unlock, profanity & XSS guards,
 *  plus a small modal for editing field properties.
 * ------------------------------------------------------------------ */

import React, { useMemo, useState, useEffect } from "react";
import {
  MaterialReactTable, MRT_ColumnDef,
} from "material-react-table";
import {
  Box, Tooltip, IconButton, Typography,
  Dialog, DialogContent, DialogActions, DialogTitle,
  Button, TextField, MenuItem,
} from "@mui/material";
import {
  FaArrowUp, FaArrowDown, FaPlus, FaTrashAlt,
  FaLock, FaLockOpen,
} from "react-icons/fa";
import EditIcon         from "@mui/icons-material/Edit";
import { v4 as uuidv4 } from "uuid";
import rawProfanity     from "leo-profanity";

import styles                       from "../style/FieldEditor.module.css";
import { selectOptions, typeToIcon } from "../lib/constants";
import { SchemaField }               from "../SchemaDesigner";

/* ---------- profanity dictionary ---------------------------------- */
const leoProfanity: typeof rawProfanity =
  // @ts-ignore — handle CJS default
  (rawProfanity.default ? rawProfanity.default : rawProfanity);

leoProfanity.clearList();
leoProfanity.loadDictionary("en");
["metadata", "schema", "llm"].forEach(w => leoProfanity.removeWord(w));

/* ---------- constants --------------------------------------------- */
const ICON_SIZE        = 14;
const LEFT_COL         = 60;
const RIGHT_COL        = 80;
const INDENT_PER_LEVEL = 6;

/* Wide-net XSS regex: <script>, javascript: URI, data:text/html|js */
const xssRegex =
  /<\s*script|javascript:|data:\s*text\/html|data:\s*text\/javascript/i;

const unsafe = (txt: string) =>
  (leoProfanity.isProfane?.(txt) ?? leoProfanity.check(txt)) ||
  xssRegex.test(txt);

/* ---------- props -------------------------------------------------- */
interface Props {
  fields: SchemaField[];
  onChangeFields: (updated: SchemaField[]) => void;
  rootRowAllowed: boolean;
  actualViewMode: string;
  metadataName: string;
  metadataDesc?: string;
  isReadOnlyMetadata?: boolean;
}

/* ================================================================ */
const FieldEditor: React.FC<Props> = ({
  fields, onChangeFields,
  rootRowAllowed, actualViewMode,
  metadataName, metadataDesc = "",
}) => {
  /* validation flags for metadata ----------------------------------- */
  const [metaErr, setMetaErr]   = useState(false);
  const [descErr, setDescErr]   = useState(false);
  const [editErr, setEditErr]   = useState("");

  /* edit-dialog state ---------------------------------------------- */
  const [open,   setOpen]   = useState(false);
  const [idx,    setIdx]    = useState<number|null>(null);
  const [eKey,   setEKey]   = useState("");
  const [eType,  setEType]  = useState("string");
  const [ePrompt,setPrompt] = useState("");

  /* re-validate metadata whenever it changes ------------------------ */
  useEffect(() => {
    setMetaErr(unsafe(metadataName));
    setDescErr(unsafe(metadataDesc));
  }, [metadataName, metadataDesc]);

  /* -------- helper actions (add/move/del/lock) -------------------- */
  const canAddRoot =
    !!metadataName.trim() && !!metadataDesc.trim() && !metaErr && !descErr;

  const addRoot = () => {
    if (!rootRowAllowed || !canAddRoot) return;
    onChangeFields([
      ...fields,
      {
        id: uuidv4(), parentId: null, parentKey: null, level: 0,
        key: "", type: "object", aiPrompt: "",
        required:false, locked:true,
        dropdownType:"none", editPermission:"fullPermission",
        isSearchable:false, isFilterable:false, isRetrievable:true,
        isSortable:false,  isFacetable:false,  isKey:false,
        excludefromRagDefinition:false,
      },
    ]);
  };

  const addChild = (i: number) => {
    const p = fields[i];
    if (!p || p.locked) return;
    if (p.type !== "object" && p.type !== "array-object") return;

    const child: SchemaField = {
      id: uuidv4(), parentId: p.id, parentKey: p.key, level: p.level + 1,
      key: "", type: "string", aiPrompt: "",
      required:false, locked:false,
      dropdownType:"none", editPermission:"fullPermission",
      isSearchable:false, isFilterable:false, isRetrievable:true,
      isSortable:false, isFacetable:false, isKey:false,
      excludefromRagDefinition:false,
    };

    /* splice child right after siblings of same parent ------------- */
    let at = fields.length;
    for (let j = i + 1; j < fields.length; j++) {
      if (fields[j].level <= p.level) { at = j; break; }
    }
    const arr = [...fields];
    arr.splice(at, 0, child);
    onChangeFields(arr);
  };

  const delRow = (i: number) =>
    fields.length > 1 && onChangeFields(fields.filter((_, x) => x !== i));

  const moveUp = (i: number) => {
    if (i === 0) return;
    if (fields[i - 1].level !== fields[i].level) return;
    const a = [...fields];
    [a[i - 1], a[i]] = [a[i], a[i - 1]];
    onChangeFields(a);
  };

  const moveDn = (i: number) => {
    if (i >= fields.length - 1) return;
    if (fields[i + 1].level !== fields[i].level) return;
    const a = [...fields];
    [a[i], a[i + 1]] = [a[i + 1], a[i]];
    onChangeFields(a);
  };

  const togLock = (i: number) => {
    const a = [...fields];
    a[i].locked = !a[i].locked;
    onChangeFields(a);
  };

  /* ---------- column definitions (memoised) ----------------------- */
  const cols = useMemo<MRT_ColumnDef<SchemaField>[]>(() => [
    /* control column: move up/down ---------------------------------- */
    {
      id:"ctl", header:"", size:LEFT_COL,
      enableColumnActions:false, enableSorting:false,
      Cell:({ row }) => {
        const i = row.index;
        const isFirstUp  =
          i === 0 || fields[i - 1].level !== fields[i].level;
        const isLastDown =
          i === fields.length - 1 || fields[i + 1].level !== fields[i].level;

        return (
          <Box className={styles.leftCell}>
            <Tooltip title="Up">
              <span>
                <IconButton
                  size="small"
                  disabled={isFirstUp}
                  onClick={() => moveUp(i)}
                >
                  <FaArrowUp style={{ fontSize: ICON_SIZE }} />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Down">
              <span>
                <IconButton
                  size="small"
                  disabled={isLastDown}
                  onClick={() => moveDn(i)}
                >
                  <FaArrowDown style={{ fontSize: ICON_SIZE }} />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        );
      },
    },
    /* field name column --------------------------------------------- */
    {
      accessorKey:"key", header:"Field", size:160,
      Cell:({ row }) => {
        const f = row.original;
        const bad = unsafe(f.key);
        return (
          <Box
            className={styles.keyCell}
            sx={{
              pl:`${Math.min(f.level, 3) * INDENT_PER_LEVEL}px`,
              color: bad ? "error.main" : undefined,
            }}
          >
            {typeToIcon[f.type]}{" "}
            <Typography variant="body2" sx={{ ml:0.5 }}>
              {f.key || <em>unnamed</em>}
            </Typography>
          </Box>
        );
      },
    },
    /* right-hand action column -------------------------------------- */
    {
      id:"ops", header:"", size:RIGHT_COL,
      enableColumnActions:false, enableSorting:false,
      Cell:({ row }) => {
        const i = row.index;
        const f = fields[i];
        const isObj =
          f.type === "object" || f.type === "array-object";

        return (
          <Box className={styles.rightCell}>
            {isObj && (
              <Tooltip title={f.locked ? "Unlock" : "Lock"}>
                <span>
                  <IconButton size="small" onClick={() => togLock(i)}>
                    {f.locked
                      ? <FaLock     style={{ fontSize: ICON_SIZE }} />
                      : <FaLockOpen style={{ fontSize: ICON_SIZE }} />}
                  </IconButton>
                </span>
              </Tooltip>
            )}
            {isObj && (
              <Tooltip title={f.locked ? "Unlock to add child" : "Add child"}>
                <span>
                  <IconButton
                    size="small"
                    onClick={() => !f.locked && addChild(i)}
                    disabled={f.locked}
                  >
                    <FaPlus style={{ fontSize: ICON_SIZE }} />
                  </IconButton>
                </span>
              </Tooltip>
            )}
            <Tooltip title="Edit">
              <span>
                <IconButton
                  size="small"
                  onClick={() => {
                    setIdx(i); setEKey(f.key); setEType(f.type);
                    setPrompt(f.aiPrompt); setOpen(true);
                  }}
                >
                  <EditIcon sx={{ fontSize: ICON_SIZE }} />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Delete">
              <span>
                <IconButton size="small" onClick={() => delRow(i)}>
                  <FaTrashAlt style={{ fontSize: ICON_SIZE }} />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        );
      },
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [fields]);

  /* --------------------------- render ------------------------------- */
  return (
    <>
      {(metaErr || descErr) && (
        <Box sx={{ color:"error.main", fontSize:12, mb:1 }}>
          {metaErr && "⚠️ ID contains disallowed text. "}
          {descErr && "⚠️ Description contains disallowed text."}
        </Box>
      )}

      {(actualViewMode === "Structure" || actualViewMode === "Split") && (
        <MaterialReactTable
          columns={cols}
          data={fields}
          enableSorting={false}
          enableColumnActions={false}
          enablePagination={false}
          muiTableProps={{
            className: styles.tableBody,
            sx: { maxHeight:"48vh", overflowY:"auto" },
          }}
          renderTopToolbar={() => (
            <Box className={styles.topBar}>
              <Tooltip
                title={
                  canAddRoot
                    ? "Add top-level object"
                    : "Enter valid ID & Description first"
                }
              >
                <span>
                  <IconButton
                    onClick={addRoot}
                    disabled={!canAddRoot}
                    sx={{ transform:"translateY(6px)" }}
                  >
                    <FaPlus />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          )}
          enableTableHead={false}
          enableBottomToolbar={false}
        />
      )}

      {/* edit-field dialog ------------------------------------------- */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Field</DialogTitle>
        <DialogContent sx={{ display:"flex", flexDirection:"column", gap:2 }}>
          <TextField
            variant="standard" label="Field name"
            error={!!editErr} helperText={editErr}
            value={eKey}
            onChange={e => {
              const v = e.target.value;
              setEKey(v);
              setEditErr(unsafe(v) ? "Disallowed text" : "");
            }}
          />
          <TextField
            variant="standard" select label="Type" value={eType}
            onChange={e => setEType(e.target.value)}
          >
            {selectOptions.map(o => (
              <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
            ))}
          </TextField>
          <TextField
            variant="standard" label="AI prompt" multiline rows={2}
            value={ePrompt} onChange={e => setPrompt(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!!editErr}
            onClick={() => {
              if (idx == null) return;
              const arr = [...fields];
              arr[idx].key      = eKey;
              arr[idx].type     = eType;
              arr[idx].aiPrompt = ePrompt;
              onChangeFields(arr);
              setOpen(false);
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FieldEditor;
