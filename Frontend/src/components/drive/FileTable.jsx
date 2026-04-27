import { useEffect, useRef, useState } from "react";

function formatSize(size) {
  if (!size && size !== 0) return "-";
  const kb = 1024;
  const mb = kb * 1024;
  if (size >= mb) return `${(size / mb).toFixed(1)} MB`;
  if (size >= kb) return `${(size / kb).toFixed(1)} KB`;
  return `${size} B`;
}

function getSimpleFileType(file) {
  const name = file.originalName || "";
  const extension = name.includes(".") ? name.split(".").pop().toUpperCase() : "";
  if (extension) return extension;

  const mime = (file.mimeType || "").toLowerCase();
  if (!mime) return "File";
  if (mime.includes("pdf")) return "PDF";
  if (mime.includes("image")) return "Image";
  if (mime.includes("video")) return "Video";
  if (mime.includes("audio")) return "Audio";
  if (mime.includes("spreadsheet") || mime.includes("excel")) return "Sheet";
  if (mime.includes("presentation") || mime.includes("powerpoint")) return "Slides";
  if (mime.includes("word") || mime.includes("document")) return "Doc";
  if (mime.includes("zip") || mime.includes("compressed")) return "Archive";
  return "File";
}

function FileTable({ files, folders, onDelete, onMove, onOpenInline, onDownload }) {
  const [openMenuFor, setOpenMenuFor] = useState(null);
  const menuRootRef = useRef(null);

  useEffect(() => {
    const onMouseDown = (event) => {
      if (!menuRootRef.current?.contains(event.target)) {
        setOpenMenuFor(null);
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  return (
    <section className="drive-card">
      <h3>Files</h3>

      {files.length > 0 ? (
        <div className="file-table-wrap" ref={menuRootRef}>
          <table className="file-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Size</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file._id}>
                  <td className="file-name-cell" title={file.originalName}>
                    {file.originalName}
                  </td>
                  <td>
                    <span className="file-type-pill">{getSimpleFileType(file)}</span>
                  </td>
                  <td>{formatSize(file.size)}</td>
                  <td className="table-actions">
                    <div className="kebab-wrap">
                      <button
                        type="button"
                        className="kebab-btn"
                        onClick={() => setOpenMenuFor((prev) => (prev === file._id ? null : file._id))}
                        aria-label="File actions"
                      >
                        <span className="kebab-dots" aria-hidden="true">
                          <span />
                          <span />
                          <span />
                        </span>
                      </button>
                      {openMenuFor === file._id ? (
                        <div className="kebab-menu">
                          <button
                            type="button"
                            onClick={() => {
                              onOpenInline(file._id);
                              setOpenMenuFor(null);
                            }}
                          >
                            Open
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onDownload(file._id);
                              setOpenMenuFor(null);
                            }}
                          >
                            Download
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onMove(file._id, null);
                              setOpenMenuFor(null);
                            }}
                          >
                            Move to Root
                          </button>
                          {folders.map((folder) => (
                            <button
                              key={`${file._id}-${folder.id}`}
                              type="button"
                              onClick={() => {
                                onMove(file._id, folder.id);
                                setOpenMenuFor(null);
                              }}
                            >
                              Move to {folder.name}
                            </button>
                          ))}
                          <button
                            type="button"
                            className="danger"
                            onClick={() => {
                              onDelete(file._id);
                              setOpenMenuFor(null);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}

export default FileTable;
