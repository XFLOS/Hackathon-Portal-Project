import React, { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { auth } from "../firebase/config";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { useAuth } from "../context/AuthContext";
import logo from "../images/1.png"; 
import "./Navbar.css";

function Navbar() {
  const [user, setUser] = useState(null);
  // homeTarget is null by default (logo inactive). It becomes '/login'
  // after an anonymous user clicks Join (localStorage.homeIsLogin), and
  // becomes '/base' for authenticated users.
  const [homeTarget, setHomeTarget] = useState(() => {
    try {
      const homeIsLogin = localStorage.getItem('homeIsLogin') === 'true';
      return homeIsLogin ? '/login' : null;
    } catch (e) { return null; }
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { role: contextRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Fallback: read role from localStorage if AuthContext doesn't have it
  const role = useMemo(() => {
    if (contextRole) return contextRole;
    try {
      const raw = localStorage.getItem('user');
      const u = raw ? JSON.parse(raw) : null;
      return u?.role || null;
    } catch (e) {
      return null;
    }
  }, [contextRole]);

  useEffect(() => {
    // Load user from Firebase or local storage
    const loadUser = () => {
      // First check localStorage (for backend JWT auth)
      try {
        const raw = localStorage.getItem('user');
        const storedUser = raw ? JSON.parse(raw) : null;
        if (storedUser) {
          setUser(storedUser);
          return true; // If we have a stored user, use it
        }
      } catch (e) {
        console.error('Failed to load user from localStorage:', e);
      }
      return false;
    };

    loadUser();

    const unsubscribe = typeof onAuthStateChanged === 'function'
      ? onAuthStateChanged(auth, (firebaseUser) => {
          if (firebaseUser) {
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || firebaseUser.email
            });
            localStorage.setItem("user", JSON.stringify({
              id: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || firebaseUser.email
            }));
            // If the user authenticated, clear the 'homeIsLogin' preference
            try { localStorage.removeItem('homeIsLogin'); } catch (_) {}
          } else {
            // Only clear user if there's no localStorage user
            try {
              const raw = localStorage.getItem('user');
              if (!raw) {
                setUser(null);
                localStorage.removeItem("user");
              }
            } catch (e) {
              setUser(null);
              localStorage.removeItem("user");
            }
          }
        })
      : // fallback if auth provides its own method (stub)
        (auth && typeof auth.onAuthStateChanged === 'function')
          ? auth.onAuthStateChanged((firebaseUser) => {
              if (firebaseUser) {
                setUser({ id: firebaseUser.uid, email: firebaseUser.email, name: firebaseUser.displayName || firebaseUser.email });
                localStorage.setItem('user', JSON.stringify({ id: firebaseUser.uid, email: firebaseUser.email, name: firebaseUser.displayName || firebaseUser.email }));
              } else {
                try {
                  const raw = localStorage.getItem('user');
                  if (!raw) {
                    setUser(null);
                    localStorage.removeItem('user');
                  }
                } catch (e) {
                  setUser(null);
                  localStorage.removeItem('user');
                }
              }
            })
          : () => {};

    // Listen for auth changes (login/logout from any component)
    const onAuthChanged = () => {
      console.log('Auth changed event received in Navbar');
      loadUser();
    };
    window.addEventListener('auth-changed', onAuthChanged);

    // Listen for storage events (user logged in from another tab or programmatically)
    const onStorage = (e) => {
      if (e.key === 'user') {
        loadUser();
      }
    };
    window.addEventListener('storage', onStorage);

    return () => { 
      try { unsubscribe(); } catch (e) {} 
      window.removeEventListener('auth-changed', onAuthChanged);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  // Update home target when auth state or storage changes
  useEffect(() => {
    const compute = () => {
      try {
        const homeIsLogin = localStorage.getItem('homeIsLogin') === 'true';
        if (user) {
          // Authenticated users: "/" will auto-redirect to their dashboard
          setHomeTarget('/');
          try { localStorage.removeItem('homeIsLogin'); } catch (_) {}
        } else if (homeIsLogin) {
          // Anonymous user clicked Join previously -> logo goes to login
          setHomeTarget('/login');
        } else {
          // Default: logo goes to landing page
          setHomeTarget('/');
        }
      } catch (e) { setHomeTarget('/'); }
    };
    compute();
    const onStorage = (e) => { if (e.key === 'homeIsLogin') compute(); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [user]);

  const handleLogout = async () => {
    try {
      // Clear backend JWT auth
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // If Firebase is enabled, sign out from Firebase too
      if (auth && typeof signOut === 'function') {
        try {
          await signOut(auth);
        } catch (fbError) {
          console.log('Firebase signout skipped:', fbError);
        }
      }
      
      setUser(null);
      setDropdownOpen(false);
      
      // Notify AuthContext to update (triggers ProtectedRoute to redirect)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth-changed'));
      }
      
      // Redirect to landing page (not login)
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      // Even if signOut fails, clear local state
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      
      // Notify AuthContext to update
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth-changed'));
      }
      
      navigate("/");
    }
  };

  // Close dropdown if user clicks outside or presses Escape
  useEffect(() => {
    const onDocClick = (e) => {
      const menu = document.querySelector('.dropdown-menu');
      const trigger = document.querySelector('.menu-trigger, .hamburger, .hamburger-btn');
      if (!menu) return;
      if (menu.contains(e.target) || (trigger && trigger.contains(e.target))) return;
      setDropdownOpen(false);
    };
    const onEsc = (e) => { if (e.key === 'Escape') setDropdownOpen(false); };
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, []);

  return (
    <nav className="navbar">
      <div className="nav-left">
        {/* Logo always links to "/" - will auto-redirect to dashboard if logged in */}
        <Link to="/" className="nav-brand" aria-label="Go to home">
          <img src={logo} alt="Hackathon Logo" className="nav-logo" />
        </Link>
      </div>

      <div className="nav-right">
        {/* Minimal hamburger trigger */}
        <button
          className="hamburger-btn"
          aria-label="Open menu"
          aria-haspopup="true"
          aria-expanded={dropdownOpen}
          onClick={() => setDropdownOpen(!dropdownOpen)}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setDropdownOpen(!dropdownOpen)}
        >
          <span className="bar" />
          <span className="bar" />
          <span className="bar" />
        </button>

        {dropdownOpen && (
          <div
            className="dropdown-menu"
            role="menu"
            onClick={(e) => {
              if (e.target.closest('a,button')) setDropdownOpen(false);
            }}
          >
            {user ? (
              <>
                {/* Home/Dashboard link - "/" will auto-redirect to role-based dashboard */}
                <Link to="/">Dashboard</Link>
                <Link to="/profile">Profile</Link>
                <Link to="/notifications">Notifications</Link>
                <div className="dropdown-divider" />
                {/* Student */}
                {role === 'student' && (
                  <>
                    <Link to="/team">Team</Link>
                    <Link to="/team-selection">Create/Join Team</Link>
                    <Link to="/submission">Submission</Link>
                    <Link to="/certificate">Certificate</Link>
                  </>
                )}
                {/* Mentor */}
                {role === 'mentor' && (
                  <>
                    <Link to="/mentor">Mentor Dashboard</Link>
                    <Link to="/mentor/teams">Teams & Q&A</Link>
                    <Link to="/mentor/feedback">Feedback</Link>
                  </>
                )}
                {/* Judge */}
                {role === 'judge' && (
                  <>
                    <Link to="/judge">Judge Dashboard</Link>
                    <Link to="/judge/evaluation">Evaluation</Link>
                    <Link to="/judge/feedback">Feedback History</Link>
                  </>
                )}
                {/* Admin */}
                {role === 'admin' && (
                  <>
                    <Link to="/admin">Coordinator</Link>
                    <Link to="/admin/manage">Manage</Link>
                    <Link to="/admin/reports">Reports</Link>
                    <Link to="/admin/schedule">Schedule</Link>
                  </>
                )}
                <div className="dropdown-divider" />
                <Link to="/leaderboard">Leaderboard</Link>
                <Link to="/surveys">Surveys</Link>
                <Link to="/help">Help</Link>
                <button onClick={handleLogout}>Log out</button>
              </>
            ) : (
              <>
                <Link to="/login">Log In</Link>
                <Link to="/help">Help</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
