const mongoose = require('mongoose')

const BinSchema = new mongoose.Schema({
  addedDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  v: {
    type: String,
    required: true,
    // unique: true
  },
  path: {
    type: String,
    required: true
  },
  batch: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: 'Batch'
  }
})

module.exports = mongoose.model('Bin', BinSchema)
