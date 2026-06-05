// Landing screen shown before any model is loaded, letting the user pick a source

import type { ChangeEvent } from "react";

// Props for ChooseScreen
type Props = {
  statusMessage: string | null;
  onUseTestFile: () => void;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

// Landing screen shown before any model is loaded
export default function ChooseScreen({ statusMessage, onUseTestFile, onFileChange }: Props) {
  return (
    <div className="entry-screen">
      <h1>Choose a source</h1>
      <p>Import a PSD file or use the built-in test avatar to start editing.</p>
      <div className="entry-buttons">
        <button type="button" onClick={onUseTestFile}>
          Use provided test file
        </button>
        <label className="file-button">
          Import PSD file
          <input type="file" accept=".psd" onChange={onFileChange} />
        </label>
      </div>
      {statusMessage && <p className="status-message">{statusMessage}</p>}
    </div>
  );
}
