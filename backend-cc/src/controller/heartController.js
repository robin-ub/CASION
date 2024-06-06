const { admin, db } = require('../middleware/firebaseAdmin');

const fetchHeartHistory = async (userId) => {
    try {
        const userRef = db.ref(`users/${userId}/medicalHistory/heart`);
        const snapshot = await userRef.once('value');
        const medicalHistory = [];
        
        snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            const entry = {
                statisticsId: childSnapshot.key,
                cp: data.cp,
                trestbps: data.trestbps,
                chol: data.chol,
                fbs: data.fbs,
                restecg: data.restecg,
                thalach: data.thalach,
                exang: data.exang,
                oldpeak: data.oldpeak,
                slope: data.slope,
                ca: data.ca,
                thal: data.thal
            };
            medicalHistory.push(entry);
        });
        
        return { success: true, message: 'Heart history fetched successfully', medicalHistory };
    } catch (error) {
        console.error('Error fetching heart history:', error);
        return { success: false, message: 'Internal server error' };
    }
};

const storeHeartHistory = async (userId, data) => {
    try {
        const heartRef = db.ref(`users/${userId}/medicalHistory/heart`);
        const newHeartRef = await heartRef.push(data);
        
        return { success: true, message: 'Heart history stored successfully', statisticsId: newHeartRef.key };
    } catch (error) {
        console.error('Error storing heart history:', error);
        return { success: false, message: 'Internal server error' };
    }
};

module.exports = {
    fetchHeartHistory,
    storeHeartHistory
};
