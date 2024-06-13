const tf = require("@tensorflow/tfjs-node");
const loadModel = require('./loadModel');
const InputError = require("../exceptions/InputError");

let model, symptoms, labelEncoder;

(async () => {
  const loadedData = await loadModel('diabetes');
  model = loadedData.model;
  symptoms = loadedData.symptoms;
  labelEncoder = loadedData.labelEncoder;
})();

async function predictClassification(text) {
  try {
    const symptomsList = text.split(',').map(symptom => symptom.trim());

    if (!(3 <= symptomsList.length && symptomsList.length <= 5)) {
      throw new InputError('Input must contain between 3 and 5 symptoms.');
    }

    const inputArray = new Array(symptoms.length).fill(0);
    symptomsList.forEach(symptom => {
      const index = symptoms.indexOf(symptom);
      if (index !== -1) {
        inputArray[index] = 1;
      } else {
        throw new InputError(`Unknown symptom: ${symptom}`);
      }
    });

    const tensor = tf.tensor2d([inputArray], [1, symptoms.length]);
    const prediction = await model.predict(tensor).array();
    const predictedLabelIndex = prediction[0].indexOf(Math.max(...prediction[0]));
    const probability = Math.max(...prediction[0]) * 100;

    const predictedPrognosis = labelEncoder.inverse_transform([predictedLabelIndex])[0];

    return {
      label: predictedPrognosis,
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
