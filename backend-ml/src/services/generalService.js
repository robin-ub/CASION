const axios = require('axios');
const InputError = require("../exceptions/InputError");

async function predictClassification(inputData) {
  try {
    // Format input data for the API request
    const formattedInput = {
      symptoms: inputData.text.split(',')
    };

    // Send request to the external API
    const response = await axios.post(process.env.GENERAL_API_URL, formattedInput);
    const { predicted_prognosis, probability } = response.data;

    // Prepare and return the response
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
