class UnauthorizedError extends Error {
  constructor(message = 'Autorização necessária') {
    super(message);
    this.statusCode = 401;
  }
}

module.exports = UnauthorizedError;
