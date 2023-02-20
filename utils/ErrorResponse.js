//modifies error object
class ErrorResponse extends Error {
  constructor(message, statusCode, extraProps) {
    super(message)
    this.statusCode = statusCode
  }
}

module.exports = ErrorResponse
