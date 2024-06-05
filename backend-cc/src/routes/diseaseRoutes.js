const express = require('express');
const diseaseRouter = express.Router();
const diseaseController = require('../controller/diseaseController');
const verifyToken = require('../middleware/authToken');

// Fetch diseases
diseaseRouter.get('/', verifyToken, async (req, res) => {
    const userId = req.user;
    const result = await diseaseController.fetchDiseases(userId);
    res.status(result.success ? 200 : 500).send(result);
});

// Store disease
diseaseRouter.post('/', verifyToken, async (req, res) => {
    const diseaseData = req.body;
    const userId = req.user; // userId from jwt
    const result = await diseaseController.storeDisease(userId, diseaseData);
    res.status(result.success ? 200 : 500).send(result);
});

module.exports = diseaseRouter;
