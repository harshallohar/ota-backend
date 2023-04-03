const mongoose = require("mongoose");
//batches can have same names
const BatchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 30,
  },
  picIds: [String], //unique values
  batchDate: {
    type: Date,
    required: true,
    default: new Date(),
  },
  BID: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Batch", BatchSchema);
