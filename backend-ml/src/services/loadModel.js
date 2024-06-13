const tf = require("@tensorflow/tfjs-node");

async function loadModel(category) {
  if (category === "diabetes") {
    return tf.loadGraphModel(process.env.MODEL_DIABETES_URL);
  } else if (category === "heart") {
    return tf.loadGraphModel(process.env.MODEL_HEART_URL);
  } else {
    return tf.loadGraphModel(process.env.MODEL_GENERAL_URL);
  }
}

module.exports = loadModel;
