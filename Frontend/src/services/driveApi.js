import { API_BASE_URL } from "../config/constants";

async function request(path, { token, method = "GET", body, isFormData = false } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body && !isFormData) headers["Content-Type"] = "application/json";

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || data.error || "Request failed");
  }
  return data;
}

export function listFolders({ token, parentFolderId = null }) {
  const query = parentFolderId ? `?parentFolderId=${parentFolderId}` : "?parentFolderId=null";
  return request(`/api/folders${query}`, { token });
}

export function listFiles({ token, folderId = null }) {
  const query = folderId ? `?folderId=${folderId}` : "?folderId=null";
  return request(`/api/files${query}`, { token });
}

export function createFolder({ token, name, parentFolderId = null }) {
  return request("/api/folders", {
    token,
    method: "POST",
    body: { name, parentFolderId },
  });
}

export function uploadFile({ token, file, folderId = null }) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folderId", folderId || "null");

  return request("/api/upload", {
    token,
    method: "POST",
    body: formData,
    isFormData: true,
  });
}

export function deleteFile({ token, fileId }) {
  return request(`/api/files/${fileId}`, {
    token,
    method: "DELETE",
  });
}

export function moveFile({ token, fileId, folderId = null }) {
  return request(`/api/files/${fileId}`, {
    token,
    method: "PATCH",
    body: { folderId: folderId || null },
  });
}

export function deleteFolder({ token, folderId }) {
  return request(`/api/folders/${folderId}`, {
    token,
    method: "DELETE",
  });
}

export function moveFolder({ token, folderId, parentFolderId = null }) {
  return request(`/api/folders/${folderId}/move`, {
    token,
    method: "PATCH",
    body: { parentFolderId: parentFolderId || null },
  });
}

export function getFilePreviewUrl({ token, fileId, download = false }) {
  return request(`/api/files/${fileId}/url?download=${download ? "true" : "false"}`, {
    token,
  });
}
