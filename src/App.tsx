// Root component — manages all app state and wires together the UI components

import { useState, useEffect, useRef, type ChangeEvent } from "react";
import PSD from "@webtoon/psd";
import "./App.css";

import type { Layer, ViewMode } from "./types";
import { normalizePsdLayers } from "./psdUtils";
import { computeFitTransform, computeLayerBounds, loadLayerDimensions } from "./layerUtils";
import ChooseScreen from "./components/ChooseScreen";
import LayerControls from "./components/LayerControls";
import LayerPicker from "./components/LayerPicker";
import PreviewCanvas from "./components/PreviewCanvas";

// Layers are rendered in array order (first = bottom). Images served from /public/test-avatar/.
const initialLayers: Layer[] = [
  { id: "irisL", src: "/test-avatar/irisL.png", x: 0, y: 0, offsetX: 0, offsetY: 0, rotation: 0, scale: 1, opacity: 1 },
  { id: "irisR", src: "/test-avatar/irisR.png", x: 0, y: 0, offsetX: 0, offsetY: 0, rotation: 0, scale: 1, opacity: 1 },
  { id: "eyeL",  src: "/test-avatar/eyeL.png",  x: 0, y: 0, offsetX: 0, offsetY: 0, rotation: 0, scale: 1, opacity: 1 },
  { id: "eyeR",  src: "/test-avatar/eyeR.png",  x: 0, y: 0, offsetX: 0, offsetY: 0, rotation: 0, scale: 1, opacity: 1 },
  { id: "mouth", src: "/test-avatar/mouth.png", x: 0, y: 0, offsetX: 0, offsetY: 0, rotation: 0, scale: 1, opacity: 1 },
  { id: "head",  src: "/test-avatar/head.png",  x: 0, y: 0, offsetX: 0, offsetY: 0, rotation: 0, scale: 1, opacity: 1 },
  { id: "neck",  src: "/test-avatar/neck.png",  x: 0, y: 0, offsetX: 0, offsetY: 0, rotation: 0, scale: 1, opacity: 1 },
];

function App() {
  const [viewMode, setViewMode]               = useState<ViewMode>("choose");
  const [layers, setLayers]                   = useState<Layer[]>(initialLayers);
  const [selectedLayerId, setSelectedLayerId] = useState<string>(initialLayers[0].id);
  const [sourceLabel, setSourceLabel]         = useState("Provided test avatar");
  const [statusMessage, setStatusMessage]     = useState<string | null>(null);
  const [fitTransform, setFitTransform]       = useState({ scale: 1, offsetX: 0, offsetY: 0 });
  const [canvasSize, setCanvasSize]           = useState({ width: 0, height: 0 });
  const [previewElement, setPreviewElement]   = useState<HTMLDivElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);

  const selectedLayer = layers.find((l) => l.id === selectedLayerId) ?? layers[0];

  // Updates a single numeric property on the selected layer (used by all sliders)
  const updateSelectedLayer = (key: keyof Omit<Layer, "id" | "src">, value: number) => {
    setLayers((prev) => prev.map((l) => l.id === selectedLayerId ? { ...l, [key]: value } : l));
  };

  // Resets all user-adjustable properties of the selected layer back to defaults
  const resetSelected = () => {
    setLayers((prev) => prev.map((l) =>
      l.id === selectedLayerId ? { ...l, offsetX: 0, offsetY: 0, rotation: 0, scale: 1, opacity: 1 } : l
    ));
  };

  // Loads layers, computes bounds, fits to preview, and switches to the given view mode
  const applyLayersAndFit = async (newLayers: Layer[], label: string, mode: ViewMode) => {
    const loaded = await loadLayerDimensions(newLayers);
    const bounds = computeLayerBounds(loaded);
    const w = previewElement?.clientWidth  || canvasSize.width  || 640;
    const h = previewElement?.clientHeight || canvasSize.height || 640;
    setLayers(loaded);
    setSelectedLayerId(loaded[0].id);
    setSourceLabel(label);
    setFitTransform(computeFitTransform(bounds, w, h));
    setStatusMessage(null);
    setViewMode(mode);
  };

  // Loads the built-in test avatar and switches to the test view
  const handleUseTestFile = async () => {
    setStatusMessage("Loading test preview...");
    await applyLayersAndFit([...initialLayers].reverse(), "Provided test avatar", "test");
  };

  // Parses a user-supplied PSD file, extracts its layers, and switches to the import view
  const handlePsdFile = async (file: File) => {
    try {
      setStatusMessage("Parsing PSD file...");
      const psd = PSD.parse(await file.arrayBuffer());
      const { layers: imported, bounds } = await normalizePsdLayers(psd);
      if (imported.length === 0) { setStatusMessage("No visible layers found in PSD."); return; }
      const w = previewElement?.clientWidth  || canvasSize.width  || 640;
      const h = previewElement?.clientHeight || canvasSize.height || 640;
      setFitTransform(computeFitTransform(bounds, w, h));
      setLayers(imported);
      setSelectedLayerId(imported[0].id);
      setSourceLabel(file.name);
      setStatusMessage(null);
      setViewMode("import");
    } catch (error) {
      console.error(error);
      setStatusMessage("Failed to import PSD. Please try a different file.");
    }
  };

  // Called when the user selects a file via the file input; forwards to handlePsdFile
  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) await handlePsdFile(file);
  };

  // Watch the preview container for size changes so fitTransform stays accurate on resize
  useEffect(() => {
    if (!previewElement) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setCanvasSize({ width, height });
      }
    });
    observer.observe(previewElement);
    setCanvasSize({ width: previewElement.clientWidth, height: previewElement.clientHeight });
    return () => observer.disconnect();
  }, [previewElement]);

  // Re-fit the model whenever the canvas size changes (e.g. window resize)
  useEffect(() => {
    if (viewMode === "choose" || canvasSize.width === 0 || canvasSize.height === 0 || layers.length === 0) return;
    let active = true;
    const refit = async () => {
      const loaded = await loadLayerDimensions(layers);
      if (!active) return;
      setLayers((current) => {
        const changed = loaded.some((l, i) => !current[i] || current[i].width !== l.width || current[i].height !== l.height);
        return changed ? loaded : current;
      });
      setFitTransform(computeFitTransform(computeLayerBounds(loaded), canvasSize.width, canvasSize.height));
    };
    refit();
    return () => { active = false; };
  }, [viewMode, canvasSize.width, canvasSize.height, layers]);

  if (viewMode === "choose") {
    return <ChooseScreen statusMessage={statusMessage} onUseTestFile={handleUseTestFile} onFileChange={handleFileChange} />;
  }

  return (
    <div className="app-shell">
      <section className="preview-panel">
        <div className="source-bar">
          <div><strong>Source:</strong> {sourceLabel}</div>
          <button type="button" onClick={() => setViewMode("choose")}>Choose another source</button>
        </div>
        <h1>LiteRig PNG Studio</h1>
        <p className="subtitle">Move, rotate, and scale your PNG layers with sliders.</p>
        <PreviewCanvas layers={layers} fitTransform={fitTransform} canvasRef={previewRef} onCanvasMount={setPreviewElement} />
      </section>

      <aside className="controls-panel">
        <LayerControls key={selectedLayer.id} layer={selectedLayer} onUpdate={updateSelectedLayer} onReset={resetSelected} />
        <LayerPicker layers={layers} selectedLayerId={selectedLayerId} onSelect={setSelectedLayerId} />
      </aside>
    </div>
  );
}

export default App;
