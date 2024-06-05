from flask import Flask, request, jsonify
import tensorflow as tf
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
import joblib

# Load the model
model = tf.keras.models.load_model('generalDisease_prediction_model.h5')

# Load the label encoder
label_encoder = joblib.load('label_encoder.pkl')

# Initialize Flask app
app = Flask(__name__)

# Load the symptoms from the dataset
data = pd.read_csv('C:/Users/Admin/PycharmProjects/generalSymptoms/Dataset General Symptoms/Training.csv')
if 'Unnamed: 133' in data.columns:
    data.drop('Unnamed: 133', axis=1, inplace=True)  # Drop the 'Unnamed: 133' column
symptoms = data.columns[:-1]  # Assuming last column is the label

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get JSON data from request
        input_data = request.json

        # Make sure input data contains all symptoms
        input_df = pd.DataFrame(input_data, index=[0])
        input_df = input_df.reindex(columns=symptoms, fill_value=0)

        # Make prediction
        prediction = model.predict(input_df)
        predicted_label = np.argmax(prediction, axis=1)[0]
        probability = prediction[0][predicted_label]

        # Decode the predicted label to the original prognosis name
        predicted_prognosis = label_encoder.inverse_transform([predicted_label])[0]

        # Return the result as JSON
        result = {
            'predicted_prognosis': predicted_prognosis,
            'probability': float(probability)
        }
        return jsonify(result)

    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True)
