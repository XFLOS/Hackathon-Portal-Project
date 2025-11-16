import React from 'react';
import './AboutPage.css';

export default function AboutPage() {
  return (
    <div className="about-container">
      <h1 className="about-title">About the GUS Hackathon 2025</h1>

      <section className="section about-mission">
        <h2 className="section-title">Our Mission</h2>
        <p>
          The GUS Hackathon is a 72-hour event where students team up to build real solutions.
          We want to push creativity, teamwork, and coding skills, and give students a taste of
          solving real tech challenges outside the classroom.
        </p>
      </section>
      
      <section className="section about-theme">
        <h2 className="section-title">This Year's Theme: Sustainable Urban Tech</h2>
        <p>
          This year, projects should improve city life, tackle environmental issues, or make urban
          systems smarter. Think smart traffic, waste reduction, or anything that makes cities
          more sustainable and fun to live in.
        </p>
      </section>
    </div>
  );
}