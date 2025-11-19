import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { firebaseEnabled } from '../firebase/config';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

export default function ProtectedRoute({ children, allowUnverified = false }) {
  const { user, loading } = useAuth();
  
  // Also check localStorage for backend JWT auth
  const hasToken = React.useMemo(() => {
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      return !!(token && storedUser);
    } catch (e) {
      return false;
    }
  }, [user]); // Re-check when user changes
  
  if (loading) return <LoadingSpinner />;
  
  // If Firebase is enabled, enforce email verification for Firebase users unless explicitly allowed
  if (!allowUnverified && firebaseEnabled && user && user.emailVerified === false) {
    return <Navigate to="/verify-email" replace />;
  }
  
  // Check both AuthContext user and localStorage token
  if (!user && !hasToken) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}
