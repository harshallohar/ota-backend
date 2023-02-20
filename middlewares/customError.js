//status code is needed
//extra information can be sent through extra props object
const apiErrorHandler = (err, req, res, next) => {
  console.log('custom error', err)
  res.status(err.statusCode || 500).json({
    ...err.extraProps,
    success: false,
    body: '',
    error: err.message
  })
}

module.exports = apiErrorHandler
