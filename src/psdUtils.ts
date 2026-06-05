// Utilities for parsing PSD files into Layer objects

import type { Layer, Bounds } from "./types";

// Composites a PSD layer's raw pixels onto a canvas and returns a PNG data URL
const createDataUrlFromLayer = async (node: any): Promise<string> => {
  const pixels = await node.composite(false);
  const canvas = document.createElement("canvas");
  canvas.width = node.width;
  canvas.height = node.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.putImageData(new ImageData(pixels, node.width, node.height), 0, 0);
  return canvas.toDataURL();
};

// Walks the PSD node tree and collects all visible layers with their positions.
// Positions are normalized so the combined bounding box starts at (0, 0).
// Layers are reversed so PSD stacking order maps to CSS z-order (last = on top).
export const normalizePsdLayers = async (psd: any): Promise<{ layers: Layer[]; bounds: Bounds }> => {
  const result: Layer[] = [];
  const bounds: Bounds = {
    minX: Number.POSITIVE_INFINITY,
    minY: Number.POSITIVE_INFINITY,
    maxX: Number.NEGATIVE_INFINITY,
    maxY: Number.NEGATIVE_INFINITY,
  };

  const walk = async (node: any) => {
    if (node.type === "Layer" && node.width > 0 && node.height > 0 && !node.isHidden) {
      const src = await createDataUrlFromLayer(node);
      const x = typeof node.left === "number" ? node.left : 0;
      const y = typeof node.top === "number" ? node.top : 0;
      // Sanitize layer name before using it as a DOM id to prevent XSS
      const rawName = typeof node.name === "string" ? node.name : "";
      const id = rawName.replace(/[^a-zA-Z0-9_-]/g, "_") || `layer-${result.length}`;
      result.push({ id, src, x, y, offsetX: 0, offsetY: 0, width: node.width, height: node.height, rotation: 0, scale: 1, opacity: 1 });
      bounds.minX = Math.min(bounds.minX, x);
      bounds.minY = Math.min(bounds.minY, y);
      bounds.maxX = Math.max(bounds.maxX, x + node.width);
      bounds.maxY = Math.max(bounds.maxY, y + node.height);
    }
    if (node.children) {
      for (const child of node.children) await walk(child);
    }
  };

  await walk(psd);

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

  return { layers: result.reverse(), bounds };
};
