class BadRequestError extends Error {
  constructor(message = 'Dados inválidos') {
    super(message);
    this.statusCode = 400;
  }
}

module.exports = BadRequestError;
