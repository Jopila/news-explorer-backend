const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const source = fs.readFileSync(path.join(__dirname, "../index.js"), "utf8");

function start(env, dotenvEnv = {}) {
  const connections = [];
  const ports = [];
  const logs = [];
  const processStub = { env: { ...env } };
  const app = { use() {}, listen(port) { ports.push(port); } };
  const express = () => app;
  express.json = () => () => {};
  const modules = {
    dotenv: { config() { Object.keys(dotenvEnv).forEach((key) => {
      if (processStub.env[key] === undefined) processStub.env[key] = dotenvEnv[key];
    }); } },
    express,
    mongoose: { connect(uri) { connections.push(uri); } },
    cors: () => () => {},
    "./routes": {},
    "./errors/not-found-error": Error,
    "./middlewares/error-handler": () => {},
    "./middlewares/logger": { requestLogger() {}, errorLogger() {} },
  };
  let error;
  try {
    vm.runInNewContext(source, {
      require(name) {
        assert(Object.prototype.hasOwnProperty.call(modules, name), name);
        return modules[name];
      },
      process: processStub,
      console: { log(message) { logs.push(message); } },
    }, { filename: "index.js" });
  } catch (caught) { error = caught; }
  return { connections, ports, logs, error };
}

for (const NODE_ENV of [undefined, "development", "production"]) {
  for (const MONGO_URI of [undefined, "", " ", "\t\n"]) {
    const result = start({ NODE_ENV, MONGO_URI });
    assert(result.error, "Missing/blank MongoDB configuration must fail");
    assert.strictEqual(result.error.message,
      "MONGO_URI deve ser configurada no ambiente ou no arquivo .env");
    assert.deepStrictEqual(result.connections, []);
    assert.deepStrictEqual(result.ports, []);
    assert.deepStrictEqual(result.logs, []);
  }
}

// Synthetic URIs only: these tests never load dependencies or contact MongoDB.
for (const uri of ["mongodb://127.0.0.1:27017/test", "mongodb+srv://cluster.example.invalid/test?retryWrites=true&w=majority"]) {
  for (const NODE_ENV of ["development", "production"]) {
    const result = start({ MONGO_URI: uri, NODE_ENV, PORT: "4321" });
    assert.ifError(result.error);
    assert.deepStrictEqual(result.connections, [uri]);
    assert.deepStrictEqual(result.ports, ["4321"]);
    assert.deepStrictEqual(result.logs, []);
  }
}

const dotenvUri = "mongodb://127.0.0.1:27017/dotenv-test";
const fromDotenv = start({}, { MONGO_URI: dotenvUri });
assert.ifError(fromDotenv.error);
assert.deepStrictEqual(fromDotenv.connections, [dotenvUri]);
assert.deepStrictEqual(fromDotenv.ports, [3000]);
const override = start({ MONGO_URI: dotenvUri }, { MONGO_URI: "unused" });
assert.ifError(override.error);
assert.deepStrictEqual(override.connections, [dotenvUri]);
assert(!/mongodb(?:\+srv)?:\/\//i.test(source), "Startup must not embed a database URI");
console.log("Startup configuration regression checks passed");
