const jwt = require('jsonwebtoken');

const config = process.env;

const verifyToken = (req, res, next) => {
    const authHeader = req.body.token || req.query.token || req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).send({success: false, message: 'A token is required for authentication'});
    }

    try {
        const user = jwt.verify(token, config.JWT_SECRET);
        req.user = user.uid;
    } catch (err) {
        return res.status(401).send({success: false, message: 'Invalid token'});
    }
    return next();
};

module.exports = verifyToken;