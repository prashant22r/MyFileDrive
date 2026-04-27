import { useEffect, useMemo, useRef, useState } from "react";

function formatSize(size) {
  if (size === null || size === undefined) return "-";
  const kb = 1024;
  const mb = kb * 1024;
  if (size >= mb) return `${(size / mb).toFixed(1)} MB`;
  if (size >= kb) return `${(size / kb).toFixed(1)} KB`;
  return `${size} B`;
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getFileExtension(item) {
  const sourceName = item.originalName || item.name || "";
  if (!sourceName.includes(".")) return "";
  return sourceName.split(".").pop().toLowerCase();
}

function getItemIcon(item) {
  if (item.kind === "folder") {
    return { label: "DIR", className: "icon-folder" };
  }

  const ext = getFileExtension(item);
  if (ext === "pdf") return { label: "PDF", className: "icon-pdf" };
  if (ext === "ppt" || ext === "pptx") return { label: "PPT", className: "icon-ppt" };
  if (ext === "png") return { label: "PNG", className: "icon-png" };
  if (ext === "jpg" || ext === "jpeg" || ext === "webp" || ext === "gif") {
    return { label: "IMG", className: "icon-image" };
  }
  return { label: "FILE", className: "icon-file" };
}

function ExplorerList({
  folders,
  files,
  allFolders,
  onOpenFolder,
  onOpenFile,
  onDownloadFile,
  onMoveFile,
  onDeleteFile,
  onMoveFolder,
  onDeleteFolder,
}) {
  const [openMenuFor, setOpenMenuFor] = useState(null);
  const rootRef = useRef(null);

  useEffect(() => {
    const onMouseDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpenMenuFor(null);
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  const items = useMemo(() => {
    const folderItems = folders.map((folder) => ({
      kind: "folder",
      id: folder.id,
      name: folder.name,
      size: null,
      createdAt: folder.createdAt,
      raw: folder,
    }));
    const fileItems = files.map((file) => ({
      kind: "file",
      id: file._id,
      name: file.originalName,
      originalName: file.originalName,
      size: file.size,
      createdAt: file.createdAt,
      raw: file,
    }));
    return [...folderItems, ...fileItems].sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === "folder" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }, [folders, files]);

  return (
    <section className="drive-card" ref={rootRef}>
      <h3>Items</h3>
      <div className="file-table-wrap">
        <table className="file-table">
          <colgroup>
            <col className="col-name" />
            <col className="col-size" />
            <col className="col-date" />
            <col className="col-actions" />
          </colgroup>
          <thead>
            <tr>
              <th>Name</th>
              <th>Size</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const icon = getItemIcon(item);
              return (
              <tr key={`${item.kind}-${item.id}`}>
                <td className="file-name-cell">
                  <button
                    type="button"
                    className="item-open-btn"
                    onClick={() => (item.kind === "folder" ? onOpenFolder(item.raw) : onOpenFile(item.id))}
                    title={item.name}
                  >
                    <span className={`item-kind-badge ${icon.className}`} aria-hidden="true">
                      {icon.label}
                    </span>
                    <span className="item-name-text">{item.name}</span>
                  </button>
                </td>
                <td>{formatSize(item.size)}</td>
                <td>{formatDate(item.createdAt)}</td>
                <td className="table-actions">
                  <div className="kebab-wrap">
                    <button
                      type="button"
                      className="kebab-btn"
                      onClick={() => setOpenMenuFor((prev) => (prev === `${item.kind}-${item.id}` ? null : `${item.kind}-${item.id}`))}
                      aria-label="Item actions"
                    >
                      <span className="kebab-dots" aria-hidden="true">
                        <span />
                        <span />
                        <span />
                      </span>
                    </button>
                    {openMenuFor === `${item.kind}-${item.id}` ? (
                      <div className="kebab-menu">
                        {item.kind === "file" ? (
                          <>
                            <button type="button" onClick={() => onOpenFile(item.id)}>
                              Open
                            </button>
                            <button type="button" onClick={() => onDownloadFile(item.id)}>
                              Download
                            </button>
                            <button type="button" onClick={() => onMoveFile(item.id, null)}>
                              Move to Root
                            </button>
                            {allFolders.map((folder) => (
                              <button
                                key={`${item.id}-${folder.id}`}
                                type="button"
                                onClick={() => onMoveFile(item.id, folder.id)}
                              >
                                Move to {folder.name}
                              </button>
                            ))}
                            <button type="button" className="danger" onClick={() => onDeleteFile(item.id)}>
                              Delete
                            </button>
                          </>
                        ) : (
                          <>
                            <button type="button" onClick={() => onOpenFolder(item.raw)}>
                              Open
                            </button>
                            <button type="button" onClick={() => onMoveFolder(item.id, null)}>
                              Move to Root
                            </button>
                            <button type="button" className="danger" onClick={() => onDeleteFolder(item.id)}>
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    ) : null}
                  </div>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default ExplorerList;
