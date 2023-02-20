const { default: mongoose } = require('mongoose')

const PicSchema = new mongoose.Schema({
  pool: [String]
})

module.exports = mongoose.model('Pic', PicSchema)
