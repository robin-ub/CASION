const axios = require('axios');
const InputError = require("../exceptions/InputError");

async function predictClassification(inputData) {
  try {
    // Extract and process the raw input from the "text" field
    const rawInput = inputData.text.split(',');
    const structuredInput = {
      age: parseInt(rawInput[1]),
      sex: parseInt(rawInput[3]),
      cp: parseInt(rawInput[5]),
      trestbps: parseInt(rawInput[7]),
      chol: parseInt(rawInput[9]),
      fbs: parseInt(rawInput[11]),
      thalach: parseInt(rawInput[13]),
      exang: parseInt(rawInput[15])
    };

    // Placeholder for API request to the Heart prediction API
    const response = await axios.post(process.env.HEART_API_URL, structuredInput);
    const { description, "label": predictedClass, "confidenceScore": predictedProbability, suggestion } = response.data;

    // Prepare and return the response
    return {
      label: predictedClass,
      probability: predictedProbability,
      description: description,
      suggestion: suggestion,
    };
  } catch (error) {
    console.error("Error during prediction:", error);
    throw new InputError(`Error during prediction: ${error.message}`, 400);
  }
}

module.exports = predictClassification;