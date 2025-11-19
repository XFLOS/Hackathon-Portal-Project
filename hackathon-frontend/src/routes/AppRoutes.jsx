import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import HomePage from "../pages/HomePage";
import BaseLogin from "../pages/BaseLogin";
import BaseRegister from "../pages/BaseRegister";

import StudentDashboard from "../pages/StudentDashboard";
import MentorDashboard from "../pages/MentorDashboard";
import JudgeDashboard from "../pages/JudgeDashboard";
import CoordinatorDashboard from "../pages/CoordinatorDashboard";

import TeamPage from "../pages/TeamPage";
import TeamSelectionPage from "../pages/TeamSelectionPage";
import SubmissionPage from "../pages/SubmissionPage";
import CertificatePage from "../pages/CertificatePage";
import LeaderboardPage from "../pages/LeaderboardPage";
import ProfilePage from "../pages/ProfilePage";
import NotificationsPage from "../pages/NotificationsPage";
import HelpPage from "../pages/HelpPage";
import SurveysPage from "../pages/SurveysPage";
import VerifyEmail from "../pages/VerifyEmail";

import MentorTeamQA from "../pages/MentorTeamQA";
import MentorFeedback from "../pages/MentorFeedback";

import JudgeEvaluationPage from "../pages/JudgeEvaluationPage";
import JudgeFeedbackHistoryPage from "../pages/JudgeFeedbackHistoryPage";

import CoordinatorManagePage from "../pages/CoordinatorManagePage";
import CoordinatorReportsPage from "../pages/CoordinatorReportsPage";
import PresentationSchedulePage from "../pages/PresentationSchedulePage";
import HackathonsListPage from "../pages/HackathonsListPage";

import NotFoundPage from "../pages/NotFoundPage";

import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";

export default function AppRoutes() {
  const { user, role, loading } = useAuth();

  console.log('🔍 [AppRoutes] Auth State:', { user, role, loading });

  if (loading) return <CenteredLoading />;

  const getDashboardPath = () => {
    if (!user) return "/";
    const userRole = role?.toLowerCase() || user.role?.toLowerCase();
    
    console.log('🎯 [AppRoutes] getDashboardPath - role:', userRole);

    return {
      student: "/student-dashboard",
      mentor: "/mentor-dashboard",
      judge: "/judge-dashboard",
      coordinator: "/coordinator-dashboard",
      admin: "/coordinator-dashboard",
    }[userRole] || "/";
  };

  const isLoggedIn = !!user;
  const dashboardPath = getDashboardPath();
  
  console.log('🚀 [AppRoutes] Root redirect check:', { isLoggedIn, dashboardPath });

  return (
    <Routes>
      {/* PUBLIC ROOT - landing if logged out, redirect if logged in */}
      <Route
        path="/"
        element={
          isLoggedIn ? (
            <Navigate to={dashboardPath} replace />
          ) : (
            <HomePage />
          )
        }
      />

      {/* PUBLIC AUTH ROUTES */}
      <Route path="/login" element={<BaseLogin />} />
      <Route path="/register" element={<BaseRegister />} />

      {/* DASHBOARD ROUTES */}
      <Route
        path="/student-dashboard"
        element={
          <RoleRoute allow={["student", "admin"]}>
            <StudentDashboard />
          </RoleRoute>
        }
      />

      <Route
        path="/mentor-dashboard"
        element={
          <RoleRoute allow={["mentor", "admin"]}>
            <MentorDashboard />
          </RoleRoute>
        }
      />

      <Route
        path="/judge-dashboard"
        element={
          <RoleRoute allow={["judge", "admin"]}>
            <JudgeDashboard />
          </RoleRoute>
        }
      />

      <Route
        path="/coordinator-dashboard"
        element={
          <RoleRoute allow={["coordinator", "admin"]}>
            <CoordinatorDashboard />
          </RoleRoute>
        }
      />

      {/* LEGACY ROUTES (for compatibility) */}
      <Route path="/student" element={<Navigate to="/student-dashboard" replace />} />
      <Route path="/mentor" element={<Navigate to="/mentor-dashboard" replace />} />
      <Route path="/judge" element={<Navigate to="/judge-dashboard" replace />} />
      <Route path="/admin" element={<Navigate to="/coordinator-dashboard" replace />} />

      {/* STUDENT ROUTES */}
      <Route
        path="/team"
        element={
          <ProtectedRoute>
            <TeamPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/team-selection"
        element={
          <ProtectedRoute>
            <TeamSelectionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/submission"
        element={
          <RoleRoute allow={["student", "admin"]}>
            <SubmissionPage />
          </RoleRoute>
        }
      />
      <Route
        path="/certificate"
        element={
          <RoleRoute allow={["student", "mentor", "judge", "admin"]}>
            <CertificatePage />
          </RoleRoute>
        }
      />

      {/* MENTOR ROUTES */}
      <Route
        path="/mentor/teams"
        element={
          <RoleRoute allow={["mentor", "admin"]}>
            <MentorTeamQA />
          </RoleRoute>
        }
      />
      <Route
        path="/mentor/feedback"
        element={
          <RoleRoute allow={["mentor", "admin"]}>
            <MentorFeedback />
          </RoleRoute>
        }
      />

      {/* JUDGE ROUTES */}
      <Route
        path="/judge/evaluation"
        element={
          <RoleRoute allow={["judge", "admin"]}>
            <JudgeEvaluationPage />
          </RoleRoute>
        }
      />
      <Route
        path="/judge/feedback"
        element={
          <RoleRoute allow={["judge", "admin"]}>
            <JudgeFeedbackHistoryPage />
          </RoleRoute>
        }
      />

      {/* COORDINATOR / ADMIN ROUTES */}
      <Route
        path="/admin/manage"
        element={
          <RoleRoute allow={["admin"]}>
            <CoordinatorManagePage />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <RoleRoute allow={["admin"]}>
            <CoordinatorReportsPage />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/schedule"
        element={
          <RoleRoute allow={["admin"]}>
            <PresentationSchedulePage />
          </RoleRoute>
        }
      />

      {/* COMMON ROUTES */}
      <Route
        path="/leaderboard"
        element={
          <ProtectedRoute>
            <LeaderboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/surveys"
        element={
          <ProtectedRoute>
            <SurveysPage />
          </ProtectedRoute>
        }
      />

      <Route path="/hackathons" element={<HackathonsListPage />} />
      <Route
        path="/verify-email"
        element={
          <ProtectedRoute allowUnverified>
            <VerifyEmail />
          </ProtectedRoute>
        }
      />
      <Route path="/help" element={<HelpPage />} />

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

/* CLEAN LOADING COMPONENT */
function CenteredLoading() {
  return (
    <div style={{
      minHeight: "80vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontSize: "1.3rem",
    }}>
      Loading...
    </div>
  );
}
