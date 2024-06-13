const generalService = require("../services/generalService");
const diabetesService = require("../services/diabetesService");
const heartService = require("../services/heartService");
const crypto = require("crypto");
const storeData = require("../services/storeData");
const loadAllData = require("../services/loadAllData");

async function postPredictHandler(request, h) {
  const { category, text } = request.payload; // Extract category and text from the request payload
  let predictClassification;

  if (category === "diabetes") {
    predictClassification = diabetesService;
  } else if (category === "heart") {
    predictClassification = heartService;
  } else {
    predictClassification = generalService;
  }

  // Perform prediction using the selected service
  const { label, probability, description, suggestion } = await predictClassification(text);
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
