import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/config";
import "./SurveyPage.css";

const MOCK_USER_ROLE = "student"; // 'student', 'mentor', 'judge'

const surveys = {
  student: [
    { id: 1, type: "rating", question: "How satisfied were you with the hackathon challenge?" },
    { id: 2, type: "rating", question: "How helpful was the mentorship provided to your team?" },
    { id: 3, type: "textarea", question: "What suggestions do you have for next year's event?" }
  ],
  mentor: [
    { id: 1, type: "rating", question: "Rate the overall quality of team engagement and ideas." },
    { id: 2, type: "rating", question: "How effective was the provided briefing and communication?" },
    { id: 3, type: "textarea", question: "Provide feedback on mentor assignment process." }
  ],
  judge: [
    { id: 1, type: "rating", question: "How clear and relevant were the judging rubrics?" },
    { id: 2, type: "rating", question: "Rate the live grading system's usability." },
    { id: 3, type: "textarea", question: "Advice for future hackathon organizers regarding judging?" }
  ]
};

export default function SurveyPage() {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);
  const [surveyQuestions, setSurveyQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      navigate("/login");
      return;
    }

    const role = MOCK_USER_ROLE;
    setUserRole(role);
    setSurveyQuestions(surveys[role] || []);
    setIsLoading(false);
  }, [navigate]);

  const handleInputChange = (id, value) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(answers).length !== surveyQuestions.length) {
      alert("Please answer all questions before submitting.");
      return;
    }

    setIsLoading(true);
    await new Promise(res => setTimeout(res, 1200)); // simulate API call
    setIsLoading(false);
    setSubmitted(true);
  };

  if (isLoading) return <div className="survey-container">Loading survey...</div>;

  if (submitted) {
    return (
      <div className="survey-container submitted-view">
        <h1>Thank You for Your Feedback!</h1>
        <p>Your input will help improve future hackathons.</p>
        <p>You can now download your certificate.</p>
        <button className="certificate-button" onClick={() => navigate("/certificate")}>
          View & Download Certificate
        </button>
      </div>
    );
  }

  if (!surveyQuestions.length) return <div className="survey-container">No survey available for role: {userRole}</div>;

  return (
    <div className="survey-container">
      <h1 className="survey-title">Feedback Survey: {userRole.charAt(0).toUpperCase() + userRole.slice(1)}</h1>
      <p className="survey-subtitle">Your feedback helps plan better NCT events.</p>

      <form onSubmit={handleSubmit} className="survey-form">
        {surveyQuestions.map(q => (
          <div key={q.id} className="question-group">
            <label className="question-label">{q.question}</label>
            {q.type === "rating" && (
              <div className="rating-options">
                {[1, 2, 3, 4, 5].map(n => (
                  <label key={n} className="rating-label">
                    <input type="radio" name={`q${q.id}`} value={n} onChange={e => handleInputChange(q.id, parseInt(e.target.value))} required />
                    {n}
                  </label>
                ))}
                <span className="rating-scale">(1 = Poor, 5 = Excellent)</span>
              </div>
            )}
            {q.type === "textarea" && (
              <textarea placeholder="Type your feedback..." onChange={e => handleInputChange(q.id, e.target.value)} required />
            )}
          </div>
        ))}

        <button type="submit" className="submit-button" disabled={isLoading}>
          {isLoading ? "Submitting..." : "Submit Feedback & Unlock Certificate"}
        </button>
      </form>
    </div>
  );
}