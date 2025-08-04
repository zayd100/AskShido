const express = require('express');
const { body, validationResult } = require('express-validator');
const Response = require('../models/Response');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get user's questionnaire response
router.get('/response', async (req, res) => {
  try {
    const response = await Response.findOrCreateForUser(req.user._id);
    
    res.json({
      response: {
        id: response._id,
        answers: response.getAnswersObject(),
        currentQuestionIndex: response.currentQuestionIndex,
        isCompleted: response.isCompleted,
        completedAt: response.completedAt,
        lastUpdated: response.lastUpdated
      }
    });
  } catch (error) {
    console.error('Get response error:', error);
    res.status(500).json({
      message: 'Failed to get questionnaire response',
      error: error.message
    });
  }
});

// Update a single answer
router.post('/answer', [
  body('questionIndex')
    .isInt({ min: 0, max: 49 })
    .withMessage('Question index must be between 0 and 49'),
  body('answer')
    .isIn(['strong_yes', 'yes', 'no', 'strong_no'])
    .withMessage('Answer must be one of: strong_yes, yes, no, strong_no')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { questionIndex, answer } = req.body;

    // Find or create response
    const response = await Response.findOrCreateForUser(req.user._id);

    // Update the answer
    await response.updateAnswer(questionIndex, answer);

    res.json({
      message: 'Answer saved successfully',
      response: {
        id: response._id,
        answers: response.getAnswersObject(),
        currentQuestionIndex: response.currentQuestionIndex,
        isCompleted: response.isCompleted,
        completedAt: response.completedAt,
        lastUpdated: response.lastUpdated
      }
    });

  } catch (error) {
    console.error('Update answer error:', error);
    res.status(500).json({
      message: 'Failed to save answer',
      error: error.message
    });
  }
});

// Update multiple answers (batch update)
router.post('/answers', [
  body('answers')
    .isObject()
    .withMessage('Answers must be an object'),
  body('currentQuestionIndex')
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage('Current question index must be between 0 and 50')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { answers, currentQuestionIndex } = req.body;

    // Validate each answer
    for (const [questionIndex, answer] of Object.entries(answers)) {
      const qIndex = parseInt(questionIndex);
      if (qIndex < 0 || qIndex > 49) {
        return res.status(400).json({
          message: `Invalid question index: ${questionIndex}`
        });
      }
      if (!['strong_yes', 'yes', 'no', 'strong_no'].includes(answer)) {
        return res.status(400).json({
          message: `Invalid answer for question ${questionIndex}: ${answer}`
        });
      }
    }

    // Find or create response
    const response = await Response.findOrCreateForUser(req.user._id);

    // Update answers
    for (const [questionIndex, answer] of Object.entries(answers)) {
      response.answers.set(questionIndex, answer);
    }

    // Update current question index if provided
    if (currentQuestionIndex !== undefined) {
      response.currentQuestionIndex = currentQuestionIndex;
    }

    await response.save();

    res.json({
      message: 'Answers saved successfully',
      response: {
        id: response._id,
        answers: response.getAnswersObject(),
        currentQuestionIndex: response.currentQuestionIndex,
        isCompleted: response.isCompleted,
        completedAt: response.completedAt,
        lastUpdated: response.lastUpdated
      }
    });

  } catch (error) {
    console.error('Batch update error:', error);
    res.status(500).json({
      message: 'Failed to save answers',
      error: error.message
    });
  }
});

// Reset questionnaire (clear all answers)
router.post('/reset', async (req, res) => {
  try {
    const response = await Response.findOne({ userId: req.user._id });
    
    if (response) {
      response.answers.clear();
      response.currentQuestionIndex = 0;
      response.isCompleted = false;
      response.completedAt = null;
      await response.save();
    }

    res.json({
      message: 'Questionnaire reset successfully',
      response: response ? {
        id: response._id,
        answers: {},
        currentQuestionIndex: 0,
        isCompleted: false,
        completedAt: null,
        lastUpdated: response.lastUpdated
      } : null
    });

  } catch (error) {
    console.error('Reset questionnaire error:', error);
    res.status(500).json({
      message: 'Failed to reset questionnaire',
      error: error.message
    });
  }
});

// Get questionnaire statistics
router.get('/stats', async (req, res) => {
  try {
    const response = await Response.findOne({ userId: req.user._id });
    
    if (!response) {
      return res.json({
        stats: {
          totalQuestions: 50,
          answeredQuestions: 0,
          completionPercentage: 0,
          answerBreakdown: {
            strong_yes: 0,
            yes: 0,
            no: 0,
            strong_no: 0
          }
        }
      });
    }

    const answers = response.getAnswersObject();
    const answeredCount = Object.keys(answers).length;
    const completionPercentage = (answeredCount / 50) * 100;

    const answerBreakdown = {
      strong_yes: 0,
      yes: 0,
      no: 0,
      strong_no: 0
    };

    Object.values(answers).forEach(answer => {
      answerBreakdown[answer] = (answerBreakdown[answer] || 0) + 1;
    });

    res.json({
      stats: {
        totalQuestions: 50,
        answeredQuestions: answeredCount,
        completionPercentage: Math.round(completionPercentage),
        answerBreakdown,
        isCompleted: response.isCompleted,
        completedAt: response.completedAt,
        lastUpdated: response.lastUpdated
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      message: 'Failed to get questionnaire statistics',
      error: error.message
    });
  }
});

module.exports = router;