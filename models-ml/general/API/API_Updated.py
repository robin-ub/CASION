from flask import Flask, request, jsonify, Response
import tensorflow as tf
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
import joblib
from collections import OrderedDict
import json

# Load the model
model = tf.keras.models.load_model('C:/Users/Admin/PycharmProjects/generalSymptoms/Model/generalDisease_prediction_model.h5')

# Load the label encoder
label_encoder = joblib.load('C:/Users/Admin/PycharmProjects/generalSymptoms/API/label_encoder.pkl')

# Initialize Flask app
app = Flask(__name__)

# Load the symptoms from the dataset
data = pd.read_csv('C:/Users/Admin/PycharmProjects/generalSymptoms/Dataset General Symptoms/Training.csv')
if 'Unnamed: 133' in data.columns:
    data.drop('Unnamed: 133', axis=1, inplace=True)  # Drop the 'Unnamed: 133' column
symptoms = data.columns[:-1]  # Assuming last column is the label

# Load the prognosis descriptions and precautions
prognosis_data = pd.read_csv('C:/Users/Admin/PycharmProjects/generalSymptoms/API/List of Prognosis - Description & Precautions.csv')
prognosis_dict = prognosis_data.set_index('Disease').T.to_dict('dict')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get JSON data from request
        input_data = request.json

        # Check if the input contains the 'symptoms' key
        if 'symptoms' not in input_data:
            return jsonify({'error': 'Input must contain the "symptoms" key.'})

        symptoms_list = input_data['symptoms']

        # Check if the number of symptoms is between 3 and 5
        if not (3 <= len(symptoms_list) <= 5):
            return jsonify({'error': 'Input must contain between 3 and 5 symptoms.'})

        # Create input dataframe with symptoms as columns
        input_df = pd.DataFrame(columns=symptoms)
        input_df.loc[0] = 0  # Initialize all symptoms with 0
        input_df[symptoms_list] = 1  # Set provided symptoms to 1

        # Make prediction
        prediction = model.predict(input_df)
        predicted_label = np.argmax(prediction, axis=1)[0]
        probability = prediction[0][predicted_label]

        # Decode the predicted label to the original prognosis name
        predicted_prognosis = label_encoder.inverse_transform([predicted_label])[0]

        # Get description and precautions
        description = prognosis_dict[predicted_prognosis]['Description']
        precautions = prognosis_dict[predicted_prognosis]['Precautions']

        formatted_precautions = precautions.replace('\\n', '\n\n')

        # Return the result as JSON with OrderedDict
        result = OrderedDict([
            ('predicted_prognosis', predicted_prognosis),
            ('probability', f"{float(probability) * 100:.3f}%"),
            ('description', description),
            ('precautions', formatted_precautions)
        ])

        # Use json.dumps to preserve order
        return Response(
            response=json.dumps(result),
            status=200,
            mimetype='application/json'
        )

    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True)
