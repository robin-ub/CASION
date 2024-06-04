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
model_path = os.path.join(BASE_DIR, "Model", "model.h5")
scaler_path = os.path.join(BASE_DIR, "Model", "scaler_model.pkl")

# Load the trained model
model = load_model(model_path)
scaler = joblib.load(scaler_path)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get JSON data from request
        data = request.json
        print("Received data:", data)  # Debug print

        df = pd.DataFrame(data)
        print("DataFrame:", df)  # Debug print

        # Preprocess the data
        X = scaler.transform(df)
        X = X.reshape((X.shape[0], X.shape[1], 1))

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
