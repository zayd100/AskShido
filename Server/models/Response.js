const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answers: {
    type: Map,
    of: {
      type: String,
      enum: ['strong_yes', 'yes', 'no', 'strong_no'],
      required: true
    },
    default: {}
  },
  currentQuestionIndex: {
    type: Number,
    default: 0,
    min: 0,
    max: 50 // Since we have 50 questions (0-49)
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update lastUpdated on save
responseSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  
  // Check if questionnaire is completed (all 50 questions answered)
  if (this.answers && this.answers.size === 50) {
    this.isCompleted = true;
    if (!this.completedAt) {
      this.completedAt = new Date();
    }
  }
  
  next();
});

// Method to get answers as a regular object (for easier frontend consumption)
responseSchema.methods.getAnswersObject = function() {
  const answersObj = {};
  this.answers.forEach((value, key) => {
    answersObj[key] = value;
  });
  return answersObj;
};

// Method to update a single answer
responseSchema.methods.updateAnswer = function(questionIndex, answer) {
  this.answers.set(questionIndex.toString(), answer);
  this.currentQuestionIndex = Math.max(this.currentQuestionIndex, questionIndex + 1);
  return this.save();
};

// Static method to find or create response for user
responseSchema.statics.findOrCreateForUser = async function(userId) {
  let response = await this.findOne({ userId });
  
  if (!response) {
    response = new this({ userId });
    await response.save();
  }
  
  return response;
};

module.exports = mongoose.model('Response', responseSchema);