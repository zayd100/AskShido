import React from 'react';
import '../styles/dashboard.css'; // Optional: create for custom styles

const Dashboard = ({
  user,
  questions,
  userAnswers,
  onLogout,
  onGoToQuestion
}) => {
  // Calculate stats
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(userAnswers).length;
  const completionPercent = Math.round((answeredCount / totalQuestions) * 100);

  // Breakdown of answers
  const answerTypes = ['strong_yes', 'yes', 'no', 'strong_no'];
  const answerLabels = {
    strong_yes: 'Strong Yes',
    yes: 'Yes',
    no: 'No',
    strong_no: 'Strong No'
  };
  const answerBreakdown = answerTypes.reduce((acc, type) => {
    acc[type] = Object.values(userAnswers).filter(a => a === type).length;
    return acc;
  }, {});

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome, {user?.username}!</h1>
        <button className="dashboard-logout" onClick={onLogout}>
          Logout
        </button>
      </div>

      <div className="dashboard-stats">
        <h2>Ask-Shido Progress</h2>
        <div className="dashboard-progress-bar">
          <div
            className="dashboard-progress-fill"
            style={{ width: `${completionPercent}%` }}
          ></div>
        </div>
        <p>
          {answeredCount} of {totalQuestions} questions answered (
          {completionPercent}%)
        </p>
      </div>

      <div className="dashboard-breakdown">
        <h3>Answer Breakdown</h3>
        <ul>
          {answerTypes.map(type => (
            <li key={type}>
              <span className={`breakdown-label breakdown-${type}`}>
                {answerLabels[type]}:
              </span>
              <span className="breakdown-count">
                {answerBreakdown[type]}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="dashboard-answers">
        <h3>Review Your Answers</h3>
        <ul>
          {questions.map((q, idx) => (
            <li key={idx} className="dashboard-question-row">
              <span className="dashboard-question-text">
                {idx + 1}. {q}
              </span>
              <span className="dashboard-answer-text">
                {userAnswers[idx] ? answerLabels[userAnswers[idx]] : <em>Not answered</em>}
              </span>
          
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;