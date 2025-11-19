import { Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import BaseHome from './pages/BaseHome';
import BaseLogin from './pages/BaseLogin';
import BaseRegister from './pages/BaseRegister';
import HomePage from './pages/HomePage';
import TeamPage from './pages/TeamPage';
import TeamSelectionPage from './pages/TeamSelectionPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import StudentDashboard from './pages/StudentDashboard';
import MentorDashboard from './pages/MentorDashboard';
import JudgeDashboard from './pages/JudgeDashboard';
import CoordinatorDashboard from './pages/CoordinatorDashboard';
import SubmissionPage from './pages/SubmissionPage';
import CertificatePage from './pages/CertificatePage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import HelpPage from './pages/HelpPage';
import NotFoundPage from './pages/NotFoundPage';
import DevAuthIndicator from './components/DevAuthIndicator';
import MentorTeamQA from './pages/MentorTeamQA';
import MentorFeedback from './pages/MentorFeedback';
import JudgeEvaluationPage from './pages/JudgeEvaluationPage';
import JudgeFeedbackHistoryPage from './pages/JudgeFeedbackHistoryPage';
import CoordinatorManagePage from './pages/CoordinatorManagePage';
import CoordinatorReportsPage from './pages/CoordinatorReportsPage';
import VerifyEmail from './pages/VerifyEmail';
import PresentationSchedulePage from './pages/PresentationSchedulePage';
import HackathonsListPage from './pages/HackathonsListPage';
import SurveysPage from './pages/SurveysPage';
import RedirectByRole from './utils/RedirectByRole';

function AppRoutes() {
  const { user } = useAuth();
  
  // Get user data from either context or localStorage
  const getUserData = () => {
    if (user) {
      console.log('✅ User from AuthContext:', user);
      return user;
    }
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        console.log('✅ User from localStorage:', parsed);
        return parsed;
      }
      console.log('❌ No user in localStorage');
      return null;
    } catch (e) {
      console.error('❌ Error parsing localStorage user:', e);
      return null;
    }
  };

  const currentUser = getUserData();
  console.log('🎯 Current user for routing:', currentUser);
  console.log('🎯 Will redirect to dashboard?', !!currentUser);

  return (
    <Routes>
      {/* Landing page with auto-redirect for logged-in users */}
      <Route 
        path="/" 
        element={
          currentUser ? (
            <RedirectByRole user={currentUser} />
          ) : (
            <HomePage />
          )
        } 
      />
      
      <Route path="/hackathons" element={<HackathonsListPage />} />
      <Route path="/base" element={<ProtectedRoute><BaseHome /></ProtectedRoute>} />
      <Route path="/login" element={<BaseLogin />} />
      <Route path="/register" element={<BaseRegister />} />

      {/* Student */}
      <Route path="/student-dashboard" element={
        <RoleRoute allow={["student", "admin"]}>
          <StudentDashboard />
        </RoleRoute>
      } />
      <Route path="/student" element={
        <RoleRoute allow={["student", "admin"]}>
          <StudentDashboard />
        </RoleRoute>
      } />
      <Route path="/team" element={
        <ProtectedRoute>
          <TeamPage />
        </ProtectedRoute>
      } />
      <Route path="/team-selection" element={
        <ProtectedRoute>
          <TeamSelectionPage />
        </ProtectedRoute>
      } />
      <Route path="/submission" element={
        <RoleRoute allow={["student", "admin"]}>
          <SubmissionPage />
        </RoleRoute>
      } />
      <Route path="/certificate" element={
        <RoleRoute allow={["student", "mentor", "judge", "admin"]}>
          <CertificatePage />
        </RoleRoute>
      } />

      {/* Mentor */}
      <Route path="/mentor-dashboard" element={
        <RoleRoute allow={["mentor", "admin"]}>
          <MentorDashboard />
        </RoleRoute>
      } />
      <Route path="/mentor" element={
        <RoleRoute allow={["mentor", "admin"]}>
          <MentorDashboard />
        </RoleRoute>
      } />
      <Route path="/mentor/teams" element={
        <RoleRoute allow={["mentor", "admin"]}>
          <MentorTeamQA />
        </RoleRoute>
      } />
      <Route path="/mentor/feedback" element={
        <RoleRoute allow={["mentor", "admin"]}>
          <MentorFeedback />
        </RoleRoute>
      } />

      {/* Judge */}
      <Route path="/judge-dashboard" element={
        <RoleRoute allow={["judge", "admin"]}>
          <JudgeDashboard />
        </RoleRoute>
      } />
      <Route path="/judge" element={
        <RoleRoute allow={["judge", "admin"]}>
          <JudgeDashboard />
        </RoleRoute>
      } />
      <Route path="/judge/evaluation" element={
        <RoleRoute allow={["judge", "admin"]}>
          <JudgeEvaluationPage />
        </RoleRoute>
      } />
      <Route path="/judge/feedback" element={
        <RoleRoute allow={["judge", "admin"]}>
          <JudgeFeedbackHistoryPage />
        </RoleRoute>
      } />

      {/* Coordinator/Admin */}
      <Route path="/coordinator-dashboard" element={
        <RoleRoute allow={["coordinator", "admin"]}>
          <CoordinatorDashboard />
        </RoleRoute>
      } />
      <Route path="/admin" element={
        <RoleRoute allow={["admin", "coordinator"]}>
          <CoordinatorDashboard />
        </RoleRoute>
      } />
      <Route path="/admin/manage" element={
        <RoleRoute allow={["admin"]}>
          <CoordinatorManagePage />
        </RoleRoute>
      } />
      <Route path="/admin/reports" element={
        <RoleRoute allow={["admin"]}>
          <CoordinatorReportsPage />
        </RoleRoute>
      } />
      <Route path="/admin/schedule" element={
        <RoleRoute allow={["admin"]}>
          <PresentationSchedulePage />
        </RoleRoute>
      } />

      {/* Common */}
      <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
      <Route path="/verify-email" element={<ProtectedRoute allowUnverified><VerifyEmail /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
      <Route path="/surveys" element={<ProtectedRoute><SurveysPage /></ProtectedRoute>} />
      <Route path="/help" element={<HelpPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <Navbar />
        <DevAuthIndicator />
        <main style={{ padding: '1rem' }}>
          <AppRoutes />
        </main>
      </AuthProvider>
    </div>
  );
}

export default App;
