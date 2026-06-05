// Shared data types used across the app

// Represents a single image layer in the model with its position, transform, and display properties
export type Layer = {
  id: string;
  src: string;      // data URL (imported PSD) or public path (test avatar)
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
  width?: number;
  height?: number;
  rotation: number;
  scale: number;
  opacity: number;  // 0 (invisible) to 1 (fully visible)
};

// Axis-aligned bounding box covering all layers
export type Bounds = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

// "choose" = landing screen, "test" = built-in avatar, "import" = user-loaded PSD
export type ViewMode = "choose" | "test" | "import";
