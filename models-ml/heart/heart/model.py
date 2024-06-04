import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score
import tensorflow as tf
from tensorflow.keras import layers, models
from flask import Flask, request, jsonify
import joblib

file_path = 'heart.csv'
heart_data = pd.read_csv(file_path)

# Define features and target
X = heart_data.drop(columns='target')
y = heart_data['target']

# Preprocessing pipeline
numeric_features = ['age', 'trestbps', 'chol', 'thalach', 'oldpeak']
categorical_features = ['sex', 'cp', 'fbs', 'restecg', 'exang', 'slope', 'ca', 'thal']

numeric_transformer = Pipeline(steps=[
    ('scaler', StandardScaler())
])

categorical_transformer = Pipeline(steps=[
    ('onehot', OneHotEncoder(handle_unknown='ignore'))
])

preprocessor = ColumnTransformer(
    transformers=[
        ('num', numeric_transformer, numeric_features),
        ('cat', categorical_transformer, categorical_features)
    ])

# Split the data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

X_train = preprocessor.fit_transform(X_train)
X_test = preprocessor.transform(X_test)

X_train_cnn = X_train.reshape((X_train.shape[0], X_train.shape[1], 1))
X_test_cnn = X_test.reshape((X_test.shape[0], X_test.shape[1], 1))

# CNN model
def create_cnn_model(input_shape):
    model = models.Sequential()
    model.add(layers.Conv1D(64, 2, activation='relu', input_shape=input_shape))
    model.add(layers.MaxPooling1D(2))
    model.add(layers.Conv1D(128, 2, activation='relu'))
    model.add(layers.MaxPooling1D(2))
    model.add(layers.Flatten())
    model.add(layers.Dense(64, activation='relu'))
    model.add(layers.Dense(1, activation='sigmoid'))  # Change activation to sigmoid for binary classification
    return model

input_shape = (X_train.shape[1], 1)
model = create_cnn_model(input_shape)

model.compile(optimizer='adam', loss=tf.keras.losses.BinaryCrossentropy(), metrics=['accuracy'])

history = model.fit(X_train_cnn, y_train, epochs=50, validation_split=0.2, batch_size=32)

y_pred_probs = model.predict(X_test_cnn)

y_pred_percentages = y_pred_probs * 100

threshold = 50 
y_pred_class = (y_pred_probs > (threshold / 100)).astype("int32")

y_pred_labels = ["high chance" if prob > threshold else "low chance" for prob in y_pred_percentages]

# Save the model
model.save("heart_disease_model.h5")

# Save the preprocessor
joblib.dump(preprocessor, 'preprocessor.pkl')