from flask import Flask, request, jsonify, Response
import tensorflow as tf
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
import joblib
import os
import requests
import tempfile
from io import BytesIO
from collections import OrderedDict
import json

# Initialize Flask app
app = Flask(__name__)

# Set URLs for the model and scaler
MODEL_URL = 'https://github.com/robin-ub/CASION/raw/95f3741d59fc3ad5763c3448ae37a3f7f27bf175/models-ml/general/Model/generalDisease_prediction_model.h5'
LABEL_ENCODER_URL = 'https://github.com/robin-ub/CASION/raw/95f3741d59fc3ad5763c3448ae37a3f7f27bf175/models-ml/general/API/label_encoder.pkl'
DATA_URL = 'https://github.com/robin-ub/CASION/raw/95f3741d59fc3ad5763c3448ae37a3f7f27bf175/models-ml/general/Dataset%20General%20Symptoms/Training.csv'
PROGNOSIS_URL = 'https://github.com/robin-ub/CASION/blob/1a523d27551b8ec6c7bf8b986193b8be42bf568c/models-ml/general/Dataset%20General%20Symptoms/List%20of%20Prognosis%20-%20Description%20%26%20Precautions.csv'

def download_file(url, suffix):
    """Download and temporarily save a file."""
    response = requests.get(url)
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    with open(temp_file.name, 'wb') as file:
        file.write(response.content)
    return temp_file.name

# Download model, scaler, and data files
model_path = download_file(MODEL_URL, ".h5")
scaler_path = download_file(LABEL_ENCODER_URL, ".pkl")
data_path = download_file(DATA_URL, ".csv")
prognosis_path = download_file(PROGNOSIS_URL, ".csv")

# Load the model and scaler
model = tf.keras.models.load_model(model_path)
label_encoder = joblib.load(scaler_path)

# Load the symptoms from the dataset
data = pd.read_csv(data_path)
if 'Unnamed: 133' in data.columns:
    data.drop('Unnamed: 133', axis=1, inplace=True)
symptoms = data.columns[:-1]  # Assuming last column is the label

# Load the prognosis descriptions and precautions
prognosis_data = pd.read_csv(prognosis_path)
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
        input_df.loc[0, symptoms_list] = 1  # Set provided symptoms to 1

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
            ('probability', f"{float(probability) * 100:.2f}%"),
            ('description', description),
            ('suggestion', formatted_precautions)
        ])

        # Use json.dumps to preserve order
        return Response(
            response=json.dumps(result),
            status=200,
            mimetype='application/json'
        )

    except Exception as e:
        return jsonify({'error': str(e)})

# Define the entry point function for Google Cloud
def gcp_cfn_entry(request):
    return 'OK'

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))  # Use the PORT environment variable
    app.run(debug=True, host='0.0.0.0', port=port)
