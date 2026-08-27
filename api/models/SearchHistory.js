const mongoose = require('mongoose');

const searchHistorySchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['movie', 'music', 'book']
  },
  query: {
    type: String,
    required: true
  },
  ai_insight: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SearchHistory', searchHistorySchema);
