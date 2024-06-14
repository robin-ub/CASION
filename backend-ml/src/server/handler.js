const generalService = require("../services/generalService");
const diabetesService = require("../services/diabetesService");
const heartService = require("../services/heartService");
const crypto = require("crypto");
const storeData = require("../services/storeData");
const loadAllData = require("../services/loadAllData");

async function postPredictHandler(request, h) {
  try {
    const { category, text } = request.payload; // Extract category and text from the request payload
    let predictClassification;

    if (category === "diabetes") {
      predictClassification = diabetesService;
    } else if (category === "heart") {
      predictClassification = heartService;
    } else {
      predictClassification = generalService;
    }

    // Format the input for the prediction service
    const inputData = { text };

    // Perform prediction using the selected service
    const { label, probability, description, suggestion } = await predictClassification(inputData);
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
  } catch (error) {
    console.error("Error in postPredictHandler:", error);
    const response = h.response({
      status: "error",
      message: `Error during prediction: ${error.message}`,
    });
    response.code(500);
    return response;
  }
}

async function getAllDataHandler(request, h) {
  try {
    const allData = await loadAllData();
    const response = h.response({
      status: "success",
      data: allData,
    });
    response.code(200);
    return response;
  } catch (error) {
    console.error("Error in getAllDataHandler:", error);
    const response = h.response({
      status: "error",
      message: `Error retrieving data: ${error.message}`,
    });
    response.code(500);
    return response;
  }
}

module.exports = { postPredictHandler, getAllDataHandler };
