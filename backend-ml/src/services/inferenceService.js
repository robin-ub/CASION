const tf = require("@tensorflow/tfjs-node");
const InputError = require("../exceptions/InputError");

async function predictClassification(model, text) {
  try {
    // Convert input text to tensor
    const symptoms = text.split(',');
    const tensor = tf.tensor1d(symptoms);

    // Predict using the provided model
    const predictionTensor = await model.predict(tensor.expandDims(0));

    // Convert prediction tensor to JavaScript object
    const prediction = await predictionTensor.array(); 

    // Extract prediction results
    const label = prediction['predicted_prognosis'] || "Unknown"; 
    const probability = prediction['probability'] || 0;
    const description = prediction['description'] || "No description available";
    const suggestion = prediction['suggestion'] || "No suggestion available";

    return {
      label,
      probability,
      description,
      suggestion,
    };
  } catch (error) {
    throw new InputError("Terjadi kesalahan dalam melakukan prediksi", 400);
  }
}

module.exports = predictClassification;
