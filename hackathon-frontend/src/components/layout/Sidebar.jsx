import React from "react";
import StudentSidebar from "./StudentSidebar";
import MentorSidebar from "./MentorSidebar";
import JudgeSidebar from "./JudgeSidebar";
import CoordinatorSidebar from "./CoordinatorSidebar";
import { useAuth } from "../../context/AuthContext";

export default function Sidebar() {
  const { user } = useAuth();

  if (!user || !user.role) return null;

  const role = user.role.toLowerCase();

  if (role === "student") return <StudentSidebar />;
  if (role === "mentor") return <MentorSidebar />;
  if (role === "judge") return <JudgeSidebar />;
  if (role === "coordinator" || role === "admin")
    return <CoordinatorSidebar />;

  return null;
}
