class ForbiddenError extends Error {
  constructor(message = 'Acesso negado') {
    super(message);
    this.statusCode = 403;
  }
}

module.exports = ForbiddenError;
