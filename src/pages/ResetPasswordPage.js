import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase/config"; 
import { Link } from "react-router-dom";
import './ResetPasswordPage.css';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState(""); 
  const [message, setMessage] = useState(""); 

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent successfully!");
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div className="reset-password-container">
      <h2>Reset Password</h2>
      <form onSubmit={handleReset}>
        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Send Link</button>
      </form>
      {message && <p className="message">{message}</p>}
      <p className="back-to-login">
        <Link to="/login">Back to Login</Link>
      </p>
    </div>
  );
}