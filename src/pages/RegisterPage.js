import React, { useState } from "react";
import { 
  createUserWithEmailAndPassword, 
  updateProfile, 
  sendEmailVerification, 
  signOut 
} from "firebase/auth";
import { auth } from "../firebase/config";
import { Link, useNavigate } from "react-router-dom";
import "./RegisterPage.css";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [college, setCollege] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const gusColleges = [
    "Niagara College - Toronto (NCT)",
    "Niagara College - Niagara Falls",
    "Toronto School of Management"
  ];

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }

    if (!name || !email || !password || !collegeId || !college) {
      setMessage("Please fill in all required fields.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });

      await sendEmailVerification(user);

      await signOut(auth);

      navigate("/verify-email", {
        state: {
          email: email,
          emailSent: true,
          message: "Registration successful! A verification email has been sent. Please check your inbox and click the link to activate your account before logging in."
        }
      });

    } catch (err) {
      console.error("Registration failed:", err);
      if (err.code === "auth/email-already-in-use") {
        setMessage("Registration Failed: This email is already in use. Please log in.");
      } else {
        setMessage(`Registration Failed: ${err.message || "An unknown error occurred."}`);
      }
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Sign Up as a Student</h2>

        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          /><br />

          <input
            type="email"
            placeholder="GUS College Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          /><br />

          <input
            type="text"
            placeholder="College ID (e.g., N00123456)"
            value={collegeId}
            onChange={(e) => setCollegeId(e.target.value)}
            required
          /><br />

          <select
            value={college}
            onChange={(e) => setCollege(e.target.value)}
            required
          >
            <option value="">Select Your College *</option>
            {gusColleges.map((col) => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select><br />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          /><br />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          /><br />

          <button type="submit">Register</button>
        </form>

        {message && <p className="message">{message}</p>}

        <p className="already-account">
          Already have an account? <Link to="/login">Log in here</Link>
        </p>
      </div>
    </div>
  );
}
