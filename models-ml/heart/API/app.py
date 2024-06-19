import numpy as np
import pandas as pd
import pickle
import tensorflow as tf
import os
import joblib
import requests
from flask import Flask, request, jsonify

app = Flask(__name__)

# URL Link model
scaler_url = 'https://raw.githubusercontent.com/robin-ub/CASION/9dbbb9709914d9a9a46f9a0753062802a950ea7e/models-ml/heart/Model/scaler.pkl'
pca_url = 'https://raw.githubusercontent.com/robin-ub/CASION/9dbbb9709914d9a9a46f9a0753062802a950ea7e/models-ml/heart/Model/pca.pkl'
le_url = 'https://raw.githubusercontent.com/robin-ub/CASION/9dbbb9709914d9a9a46f9a0753062802a950ea7e/models-ml/heart/Model/labelencoder.pkl'
model_url = 'https://raw.githubusercontent.com/robin-ub/CASION/9dbbb9709914d9a9a46f9a0753062802a950ea7e/models-ml/heart/Model/model.h5'

# Directory to save downloaded files
download_dir = "downloaded_files"
os.makedirs(download_dir, exist_ok=True)

# Helper function to download a file
def download_file(url, local_filename):
    response = requests.get(url)
    if response.status_code == 200:
        with open(local_filename, 'wb') as f:
            f.write(response.content)
    else:
        raise Exception(f"Failed to download file from {url}")

# Download and load the scaler, PCA, label encoder, and model
download_file(scaler_url, os.path.join(download_dir, "scaler.pkl"))
download_file(pca_url, os.path.join(download_dir, "pca.pkl"))
download_file(le_url, os.path.join(download_dir, "labelencoder.pkl"))
download_file(model_url, os.path.join(download_dir, "model.h5"))

with open(os.path.join(download_dir, 'scaler.pkl'), 'rb') as f:
    scaler = pickle.load(f)

with open(os.path.join(download_dir, 'pca.pkl'), 'rb') as f:
    pca = pickle.load(f)

with open(os.path.join(download_dir, 'labelencoder.pkl'), 'rb') as f:
    le = pickle.load(f)

model = tf.keras.models.load_model(os.path.join(download_dir, 'model.h5'))

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json(force=True)
    
    # Extract features from the request
    features = [
        data["age"],
        data["sex"],
        data["cp"],
        data["trestbps"],
        data["chol"],
        data["fbs"],
        data["thalach"],
        data["exang"]
    ]
    
    # Preprocess the features
    features = np.array(features).reshape(1, -1)
    
    # Check if the number of features is as expected
    if features.shape[1] != scaler.mean_.shape[0]:
        return jsonify({"error": "Invalid number of features"})
    
    features_scaled = scaler.transform(features)
    features_pca = pca.transform(features_scaled)
    
    # Predict
    prediction = model.predict(features_pca)
    confidence_score = float(prediction[0][0]) * 100  # Convert to Python float
    label = "high chance" if confidence_score > 50 else "low chance"
    
    # Add description and suggestion based on prediction
    if label == "high chance":
        description = ("Anda memiliki kemungkinan tinggi untuk menderita penyakit jantung. "
                       "Hal ini menunjukkan bahwa beberapa faktor risiko yang Anda miliki "
                       "mungkin berkontribusi terhadap kondisi kesehatan jantung Anda.")
        suggestion = ("Sangat penting untuk berkonsultasi dengan penyedia layanan kesehatan "
                      "untuk penilaian yang lebih komprehensif. Pertimbangkan perubahan gaya hidup "
                      "seperti diet seimbang, olahraga teratur, dan berhenti merokok. Mengelola "
                      "stres dan memantau tekanan darah serta kadar kolesterol juga sangat penting. "
                      "Untuk informasi lebih lanjut, kunjungi [American Heart Association](https://www.heart.org) "
                      "dan [Mayo Clinic](https://www.mayoclinic.org).")
    else:
        description = ("Anda memiliki kemungkinan rendah untuk menderita penyakit jantung. "
                       "Ini berarti bahwa faktor risiko Anda saat ini tidak menunjukkan adanya "
                       "potensi masalah jantung yang signifikan.")
        suggestion = ("Tetaplah menjaga gaya hidup sehat untuk terus meminimalkan risiko penyakit jantung. "
                      "Pemeriksaan rutin dan pemantauan kesehatan sangat dianjurkan untuk memastikan kondisi "
                      "kesehatan yang optimal. Pertahankan pola makan seimbang, aktivitas fisik yang teratur, "
                      "dan hindari kebiasaan buruk seperti merokok. Untuk informasi lebih lanjut, kunjungi "
                      "[Centers for Disease Control and Prevention](https://www.cdc.gov) dan [WHO](https://www.who.int).")
    
    # Return the result as a JSON response
    return jsonify({
        "confidenceScore": confidence_score,
        "label": label,
        "description": description,
        "suggestion": suggestion
    })

if __name__ == "__main__":
    app.run(debug=True)