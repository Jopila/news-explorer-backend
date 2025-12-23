const mongoose = require("mongoose");
const validator = require("validator");

const urlValidator = {
  validator: (url) => validator.isURL(url, { require_protocol: true }),
  message: "O link informado é inválido",
};

const articleSchema = new mongoose.Schema(
  {
    keyword: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
      validate: urlValidator,
    },
    image: {
      type: String,
      required: true,
      validate: urlValidator,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      select: false, // oculta por padrão em consultas
    },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model("article", articleSchema);
