import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, useNavigate, useLocation } from 'react-router-dom';
import './index.css';
import './styles/theme.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Redirect wrapper that must be INSIDE BrowserRouter
function RedirectWrapper({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
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
          
          const path = dashboardPaths[role] || "/student-dashboard";
          console.log('🚀 [Index Redirect] Redirecting logged-in user to:', path);
          navigate(path, { replace: true });
        }
      } catch (e) {
        console.error('🚀 [Index Redirect] Error:', e);
      }
    }
  }, [location.pathname, navigate]);

  return children;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <RedirectWrapper>
        <App />
      </RedirectWrapper>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
