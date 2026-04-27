import { useState } from "react";

function DriveActions({ currentFolderId, onCreateFolder, onUploadFile, loading }) {
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const submitFolder = () => {
    onCreateFolder(newFolderName);
    setNewFolderName("");
  };

  const submitUpload = () => {
    onUploadFile(selectedFile);
    setSelectedFile(null);
  };

  return (
    <section className="drive-actions">
      <p className="drive-folder-meta">Current folder: {currentFolderId || "Root"}</p>
      <div className="drive-action-row">
        <input
          type="text"
          placeholder="New folder name"
          value={newFolderName}
          onChange={(event) => setNewFolderName(event.target.value)}
        />
        <button type="button" onClick={submitFolder} disabled={loading || !newFolderName.trim()}>
          Create Folder
        </button>
      </div>
      <div className="drive-action-row">
        <input
          key={selectedFile ? selectedFile.name : "empty"}
          type="file"
          onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
        />
        <button type="button" onClick={submitUpload} disabled={loading || !selectedFile}>
          Upload File
        </button>
      </div>
    </section>
  );
}

export default DriveActions;
