const tf = require("@tensorflow/tfjs-node");
const axios = require('axios');
const joblib = require('joblib');
const { parse } = require('papaparse');
const dotenv = require('dotenv');

dotenv.config();

async function loadModel(category) {
  let modelUrl, csvUrl, labelEncoderUrl;
  
  if (category === "diabetes") {
    modelUrl = process.env.MODEL_DIABETES_URL;
    csvUrl = process.env.CSV_DIABETES_URL;
    labelEncoderUrl = process.env.LABEL_ENCODER_DIABETES_URL;
  } else if (category === "heart") {
    modelUrl = process.env.MODEL_HEART_URL;
    csvUrl = process.env.CSV_HEART_URL;
    labelEncoderUrl = process.env.LABEL_ENCODER_HEART_URL;
  } else {
    modelUrl = process.env.MODEL_GENERAL_URL;
    csvUrl = process.env.CSV_GENERAL_URL;
    labelEncoderUrl = process.env.LABEL_ENCODER_GENERAL_URL;
  }

  // Load the model
  const model = await tf.loadGraphModel(modelUrl);

  // Load the CSV file and extract symptoms
  const csvResponse = await axios.get(csvUrl);
  const csvData = csvResponse.data;
  const parsedCSV = parse(csvData, { header: true });
  const symptoms = Object.keys(parsedCSV.data[0]).slice(0, -1); // Assuming the last column is the label

  // Load the label encoder
  const encoderResponse = await axios.get(labelEncoderUrl, { responseType: 'arraybuffer' });
  const labelEncoder = joblib.load(encoderResponse.data);

  return { model, symptoms, labelEncoder };
}

module.exports = loadModel;
