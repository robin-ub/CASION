const axios = require('axios');
const InputError = require("../exceptions/InputError");

async function predictClassification(inputData) {
  try {
    // Placeholder for API request to the Heart prediction API
    const response = await axios.post(process.env.HEART_API_URL, inputData);
    const { predicted_prognosis, probability } = response.data;

    return {
      label: predicted_prognosis,
      probability: probability,
      description: "Description not available yet.",
      suggestion: "Suggestion not available yet.",
    };
  } catch (error) {
    console.error("Error during prediction:", error);
    throw new InputError(`Error during prediction: ${error.message}`, 400);
  }
}

module.exports = predictClassification;
