import { Navigate, useNavigate } from "react-router-dom";
import DriveSidebar from "../components/drive/DriveSidebar";
import DriveHeader from "../components/drive/DriveHeader";
import ExplorerList from "../components/drive/ExplorerList";
import { useDriveData } from "../hooks/useDriveData";
import "../styles/drive.css";
import { clearToken, decodeJwtPayload, getStoredValidToken, isJwtValid } from "../utils/auth";

function DrivePage() {
  const token = getStoredValidToken();
  const navigate = useNavigate();

  const {
    currentFolderId,
    setCurrentFolderId,
    folders,
    files,
    message,
    messageType,
    loading,
    createFolderAction,
    uploadFileAction,
    deleteFileAction,
    moveFileAction,
    deleteFolderAction,
    moveFolderAction,
    openFileAction,
  } = useDriveData(token);

  if (!isJwtValid(token)) {
    return <Navigate to="/signin" replace />;
  }

  const handleLogout = () => {
    clearToken();
    navigate("/");
  };

  const jwtPayload = decodeJwtPayload(token) || {};
  const profileLabel = (jwtPayload.email?.[0] || jwtPayload.name?.[0] || "U").toUpperCase();
  const folderById = new Map(folders.map((folder) => [folder.id, folder]));

  const handleGoRoot = () => {
    setCurrentFolderId(null);
  };

  const handleOpenFolder = (folder) => {
    setCurrentFolderId(folder.id);
  };

  const visibleFolders = folders.filter(
    (folder) => String(folder.parentFolder || "") === String(currentFolderId || "")
  );
  const visibleFiles = files.filter(
    (file) => String(file.folderId || "") === String(currentFolderId || "")
  );

  const getCurrentPathLabel = () => {
    if (!currentFolderId) return "Root";
    const names = [];
    let cursor = folderById.get(currentFolderId);
    while (cursor) {
      names.push(cursor.name);
      cursor = cursor.parentFolder ? folderById.get(String(cursor.parentFolder)) : null;
    }
    return `Root / ${names.reverse().join(" / ")}`;
  };

  const getBreadcrumbs = () => {
    const crumbs = [{ id: null, label: "Root" }];
    if (!currentFolderId) return crumbs;

    const chain = [];
    let cursor = folderById.get(currentFolderId);
    while (cursor) {
      chain.push({ id: cursor.id, label: cursor.name });
      cursor = cursor.parentFolder ? folderById.get(String(cursor.parentFolder)) : null;
    }
    return [...crumbs, ...chain.reverse()];
  };

  const breadcrumbs = getBreadcrumbs();
  const isCurrentFolderEmpty = visibleFolders.length === 0 && visibleFiles.length === 0;

  return (
    <main className="drive-page">
      <DriveSidebar
        currentFolderId={currentFolderId}
        folders={folders}
        onOpenFolder={handleOpenFolder}
        loading={loading}
        onCreateFolder={createFolderAction}
        onUploadFile={uploadFileAction}
        onMoveFolder={moveFolderAction}
        onDeleteFolder={deleteFolderAction}
        onLogout={handleLogout}
        profileLabel={profileLabel}
      />

      <section className="drive-content-area">
        <DriveHeader />
        <nav className="drive-breadcrumb" aria-label="Current folder path">
          {breadcrumbs.map((crumb, index) => (
            <span key={`${crumb.id ?? "root"}-${index}`} className="crumb-wrap">
              <button
                type="button"
                className="crumb-btn"
                onClick={() => setCurrentFolderId(crumb.id)}
                disabled={index === breadcrumbs.length - 1}
              >
                {crumb.label}
              </button>
              {index < breadcrumbs.length - 1 ? <span className="crumb-sep">/</span> : null}
            </span>
          ))}
        </nav>
        {message ? (
          <div
            className={
              messageType === "error"
                ? "drive-status-banner error"
                : messageType === "success"
                  ? "drive-status-banner success"
                  : "drive-status-banner"
            }
          >
            {message}
          </div>
        ) : null}

        {isCurrentFolderEmpty ? <section className="drive-empty-space" /> : null}

        {!isCurrentFolderEmpty ? (
          <ExplorerList
            folders={visibleFolders}
            files={visibleFiles}
            allFolders={folders}
            onOpenFolder={handleOpenFolder}
            onOpenFile={(fileId) => openFileAction(fileId, false)}
            onDownloadFile={(fileId) => openFileAction(fileId, true)}
            onMoveFile={moveFileAction}
            onDeleteFile={deleteFileAction}
            onMoveFolder={moveFolderAction}
            onDeleteFolder={deleteFolderAction}
          />
        ) : null}
      </section>
    </main>
  );
}

export default DrivePage;
