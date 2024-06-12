const tf = require("@tensorflow/tfjs-node");
const input = require("../server/handler")

async function loadModel() {
  if (input.category == "diabetes"){
    return tf.loadGraphModel(process.env.MODEL_DIABETES_URL);
  }else if (input.category == "heart"){
    return tf.loadGraphModel(process.env.MODEL_HEART_URL);
  }else{ // "general"
    return tf.loadGraphModel(process.env.MODEL_DIABETES_URL);
  }
}

module.exports = loadModel;