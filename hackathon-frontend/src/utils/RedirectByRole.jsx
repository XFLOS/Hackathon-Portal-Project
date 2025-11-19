import { Navigate } from "react-router-dom";

export default function RedirectByRole({ user }) {
  console.log('🔄 RedirectByRole called with user:', user);
  
  if (!user || !user.role) {
    console.log('⚠️ No user or role, redirecting to /');
    return <Navigate to="/" replace />;
  }

  console.log('✅ User role:', user.role);

  switch (user.role) {
    case "student":
      console.log('🎓 Redirecting to /student-dashboard');
      return <Navigate to="/student-dashboard" replace />;

    case "mentor":
      console.log('👨‍🏫 Redirecting to /mentor-dashboard');
      return <Navigate to="/mentor-dashboard" replace />;

    case "judge":
      console.log('⚖️ Redirecting to /judge-dashboard');
      return <Navigate to="/judge-dashboard" replace />;

    case "coordinator":
    case "admin":
      console.log('👑 Redirecting to /coordinator-dashboard');
      return <Navigate to="/coordinator-dashboard" replace />;

    default:
      console.log('⚠️ Unknown role, redirecting to /');
      return <Navigate to="/" replace />;
  }
}
