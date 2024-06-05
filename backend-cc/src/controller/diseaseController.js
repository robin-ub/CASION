const { admin, db } = require('../middleware/firebaseAdmin');

const fetchDiseases = async (userId) => {
    try {
        const diseasesSnapshot = await db.ref(`users/${userId}/diseases`).once('value');
        const diseases = [];
        diseasesSnapshot.forEach((diseaseSnapshot) => {
            const diseaseData = diseaseSnapshot.val();
            const treatments = diseaseData.treatments ? Object.values(diseaseData.treatments) : [];
            diseases.push({
                diseaseId: diseaseSnapshot.key,
                name: diseaseData.name,
                description: diseaseData.description,
                treatments: treatments
            });
        });

        return { success: true, message: 'Diseases fetched successfully', diseases };
    } catch (error) {
        console.error('Error fetching disease data:', error);
        return { success: false, message: 'Internal server error' };
    }
};

const storeDisease = async (userId, disease) => {
    try {
        const diseaseRef = db.ref(`users/${userId}/diseases`);
        const newDiseaseRef = await diseaseRef.push({
            name: disease.name,
            description: disease.description
        });

        const diseaseId = newDiseaseRef.key;
        const treatments = disease.treatments || [];

        const treatmentsRef = db.ref(`users/${userId}/diseases/${diseaseId}/treatments`);
        for (const treatment of treatments) {
            await treatmentsRef.push(treatment);
        }

        return { success: true, message: 'Disease stored successfully', diseaseId };
    } catch (error) {
        console.error('Error storing disease data:', error);
        return { success: false, message: 'Internal server error' };
    }
};

module.exports = {
    fetchDiseases,
    storeDisease
};
