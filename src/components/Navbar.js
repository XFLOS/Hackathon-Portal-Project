import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { auth } from "../firebase/config";
import { signOut, onAuthStateChanged } from "firebase/auth";
import logo from "../images/1.png";
import "./Navbar.css";

const TEMPORARY_getRole = (userEmail) => {
  if (!userEmail) return null;
  if (userEmail.includes("coordinator")) return "Coordinator";
  if (userEmail.includes("judge")) return "Judge";
  if (userEmail.includes("mentor")) return "Mentor";
  return "Student";
};

function Navbar() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const userData = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email,
        };

        const role = TEMPORARY_getRole(firebaseUser.email);
        setUser(userData);
        setUserRole(role);
        localStorage.setItem("userRole", role);
      } else {
        setUser(null);
        setUserRole(null);
        localStorage.removeItem("userRole");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setDropdownOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const closeDropdown = useCallback(() => setDropdownOpen(false), []);

  const renderNavLinks = useCallback(() => {
    const links = [];

    links.push(<Link key="schd-pub" to="/schedule" onClick={closeDropdown}>Full Schedule</Link>);
    links.push(<div key="div-1" className="dropdown-divider" />);

    switch (userRole) {
      case "Student":
        links.push(<Link key="dash" to="/student/dashboard" onClick={closeDropdown}>Dashboard</Link>);
        links.push(<Link key="team" to="/student/team" onClick={closeDropdown}>My Team & Submissions</Link>);
        links.push(<Link key="schd-priv" to="/student/schedule" onClick={closeDropdown}>Presentation Schedule</Link>);
        links.push(<Link key="prof" to="/student/profile" onClick={closeDropdown}>Edit Profile</Link>);
        break;

      case "Mentor":
        links.push(<Link key="mentorDash" to="/mentor/teams" onClick={closeDropdown}>My Teams</Link>);
        links.push(<Link key="briefing" to="/mentor/briefing" onClick={closeDropdown}>Briefing View</Link>);
        links.push(<Link key="prof" to="/mentor/profile" onClick={closeDropdown}>My Profile</Link>);
        break;

      case "Judge":
        links.push(<Link key="judgeDash" to="/judge/dashboard" onClick={closeDropdown}>Judge Portal</Link>);
        links.push(<Link key="grade" to="/judge/grading" onClick={closeDropdown}>Live Grading</Link>);
        links.push(<Link key="sublist" to="/judge/submissions" onClick={closeDropdown}>Submissions List</Link>);
        break;

      case "Coordinator":
        links.push(<Link key="adminDash" to="/admin/dashboard" onClick={closeDropdown}>Admin Dashboard</Link>);
        links.push(<Link key="users" to="/admin/users" onClick={closeDropdown}>Users</Link>);
        links.push(<Link key="reports" to="/admin/reports" onClick={closeDropdown}>Reports & Analytics</Link>);
        links.push(<Link key="lboard" to="/leaderboard" onClick={closeDropdown}>Leaderboard</Link>);
        links.push(<Link key="schd-edit" to="/admin/schedule-edit" onClick={closeDropdown}>Edit Schedule</Link>);
        break;

      default:
        break;
    }

    links.push(<div key="div-2" className="dropdown-divider" />);
    links.push(<Link key="about" to="/about" onClick={closeDropdown}>About Hackathon</Link>);
    links.push(<Link key="contact" to="/contact" onClick={closeDropdown}>Contact & Support</Link>);
    links.push(<button key="logout" onClick={handleLogout}>Log out</button>);

    return links;
  }, [userRole, closeDropdown]);

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/">
          <img src={logo} alt="Hackathon Portal Logo" className="nav-logo" />
        </Link>
      </div>

      {user ? (
        <div className="nav-right authenticated">
          <span className="user-info">
            Welcome, {user.name.split(" ")[0]} ({userRole})
          </span>
          <div
            className="hamburger"
            onClick={() => setDropdownOpen((prev) => !prev)}
          >
            &#9776;
          </div>
          {dropdownOpen && (
            <div className="dropdown-menu">{renderNavLinks()}</div>
          )}
        </div>
      ) : (
        <div className="nav-right public">
          <Link to="/login" className="nav-btn">Log In</Link>
          <Link to="/register" className="nav-btn signup-highlight">Sign Up</Link>
        </div>
      )}
    </nav>
  );
}

export default Navbar;