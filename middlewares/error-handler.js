const handleErrors = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  const { statusCode = 500, message } = err;

  if (statusCode === 500) {
    return res.status(500).send({ message: 'Erro interno do servidor' });
  }

  return res.status(statusCode).send({ message });
};

module.exports = handleErrors;
