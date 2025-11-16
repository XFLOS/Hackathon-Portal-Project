import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { firebaseEnabled } from '../firebase/config';
import LoadingSpinner from '../components/LoadingSpinner';

export default function RoleRoute({ allow = [], children }) {
  const { user, role, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  // If Firebase is enabled, enforce email verification for Firebase users
  if (firebaseEnabled && user && user.emailVerified === false) return <Navigate to="/verify-email" replace />;
  if (!user) return <Navigate to="/login" replace />;
  const list = Array.isArray(allow) ? allow : [allow];
  if (!list.includes(role)) return <Navigate to="/" replace />;
  return children;
}

