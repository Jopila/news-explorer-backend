class ConflictError extends Error {
  constructor(message = 'Recurso já existe') {
    super(message);
    this.statusCode = 409;
  }
}

module.exports = ConflictError;
