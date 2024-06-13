const tf = require("@tensorflow/tfjs-node");
const InputError = require("../exceptions/InputError");

async function predictClassification(model, text) {
  try {
    // Convert input text to tensor
    const symptoms = text.split(',');
    const tensor = tf.tensor1d(symptoms);

    // Predict using the provided model
    const prediction = await model.predict(tensor.expandDims(0));

    // Extract prediction results
    const label = prediction[0] || "Unknown";
    const probability = prediction[1] || 0;
    const description = prediction[2] || "No description available";
    const suggestion = prediction[3] || "No suggestion available";

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
