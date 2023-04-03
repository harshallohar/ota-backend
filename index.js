const express = require('express')
// const symLinkForBinFiles = require('./startup')
const { connect_db } = require('./db')
const rateLimit = require('express-rate-limit')
const morgan = require('morgan')
const express_file_upload = require('express-fileupload')
const helmet = require('helmet')
const path = require('path')
const cors = require('cors');
// routes import
// const apiRoutes = require('./routes/apiRoutes')
const userRoutes = require('./routes/userRoutes');
const apiRoutes2 = require('./routes/apiRoutes2');
const { checkAndCreate } = require('./startup')
const app = express()
// for coloring text
require('colors')
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

app.use(cors())
app.use(limiter)
app.use(helmet())
//morgan logger
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))

// setting env variables
require('dotenv').config({
  path: './config/config.env'
})
// express file upload
const expressFileUploadObj = {
  createParentPath: true
}
if (process.env.NODE_ENV === 'development') {
  expressFileUploadObj.debug = true
}
app.use(express_file_upload(expressFileUploadObj))

// api routes
// app.use('/api/v1/', apiRoutes)
app.use('/api/v1/', userRoutes)
app.use('/api/v2', apiRoutes2)
// front end routes

//404 handler
//executed when the path is not found
app.use((req, res, next) => {
  res.status(404)
  res.render('404')
})

const PORT = process.env.PORT || 5002
let server = null;
(async () => {
  //creating symbolic link to uploads in public directory
  // await symLinkForBinFiles(process.env.FILE_UPLOAD_PATH, path.join(__dirname, '/public/uploads'))
  await checkAndCreate(process.env.FILE_UPLOAD_PATH)
  await checkAndCreate(process.env.FILE_UPLOAD_PATH1)
  await checkAndCreate(process.env.FILE_UPLOAD_PATH2)
  await checkAndCreate(process.env.FILE_UPLOAD_PATH3)
  db_connection = await connect_db()
  server = app.listen(PORT, () => console.log(`listening at ${PORT} env: ${process.env.NODE_ENV || 'development'}`.yellow.italic.underline))
})()