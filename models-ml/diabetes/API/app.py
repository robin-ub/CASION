# ======================================================================================
# Format Inputer: 
# 1. Age
# 2. Sex
# 3. Education
# 4. BMI
# 5. PhysHlth
# 6. PhysActivity
# 7. HighBP
# 8. HighChol
# 9. Stroke
# 10. DiffWalk
# 11. HeartDiseaseorAttack
# 12. GenHlth

# Description Inputer:

# Age category:
# 18-24 = 1
# 25-29 = 2
# 30-34 = 3
# 35-39 = 4
# 40-44 = 5
# 45-49 = 6
# 50-54 = 7
# 55-59 = 8
# 60-64 = 9
# 65-69 = 10
# 70-74 = 11
# 75-79 = 12
# 80 & older = 13

# Sex:
# Female: 0, Male: 1

# Education level:
# 1	Tidak/Belum sekolah atau hanya TK
# 2	SD
# 3	SMP
# 4	SMA
# 5	D1
# 6	D3, S1, dan seterusnya

# PhysHlth:
# Selama 30 hari terakhir, berapa hari kesehatan fisik Anda tidak baik?
# Kesehatan fisik ini mencakup penyakit dan cedera fisik.
# Gunakan skala 0-30 hari.

# PhysActivity:
# Apakah Anda melakukan aktivitas fisik selain pekerjaan rutin dalam 30 hari terakhir?
# Jawab "Tidak" (0) jika tidak melakukan, dan "Ya" (1) jika melakukan.

# HighBP:
# 0 = Tidak ada tekanan darah tinggi
# 1 = Ada tekanan darah tinggi

# HighChol:
# 0 = Tidak ada kolesterol tinggi
# 1 = Ada kolesterol tinggi

# Stroke:
# Pernah terdiagnosis Stroke?
# 0 = Tidak, 1 = Pernah 

# DiffWalk:
# Kesulitan Berjalan?
# 0 = Tidak, 1 = Ya 

# HeartDiseaseorAttack:
# Pernah terdiagnosis Serangan Jantung?
# 0 = Tidak, 1 = Penah

# GenHlth:
# Bagaimana Keadaan Kesehatan Umum Tubuh anda?
# 1 = Sehat sekali
# 2 = Merasa sangat sehat
# 3 = Baik
# 4 = Cukup
# 5 = Buruk

import pandas as pd
import os
import joblib
from flask import Flask, request, jsonify
import tensorflow as tf
from tensorflow.keras.models import load_model

# Initialize Flask app
app = Flask(__name__)

# Define the base path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Correct path to the Model directory
model_path = os.path.join(BASE_DIR, "Model", "fnn_model.h5")
scaler_path = os.path.join(BASE_DIR, "Model", "scaler_model.pkl")

# Load the trained model
model = load_model(model_path)
scaler = joblib.load(scaler_path)

feature_map = {
    # Age category mapping
    'age_map': {
        1: (1, 24),
        2: (25, 29),
        3: (30, 34),
        4: (35, 39),
        5: (40, 44),
        6: (45, 49),
        7: (50, 54),
        8: (55, 59),
        9: (60, 64),
        10: (65, 69),
        11: (70, 74),
        12: (75, 79),
        13: (80, None)
    },

    # Sex
    'Perempuan': 0,
    'Laki-laki': 1,

    # Education level
    'TK': 1,
    'Tidak Sekolah': 1,
    'SD': 2,
    'SMP': 3,
    'SMA': 4,
    'D1': 5,
    'D2': 6,
    'D3': 6,
    'S1': 6,
    'S2': 6,
    'S3': 6,    
    
    # PhysActivity
    'Tidak': 0,
    'Ya': 1,

    # HighBP
    'Tidak ada': 0,
    'Ada': 1,

    # HighChol
    'Tidak ada': 0,
    'Ada': 1,

    # Stroke
    'Tidak pernah': 0,
    'Pernah': 1,

    # DiffWalk
    'Tidak': 0,
    'Ya': 1,

    # HeartDiseaseorAttack
    'Tidak': 0,
    'Pernah': 1,

    # GenHlth
    'Sehat sekali': 1,
    'Merasa sangat sehat': 2,
    'Baik': 3,
    'Cukup': 4,
    'Buruk': 5
}

def map_age_to_category(age):
    for category, (start, end) in feature_map['age_map'].items():
        if end is None:
            if age >= start:
                return category
        elif start <= age <= end:
            return category
    return None

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get JSON data from request
        data = request.json
        print("Received data:", data)  # Debug print

        # Map age to category and other categorical values to integers
        for entry in data:
            entry['Age'] = map_age_to_category(entry['Age'])
            entry['Sex'] = feature_map[entry['Sex']]
            entry['Education'] = feature_map[entry['Education']]
            entry['PhysActivity'] = feature_map[entry['PhysActivity']]
            entry['HighBP'] = feature_map[entry['HighBP']]
            entry['HighChol'] = feature_map[entry['HighChol']]
            entry['Stroke'] = feature_map[entry['Stroke']]
            entry['DiffWalk'] = feature_map[entry['DiffWalk']]
            entry['HeartDiseaseorAttack'] = feature_map[entry['HeartDiseaseorAttack']]
            entry['GenHlth'] = feature_map[entry['GenHlth']]

        df = pd.DataFrame(data)
        print("DataFrame:", df)  # Debug print

        # Preprocess the data
        X = scaler.transform(df)

        # Predict using the loaded model
        y_pred_probs = model.predict(X)
        y_pred_percentages = y_pred_probs * 100

        # Identify the class with the highest probability
        y_pred_class = y_pred_probs.argmax(axis=1)

        # Prepare the response
        results = []
        for prob, cls in zip(y_pred_percentages, y_pred_class):
            predicted_probability = float(prob[cls])  # Convert to native Python float
            result = {
                "Predicted Class": int(cls),
                "Predicted Probability (%)": predicted_probability
            }
            results.append(result)

        # Return the predictions
        return jsonify(results)

    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == '__main__':
    app.run(debug=True)
