const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const UnauthorizedError = require('../errors/unauthorized-error');
const NotFoundError = require('../errors/not-found-error');
const BadRequestError = require('../errors/bad-request-error');
const ConflictError = require('../errors/conflict-error');

const { JWT_SECRET = 'dev-secret' } = process.env;

const getCurrentUser = (req, res, next) => {
  const userId = req.user && req.user._id;

  if (!userId) {
    return next(new UnauthorizedError('Token inválido'));
  }

  return User.findById(userId)
    .orFail(() => new NotFoundError('Usuário não encontrado'))
    .then((user) => res.send({ email: user.email, name: user.name }))
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new UnauthorizedError('Token inválido'));
      }
      return next(err);
    });
};

const createUser = (req, res, next) => {
  const { email, password, name } = req.body;

  if (!password) {
    return next(new BadRequestError('Senha é obrigatória'));
  }

  return bcrypt
    .hash(password, 10)
    .then((hash) => User.create({ email, password: hash, name }))
    .then((user) => res.status(201).send({
      _id: user._id,
      email: user.email,
      name: user.name,
    }))
    .catch((err) => {
      if (err.code === 11000) {
        return next(new ConflictError('E-mail já cadastrado'));
      }
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Dados inválidos para criar usuário'));
      }
      return next(err);
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new BadRequestError('E-mail e senha são obrigatórios'));
  }

  return User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw new UnauthorizedError('E-mail ou senha incorretos');
      }

      return bcrypt.compare(password, user.password).then((matched) => {
        if (!matched) {
          throw new UnauthorizedError('E-mail ou senha incorretos');
        }

        const token = jwt.sign(
          { _id: user._id },
          JWT_SECRET,
          { expiresIn: '7d' },
        );

        return res.send({ token });
      });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Dados inválidos'));
      }
      return next(err);
    });
};

module.exports = {
  getCurrentUser,
  createUser,
  login,
};
