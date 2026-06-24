// frontend/js/auth.js

const API_BASE = 'http://127.0.0.1:8000';

// ===== Helper: Get token from localStorage =====
export function getToken() {
  return localStorage.getItem('token');
}

// ===== Helper: Check if user is logged in =====
export function isAuthenticated() {
  return !!getToken();
}

// ===== Helper: Get auth headers =====
export function getAuthHeaders() {
  const token = getToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// ===== Login =====
export async function loginUser(email, password) {
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Login failed');
  }

  const data = await res.json();
  localStorage.setItem('token', data.access_token);
  return data;
}

// ===== Register =====
export async function registerUser(email, password, fullName) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, full_name: fullName })
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Registration failed');
  }

  return res.json();
}

// ===== Logout =====
export function logoutUser() {
  localStorage.removeItem('token');
  window.location.href = 'index.html';
}

// ===== Get current user profile =====
export async function getCurrentUser() {
  const token = getToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) {
      if (res.status === 401) {
        logoutUser();
        return null;
      }
      throw new Error('Failed to fetch user profile');
    }

    return await res.json();
  } catch (error) {
    console.error('getCurrentUser error:', error);
    throw error;
  }
}

// ===== Redirect if not logged in =====
export function requireAuth() {
  if (!isAuthenticated()) {
    console.log('Not authenticated, redirecting to login...');
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

// ===== Redirect if already logged in =====
export function redirectIfLoggedIn() {
  if (isAuthenticated()) {
    console.log('Already authenticated, redirecting to dashboard...');
    window.location.href = 'dashboard.html';
    return true;
  }
  return false;
}