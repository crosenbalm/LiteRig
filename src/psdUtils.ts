// Utilities for parsing PSD files into Layer objects

import { readPsd, type Layer as PsdLayer } from "ag-psd";
import type { Layer, Bounds } from "./types";

// Composites a PSD layer's canvas onto a 2D canvas and returns a PNG data URL
const createDataUrlFromLayer = (psdLayer: PsdLayer): string | null => {
  if (!psdLayer.canvas) return null;
  const canvas = document.createElement("canvas");
  canvas.width = psdLayer.canvas.width;
  canvas.height = psdLayer.canvas.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(psdLayer.canvas, 0, 0);
  return canvas.toDataURL();
};

// Walks the PSD layer tree and collects all visible pixel layers with their positions.
// Positions are normalized so the combined bounding box starts at (0, 0).
export const normalizePsdLayers = (buffer: ArrayBuffer): { layers: Layer[]; bounds: Bounds } => {
  const psd = readPsd(buffer, { skipCompositeImageData: true, skipLinkedFilesData: true });

  const result: Layer[] = [];
  const bounds: Bounds = {
    minX: Number.POSITIVE_INFINITY,
    minY: Number.POSITIVE_INFINITY,
    maxX: Number.NEGATIVE_INFINITY,
    maxY: Number.NEGATIVE_INFINITY,
  };

  const walk = (psdLayer: PsdLayer) => {
    // Skip hidden layers and groups (groups have children but no canvas)
    if (psdLayer.hidden) return;

    if (psdLayer.canvas && psdLayer.left !== undefined && psdLayer.top !== undefined) {
      const src = createDataUrlFromLayer(psdLayer);
      if (!src) return;

      const x = psdLayer.left;
      const y = psdLayer.top;
      const w = psdLayer.canvas.width;
      const h = psdLayer.canvas.height;

      // Sanitize layer name before using it as a DOM id to prevent XSS,
      // then append a counter if the name is already taken to guarantee uniqueness
      const rawName = typeof psdLayer.name === "string" ? psdLayer.name : "";
      const baseName = rawName.replace(/[^a-zA-Z0-9_-]/g, "_") || `layer-${result.length}`;
      const isDuplicate = result.some((l) => l.id === baseName || l.id.startsWith(`${baseName}-`));
      const id = isDuplicate ? `${baseName}-${result.length}` : baseName;

      result.push({ id, src, x, y, offsetX: 0, offsetY: 0, width: w, height: h, rotation: 0, scale: 1, opacity: 1 });
      bounds.minX = Math.min(bounds.minX, x);
      bounds.minY = Math.min(bounds.minY, y);
      bounds.maxX = Math.max(bounds.maxX, x + w);
      bounds.maxY = Math.max(bounds.maxY, y + h);
    }

    if (psdLayer.children) {
      for (const child of psdLayer.children) walk(child);
    }
  };

  if (psd.children) {
    for (const child of psd.children) walk(child);
  }

  // Shift all positions so the bounding box starts at (0, 0)
  if (Number.isFinite(bounds.minX) && Number.isFinite(bounds.minY)) {
    for (const layer of result) {
      layer.x -= bounds.minX;
      layer.y -= bounds.minY;
    }
    bounds.maxX -= bounds.minX;
    bounds.maxY -= bounds.minY;
    bounds.minX = 0;
    bounds.minY = 0;
  }

  return { layers: result, bounds };
};
