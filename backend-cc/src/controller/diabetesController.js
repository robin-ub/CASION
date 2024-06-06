const { admin, db } = require('../middleware/firebaseAdmin');

const fetchDiabetesHistory = async (userId) => {
    try {
        const userRef = db.ref(`users/${userId}/medicalHistory/diabetes`);
        const snapshot = await userRef.once('value');
        const medicalHistory = [];
        
        snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            const entry = {
                statisticsId: childSnapshot.key,
                HighBP: data.HighBP,
                HighChol: data.HighChol,
                BMI: data.BMI,
                Stroke: data.Stroke,
                HeartDiseaseorAttack: data.HeartDiseaseorAttack,
                PhysActivity: data.PhysActivity,
                GenHlth: data.GenHlth,
                PhysHlth: data.PhysHlth,
                DiffWalk: data.DiffWalk,
                Education: data.Education,
                Income: data.Income
            };
            medicalHistory.push(entry);
        });
        
        return { success: true, message: 'Diabetes history fetched successfully', medicalHistory };
    } catch (error) {
        console.error('Error fetching diabetes history:', error);
        return { success: false, message: 'Internal server error' };
    }
};

const storeDiabetesHistory = async (userId, data) => {
    try {
        const diabetesRef = db.ref(`users/${userId}/medicalHistory/diabetes`);
        const newDiabetesRef = await diabetesRef.push(data);
        
        return { success: true, message: 'Diabetes history stored successfully', statisticsId: newDiabetesRef.key };
    } catch (error) {
        console.error('Error storing diabetes history:', error);
        return { success: false, message: 'Internal server error' };
    }
};

module.exports = {
    fetchDiabetesHistory,
    storeDiabetesHistory
};
