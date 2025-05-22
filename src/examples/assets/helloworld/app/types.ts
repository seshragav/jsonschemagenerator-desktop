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
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 * ------------------------------------------------------------------
 * File   : types.ts
 * Author : Sesh Ragavachari
 * Date   : 2025-04-30
 * Version: 1.0
 * ------------------------------------------------------------------
 * Purpose
 *  Shared types and helpers for the *helloworld* dessert-map demo.
 * ------------------------------------------------------------------ */

export interface Recipe {
  ingredients : string[];
  instructions: string[];
}

export interface Dessert {
  /** Country of origin (displayed on card). */
  country      : string;
  /** Comma-separated "lat, lon" string from the JSON file. */
  geocordinates: string;
  /** Short cultural background paragraph. */
  background   : string;
  recipe       : Recipe;
  /** Café / bakery suggestions to link to Google search. */
  whereToGet   : string[];
  /** Card title. */
  dessertName  : string;
  /** Optional image URL (shown on card front). */
  image?       : string;
}

/**
 * Converts `"lat, lon"` → `[lon, lat]` because
 * `react-simple-maps` expects reverse order.
 */
export const parseCoords = (geo: string): [number, number] => {
  const [lat, lon] = geo.split(/,\s*/).map(Number);
  return [lon, lat];
};
