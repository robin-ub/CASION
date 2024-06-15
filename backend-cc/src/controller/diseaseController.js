const { admin, db } = require('../middleware/firebaseAdmin');

const fetchDiseases = async (userId) => {
    try {
        const diseasesSnapshot = await db.ref(`users/${userId}/diseases`).once('value');
        const diseases = [];
        diseasesSnapshot.forEach((diseaseSnapshot) => {
            const diseaseData = diseaseSnapshot.val();
            diseases.push({
                diseaseId: diseaseSnapshot.key,
                name: diseaseData.name,
                description: diseaseData.description,
                suggestion: diseaseData.suggestion || '', // Ensure treatments is a string
                confidenceScore: diseaseData.confidenceScore || 0,
                category: diseaseData.category || '',
                createdAt: diseaseData.createdAt || ''
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
            description: disease.description,
            suggestion: disease.suggestion || '',
            confidenceScore: disease.confidenceScore || 0,
            category: disease.category || '',
            createdAt: disease.createdAt || new Date().toISOString()
        });

        const diseaseId = newDiseaseRef.key;

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
