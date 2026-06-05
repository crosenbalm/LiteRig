// Renders all model layers as absolutely-positioned images scaled and centered in the preview area

import { useRef, type CSSProperties } from "react";
import type { Layer } from "../types";

// Scale and offset that maps model-space coordinates to screen pixels
type FitTransform = { scale: number; offsetX: number; offsetY: number };

// Props for PreviewCanvas
type Props = {
  layers: Layer[];
  fitTransform: FitTransform;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  onCanvasMount: (node: HTMLDivElement | null) => void;
};

// Renders each layer as a positioned <img>, applying fitTransform so the full model
// stays centered and fills the available preview space
export default function PreviewCanvas({ layers, fitTransform, canvasRef, onCanvasMount }: Props) {
  return (
    <div className="preview-frame">
      <div
        className="preview-canvas"
        ref={(node) => {
          canvasRef.current = node;
          onCanvasMount(node);
        }}
      >
        {layers.map((layer) => {
          const style: CSSProperties = {
            position: "absolute",
            transformOrigin: "0 0",  // rotation/scale origin is the layer's top-left corner
            pointerEvents: "none",
            display: "block",
            left: `${(layer.x + layer.offsetX) * fitTransform.scale + fitTransform.offsetX}px`,
            top:  `${(layer.y + layer.offsetY) * fitTransform.scale + fitTransform.offsetY}px`,
            transform: `rotate(${layer.rotation}deg) scale(${layer.scale})`,
            opacity: layer.opacity,
            ...(typeof layer.width === "number" && typeof layer.height === "number"
              ? { width: `${layer.width * fitTransform.scale}px`, height: `${layer.height * fitTransform.scale}px` }
              : {}),
          };
          return <img key={layer.id} src={layer.src} alt={layer.id} style={style} />;
        })}
      </div>
    </div>
  );
}
