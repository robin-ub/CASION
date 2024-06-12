const predictClassification = require("../services/inferenceService");
const crypto = require("crypto");
const storeData = require("../services/storeData");
const loadAllData = require("../services/loadAllData");

async function postPredictHandler(request, h) {
  const { model } = request.server.app; // Get the model from the server
  const { category } = request.payload; // Extract category text from the request payload
  const { text } = request.payload; // Extract input text from the request payload

  // Perform prediction using the inference service
  const {label, confidenceScore, description, suggestion} = await predictClassification(model, category, text);
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  const data = {
    id: id,
    result: label,
    confidenceScore: confidenceScore,
    description: description,
    suggestion: suggestion,
    createdAt: createdAt,
  };

  await storeData(id, data);

  const response = h.response({
    status: "success",
    message: "Model is predicted successfully",
    data,
  });
  response.code(201);
  return response;
}

async function getAllDataHandler(request, h) {
  const allData = await loadAllData();
  const response = h.response({
    status: "success",
    data: allData,
  });
  response.code(200);
  return response;
}

module.exports = { postPredictHandler, getAllDataHandler };