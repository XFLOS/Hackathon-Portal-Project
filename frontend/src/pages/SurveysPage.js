import React from 'react';
import { useAuth } from '../context/AuthContext';

// Simple placeholder UI for post-event surveys/feedback
export default function SurveysPage() {
  const { role } = useAuth();

  return (
    <section>
      <h1>Surveys & Feedback</h1>
      {role === 'admin' ? (
        <>
          <p>Create and review surveys, export results.</p>
          <button disabled>Create Survey (placeholder)</button>
        </>
      ) : (
        <>
          <p>Please share your feedback about the event.</p>
          <form onSubmit={(e) => e.preventDefault()}>
            <label>
              Overall experience
              <select defaultValue="5">
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
            </label>
            <br />
            <label>
              Comments
              <br />
              <textarea rows={4} cols={50} placeholder="Your thoughts..." />
            </label>
            <br />
            <button type="submit" disabled>Submit (placeholder)</button>
          </form>
        </>
      )}
    </section>
  );
}

