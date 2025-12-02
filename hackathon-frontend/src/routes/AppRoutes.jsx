// src/routes/AppRoutes.jsx

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import BaseHome from "../pages/BaseHome";
import BaseLogin from "../pages/BaseLogin";
import BaseRegister from "../pages/BaseRegister";
import HomePage from "../pages/HomePage";
import TeamPage from "../pages/TeamPage";
import LeaderboardPage from "../pages/LeaderboardPage";

import StudentDashboard from "../pages/StudentDashboard";
import MentorDashboard from "../pages/MentorDashboard";
import MentorSubmissionView from "../pages/MentorSubmissionView";
import JudgeDashboard from "../pages/JudgeDashboard";
import CoordinatorDashboard from "../pages/CoordinatorDashboard";

import SubmissionPage from "../pages/SubmissionPage";
import CertificatePage from "../pages/CertificatePage";
import ProfilePage from "../pages/ProfilePage";
import NotificationsPage from "../pages/NotificationsPage";
import HelpPage from "../pages/HelpPage";
import NotFoundPage from "../pages/NotFoundPage";

import MentorTeamQA from "../pages/MentorTeamQA";
import MentorFeedback from "../pages/MentorFeedback";
import MentorChatPage from "../pages/MentorChatPage";
import StudentChatPage from "../pages/StudentChatPage";
import MentorResourcesPage from "../pages/MentorResourcesPage";
import StudentResourcesPage from "../pages/StudentResourcesPage";

import JudgeEvaluationPage from "../pages/JudgeEvaluationPage";
import JudgeFeedbackHistoryPage from "../pages/JudgeFeedbackHistoryPage";
import JudgeSchedulePage from "../pages/JudgeSchedulePage";

import CoordinatorManagePage from "../pages/CoordinatorManagePage";
import CoordinatorReportsPage from "../pages/CoordinatorReportsPage";
import PresentationSchedulePage from "../pages/PresentationSchedulePage";

import VerifyEmail from "../pages/VerifyEmail";
import HackathonsListPage from "../pages/HackathonsListPage";
import SurveysPage from "../pages/SurveysPage";
import AnnouncementsPage from "../pages/AnnouncementsPage";

import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";
import { useAuth } from "../context/AuthContext";

function AppRoutesInner() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  const getDashboardPath = () => {
    if (!user || !user.role) return "/";
    const role = user.role.toLowerCase();
    if (role === "student") return "/student-dashboard";
    if (role === "mentor") return "/mentor-dashboard";
    if (role === "judge") return "/judge-dashboard";
    if (role === "coordinator" || role === "admin")
      return "/coordinator-dashboard";
    return "/";
  };

  return (
    <Routes>
      {/* Root */}
      <Route
        path="/"
        element={user ? <Navigate to={getDashboardPath()} replace /> : <HomePage />}
      />

      {/* Public */}
      <Route path="/hackathons" element={<HackathonsListPage />} />
      <Route path="/login" element={<BaseLogin />} />
      <Route path="/register" element={<BaseRegister />} />
      <Route path="/base" element={<BaseHome />} />

      {/* Student */}
      <Route path="/student-dashboard" element={<RoleRoute allow={["student", "admin"]}><StudentDashboard /></RoleRoute>} />
      <Route path="/team" element={<RoleRoute allow={["student", "admin"]}><TeamPage /></RoleRoute>} />
      <Route path="/submission" element={<RoleRoute allow={["student", "admin"]}><SubmissionPage /></RoleRoute>} />
      <Route path="/student/chat" element={<RoleRoute allow={["student", "admin"]}><StudentChatPage /></RoleRoute>} />
      <Route path="/student/resources" element={<RoleRoute allow={["student", "admin"]}><StudentResourcesPage /></RoleRoute>} />

      {/* Mentor */}
      <Route path="/mentor-dashboard" element={<RoleRoute allow={["mentor", "admin"]}><MentorDashboard /></RoleRoute>} />
      <Route path="/mentor/teams" element={<RoleRoute allow={["mentor", "admin"]}><MentorTeamQA /></RoleRoute>} />
      <Route path="/mentor/feedback" element={<RoleRoute allow={["mentor", "admin"]}><MentorFeedback /></RoleRoute>} />
      <Route path="/mentor/chat" element={<RoleRoute allow={["mentor", "admin"]}><MentorChatPage /></RoleRoute>} />
      <Route path="/mentor/resources" element={<RoleRoute allow={["mentor", "admin"]}><MentorResourcesPage /></RoleRoute>} />
      <Route path="/mentor/submission/:teamId" element={<RoleRoute allow={["mentor", "admin"]}><MentorSubmissionView /></RoleRoute>} />

      {/* Judge */}
      <Route path="/judge-dashboard" element={<RoleRoute allow={["judge", "admin"]}><JudgeDashboard /></RoleRoute>} />
      <Route path="/judge/evaluation" element={<RoleRoute allow={["judge", "admin"]}><JudgeEvaluationPage /></RoleRoute>} />
      <Route path="/judge/feedback" element={<RoleRoute allow={["judge", "admin"]}><JudgeFeedbackHistoryPage /></RoleRoute>} />
      <Route path="/judge/schedule" element={<RoleRoute allow={["judge", "admin"]}><JudgeSchedulePage /></RoleRoute>} />

      {/* Coordinator */}
      <Route path="/coordinator-dashboard" element={<RoleRoute allow={["coordinator", "admin"]}><CoordinatorDashboard /></RoleRoute>} />
      <Route path="/coordinator-manage" element={<RoleRoute allow={["coordinator", "admin"]}><CoordinatorManagePage /></RoleRoute>} />
      <Route path="/coordinator-reports" element={<RoleRoute allow={["coordinator", "admin"]}><CoordinatorReportsPage /></RoleRoute>} />
      <Route path="/coordinator-schedule" element={<RoleRoute allow={["coordinator", "admin"]}><PresentationSchedulePage /></RoleRoute>} />

      {/* Common */}
      <Route path="/schedule" element={<RoleRoute allow={["student", "mentor", "judge", "coordinator", "admin"]}><PresentationSchedulePage /></RoleRoute>} />
      <Route path="/leaderboard" element={<RoleRoute allow={["student", "mentor", "judge", "coordinator", "admin"]}><LeaderboardPage /></RoleRoute>} />
      <Route path="/certificate" element={<RoleRoute allow={["student", "mentor", "judge", "coordinator", "admin"]}><CertificatePage /></RoleRoute>} />
      <Route path="/profile" element={<RoleRoute allow={["student", "mentor", "judge", "coordinator", "admin"]}><ProfilePage /></RoleRoute>} />
      <Route path="/notifications" element={<RoleRoute allow={["student", "mentor", "judge", "coordinator", "admin"]}><NotificationsPage /></RoleRoute>} />
      <Route path="/announcements" element={<RoleRoute allow={["student", "mentor", "judge", "coordinator", "admin"]}><AnnouncementsPage /></RoleRoute>} />
      <Route path="/surveys" element={<RoleRoute allow={["student", "mentor", "judge", "coordinator", "admin"]}><SurveysPage /></RoleRoute>} />

      {/* Verify */}
      <Route path="/verify-email" element={<ProtectedRoute allowUnverified><VerifyEmail /></ProtectedRoute>} />

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutesInner;
