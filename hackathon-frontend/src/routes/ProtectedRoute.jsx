import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { firebaseEnabled } from '../firebase/config';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ProtectedRoute({ children, allowUnverified = false }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  // If Firebase is enabled, enforce email verification for Firebase users unless explicitly allowed
  if (!allowUnverified && firebaseEnabled && user && user.emailVerified === false) {
    return <Navigate to="/verify-email" replace />;
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
