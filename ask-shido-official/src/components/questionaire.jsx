// src/components/Questionnaire.jsx - Fixed to handle completion state
import React, { useState, useEffect, useCallback } from 'react';
import { useQuestionnaire } from '../hooks/useQuestionnaire';
import { useAuth } from '../hooks/useAuth';
import '../styles/questionaire.css'
const Questionnaire = ({ 
  questions, 
  onLogout,
  onViewDashboard 
}) => {
  const { user, logout } = useAuth();
  const { 
    response, 
    loading, 
    error, 
    loadResponse, 
    submitAnswer 
  } = useQuestionnaire();
  
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const answerOptions = [
    { value: 'strong_yes', label: 'Strong Yes', color: 'strong-yes-option' },
    { value: 'yes', label: 'Yes', color: 'yes-option' },
    { value: 'no', label: 'No', color: 'no-option' },
    { value: 'strong_no', label: 'Strong No', color: 'strong-no-option' }
  ];

  // Load user's existing response on component mount ONLY ONCE
  useEffect(() => {
    const loadUserResponse = async () => {
      if (isInitialized) return; // Prevent multiple loads
      
      try {
        const userResponse = await loadResponse();
        if (userResponse) {
          setUserAnswers(userResponse.answers || {});
          
          // FIXED: Handle completion state properly
          if (userResponse.isCompleted || userResponse.currentQuestionIndex >= questions.length) {
            setIsCompleted(true);
            setCurrentQuestionIndex(questions.length - 1); // Show last question
            console.log('✅ Questionnaire already completed');
          } else {
            setCurrentQuestionIndex(Math.min(userResponse.currentQuestionIndex || 0, questions.length - 1));
          }
          
          setSelectedAnswer(userResponse.answers?.[currentQuestionIndex] || '');
        }
      } catch (err) {
        console.error('Failed to load user response:', err);
      } finally {
        setIsInitialized(true);
      }
    };

    loadUserResponse();
  }, []); // EMPTY dependency array - only run once!

  // Update selected answer when question changes (but not on initial load)
  useEffect(() => {
    if (isInitialized && !isCompleted) {
      setSelectedAnswer(userAnswers[currentQuestionIndex] || '');
    }
  }, [currentQuestionIndex, userAnswers, isInitialized, isCompleted]);

  // If questionnaire is completed, show completion screen
  useEffect(() => {
    if (isCompleted) {
      // Auto-redirect to dashboard after showing completion
      const timer = setTimeout(() => {
        onViewDashboard();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isCompleted, onViewDashboard]);

  const handleAnswerSelect = useCallback((answer) => {
    setSelectedAnswer(answer);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!selectedAnswer) return;

    try {
      const updatedResponse = await submitAnswer(currentQuestionIndex, selectedAnswer);
      setUserAnswers(prev => ({ ...prev, ...updatedResponse.answers }));
      
      // Check if questionnaire is completed
      if (updatedResponse.isCompleted || Object.keys(updatedResponse.answers).length >= questions.length) {
        setIsCompleted(true);
        alert('Congratulations! You have completed the questionnaire.');
      }
    } catch (err) {
      console.error('Failed to submit answer:', err);
      alert('Failed to save your answer. Please try again.');
    }
  }, [selectedAnswer, currentQuestionIndex, submitAnswer, questions.length]);

  const handleNext = useCallback(async () => {
    if (!selectedAnswer) return;

    try {
      const updatedResponse = await submitAnswer(currentQuestionIndex, selectedAnswer);
      setUserAnswers(prev => ({ ...prev, ...updatedResponse.answers }));
      
      // Check if questionnaire is completed
      if (updatedResponse.isCompleted || Object.keys(updatedResponse.answers).length >= questions.length) {
        setIsCompleted(true);
        alert('Congratulations! You have completed Ask-Shido!');
        return;
      }
      
      // Move to next question (but don't go beyond last question)
      if (currentQuestionIndex < questions.length - 1) {
        const nextIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIndex);
      }
    } catch (err) {
      console.error('Failed to submit answer:', err);
      alert('Failed to save your answer. Please try again.');
    }
  }, [selectedAnswer, currentQuestionIndex, submitAnswer, questions.length]);

  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0 && !isCompleted) {
      const prevIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIndex);
    }
  }, [currentQuestionIndex, isCompleted]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      onLogout();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  }, [logout, onLogout]);

  // Don't render until initialized to prevent flicker
  if (!isInitialized || loading) {
    return (
      <div className="questionnaire-container">
        <div className="loading-message">
          Loading your questionnaire...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="questionnaire-container">
        <div className="error-message">
          {error}
        </div>
      </div>
    );
  }

  // Show completion screen
  if (isCompleted) {
    return (
      <div className="questionnaire-container">
        <div className="completion-screen">
          <h1>🎉 Questionnaire Completed!</h1>
          <p>Thank you for completing all {questions.length} questions.</p>
          <p>Redirecting to your dashboard...</p>
          <button onClick={onViewDashboard} className="nav-button complete-button">
            View Results Now
          </button>
        </div>
      </div>
    );
  }

  // SAFETY CHECK: Ensure we don't go beyond available questions
  const safeQuestionIndex = Math.min(currentQuestionIndex, questions.length - 1);
  const progress = ((safeQuestionIndex + 1) / questions.length) * 100;
  const answeredCount = Object.keys(userAnswers).length;

  return (
    <div className="questionnaire-container">
      {/* Header */}
      <div className="questionnaire-header">
        <div className="questionnaire-header-content">
          <div className="questionnaire-header-info">
            <div className="user-info">
              <h1 className="user-welcome">
                Welcome, {user?.username}
              </h1>
              <p className="question-counter">
                Question {safeQuestionIndex + 1} of {questions.length}
              </p>
            </div>
            <div className="header-buttons">
              {answeredCount > 0 && (
                <button
                  onClick={onViewDashboard}
                  className="header-button dashboard-button"
                >
                  View Progress
                </button>
              )}
              <button
                onClick={handleLogout}
                className="header-button logout-button"
              >
                Logout
              </button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="progress-section">
            <div className="progress-bar-container">
              <div 
                className="progress-bar-fill"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="progress-text">
              {answeredCount} of {questions.length} questions answered
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="questionnaire-main">
        <div className="question-card">
          <div className="question-section">
            <h2 className="question-text">
              {questions[safeQuestionIndex]}
            </h2>
            <p className="question-instruction">
              Please select the option that best represents your response:
            </p>
          </div>

          {/* Answer Options */}
          <div className="answer-options">
            {answerOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleAnswerSelect(option.value)}
                className={`answer-option ${selectedAnswer === option.value ? 'answer-option-selected' : 'answer-option-default'}`}
              >
                <div className="answer-option-content">
                  <div className={`option-radio ${selectedAnswer === option.value ? 'option-radio-selected' : 'option-radio-default'}`}></div>
                  <span className={`option-label ${selectedAnswer === option.value ? 'option-label-selected' : 'option-label-default'}`}>
                    {option.label}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="navigation-buttons">
            <button
              onClick={handlePrevious}
              disabled={safeQuestionIndex === 0}
              className="nav-button previous-button"
            >
              Previous
            </button>

            <div className="question-counter-nav">
              {safeQuestionIndex + 1} / {questions.length}
            </div>

            {safeQuestionIndex === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={!selectedAnswer}
                className="nav-button complete-button"
              >
                Complete Ask-Shido
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!selectedAnswer}
                className="nav-button next-button"
              >
                Next
              </button>
            )}
          </div>
        </div>

        {/* Mobile-friendly spacing */}
        <div className="mobile-spacing"></div>
      </div>
    </div>
  );
};

export default Questionnaire;