require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const routes = require("./routes");
const NotFoundError = require("./errors/not-found-error");
const handleErrors = require("./middlewares/error-handler");
const { requestLogger, errorLogger } = require("./middlewares/logger");

const { PORT = 3000, MONGO_URI } = process.env;

if (!MONGO_URI || !MONGO_URI.trim()) {
  throw new Error("MONGO_URI deve ser configurada no ambiente ou no arquivo .env");
}

const app = express();

app.use(express.json());
app.use(requestLogger);
app.use(cors());

mongoose.connect(MONGO_URI);

app.use(routes);
app.use("*", (req, res, next) =>
  next(new NotFoundError("Rota não encontrada"))
);
app.use(errorLogger);
app.use(handleErrors);

app.listen(PORT, () => {
  console.log(`Servidor iniciado na porta ${PORT}`);
});

