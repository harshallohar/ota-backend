const mongoose = require('mongoose')

const ESPSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    minLength: 3,
    maxLength: 30
  },
  espId: {
    type: String,
    required: true,
    unique: true,
    minLength: 3,
    maxLength: 30
  },
  dateAdded: {
    type: Date,
    required: true,
    default: new Date()
  }
})

module.exports = mongoose.model('ESP', ESPSchema)
