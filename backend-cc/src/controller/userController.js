const { db } = require('../middleware/firebaseAdmin');

const fetchUserDetails = async (userId) => {
    try {
        const userSnapshot = await db.ref(`users/${userId}`).once('value');
        if (!userSnapshot.exists()) {
            return { success: false, message: 'User not found' };
        }
        const userData = userSnapshot.val();

        const userDetails = {
            userId: userId,
            fullName: userData.full_name,
            email: userData.email,
            gender: userData.gender,
            birthday: userData.birthday,
            medicalHistory: userData.medicalHistory
        };

        return { success: true, message: 'User details fetched successfully', userDetails };
    } catch (error) {
        console.error('Error fetching user details:', error);
        return { success: false, message: 'Internal server error' };
    }
};

const updateUserDetails = async (userId, userDetails) => {
    try {
        const userRef = db.ref(`users/${userId}`);
        await userRef.update(userDetails);
        return { success: true, message: 'User details updated successfully' };
    } catch (error) {
        console.error('Error updating user details:', error);
        return { success: false, message: 'Internal server error' };
    }
};

module.exports = {
    fetchUserDetails,
    updateUserDetails
};
