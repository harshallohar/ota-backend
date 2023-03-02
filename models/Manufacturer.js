const mongoose = require('mongoose')

const ManufacturerSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
    minLength: 3,
    maxLength: 30
  },
  password: {
    type: String,
    required: true,
    minLength: 6,
    maxLength: 20
  },
  addedDate: {
    type: Date,
    required: true,
    default: new Date()
  },
  type: {
    type: String,
    default: "manufacturer",
  },
  description: {
    type: String,
    minLength: 7,
    maxLength: 50,
  },
  id: {
    type: String,
    required: true,
  },
  batches: [{ type: mongoose.Types.ObjectId, ref: 'Batch' }],
  esps: [{ type: mongoose.Types.ObjectId, ref: 'ESP' }]
})

module.exports = mongoose.model('Manufacturer', ManufacturerSchema)
