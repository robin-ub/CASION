const tf = require("@tensorflow/tfjs-node");
const InputError = require("../exceptions/InputError");

async function predictClassification(model, text) {
  try {
    // const tensor = tf.node.decodeJpeg(image)
    //   .resizeNearestNeighbor([224, 224])
    //   .expandDims()
    //   .toFloat();

    // lengkapin fungsi convert text ke tensor DONE
    // const tensor = tf.node.encodeString(text).expandDims();
    const tensor = tf.node.encodeString(text.split(',')).expandDims();

    const prediction = model.predict(tensor);
    const score = await prediction.data();
    const confidenceScore = Math.max(...score) * 100;

    // PR : minta 
    const classes = ['Melanocytic nevus', 'Squamous cell carcinoma', 'Vascular lesion'];
    
    const classResult = tf.argMax(prediction, 1).dataSync()[0];
    const label = classes[classResult];

    // ML  minta buat label + suggestion (general / dikosongin dulu juga gapapa dari ml)
    // const suggestion = label === "Cancer" 
    // ? "Sistem kami mendeteksi probabilitas cancer, segera periksakan ke dokter!"
    // : "Sistem kami tidak mendeteksi probabilitas cancer, segera periksakan ke dokter!";

    return { label, suggestion, confidenceScore};
  } catch (error) {
    throw new InputError("Terjadi kesalahan dalam melakukan prediksi", 400);
  }
}

module.exports = predictClassification;
