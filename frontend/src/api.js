const BASE = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'campusfix_token';

let token = localStorage.getItem(TOKEN_KEY);
let onUnauthorized = () => {};

export const getToken = () => token;
export function setToken(t) {
  token = t;
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
}
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn; };

export class ApiError extends Error {
  constructor(message, status, fieldErrors) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    });
  } catch {
    throw new ApiError('Cannot reach the server. Check that the backend is running.', 0);
  }
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* empty or non-JSON body */
  }
  if (!res.ok) {
    if (res.status === 401 && token) onUnauthorized(); // expired or invalid session
    const unavailable = res.status >= 500 && !data?.message;
    throw new ApiError(
      unavailable ? 'The server is unavailable. Check that the backend and MongoDB are running.' : data?.message || `Request failed (${res.status})`,
      res.status,
      data?.errors
    );
  }
  return data;
}
const json = (method, body) => ({ method, body: JSON.stringify(body) });

// Auth
export const login = (body) => request('/auth/login', json('POST', body));
export const register = (body) => request('/auth/register', json('POST', body));
export const fetchMe = () => request('/auth/me');

// Complaints
export function listComplaints(filters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => { if (v && v !== 'All') params.set(k, v); });
  return request(`/complaints?${params}`);
}
export const getStats = () => request('/complaints/stats');
export const createComplaint = (body) => request('/complaints', json('POST', body));
export const updateComplaint = (id, body) => request(`/complaints/${id}`, json('PATCH', body));
export const deleteComplaint = (id) => request(`/complaints/${id}`, { method: 'DELETE' });

// Admin
export const listWorkers = () => request('/users/workers');
export const createWorker = (body) => request('/users/workers', json('POST', body));
export const deleteWorker = (id) => request(`/users/workers/${id}`, { method: 'DELETE' });
export const listStudents = () => request('/users/students');
