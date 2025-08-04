import api from './api';

class QuestionnaireService {
  async getResponse() {
    try {
      const response = await api.get('/questionnaire/response');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to get questionnaire response');
    }
  }

  async submitAnswer(questionIndex, answer) {
    try {
      const response = await api.post('/questionnaire/answer', {
        questionIndex,
        answer
      });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to submit answer');
    }
  }

  async getStats() {
    try {
      const response = await api.get('/questionnaire/stats');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to get questionnaire stats');
    }
  }

  async resetQuestionnaire() {
    try {
      const response = await api.post('/questionnaire/reset');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to reset questionnaire');
    }
  }
}

export default new QuestionnaireService();