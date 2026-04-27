import { useState } from "react";

function NewMenu({ onCreateFolder, onUploadFile, onClose, loading }) {
  const [mode, setMode] = useState("folder");
  const [folderName, setFolderName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const submitFolder = () => {
    if (!folderName.trim()) return;
    onCreateFolder(folderName.trim());
    setFolderName("");
    onClose();
  };

  const submitFile = () => {
    if (!selectedFile) return;
    onUploadFile(selectedFile);
    setSelectedFile(null);
    onClose();
  };

  return (
    <section className="new-menu">
      <div className="new-menu-head">
        <h4>Create New</h4>
        <button type="button" className="new-menu-close" onClick={onClose}>
          x
        </button>
      </div>

      <div className="new-menu-tabs">
        <button
          type="button"
          className={mode === "folder" ? "active" : ""}
          onClick={() => setMode("folder")}
        >
          New Folder
        </button>
        <button type="button" className={mode === "file" ? "active" : ""} onClick={() => setMode("file")}>
          Upload File
        </button>
      </div>

      {mode === "folder" ? (
        <div className="new-menu-panel">
          <label htmlFor="folderName">Folder name</label>
          <input
            id="folderName"
            type="text"
            placeholder="Enter folder name"
            value={folderName}
            onChange={(event) => setFolderName(event.target.value)}
          />
          <button type="button" onClick={submitFolder} disabled={loading || !folderName.trim()}>
            Create Folder
          </button>
        </div>
      ) : (
        <div className="new-menu-panel">
          <label htmlFor="uploadFile">Select file</label>
          <input
            id="uploadFile"
            type="file"
            onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
          />
          <button type="button" onClick={submitFile} disabled={loading || !selectedFile}>
            Upload
          </button>
        </div>
      )}
    </section>
  );
}

export default NewMenu;
