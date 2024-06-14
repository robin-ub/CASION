const express = require('express');
const userRouter = express.Router();

const { login, register } = require('../auth/auth');
const { fetchUserDetails, updateUserDetails } = require('../controller/userController');
const verifyToken = require('../middleware/authToken');

// Register endpoint
userRouter.post('/register', async (req, res) => {
    const { full_name, email, password, birthday, gender } = req.body;
    const result = await register(full_name, email, password, birthday, gender);
    res.status(result.success ? 200 : 400).send(result);
});

// Login endpoint
userRouter.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const result = await login(email, password);
    res.status(result.success ? 200 : 401).send(result);
});

// Validate token endpoint
userRouter.post('/validate', verifyToken, async (req, res) => {
    const userId = req.user;
    res.status(200).send({
        success: true,
        message: 'Valid token',
        token: userId,
    });
});

// Fetch user details
userRouter.get('/details', verifyToken, async (req, res) => {
    const userId = req.user;
    const result = await fetchUserDetails(userId);
    res.status(result.success ? 200 : 500).send(result);
});

// Update user details
userRouter.put('/details', verifyToken, async (req, res) => {
    const userId = req.user;
    const userDetails = req.body; // Gender, birthday, education background, and medical history fields
    const result = await updateUserDetails(userId, userDetails);
    res.status(result.success ? 200 : 500).send(result);
});

module.exports = userRouter;
