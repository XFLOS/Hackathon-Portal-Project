import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import VerificationPage from "./pages/VerificationPage"; 
import AboutPage from "./pages/AboutPage"; 
import ContactPage from "./pages/ContactPage"; 

import HomePage from "./pages/HomePage";
import FullSchedulePage from "./pages/FullSchedulePage";
import LeaderboardPage from "./pages/LeaderboardPage";
import StudentDashboard from "./pages/StudentDashboard";
import StudentProfilePage from "./pages/StudentProfilePage";
import TeamPage from "./pages/TeamPage";
import TeamSelectionPage from "./pages/TeamSelectionPage";
import TeamUpdatesPage from "./pages/TeamUpdatesPage"; 
import MentorChatPage from "./pages/MentorChatPage"; 
import SurveyPage from "./pages/SurveyPage";
import CertificatePage from "./pages/CertificatePage";

import CoordinatorDashboard from "./pages/CoordinatorDashboard"; 
import PostHackathonReports from "./pages/PostHackathonReports"; 
import AdminScheduleEditor from "./pages/AdminScheduleEditor"; 
import JudgeRubricEditor from "./pages/JudgeRubricEditor";

import JudgeDashboard from "./pages/JudgeDashboard"; 
import JudgeSubmissionsList from "./pages/JudgeSubmissionsList";
import JudgeGradingView from "./pages/JudgeGradingView";
import JudgeTeamHistory from "./pages/JudgeTeamHistory";

import MentorDashboard from "./pages/MentorDashboard";
import MentorAssignedTeams from "./pages/MentorAssignedTeams";
import MentorBriefingView from "./pages/MentorBriefingView";
import MentorTeamUpdates from "./pages/MentorTeamUpdates";
import MentorProfilePage from "./pages/MentorProfilePage";

function App() {
    return (
        <Router>
            <Navbar />
            <div className="main-content-area">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/verify-email" element={<VerificationPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/schedule" element={<FullSchedulePage />} />
                    <Route path="/leaderboard" element={<LeaderboardPage />} />

                    <Route path="/student/dashboard" element={<StudentDashboard />} />
                    <Route path="/student/profile" element={<StudentProfilePage />} />
                    <Route path="/student/team-select" element={<TeamSelectionPage />} />
                    <Route path="/student/team" element={<TeamPage />} /> 
                    <Route path="/student/updates" element={<TeamUpdatesPage />} />
                    <Route path="/chat/:teamId" element={<MentorChatPage />} /> 
                    <Route path="/survey" element={<SurveyPage />} />
                    <Route path="/certificate" element={<CertificatePage />} />

                    <Route path="/admin/dashboard" element={<CoordinatorDashboard />} />
                    <Route path="/admin/schedule-edit" element={<AdminScheduleEditor />} /> 
                    <Route path="/admin/reports" element={<PostHackathonReports />} />
                    <Route path="/admin/rubric-editor" element={<JudgeRubricEditor />} />

                    <Route path="/judge/dashboard" element={<JudgeDashboard />} />
                    <Route path="/judge/submissions" element={<JudgeSubmissionsList />} />
                    <Route path="/judge/grade/:teamId" element={<JudgeGradingView />} />
                    <Route path="/judge/history/:teamId" element={<JudgeTeamHistory />} />

                    <Route path="/mentor/dashboard" element={<MentorAssignedTeams />} />
                    <Route path="/mentor/teams" element={<MentorAssignedTeams />} />
                    <Route path="/mentor/briefing" element={<MentorBriefingView />} />
                    <Route path="/mentor/updates/:teamId" element={<MentorTeamUpdates />} />
                    <Route path="/mentor/profile" element={<MentorProfilePage />} />
                </Routes>
            </div>
            <Footer />
        </Router>
    );
}

export default App;