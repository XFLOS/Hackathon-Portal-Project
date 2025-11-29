

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './SurveysPage.css';

export default function SurveysPage() {
  const { role } = useAuth();
  const [experience, setExperience] = useState('5');
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/surveys', {
        experience: Number(experience),
        comments,
        // Optionally, add user_id if available from auth context
      });
      setSubmitted(true);
    } catch (err) {
      alert('Failed to submit feedback. Please try again.');
    }
  };

  return (
    <section className="surveys-section">
      <h1>Surveys & Feedback</h1>
      {role === 'admin' ? (
        <>
          <p>Create and review surveys, export results.</p>
          <button className="surveys-form-btn" disabled>Create Survey (placeholder)</button>
        </>
      ) : (
        <>
          <p>Please share your feedback about the event.</p>
          <form className="surveys-form" onSubmit={handleSubmit}>
            <label htmlFor="experience">Overall experience</label>
            <select
              id="experience"
              value={experience}
              onChange={e => setExperience(e.target.value)}
              required
            >
              <option value="">Select…</option>
              <option value="1">1 - Poor</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5 - Excellent</option>
            </select>
            <label htmlFor="comments">Comments</label>
            <textarea
              id="comments"
              rows={4}
              placeholder="Your thoughts..."
              value={comments}
              onChange={e => setComments(e.target.value)}
            />
            <button type="submit" disabled={submitted || !experience}>Submit</button>
            {submitted && <div className="surveys-success">Thank you for your feedback!</div>}
          </form>
        </>
      )}
    </section>
  );
}

