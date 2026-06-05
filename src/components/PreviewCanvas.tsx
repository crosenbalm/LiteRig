// Renders all model layers as absolutely-positioned images scaled and centered in the preview area

import { type CSSProperties } from "react";
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
          const screenX = (layer.x + layer.offsetX) * fitTransform.scale + fitTransform.offsetX;
          const screenY = (layer.y + layer.offsetY) * fitTransform.scale + fitTransform.offsetY;
          const screenW = (layer.width  ?? 0) * fitTransform.scale;
          const screenH = (layer.height ?? 0) * fitTransform.scale;

          // left/top position the top-left corner; transformOrigin 50% 50% pivots
          // rotation and scale around the layer's own center
          const style: CSSProperties = {
            position: "absolute",
            pointerEvents: "none",
            display: "block",
            left: `${screenX}px`,
            top:  `${screenY}px`,
            width:  `${screenW}px`,
            height: `${screenH}px`,
            transformOrigin: "50% 50%",
            transform: `rotate(${layer.rotation}deg) scale(${layer.scale})`,
            opacity: layer.opacity,
          };
          return <img key={layer.id} src={layer.src} alt={layer.id} style={style} />;
        })}
      </div>
    </div>
  );
}
