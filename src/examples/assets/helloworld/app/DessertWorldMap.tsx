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
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
 * BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN
 * AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
 * IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * ------------------------------------------------------------------
 * File   : DessertWorldMap.tsx
 * Author : Sesh Ragavachari
 * Date   : 2025-04-30
 * Version: 1.0
 * ------------------------------------------------------------------
 * Interactive “world desserts” map used by the *helloworld* demo.
 * ------------------------------------------------------------------ */

import React, { useMemo, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import { AnimatePresence, motion } from "framer-motion";
import Card        from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button      from "@mui/material/Button";
import IconButton  from "@mui/material/IconButton";
import CloseIcon   from "@mui/icons-material/Close";

import { DESSERTS }             from "./data";
import { Dessert, parseCoords } from "./types";

/* public TopoJSON of the world ---------------------------------- */
const geoUrl =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

/* ------------------------------------------------------------------
   HoverCard – appears on hover or when a marker is pinned
   ------------------------------------------------------------------ */
interface CardProps {
  dessert: Dessert;
  x: number;
  y: number;
  pinned: boolean;
  onClose: () => void;
}

const HoverCard: React.FC<CardProps> = ({ dessert, x, y, pinned, onClose }) => {
  const [flipped, setFlipped] = useState(false);
  const toggleFlip = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setFlipped(s => !s);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.15 }}
      style={{
        position: "fixed",
        left: x,
        top: y,
        transform: "translate(-50%, -100%)",
        zIndex: 60,
        pointerEvents: "auto",
        maxWidth: 320,
      }}
    >
      <div style={{ perspective: 1000 }}>
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.45 }}
          style={{
            position: "relative",
            width: "100%",
            transformStyle: "preserve-3d",
          }}
          onClick={!pinned ? undefined : toggleFlip}
        >
          {/* ---------- front ---------- */}
          <Card elevation={10} style={{ backfaceVisibility: "hidden" }}>
            <CardContent sx={{ p: 2 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
                  {dessert.dessertName}
                </h3>
                {pinned && (
                  <IconButton size="small" onClick={onClose}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                )}
              </div>

              {dessert.image && (
                <img
                  src={dessert.image}
                  alt={`${dessert.country} dessert`}
                  style={{
                    width: "100%",
                    maxHeight: 160,
                    objectFit: "cover",
                    marginTop: 8,
                    borderRadius: 6,
                  }}
                />
              )}

              <p style={{ marginTop: 8, fontSize: 13, lineHeight: 1.45 }}>
                {dessert.background}
              </p>

              <h4 style={{ margin: "12px 0 4px", fontSize: 14, fontWeight: 500 }}>
                Where to try
              </h4>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12 }}>
                {dessert.whereToGet.map(spot => (
                  <li key={spot} style={{ marginBottom: 2 }}>
                    <a
                      href={`https://www.google.com/search?q=${encodeURIComponent(spot)}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: "#2563eb" }}
                    >
                      {spot}
                    </a>
                  </li>
                ))}
              </ul>

              <Button
                variant="outlined"
                size="small"
                sx={{ mt: 1.2 }}
                onClick={toggleFlip}
              >
                Show Recipe
              </Button>
            </CardContent>
          </Card>

          {/* ---------- back ---------- */}
          <Card
            elevation={10}
            style={{
              backfaceVisibility: "hidden",
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              transform: "rotateY(180deg)",
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
                  {dessert.dessertName} – Recipe
                </h3>
                <IconButton size="small" onClick={toggleFlip}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </div>

              <h5 style={{ margin: "12px 0 4px", fontSize: 13, fontWeight: 600 }}>
                Ingredients
              </h5>
              <ul style={{ paddingLeft: 18, fontSize: 12 }}>
                {dessert.recipe.ingredients.map(ing => (
                  <li key={ing}>{ing}</li>
                ))}
              </ul>

              <h5 style={{ margin: "8px 0 4px", fontSize: 13, fontWeight: 600 }}>
                Instructions
              </h5>
              <ol style={{ paddingLeft: 18, fontSize: 12 }}>
                {dessert.recipe.instructions.map(step => (
                  <li key={step} style={{ marginBottom: 2 }}>
                    {step}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

/* ------------------------------------------------------------------
   Main world-map component
   ------------------------------------------------------------------ */
export default function DessertWorldMap() {
  type HoverState = { dessert: Dessert; x: number; y: number };
  /* React mouse-event alias for SVG circles */
  type SvgEvt = React.MouseEvent<SVGCircleElement, globalThis.MouseEvent>;

  const [hover,  setHover ] = useState<HoverState | null>(null);
  const [pinned, setPinned] = useState<HoverState | null>(null);

  /* pre-compute marker data --------------------------------------- */
  const markers = useMemo(
    () =>
      DESSERTS.map(d => ({
        coords: parseCoords(d.geocordinates),
        data  : d,
      })),
    [],
  );

  /* helpers ------------------------------------------------------- */
  const buildCard = (dessert: Dessert, e: SvgEvt): HoverState => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      dessert,
      x: rect.left + rect.width / 2,
      y: rect.top - 6,
    };
  };

  const handleEnter = (e: SvgEvt, d: Dessert) =>
    !pinned && setHover(buildCard(d, e));

  const handleLeave = () => !pinned && setHover(null);

  const handleClick = (e: SvgEvt, d: Dessert) => {
    e.stopPropagation();
    setPinned(buildCard(d, e));
    setHover(null);
  };

  const closePinned = () => setPinned(null);

  /* render -------------------------------------------------------- */
  return (
    <div style={{ width: "100%" }} onClick={closePinned}>
      <ComposableMap
        projectionConfig={{ scale: 170, center: [12, 0] }}
        width={980}
        height={600}
        style={{ width: "100%", height: "auto" }}
      >
        {/* world geographies */}
        <Geographies geography={geoUrl}>
          {({ geographies }: { geographies: any[] }) =>
            geographies.map(geo => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                style={{
                  default : { fill: "#e5e7eb", stroke: "#cbd5e1", strokeWidth: 0.6 },
                  hover   : { fill: "#a5b4fc", stroke: "#818cf8", strokeWidth: 0.6 },
                  pressed : { fill: "#a5b4fc", stroke: "#818cf8", strokeWidth: 0.6 },
                }}
              />
            ))
          }
        </Geographies>

        {/* dessert markers */}
        {markers.map(({ coords, data }) => (
          <Marker
            key={data.country}
            coordinates={coords}
            onMouseEnter={(e: SvgEvt) => handleEnter(e, data)}
            onMouseLeave={handleLeave}
            onClick={(e: SvgEvt) => handleClick(e, data)}
          >
            <circle
              r={6}
              style={{
                cursor: "pointer",
                fill: "#6366f1",
                stroke: "#ffffff",
                strokeWidth: 2,
              }}
            />
          </Marker>
        ))}
      </ComposableMap>

      {/* transient hover card */}
      <AnimatePresence>
        {!pinned && hover && (
          <HoverCard {...hover} pinned={false} onClose={() => {}} />
        )}
      </AnimatePresence>

      {/* pinned card */}
      <AnimatePresence>
        {pinned && <HoverCard {...pinned} pinned onClose={closePinned} />}
      </AnimatePresence>
    </div>
  );
}