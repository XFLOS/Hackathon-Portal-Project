import './App.css';
import Navbar from './components/Navbar';
import DevAuthIndicator from './components/DevAuthIndicator';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Early redirect component that checks BEFORE AuthContext loads
function EarlyRedirect({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only check on root path
    if (location.pathname === '/') {
      try {
        const userRaw = localStorage.getItem('user');
        if (userRaw) {
          const user = JSON.parse(userRaw);
          const role = user.role?.toLowerCase();
          
          const dashboardPaths = {
            student: "/student-dashboard",
            mentor: "/mentor-dashboard",
            judge: "/judge-dashboard",
            coordinator: "/coordinator-dashboard",
            admin: "/coordinator-dashboard",
          };
          
          const dashboardPath = dashboardPaths[role] || "/student-dashboard";
          console.log('⚡ [EarlyRedirect] User found in localStorage, redirecting to:', dashboardPath);
          navigate(dashboardPath, { replace: true });
        }
      } catch (e) {
        console.error('⚡ [EarlyRedirect] Error:', e);
      }
    }
  }, [location.pathname, navigate]);

  return children;
}

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <EarlyRedirect>
          <Navbar />
          <DevAuthIndicator />
          <AppRoutes />
        </EarlyRedirect>
      </AuthProvider>
    </div>
  );
}

export default App;
