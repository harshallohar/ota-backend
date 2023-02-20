const mongoose = require('mongoose')

const ManufacturerSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
    minLength: 3,
    maxLength: 30
  },
  addedDate: {
    type: Date,
    required: true,
    default: new Date()
  },
  batches: [{ type: mongoose.Types.ObjectId, ref: 'Batch' }],
  esps: [{ type: mongoose.Types.ObjectId, ref: 'ESP' }]
})

module.exports = mongoose.model('Manufacturer', ManufacturerSchema)
