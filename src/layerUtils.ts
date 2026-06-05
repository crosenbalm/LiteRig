// Pure utility functions for computing layer layout and dimensions

import type { Layer, Bounds } from "./types";

// Calculates a uniform scale + offset so the model fits centered in the preview area
export const computeFitTransform = (bounds: Bounds, width: number, height: number) => {
  const modelWidth = bounds.maxX - bounds.minX;
  const modelHeight = bounds.maxY - bounds.minY;
  if (!Number.isFinite(modelWidth) || !Number.isFinite(modelHeight) || modelWidth <= 0 || modelHeight <= 0) {
    return { scale: 1, offsetX: 0, offsetY: 0 };
  }
  const padding = 24;
  const availableWidth = Math.max(width - padding * 2, 100);
  const availableHeight = Math.max(height - padding * 2, 100);
  const scale = Math.min(availableWidth / modelWidth, availableHeight / modelHeight);
  const offsetX = (availableWidth - modelWidth * scale) / 2 - bounds.minX * scale + padding;
  const offsetY = (availableHeight - modelHeight * scale) / 2 - bounds.minY * scale + padding;
  return { scale, offsetX, offsetY };
};

// Computes the axis-aligned bounding box that contains all layers (including their offsets)
export const computeLayerBounds = (layers: Layer[]): Bounds => {
  const bounds: Bounds = {
    minX: Number.POSITIVE_INFINITY,
    minY: Number.POSITIVE_INFINITY,
    maxX: Number.NEGATIVE_INFINITY,
    maxY: Number.NEGATIVE_INFINITY,
  };
  for (const layer of layers) {
    const w = typeof layer.width === "number" ? layer.width : 0;
    const h = typeof layer.height === "number" ? layer.height : 0;
    bounds.minX = Math.min(bounds.minX, layer.x + layer.offsetX);
    bounds.minY = Math.min(bounds.minY, layer.y + layer.offsetY);
    bounds.maxX = Math.max(bounds.maxX, layer.x + layer.offsetX + w);
    bounds.maxY = Math.max(bounds.maxY, layer.y + layer.offsetY + h);
  }
  if (!Number.isFinite(bounds.minX) || !Number.isFinite(bounds.minY)) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  }
  return bounds;
};

// Ensures every layer has width/height set. For test-avatar layers these aren't known until
// the browser loads the image, so we wait for the onload event when needed.
export const loadLayerDimensions = async (layers: Layer[]): Promise<Layer[]> => {
  return Promise.all(
    layers.map((layer) => {
      if (typeof layer.width === "number" && typeof layer.height === "number") {
        return Promise.resolve(layer);
      }
      return new Promise<Layer>((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ ...layer, width: img.naturalWidth, height: img.naturalHeight });
        img.onerror = () => resolve({ ...layer, width: 0, height: 0 });
        img.src = layer.src;
      });
    }),
  );
};
