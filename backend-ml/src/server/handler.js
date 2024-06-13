const predictClassification = require("../services/inferenceService");
const crypto = require("crypto");
const storeData = require("../services/storeData");
const loadModel = require("../services/loadModel");

async function postPredictHandler(request, h) {
  const { category, text } = request.payload; // Extract category and text from the request payload
  const model = await loadModel(category); // Load the appropriate model based on the category

  // Perform prediction using the inference service
  const { label, probability, description, suggestion } = await predictClassification(model, text);
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  const data = {
    id: id,
    result: label,
    confidenceScore: probability,
    description: description,
    suggestion: suggestion,
    createdAt: createdAt,
  };

  await storeData(id, data);

  const response = h.response({
    status: "success",
    message: "Model predicted successfully",
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
