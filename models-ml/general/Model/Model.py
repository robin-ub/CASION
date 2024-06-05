import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from sklearn.preprocessing import MinMaxScaler, LabelEncoder
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout
from mlxtend.plotting import plot_confusion_matrix
import warnings
import joblib
warnings.filterwarnings('ignore')

# Load the dataset
train_data = pd.read_csv(r'C:\Users\Admin\PycharmProjects\generalSymptoms\Dataset General Symptoms\Training.csv')
test_data = pd.read_csv(r'C:\Users\Admin\PycharmProjects\generalSymptoms\Dataset General Symptoms\Testing.csv')

# Drop unnecessary kolom ((kalo ada))
if 'Unnamed: 133' in train_data.columns:
    train_data = train_data.drop(['Unnamed: 133'], axis=1)
if 'Unnamed: 133' in test_data.columns:
    test_data = test_data.drop(['Unnamed: 133'], axis=1)

# Misahin features dan label di training n testing
X_train = train_data.drop(["prognosis"], axis=1)
y_train = train_data["prognosis"]
X_test = test_data.drop(["prognosis"], axis=1)
y_test = test_data["prognosis"]

# Encode the labels
label_encoder = LabelEncoder()
y_train_encoded = label_encoder.fit_transform(y_train)
y_test_encoded = label_encoder.transform(y_test)

joblib.dump(label_encoder, 'label_encoder.pkl')

# Normalisasi data
scaler = MinMaxScaler()
X_train_normalized = scaler.fit_transform(X_train)
X_test_normalized = scaler.transform(X_test)

# Bikin model
model = Sequential()
model.add(Dense(256, input_shape=(X_train.shape[1],), activation='relu'))
model.add(Dropout(0.3))
model.add(Dense(128, activation='relu'))
model.add(Dropout(0.3))
model.add(Dense(64, activation='relu'))
model.add(Dense(len(np.unique(y_train_encoded)), activation='softmax'))

# Mengompilasi model
model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])

# Train the model
history = model.fit(X_train_normalized, y_train_encoded, epochs=50, batch_size=32, validation_split=0.2)

# Evaluasi model
y_pred_encoded = np.argmax(model.predict(X_test_normalized), axis=1)

# Confusion Matrix and Classification Report
cm = confusion_matrix(y_test_encoded, y_pred_encoded)
ac = accuracy_score(y_test_encoded, y_pred_encoded)
cr = classification_report(y_test_encoded, y_pred_encoded, target_names=label_encoder.classes_)

print(f'Confusion Matrix:\n{cm}')
print(f'Accuracy Score: {ac}')
print(f'Classification Report:\n{cr}')

# Plot Confusion Matrix
fig, ax = plot_confusion_matrix(conf_mat=cm,
                                show_absolute=True,
                                colorbar=True,
                                cmap='Wistia',
                                figsize=(12, 12))
plt.title("Confusion Matrix for Disease Prediction Model")
plt.show()

# Print training and testing accuracy
train_accuracy = model.evaluate(X_train_normalized, y_train_encoded)[1]
test_accuracy = model.evaluate(X_test_normalized, y_test_encoded)[1]
print(f'Training Accuracy: {train_accuracy}')
print(f'Test Accuracy: {test_accuracy}')
