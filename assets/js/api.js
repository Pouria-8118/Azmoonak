import { API_URL } from './config.js';
import { getToken, clearToken } from './auth.js';

export async function api(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  const token = getToken();
  if (token) headers['Authorization'] = 'Bearer ' + token;
  let res;
  try {
    res = await fetch(API_URL + path, { ...opts, headers, cache: 'no-store' });
  } catch {
    throw new Error('ارتباط با سرور برقرار نشد.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) clearToken();
    throw new Error(data.error || 'خطا در سرور');
  }
  return data;
}