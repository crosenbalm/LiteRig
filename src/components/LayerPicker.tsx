// List of buttons for selecting which layer is currently being edited

import type { Layer } from "../types";

// Props for LayerPicker
type Props = {
  layers: Layer[];
  selectedLayerId: string;
  onSelect: (id: string) => void;
};

// Renders a button for each layer; clicking one makes it the active layer in the controls panel
export default function LayerPicker({ layers, selectedLayerId, onSelect }: Props) {
  return (
    <div className="control-section">
      <h2>Selected layer</h2>
      <div className="layer-buttons">
        {layers.map((layer) => (
          <button
            key={layer.id}
            type="button"
            className={layer.id === selectedLayerId ? "active" : ""}
            onClick={() => onSelect(layer.id)}
          >
            {layer.id}
          </button>
        ))}
      </div>
    </div>
  );
}
