// Controls panel for adjusting a single layer's position, rotation, scale, and opacity

import type { Layer } from "../types";

// Props for LayerControls
type Props = {
  layer: Layer;
  onUpdate: (key: keyof Omit<Layer, "id" | "src">, value: number) => void;
  onReset: () => void;
};

// Props for the reusable Slider sub-component
type SliderProps = {
  id: string;
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
};

// A labeled range input used by LayerControls for each adjustable property
function Slider({ id, label, min, max, step = 1, value, onChange }: SliderProps) {
  return (
    <div className="control-row">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

// Renders all sliders for the currently selected layer and a button to reset it to defaults
export default function LayerControls({ layer, onUpdate, onReset }: Props) {
  return (
    <div className="control-section">
      <h3>{layer.id} controls</h3>
      <Slider id="x-range"        label={`X offset: ${layer.offsetX}px`}                  min={-300} max={300}  value={layer.offsetX}  onChange={(v) => onUpdate("offsetX", v)} />
      <Slider id="y-range"        label={`Y offset: ${layer.offsetY}px`}                  min={-300} max={300}  value={layer.offsetY}  onChange={(v) => onUpdate("offsetY", v)} />
      <Slider id="rotation-range" label={`Rotation: ${layer.rotation}°`}                  min={-180} max={180}  value={layer.rotation} onChange={(v) => onUpdate("rotation", v)} />
      <Slider id="scale-range"    label={`Scale: ${layer.scale.toFixed(2)}`}              min={0.1}  max={2}    step={0.01} value={layer.scale}   onChange={(v) => onUpdate("scale", v)} />
      <Slider id="opacity-range"  label={`Opacity: ${Math.round((layer.opacity ?? 1) * 100)}%`} min={0}    max={1}    step={0.01} value={layer.opacity ?? 1} onChange={(v) => onUpdate("opacity", v)} />
      <button type="button" className="reset-button" onClick={onReset}>
        Reset layer
      </button>
    </div>
  );
}
