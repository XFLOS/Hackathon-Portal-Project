import { Navigate } from "react-router-dom";

export default function RedirectByRole({ user }) {
  if (!user || !user.role) {
    return <Navigate to="/" replace />;
  }

  switch (user.role) {
    case "student":
      return <Navigate to="/student-dashboard" replace />;

    case "mentor":
      return <Navigate to="/mentor-dashboard" replace />;

    case "judge":
      return <Navigate to="/judge-dashboard" replace />;

    case "coordinator":
    case "admin":
      return <Navigate to="/coordinator-dashboard" replace />;

    default:
      return <Navigate to="/" replace />;
  }
}
