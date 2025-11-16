import axios from 'axios';
import { getIdToken } from 'firebase/auth';
import mockApi from './mockApi';
import { auth } from '../firebase/config';

const USE_MOCK = process.env.REACT_APP_USE_MOCK_API === 'true';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

let api;
if (USE_MOCK) {
  // eslint-disable-next-line no-console
  console.info('[API] Using in-browser mock API');
  api = mockApi;
} else {
  api = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

// Attach authorization header: prefer backend JWT, otherwise Firebase ID token.
// Only add interceptors when we built a real axios instance.
if (!USE_MOCK) {
  api.interceptors.request.use(async (config) => {
    // 1) If we have a backend JWT (backend-only auth flow), use it first.
    try {
      const stored = localStorage.getItem('token');
      if (stored) {
        config.headers.Authorization = `Bearer ${stored}`;
        return config;
      }
    } catch (_) {
      // ignore JSON parse/localStorage failures
    }

    // 2) Otherwise attach a Firebase ID token when available.
    try {
      if (auth && auth.currentUser) {
        const idToken = await getIdToken(auth.currentUser, /* forceRefresh */ false);
        if (idToken) {
          config.headers.Authorization = `Bearer ${idToken}`;
        }
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('Could not attach Firebase token to request:', err.message);
    }

    return config;
  });
}

export default api;
