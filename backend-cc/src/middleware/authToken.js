const jwt = require('jsonwebtoken');
const { admin } = require('./firebaseAdmin');
const config = process.env;

const verifyToken = async (req, res, next) => {
    const authHeader = req.body.token || req.query.token || req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).send({ success: false, message: 'A token is required for authentication' });
    }

    try {
        // Verify custom JWT
        const user = jwt.verify(token, config.JWT_SECRET);
        req.user = user.uid;
    } catch (err) {
        try {
            // If custom JWT verification fails, verify Google ID token
            const decodedToken = await admin.auth().verifyIdToken(token);
            req.user = decodedToken.uid;
        } catch (error) {
            return res.status(401).send({ success: false, message: 'Invalid token' });
        }
    }

    return next();
};

module.exports = verifyToken;
