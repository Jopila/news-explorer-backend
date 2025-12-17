const mongoose = require("mongoose");
const Article = require("../models/article");
const BadRequestError = require("../errors/bad-request-error");
const NotFoundError = require("../errors/not-found-error");
const ForbiddenError = require("../errors/forbidden-error");
const UnauthorizedError = require("../errors/unauthorized-error");

const removeOwnerFromResponse = (article) => {
  const data = article.toObject();
  delete data.owner;
  return data;
};

const getArticles = (req, res, next) => {
  const ownerId = req.user && req.user._id;

  if (!ownerId) {
    return next(new UnauthorizedError("Token inválido"));
  }

  return Article.find({ owner: ownerId })
    .then((articles) => res.send(articles))
    .catch(next);
};

const createArticle = (req, res, next) => {
  const { keyword, title, text, date, source, link, image } = req.body;
  const ownerId = req.user && req.user._id;

  if (!ownerId) {
    return next(new UnauthorizedError("Token inválido"));
  }

  return Article.create({
    keyword,
    title,
    text,
    date,
    source,
    link,
    image,
    owner: ownerId,
  })
    .then((article) => res.status(201).send(removeOwnerFromResponse(article)))
    .catch((err) => {
      if (err.name === "ValidationError") {
        return next(new BadRequestError("Dados inválidos para criar artigo"));
      }
      return next(err);
    });
};

const deleteArticle = (req, res, next) => {
  const { articleId } = req.params;
  const ownerId = req.user && req.user._id;

  if (!ownerId) {
    return next(new UnauthorizedError("Token inválido"));
  }

  if (!mongoose.Types.ObjectId.isValid(articleId)) {
    return next(new BadRequestError("ID do artigo inválido"));
  }

  return Article.findById(articleId)
    .select("+owner")
    .orFail(() => new NotFoundError("Artigo não encontrado"))
    .then((article) => {
      if (article.owner.toString() !== ownerId) {
        throw new ForbiddenError(
          "Você não pode remover artigos de outro usuário"
        );
      }
      return article
        .deleteOne()
        .then(() => res.send(removeOwnerFromResponse(article)));
    })
    .catch((err) => {
      if (err.name === "CastError") {
        return next(new BadRequestError("ID do artigo inválido"));
      }
      return next(err);
    });
};

module.exports = {
  getArticles,
  createArticle,
  deleteArticle,
};
