import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { auth, firebaseEnabled } from '../firebase/config';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import api from '../services/api';

const AuthContext = createContext({ user: null, role: null, loading: true });

export function AuthProvider({ children }) {
  // Initialize user from localStorage for backend-only (non-Firebase) flows so
  // ProtectedRoute/RoleRoute can work immediately after login/register.
  const initialUser = (() => {
    try {
      const raw = localStorage.getItem('user');
      const parsed = raw ? JSON.parse(raw) : null;
      console.log('🔐 [AuthContext] initialUser from localStorage:', parsed);
      return parsed;
    } catch (e) {
      console.error('🔐 [AuthContext] Error parsing user from localStorage:', e);
      return null;
    }
  })();

  const [user, setUser] = useState(initialUser);
  const [role, setRole] = useState(initialUser?.role || null);
  const [loading, setLoading] = useState(true);

  console.log('🔐 [AuthContext] State:', { user, role, loading, firebaseEnabled });

  useEffect(() => {
    let unsub = () => {};

    async function loadBackendProfile(u) {
      if (!u) {
        setRole(null);
        return;
      }
      try {
        const res = await api.get('/users/me');
        setRole(res.data?.role || u.role || null);
      } catch (_) {
        // fallback to whatever was stored locally
        setRole(u.role || null);
      }
    }

    if (firebaseEnabled) {
      // Use real Firebase listener only when Firebase is configured
      try {
        unsub = onAuthStateChanged(auth, async (u) => {
          setUser(u);
          if (u) {
            try {
              const res = await api.get('/users/me');
              setRole(res.data?.role || null);
            } catch (_) {
              // Dev-only: if backend role fetch fails, default to 'student' so
              // role-gated pages are accessible during Firebase-only development.
              const fallback = process.env.NODE_ENV === 'development' ? 'student' : null;
              setRole(fallback);
              // persist fallback role locally for refresh continuity
              try {
                const raw = localStorage.getItem('user');
                if (raw && fallback) {
                  const obj = JSON.parse(raw);
                  localStorage.setItem('user', JSON.stringify({ ...obj, role: fallback }));
                }
              } catch (_) {}
            }
          } else {
            setRole(null);
          }
          setLoading(false);
        });
      } catch (e) {
        // If anything goes wrong, fail open so UI doesn't hang
        setUser(null);
        setRole(null);
        setLoading(false);
      }
    } else {
      // Backend-only flow: use localStorage user if present and try to refresh profile
      console.log('🔐 [AuthContext] Backend-only flow, loading profile...');
      (async () => {
        await loadBackendProfile(initialUser);
        console.log('🔐 [AuthContext] Backend profile loaded, setting loading=false');
        setLoading(false);
      })();

      // Listen for other windows or code dispatching an 'auth-changed' event
      const onAuthChanged = async () => {
        console.log('🔐 [AuthContext] auth-changed event received');
        const raw = localStorage.getItem('user');
        let newUser = null;
        try { newUser = raw ? JSON.parse(raw) : null; } catch (_) { newUser = null; }
        console.log('🔐 [AuthContext] New user from localStorage:', newUser);
        setUser(newUser);
        await loadBackendProfile(newUser);
      };
      window.addEventListener('auth-changed', onAuthChanged);
      unsub = () => window.removeEventListener('auth-changed', onAuthChanged);
    }

    return () => {
      try { unsub(); } catch (e) { /* noop */ }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(() => ({ user, role, loading, setRole }), [user, role, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

// Helper actions
export async function loginWithEmail(email, password) {
  // If Firebase client isn't configured, fall back to backend JWT login
  if (!firebaseEnabled) {
    const res = await api.post('/auth/login', { email, password });
    // store token & user in localStorage for api wrapper to pick up
    if (res?.data?.token) localStorage.setItem('token', res.data.token);
    if (res?.data?.user) localStorage.setItem('user', JSON.stringify(res.data.user));
    // notify any AuthProvider instances to reload local state
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('auth-changed'));
    return res.data.user;
  }

  const cred = await signInWithEmailAndPassword(auth, email, password);
  // If Firebase is enabled and the user's email is not verified, throw a specific error
  if (firebaseEnabled && cred?.user && !cred.user.emailVerified) {
    const err = new Error('Email not verified');
    err.code = 'auth/email-not-verified';
    throw err;
  }

    // Persist a normalized local user object so other UI code (redirects,
    // team detection) can rely on a consistent `localStorage.user` shape.
    try {
      // Try to fetch the canonical backend profile first
      const res = await api.get('/users/me');
      const u = res?.data || {};
      const normalized = {
        id: u.id || cred.user.uid,
        email: u.email || cred.user.email,
        name: u.name || cred.user.displayName || null,
        role: u.role || null,
        teamId: u.teamId || null,
      };
      localStorage.setItem('user', JSON.stringify(normalized));
    } catch (e) {
      // Fallback to minimal Firebase profile
      try {
        const minimal = {
          id: cred.user.uid,
          email: cred.user.email,
          name: cred.user.displayName || null,
          role: null,
        };
        localStorage.setItem('user', JSON.stringify(minimal));
      } catch (_) {}
    }

    // Notify other windows/components to pick up the new user
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('auth-changed'));

    return cred.user;
}

export async function registerWithEmail({ name, email, password, role = 'student' }) {
  if (!firebaseEnabled) {
    // Register via backend then login
    await api.post('/auth/register', { name, email, password, role });
    const res = await api.post('/auth/login', { email, password });
    if (res?.data?.token) localStorage.setItem('token', res.data.token);
    if (res?.data?.user) localStorage.setItem('user', JSON.stringify(res.data.user));
    // notify any AuthProvider instances to reload local state
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('auth-changed'));
    return res.data.user;
  }

  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (name) {
    try { await updateProfile(cred.user, { displayName: name }); } catch (_) {}
  }

  // Send email verification (best-effort). Do not block registration if it fails.
  try { await sendEmailVerification(cred.user); } catch (e) { /* noop */ }

  // Upsert user record in backend with selected role (best-effort)
  try { await api.post('/users', { name, email, role }); } catch (_) {}
  // Persist a minimal normalized user for immediate UI responsiveness
  try {
    const minimal = { id: cred.user.uid, email: cred.user.email, name: cred.user.displayName || name, role };
    localStorage.setItem('user', JSON.stringify(minimal));
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('auth-changed'));
  } catch (_) {}

  return cred.user;
}

export async function logout() {
  await signOut(auth);
}
