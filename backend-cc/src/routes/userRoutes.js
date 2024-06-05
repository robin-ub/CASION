const express = require('express');
const userRouter = express.Router();

const { login, register } = require('../auth/auth');
const { fetchUserDetails, updateUserDetails } = require('../controller/userController');
const verifyToken = require('../middleware/authToken');

// Register endpoint
userRouter.post('/register', async (req, res) => {
    const { full_name, email, password } = req.body;
    const result = await register( full_name, email, password);
    res.status(result.success ? 200 : 400).send(result);
});

// Login endpoint
userRouter.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const result = await login(email, password);
    res.status(result.success ? 200 : 401).send(result);
});

userRouter.post('/validate', verifyToken, async (req, res) => {
    const userId = req.user
    res.status(200).send({
        success: true,
        message: "Valid token",
        token: userId,
    })
});


module.exports = userRouter;