import React, { useState, useEffect } from 'react';
import Login from './components/login';
import Register from './components/register';
import Questionnaire from './components/questionaire';
import Dashboard from './components/dashboard';
import { useQuestionnaire } from './hooks/useQuestionnaire';

// Your existing QUESTIONS array...
const QUESTIONS = [
 "Do you enjoy working in teams?",
  "Are you comfortable with public speaking?",
  "Do you prefer working with data over people?",
  "Are you motivated by financial rewards?",
  "Do you enjoy creative problem solving?",
  "Are you comfortable with uncertainty?",
  "Do you prefer structured work environments?",
  "Are you willing to work long hours?",
  "Do you enjoy learning new technologies?",
  "Are you comfortable with leadership roles?",
  "Do you prefer remote work?",
  "Are you detail-oriented?",
  "Do you enjoy competitive environments?",
  "Are you comfortable with frequent travel?",
  "Do you prefer working independently?",
  "Are you passionate about helping others?",
  "Do you enjoy analytical thinking?",
  "Are you comfortable with risk-taking?",
  "Do you prefer routine work?",
  "Are you motivated by recognition?",
  "Do you enjoy mentoring others?",
  "Are you comfortable with technology?",
  "Do you prefer fast-paced environments?",
  "Are you willing to relocate for work?",
  "Do you enjoy research and development?",
  "Are you comfortable with client interaction?",
  "Do you prefer working with your hands?",
  "Are you motivated by making a difference?",
  "Do you enjoy planning and organizing?",
  "Are you comfortable with performance pressure?",
  "Do you prefer collaborative decision making?",
  "Are you interested in continuous learning?",
  "Do you enjoy working with numbers?",
  "Are you comfortable with change?",
  "Do you prefer project-based work?",
  "Are you motivated by career advancement?",
  "Do you enjoy teaching others?",
  "Are you comfortable with multitasking?",
  "Do you prefer working in small companies?",
  "Are you interested in innovation?",
  "Do you enjoy customer service?",
  "Are you comfortable with tight deadlines?",
  "Do you prefer working outdoors?",
  "Are you motivated by work-life balance?",
  "Do you enjoy strategic thinking?",
  "Are you comfortable with public presentations?",
  "Do you prefer working with established processes?",
  "Are you interested in entrepreneurship?",
  "Do you enjoy problem-solving under pressure?",
  "Are you comfortable with ambiguous situations?"
];

function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('login');
  const [isLoading, setIsLoading] = useState(true);

  const {
    response,
    loadResponse,
    submitAnswer,
    resetQuestionnaire,
    loading: questionnaireLoading,
  } = useQuestionnaire();

    useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);

      try {
        const resp = await loadResponse();
        const answeredCount = Object.keys(resp?.answers || {}).length;
        if (answeredCount === QUESTIONS.length || resp?.isCompleted) {
          setCurrentView('dashboard');
        } else {
          setCurrentView('questionnaire');
        }
      } catch (err) {
        console.error('Failed to load response from backend:', err);
        setCurrentView('questionnaire');
      }
    } else {
      setCurrentView('login');
    }

    setIsLoading(false);
  };

  const handleLogin = async (userData) => {
    setUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
    try {
      const resp = await loadResponse();
      const answeredCount = Object.keys(resp?.answers || {}).length;
      if (answeredCount === QUESTIONS.length || resp?.isCompleted) {
        setCurrentView('dashboard');
      } else {
        setCurrentView('questionnaire');
      }
    } catch (err) {
      console.error('Failed to load response after login:', err);
      setCurrentView('questionnaire');
    }
  };

  const handleRegister = async (userData) => {
    setUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
    try {
      await loadResponse(); // initialize response in backend
    } catch (err) {
      console.error('Failed to load response after register:', err);
    }
    setCurrentView('questionnaire');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    setCurrentView('login');
  };

  const handleAnswerSubmit = async (questionIndex, answer) => {
    try {
      const updated = await submitAnswer(questionIndex, answer);
      const totalAnswered = Object.keys(updated.answers || {}).length;
      if (totalAnswered === QUESTIONS.length) {
        setCurrentView('dashboard');
      }
    } catch (err) {
      console.error('Failed to submit answer:', err);
    }
  };

  const goToQuestion = (index) => {
    // You may want to update the backend current index here too
    setCurrentView('questionnaire');
  };

  if (isLoading || questionnaireLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // NEW: Add the redo questionnaire function
  const handleRedoQuestionnaire = async () => {
    try {
      await resetQuestionnaire();
      // Navigate back to questionnaire
      setCurrentView('questionnaire');
    } catch (err) {
      console.error('Failed to reset questionnaire:', err);
      alert('Failed to reset questionnaire. Please try again.');
    }
  };

  if (isLoading || questionnaireLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {currentView === 'login' && (
        <Login
          onLogin={handleLogin}
          onSwitchToRegister={() => setCurrentView('register')}
        />
      )}

      {currentView === 'register' && (
        <Register
          onRegister={handleRegister}
          onSwitchToLogin={() => setCurrentView('login')}
        />
      )}

      {currentView === 'questionnaire' && user && response && (
        <Questionnaire
          user={user}
          questions={QUESTIONS}
          currentQuestionIndex={response.currentQuestionIndex}
          userAnswers={response.answers || {}}
          onAnswerSubmit={handleAnswerSubmit}
          onLogout={handleLogout}
          onViewDashboard={() => setCurrentView('dashboard')}
        />
      )}

      {currentView === 'dashboard' && user && response && (
        <Dashboard
          user={user}
          questions={QUESTIONS}
          userAnswers={response.answers || {}}
          onLogout={handleLogout}
          onGoToQuestion={goToQuestion}
          onRedoQuestionnaire={handleRedoQuestionnaire} // NEW: Pass the function
          isResetting={questionnaireLoading} // NEW: Pass loading state
        />
      )}
    </div>
  );
}

export default App;