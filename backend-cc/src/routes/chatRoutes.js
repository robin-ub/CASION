const express = require('express');
const router = express.Router();
const chatController = require('../controller/chatController');
const verifyToken = require('../middleware/authToken');

// fetch chat
router.get('/', verifyToken, async (req, res) => {
  const userId = req.user;
  const result = await chatController.fetchChats(userId);
  res.status(result.success ? 200 : 500).send(result);
});

// store chat
router.post('/', verifyToken, async (req, res) => {
  const chat = req.body
  const userId = req.user; // userId from jwt
  const result = await chatController.storeChat(userId, chat);
  res.status(result.success ? 200 : 500).send(result);
});

// update chat
router.put('/:chatId', verifyToken, async (req, res) => {
  const userId = req.user; // userId from jwt
  const chatId = req.params.chatId;
  const updatedData = req.body; // Data to update
  const result = await chatController.updateChat(userId, chatId, updatedData);
  res.status(result.success ? 200 : 500).send(result);
});

// delete chat
router.delete('/:chatId', verifyToken, async (req, res) => {
  const userId = req.user;
  const chatId = req.params.chatId;
  const result = await chatController.deleteChat(userId, chatId);
  res.status(result.success ? 200 : 500).send(result);
});
module.exports = router;
