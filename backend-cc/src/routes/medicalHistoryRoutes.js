const express = require('express');
const router = express.Router();
const heartController = require('../controller/heartController');
const diabetesController = require('../controller/diabetesController');
const verifyToken = require('../middleware/authToken');

// Fetch heart history
router.get('/heart', verifyToken, async (req, res) => {
    const userId = req.user;
    const result = await heartController.fetchHeartHistory(userId);
    res.status(result.success ? 200 : 500).send(result);
});

// Store heart history
router.post('/heart', verifyToken, async (req, res) => {
    const userId = req.user;
    const data = req.body;
    const result = await heartController.storeHeartHistory(userId, data);
    res.status(result.success ? 200 : 500).send(result);
});

// Fetch diabetes history
router.get('/diabetes', verifyToken, async (req, res) => {
    const userId = req.user;
    const result = await diabetesController.fetchDiabetesHistory(userId);
    res.status(result.success ? 200 : 500).send(result);
});

// Store diabetes history
router.post('/diabetes', verifyToken, async (req, res) => {
    const userId = req.user;
    const data = req.body;
    const result = await diabetesController.storeDiabetesHistory(userId, data);
    res.status(result.success ? 200 : 500).send(result);
});

module.exports = router;
