const tf = require("@tensorflow/tfjs-node");
const InputError = require("../exceptions/InputError");

// Function to predict classification based on model, category, and input text
async function predictClassification(model, text) {
  try {
    // Convert input text to tensor
    const tensor = tf.node.encodeString(text.split(',')).expandDims();

    // Predict using the provided model
    const prediction = await model.predict(tensor);

    //DIABETES & HEART & GENERAL process
      const {label, confidenceScore, description, suggestion} = prediction; 
      return {label, confidenceScore, description, suggestion};

  } catch (error) {
    // Throw error if prediction fails
    throw new InputError("Terjadi kesalahan dalam melakukan prediksi", 400);
  }
}

module.exports = predictClassification;