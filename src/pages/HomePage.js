import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../firebase/config";
import "./HomePage.css";

const mockData = {
  details: {
    theme: "Sustainable Urban Tech",
    date: "Nov 23-24, 2025",
    location: "Niagara College Toronto - Mirvish Campus",
  },
  prizes: [
    { title: "1st Place", value: "$2,000", description: "Best overall project." },
    { title: "2nd Place", value: "$1,000", description: "2nd Best overall project." },
    { title: "3rd Place", value: "$500", description: "3rd Best overall project." },
  ],
  schedule: [
    { time: "10 AM", event: "Opening & Kickoff" },
    { time: "11 AM", event: "Start Hacking!" },
    { time: "5 PM", event: "Mentor Office Hours" },
    { time: "Day 2, 11 AM", event: "Project Deadline" },
    { time: "Day 2, 12 PM", event: "Judging Time" },
    { time: "3 PM", event: "Closing & Awards" },
  ],
  sponsors: [ "Google", "TD Bank", "CIBC"]
};

export default function HomePage() {
  const navigate = useNavigate();

  const handleJoinHackathon = () => {
    const user = auth.currentUser;
    if (!user) {
      navigate("/login");
      return;
    }
    navigate("/student/team-select");
  };

  return (
    <div className="home-container">
      <section className="section hero-section">
        <h1 className="main-title">GUS Hackathon Portal</h1>
        <h2 className="subtitle">The Home for Innovation</h2>
        <p className="description">
          Team up, build cool stuff, and win some awesome prizes!
        </p>
        <button className="cta-btn" onClick={handleJoinHackathon}>
          Join Now
        </button>
      </section>
      <section className="section details-section">
        <h3 className="section-title">Event Info</h3>
        <div className="details-grid">
          <div className="detail-item">
            <span className="detail-label">Theme:</span>
            <span className="detail-value">{mockData.details.theme}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">When:</span>
            <span className="detail-value">{mockData.details.date}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Where:</span>
            <span className="detail-value">{mockData.details.location}</span>
          </div>
        </div>
      </section>
      <section className="section prize-section">
        <h3 className="section-title">Prizes</h3>
        <div className="prize-list">
          {mockData.prizes.map((p, index) => (
            <div key={index} className="prize-item">
              <span className="prize-rank">#{index + 1}</span>
              <div className="prize-info">
                <h4>{p.title} - {p.value}</h4>
                <p>{p.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="section schedule-section">
        <h3 className="section-title">Schedule</h3>
        <div className="schedule-list">
          {mockData.schedule.map((item, index) => (
            <div key={index} className="schedule-item">
              <span className="schedule-time">{item.time}</span>
              <span className="schedule-event">{item.event}</span>
            </div>
          ))}
        </div>
        <Link to="/schedule" className="full-schedule-link">
          See Full Schedule &rarr;
        </Link>
      </section>
      <section className="section sponsor-section">
        <h3 className="section-title">Sponsors</h3>
        <div className="sponsor-logos">
          {mockData.sponsors.map((name, index) => (
            <div key={index} className="sponsor-logo-wrapper">
              <p className="sponsor-text">{name}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}