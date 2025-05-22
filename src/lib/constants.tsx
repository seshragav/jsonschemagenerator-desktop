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
 * File   : constants.tsx
 * Author : Sesh Ragavachari
 * Date   : 2025-04-30
 * Version: 1.0
 * ------------------------------------------------------------------
 * Purpose
 *  Central repository for visual constants and shared dropdown data.
 *  – JSON-type <Select> options
 *  – React-icon mapping for each JSON type
 *  All UI components should import from here to stay in sync.
 * ------------------------------------------------------------------ */

import {
  FaFont,
  FaHashtag,
  FaCheckSquare,
  FaList,
  FaCubes,
} from "react-icons/fa";

/* ------------------------------------------------------------------ */
/* Visual constants                                                   */
/* ------------------------------------------------------------------ */
export const ICON_SIZE = 14;

/* ------------------------------------------------------------------ */
/* Canonical <Select> options for JSON value types                    */
/* ------------------------------------------------------------------ */
export const TYPE_OPTIONS = [
  { value: "string",       label: "String"        },
  { value: "number",       label: "Number"        },
  { value: "boolean",      label: "Boolean"       },
  { value: "integer",      label: "Integer"       },
  { value: "object",       label: "Object"        },
  { value: "array-string", label: "Array-String"  },
  { value: "array-number", label: "Array-Number"  },
  { value: "array-object", label: "Array-Object"  },
] as const;

/* Backwards-compat alias (legacy imports) */
export const selectOptions = TYPE_OPTIONS;

/* ------------------------------------------------------------------ */
/* Icon mapping for quick inline rendering                            */
/* ------------------------------------------------------------------ */
export const TYPE_ICON: Record<string, JSX.Element> = {
  string : <FaFont        style={{ fontSize: ICON_SIZE }} />,
  number : <FaHashtag     style={{ fontSize: ICON_SIZE }} />,
  integer: <FaHashtag     style={{ fontSize: ICON_SIZE }} />,
  boolean: <FaCheckSquare style={{ fontSize: ICON_SIZE }} />,
  object : <FaCubes       style={{ fontSize: ICON_SIZE }} />,
  array  : <FaList        style={{ fontSize: ICON_SIZE }} />,
};

/* Extended map covering array-* composite types */
export const typeToIcon: Record<string, JSX.Element> = {
  ...TYPE_ICON,
  "array-string": <FaList style={{ fontSize: ICON_SIZE }} />,
  "array-number": <FaList style={{ fontSize: ICON_SIZE }} />,
  "array-object": <FaList style={{ fontSize: ICON_SIZE }} />,
};
