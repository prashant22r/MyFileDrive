import { TOKEN_STORAGE_KEY } from "../config/constants";

export function decodeJwtPayload(token) {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function isJwtValid(token) {
  if (!token || !token.trim()) return false;
  const payload = decodeJwtPayload(token.trim());
  if (!payload || !payload.exp) return false;
  const nowInSeconds = Math.floor(Date.now() / 1000);
  return payload.exp > nowInSeconds;
}

export function getStoredValidToken() {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY) || "";
  if (isJwtValid(token)) return token.trim();
  if (token) localStorage.removeItem(TOKEN_STORAGE_KEY);
  return "";
}

export function persistToken(token) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}
