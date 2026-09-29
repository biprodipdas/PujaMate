// src/lib/api.js
// Thin fetch wrapper for the Phase 1 Express API. Centralizes the base
// URL, JSON handling, and auth header so components don't repeat it.

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function getToken() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('pujamate_token');
}

async function apiFetch(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const message = data?.error || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
}

export const api = {
  // Auth
  register: (name, email, password) =>
    apiFetch('/auth/register', { method: 'POST', body: { name, email, password } }),
  login: (email, password) =>
    apiFetch('/auth/login', { method: 'POST', body: { email, password } }),
  getCurrentUser: () => apiFetch('/auth/me', { auth: true }),

  // Pujas
  searchPujas: (params) => apiFetch(`/pujas?${new URLSearchParams(params).toString()}`),
  getPuja: (id) => apiFetch(`/pujas/${id}`),
  getFacilities: (params) => apiFetch(`/pujas/facilities?${new URLSearchParams(params).toString()}`),
  getReviews: (pujaId) => apiFetch(`/pujas/${pujaId}/reviews`),
  createReview: (pujaId, rating, comment) =>
    apiFetch(`/pujas/${pujaId}/reviews`, {
      method: 'POST',
      body: { rating, comment },
      auth: true,
    }),

  // Crowd
  getCrowdStatus: (pujaId) => apiFetch(`/crowd/${pujaId}`),
  submitCrowdReport: (pujaId, crowdLevel) =>
    apiFetch(`/crowd/${pujaId}`, { method: 'POST', body: { crowd_level: crowdLevel }, auth: true }),

  // Passport
  getPassport: () => apiFetch('/passport', { auth: true }),
  checkIn: (pujaId, latitude, longitude) =>
    apiFetch('/passport/checkin', { method: 'POST', body: { pujaId, latitude, longitude }, auth: true }),

  // Missing pandal suggestions
  suggestPandal: (payload) => apiFetch('/pandal-suggestions', { method: 'POST', body: payload }),

  // Route planner
  generateRoute: (payload) => apiFetch('/planner/generate', { method: 'POST', body: payload }),
  generateAIPlan: (payload) => apiFetch('/planner/ai', { method: 'POST', body: payload }),
  saveRoute: (title, stops) =>
    apiFetch('/routes', { method: 'POST', body: { title, stops }, auth: true }),
  listRoutes: () => apiFetch('/routes', { auth: true }),
  getRoute: (id) => apiFetch(`/routes/${id}`, { auth: true }),
  updateRoute: (id, payload) => apiFetch(`/routes/${id}`, { method: 'PUT', body: payload, auth: true }),
  deleteRoute: (id) => apiFetch(`/routes/${id}`, { method: 'DELETE', auth: true }),

  // V2
  getLeaderboard: (limit = 20) => apiFetch(`/leaderboard?limit=${limit}`),
  listGroups: () => apiFetch('/groups', { auth: true }),
  createGroup: (name) => apiFetch('/groups', { method: 'POST', body: { name }, auth: true }),
  getGroup: (id) => apiFetch(`/groups/${id}`, { auth: true }),
  updateGroup: (id, payload) => apiFetch(`/groups/${id}`, { method: 'PUT', body: payload, auth: true }),
  addGroupMember: (id, email) => apiFetch(`/groups/${id}/members`, { method: 'POST', body: { email }, auth: true }),
  subscribeNotifications: (subscription, pujaId = null) => apiFetch('/notifications/subscribe', { method: 'POST', body: { ...subscription, pujaId }, auth: true }),
  unsubscribeNotifications: (endpoint) => apiFetch('/notifications/unsubscribe', { method: 'POST', body: { endpoint }, auth: true }),

  // Community photo wall
  getCommunityPosts: (limit = 24) => apiFetch(`/community/posts?limit=${limit}`),
  createCommunityPost: (payload) => apiFetch('/community/posts', { method: 'POST', body: payload, auth: true }),

  // Puja Blog
  getBlogs: (limit = 12) => apiFetch(`/blogs?limit=${limit}`),
  getBlog: (id) => apiFetch(`/blogs/${id}`),
  createBlog: (payload) => apiFetch('/blogs', { method: 'POST', body: payload, auth: true }),
  getNextPuja: (lat, lng) => {
    const query = Number.isFinite(Number(lat)) && Number.isFinite(Number(lng))
      ? `?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`
      : '';
    return apiFetch(`/next-pandal${query}`, { auth: true });
  },

  // Emergency
  getHelplines: () => apiFetch('/emergency/helplines'),
  getNearbyEmergencyServices: (params) =>
    apiFetch(`/emergency/nearby?${new URLSearchParams(params).toString()}`),
};

export { API_URL };
