import { useEffect, useRef, useState } from "react";
import logo from "../../logo.png";
import NewMenu from "./NewMenu";

function DriveSidebar({
  currentFolderId,
  folders,
  onOpenFolder,
  loading,
  onCreateFolder,
  onUploadFile,
  onMoveFolder,
  onDeleteFolder,
  onLogout,
  profileLabel,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFolderMenuFor, setOpenFolderMenuFor] = useState(null);
  const folderMenuRootRef = useRef(null);

  useEffect(() => {
    const onMouseDown = (event) => {
      if (!folderMenuRootRef.current?.contains(event.target)) {
        setOpenFolderMenuFor(null);
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  return (
    <aside className="drive-sidebar">
      <div className="drive-brand">
        <img src={logo} alt="MyFileDrive logo" />
        <span>MyFileDrive</span>
      </div>

      <div className="sidebar-plus-wrap">
        <button type="button" className="drive-primary" onClick={() => setMenuOpen((prev) => !prev)}>
          + New
        </button>
        {menuOpen ? (
          <div className="new-menu-overlay" onClick={() => setMenuOpen(false)}>
            <div onClick={(event) => event.stopPropagation()}>
              <NewMenu
                onCreateFolder={onCreateFolder}
                onUploadFile={onUploadFile}
                onClose={() => setMenuOpen(false)}
                loading={loading}
              />
            </div>
          </div>
        ) : null}
      </div>

      {folders.length > 0 ? (
        <section className="sidebar-folders">
          <h4>Folders</h4>
          <div className="sidebar-folder-list" ref={folderMenuRootRef}>
            {folders.map((folder) => (
              <div key={folder.id} className="sidebar-folder-row">
                <button
                  type="button"
                  className={currentFolderId === folder.id ? "active-folder folder-open-btn" : "folder-open-btn"}
                  onClick={() => onOpenFolder(folder)}
                >
                  {folder.name}
                </button>
                <div className="sidebar-folder-menu-wrap">
                  <button
                    type="button"
                    className="sidebar-folder-menu-btn"
                    onClick={() => setOpenFolderMenuFor((prev) => (prev === folder.id ? null : folder.id))}
                  >
                    <span className="kebab-dots" aria-hidden="true">
                      <span />
                      <span />
                      <span />
                    </span>
                  </button>
                  {openFolderMenuFor === folder.id ? (
                    <div className="sidebar-folder-menu">
                      <button
                        type="button"
                        className="danger"
                        onClick={() => {
                          onDeleteFolder(folder.id);
                          setOpenFolderMenuFor(null);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <div className="sidebar-footer">
        <div className="profile-avatar sidebar-avatar" title={profileLabel}>
          {profileLabel}
        </div>
        <button type="button" className="sidebar-logout" onClick={onLogout}>
          Logout
        </button>
      </div>
    </aside>
  );
}

export default DriveSidebar;
