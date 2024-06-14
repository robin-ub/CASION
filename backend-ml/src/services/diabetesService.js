const axios = require('axios');
const InputError = require("../exceptions/InputError");

async function predictClassification(inputData) {
  try {
    // Example inputData from frontend: "text": "55,Perempuan,S2,22.0,5,Ya,Tidak ada,Ada,Tidak pernah,Tidak,Tidak,Baik"
    const rawInput = inputData.text.split(',');
    
    // Parse raw input into structured format required by the Diabetes prediction API
    const structuredInput = [
      {
        "Age": parseInt(rawInput[0].trim(), 10),
        "Sex": rawInput[1].trim(),
        "Education": rawInput[2].trim(),
        "BMI": parseFloat(rawInput[3].trim()),
        "PhysHlth": parseInt(rawInput[4].trim(), 10),
        "PhysActivity": rawInput[5].trim(),
        "HighBP": rawInput[6].trim(),
        "HighChol": rawInput[7].trim(),
        "Stroke": rawInput[8].trim(),
        "DiffWalk": rawInput[9].trim(),
        "HeartDiseaseorAttack": rawInput[10].trim(),
        "GenHlth": rawInput[11].trim(),
      }
    ];

    // Send request to the Diabetes prediction API
    const response = await axios.post(process.env.DIABETES_API_URL, structuredInput);
    const { Description, "Predicted Class": predictedClass, "Predicted Probability (%)": predictedProbability, Suggestion } = response.data[0];

    // Prepare and return the response
    return {
      label: predictedClass,
      probability: predictedProbability,
      description: Description,
      suggestion: Suggestion,
    };
  } catch (error) {
    console.error("Error during prediction:", error);
    throw new InputError(`Error during prediction: ${error.message}`, 400);
  }
}

module.exports = predictClassification;
