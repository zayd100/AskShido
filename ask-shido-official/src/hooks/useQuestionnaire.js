import { useState } from 'react';
import questionnaireService from '../services/questionnaireService';

export const useQuestionnaire = () => {
  const [response, setResponse] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadResponse = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await questionnaireService.getResponse();
      setResponse(data.response);
      return data.response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async (questionIndex, answer) => {
    setError(null);
    
    try {
      const data = await questionnaireService.submitAnswer(questionIndex, answer);
      setResponse(data.response);
      return data.response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const loadStats = async () => {
    setError(null);
    
    try {
      const data = await questionnaireService.getStats();
      setStats(data.stats);
      return data.stats;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const resetQuestionnaire = async () => {
    setError(null);
    
    try {
      const data = await questionnaireService.resetQuestionnaire();
      setResponse(data.response);
      return data.response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    response,
    stats,
    loading,
    error,
    loadResponse,
    submitAnswer,
    loadStats,
    resetQuestionnaire
  };
};