const mongoose = require('mongoose')
require('dotenv').config({
  path: './config/config.env'
})
const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_U, {
    autoIndex: true
  })
  console.log(`connected to db ${conn.connection.host}`)
  return conn
}
exports.connect_db = connectDB
