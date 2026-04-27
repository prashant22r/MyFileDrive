function FolderSection({ folders, onOpenFolder, onGoRoot }) {
  return (
    <section className="drive-card">
      <div className="drive-card-head">
        <h3>Folders</h3>
        <button type="button" className="ghost" onClick={onGoRoot}>
          Root
        </button>
      </div>

      {folders.length === 0 ? <p className="drive-muted">No folders in this location.</p> : null}

      <div className="folder-grid">
        {folders.map((folder) => (
          <button key={folder.id} type="button" className="folder-item" onClick={() => onOpenFolder(folder.id)}>
            <span className="folder-icon">[DIR]</span>
            <span className="folder-name">{folder.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export default FolderSection;
