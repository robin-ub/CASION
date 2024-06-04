import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
import tensorflow as tf
from tensorflow.keras.models import load_model
import joblib
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

# Load the trained model
model = load_model("heart_disease_model.h5")

# Load the preprocessor
preprocessor = joblib.load('preprocessor.pkl')

# Initialize Flask app
app = Flask(__name__)

@app.route('/predict', methods=['GET'])
def predict():
    try:
        # Get JSON data from request
        data = request.json
        df = pd.DataFrame(data)

        # Preprocess the data
        X = preprocessor.transform(df)
        X = X.reshape((X.shape[0], X.shape[1], 1))

        # Predict using the loaded model
        y_pred_probs = model.predict(X)
        y_pred_percentages = y_pred_probs * 100
        threshold = 50 
        y_pred_class = (y_pred_probs > (threshold / 100)).astype("int32")
        # y_pred_labels = ["high chance" if prob > threshold else "low chance" for prob in y_pred_percentages]

        # Return the predictions
        return jsonify({
            # "predictions": y_pred_labels,
            "probabilities": y_pred_percentages.tolist()
        })

    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == '__main__':
    app.run(debug=True)
