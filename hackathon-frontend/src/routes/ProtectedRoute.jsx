import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { firebaseEnabled } from '../firebase/config';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

export default function ProtectedRoute({ children, allowUnverified = false }) {
  const { user, loading } = useAuth();

  // Validate children is JSX, not objects
  const safeChild = React.isValidElement(children) ? children : null;

  const hasToken = React.useMemo(() => {
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      return !!(token && storedUser);
    } catch (e) {
      return false;
    }
  }, [user]);

  if (loading) return <LoadingSpinner />;

  // Email verification check
  if (!allowUnverified && firebaseEnabled && user && user.emailVerified === false) {
    return <Navigate to="/verify-email" replace />;
  }

  // Auth check
  if (!user && !hasToken) {
    return <Navigate to="/login" replace />;
  }

  // FINAL SAFETY LAYER:
  // If the "children" passed is NOT valid JSX, do NOT crash — show a fallback
  if (!safeChild) {
    console.error("ProtectedRoute received invalid children:", children);
    return (
      <div style={{ padding: "2rem", color: "white" }}>
        Invalid component inside ProtectedRoute
      </div>
    );
  }

  return safeChild;
}
