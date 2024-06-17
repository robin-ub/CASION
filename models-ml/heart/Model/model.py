"""
Penjelasan feature:
Age = umur
Sex = jenis kelamin, dengan kategori (1 = laki, 2 = perempuan )
Cp : tipe nyeri dada (0 = typical angina, 1=Atypical angina, 2=non-anginal pain, 3=asymptomatic)
Trestbps: tekanan darah istirahat (dalam mm Hg )
Chol : serum cholestoral dalam mg/dl
Restecg: hasil resting electrocardiographic (dengan nilai 0,1,2)
Thalach: detak jantung maksimum
Exang : olahraga menyebabkan nyeri dada ( 1 = iya, 0 = tidak )
"""

import numpy as np # linear algebra
import pandas as pd # data processing, CSV file I/O (e.g. pd.read_csv)
from sklearn.preprocessing import StandardScaler,LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.decomposition import PCA
import pickle
import tensorflow as tf
from sklearn.metrics import classification_report
from sklearn.metrics import accuracy_score,r2_score

df = pd.read_csv(r'ucl/heart/heart.csv')

X = df[["age", "sex", "cp", "trestbps", "chol", "fbs", "thalach", "exang"]]
y = df['target']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.33, random_state=42)

scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

le = LabelEncoder()
y=le.fit_transform(y)

pca = PCA(n_components=8)
X_train_trf = pca.fit_transform(X_train)
X_test_trf = pca.transform(X_test)

# Save the scaler and PCA
with open('scaler.pkl', 'wb') as f:
    pickle.dump(scaler, f)

with open('pca.pkl', 'wb') as f:
    pickle.dump(pca, f)

# Load label encoder
with open("labelencoder.pkl", "wb") as f:
    pickle.dump(le, f)

# Build the neural network model
model = tf.keras.models.Sequential([
    tf.keras.layers.Dense(32, input_dim=X_train_trf.shape[1], activation='relu'),
    tf.keras.layers.Dense(16, activation='relu'),
    tf.keras.layers.Dense(1, activation='sigmoid')
])

# Compile the model
model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

model.fit(X_train_trf, y_train, epochs=100, batch_size=32, validation_split=0.2)

# Evaluate the model
y_pred_prob = model.predict(X_test_trf)
y_pred = (y_pred_prob > 0.5).astype(int)

print(X_test_trf)
print(y_test)
print(y_pred)

# Print classification report
cr = classification_report(y_test, y_pred)
print(cr)
accuracy_score(y_test, y_pred)

#save model
model.save("model.h5")