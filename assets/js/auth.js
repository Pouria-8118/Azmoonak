import { TOKEN_KEY, SESSION_KEY } from './config.js';

let authToken = localStorage.getItem(TOKEN_KEY) || '';
let session = null;
try { session = JSON.parse(localStorage.getItem(SESSION_KEY)); } catch {}

export const getSession = () => session;
export const getToken = () => authToken;

export function clearToken() {
  authToken = '';
  localStorage.removeItem(TOKEN_KEY);
}

export function setSession(s, token) {
  session = s;
  if (token) {
    authToken = token;
    localStorage.setItem(TOKEN_KEY, token);
  }
  if (s) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(s));
  } else {
    localStorage.removeItem(SESSION_KEY);
    clearToken();
  }
}