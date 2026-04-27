import { useCallback, useEffect, useState } from "react";
import {
  createFolder,
  deleteFolder,
  deleteFile,
  getFilePreviewUrl,
  listFiles,
  listFolders,
  moveFile,
  moveFolder,
  uploadFile,
} from "../services/driveApi";

export function useDriveData(token) {
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState("Welcome to your Drive.");
  const [messageType, setMessageType] = useState("info");
  const [loading, setLoading] = useState(false);

  const refreshExplorer = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const discoveredFolders = [];
      const queue = [null];

      while (queue.length > 0) {
        const parentFolderId = queue.shift();
        const folderData = await listFolders({ token, parentFolderId });
        const children = folderData.folders || [];
        for (const child of children) {
          discoveredFolders.push(child);
          queue.push(child.id);
        }
      }

      const folderIdsForFileScan = [null, ...discoveredFolders.map((folder) => folder.id)];
      const fileResults = await Promise.all(
        folderIdsForFileScan.map((folderId) => listFiles({ token, folderId }))
      );
      const discoveredFiles = fileResults.flatMap((result) => result.files || []);

      setFolders(discoveredFolders);
      setFiles(discoveredFiles);
      setMessage("Synced");
      setMessageType("success");
    } catch (error) {
      setMessage(error.message);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const createFolderAction = async (name) => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const data = await createFolder({ token, name: name.trim(), parentFolderId: currentFolderId });
      setMessage(data.message || "Folder created");
      setMessageType("success");
      await refreshExplorer();
    } catch (error) {
      setMessage(error.message);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const uploadFileAction = async (file) => {
    if (!file) return;
    setLoading(true);
    try {
      const data = await uploadFile({ token, file, folderId: currentFolderId });
      setMessage(data.message || "File uploaded");
      setMessageType("success");
      await refreshExplorer();
    } catch (error) {
      setMessage(error.message);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const deleteFileAction = async (fileId) => {
    setLoading(true);
    try {
      const data = await deleteFile({ token, fileId });
      setMessage(data.message || "File deleted");
      setMessageType("success");
      await refreshExplorer();
    } catch (error) {
      setMessage(error.message);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const moveFileAction = async (fileId, folderId = null) => {
    setLoading(true);
    try {
      const data = await moveFile({ token, fileId, folderId });
      setMessage(data.message || "File moved");
      setMessageType("success");
      await refreshExplorer();
    } catch (error) {
      setMessage(error.message);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const deleteFolderAction = async (folderId) => {
    setLoading(true);
    try {
      const data = await deleteFolder({ token, folderId });
      setMessage(data.message || "Folder deleted");
      setMessageType("success");
      await refreshExplorer();
    } catch (error) {
      setMessage(error.message);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const moveFolderAction = async (folderId, parentFolderId = null) => {
    setLoading(true);
    try {
      const data = await moveFolder({ token, folderId, parentFolderId });
      setMessage(data.message || "Folder moved");
      setMessageType("success");
      await refreshExplorer();
    } catch (error) {
      setMessage(error.message);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const openFileAction = async (fileId, download = false) => {
    try {
      const data = await getFilePreviewUrl({ token, fileId, download });
      if (data.url) {
        window.open(data.url, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      setMessage(error.message);
      setMessageType("error");
    }
  };

  useEffect(() => {
    refreshExplorer();
  }, [refreshExplorer]);

  return {
    currentFolderId,
    setCurrentFolderId,
    folders,
    files,
    message,
    messageType,
    loading,
    refreshExplorer,
    createFolderAction,
    uploadFileAction,
    deleteFileAction,
    moveFileAction,
    deleteFolderAction,
    moveFolderAction,
    openFileAction,
  };
}
