require("dotenv").config();

const Hapi = require("@hapi/hapi");
const routes = require("../server/routes");
const InputError = require("../exceptions/InputError");

(async () => {
  const server = Hapi.server({
    port: 8080,
    host: "0.0.0.0",
    // host: "localhost",
    routes: {
      cors: {
        origin: ["*"],
      },
    },
  });

  server.route(routes);

  server.ext("onPreResponse", function (request, h) {
    const response = request.response;

    if (response instanceof InputError) {
      const newResponse = h.response({
        status: "fail",
        message: "Terjadi kesalahan dalam melakukan prediksi",
      });
      newResponse.code(response.statusCode);
      return newResponse;
    }

    return h.continue;
  });

  await server.start();
  console.log(`Server started at: ${server.info.uri}`);
})();
