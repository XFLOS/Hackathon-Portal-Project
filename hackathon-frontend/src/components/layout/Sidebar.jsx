import React from "react";
import StudentSidebar from "./StudentSidebar";
import MentorSidebar from "./MentorSidebar";
import JudgeSidebar from "./JudgeSidebar";
import CoordinatorSidebar from "./CoordinatorSidebar";
import { useAuth } from "../../context/AuthContext";

export default function Sidebar() {
  const { user, loading } = useAuth();

  // While loading auth state, don't break the layout
  if (loading) {
    return (
      <div style={{ width: "260px", background: "rgba(255,255,255,0.05)" }} />
    );
  }

  // If no user, just render an empty sidebar container to preserve layout
  if (!user || !user.role) {
    return (
      <div style={{ width: "260px", background: "rgba(255,255,255,0.05)" }} />
    );
  }

  const role = user.role.toLowerCase();

  switch (role) {
    case "student":
      return <StudentSidebar />;
    case "mentor":
      return <MentorSidebar />;
    case "judge":
      return <JudgeSidebar />;
    case "coordinator":
    case "admin":
      return <CoordinatorSidebar />;
    default:
      return (
        <div style={{ width: "260px", background: "rgba(255,255,255,0.05)" }} />
      );
  }
}
