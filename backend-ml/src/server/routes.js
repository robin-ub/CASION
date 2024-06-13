const { postPredictHandler, getAllDataHandler } = require("../server/handler");

const routes = [
  {
    path: "/predict",
    method: "POST",
    handler: postPredictHandler,
  },
  {
    path: "/predict/histories",
    method: "GET",
    handler: getAllDataHandler,
  },
];

module.exports = routes;
