import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/config";
import "./CertificatePage.css";

const MOCK_USER = {
  role: "student",
  name: "Cassia Millnitz",
  certificateType: "Participation",
  surveyCompleted: true,
  hackathonName: "NCT Spring 2025 Innovation Challenge",
};

export default function CertificatePage() {
  const [user, setUser] = useState(MOCK_USER);
  const [canDownload, setCanDownload] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setCanDownload(MOCK_USER.surveyCompleted);
  }, [navigate]);

  const handleDownload = () => {
    alert(`Downloading ${user.certificateType} Certificate for ${user.name}...`);
  };

  if (!canDownload) {
    return (
      <div className="certificate-container access-denied">
        <h2 className="certificate-title">Certificate Status</h2>
        <p className="error-message">
          Access Denied: You must complete the <strong>Post-Hackathon Survey</strong> to unlock your certificate.
        </p>
        <button
          className="survey-link-button"
          onClick={() => navigate("/survey")}
        >
          Go to Survey Page
        </button>
      </div>
    );
  }

  return (
    <div className="certificate-container">
      <h2 className="certificate-title">{user.certificateType} Certificate</h2>
      <p className="certificate-subtitle">
        Congratulations, <strong>{user.name}</strong>! Your contribution to the{" "}
        <strong>{user.hackathonName}</strong> is truly appreciated.
      </p>

      <div className="certificate-display">
        <p><strong>Preview of your Certificate:</strong></p>
        <p>Type: <strong>{user.certificateType}</strong> | Role: <strong>{user.role}</strong></p>
      </div>

      <button className="download-button" onClick={handleDownload}>
        ⬇️ Download High-Resolution Certificate
      </button>
    </div>
  );
}