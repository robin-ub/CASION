const { admin, db } = require('../middleware/firebaseAdmin');

const fetchChats = async (userId) => {
    try {
        const chatsSnapshot = await db.ref(`users/${userId}/chats`).once('value');
        const chats = [];
        chatsSnapshot.forEach((chatSnapshot) => {
            const chatData = chatSnapshot.val();
            const messages = [];
            if (chatData.messages) {
            for (const messageId in chatData.messages) {
                if (chatData.messages.hasOwnProperty(messageId)) {
                messages.push({
                    messageId: messageId,
                    ...chatData.messages[messageId]
                });
                }
            }
            }
            chats.push({
            chatId: chatSnapshot.key,
            title: chatData.title,
            dateTime: chatData.dateTime,
            messages: messages
            });
        });

        
        return { success: true, message: 'Chats fetched successfully', chats };
        } catch (error) {
        console.error('Error fetching chat history:', error);
        return { success: false, message: 'Internal server error' };
    }
};

const storeChat = async (userId, chat) => {
    try {
        const chatRef = db.ref(`users/${userId}/chats`)
        const newChatRef = await chatRef.push({
            title: chat.title,
            dateTime: chat.dateTime
        });

        const chatId = newChatRef.key
        const messages = chat.messages

        const msgRef = db.ref(`users/${userId}/chats/${chatId}/messages`)

        for ( var message of messages ) {
            await msgRef.push({
                bot: message.bot,
                message: message.message,
                time: message.time,
            })
        }

        return { success: true, message: 'Chat message stored successfully', chatId };
    } catch (error) {
        console.error('Error storing chat message:', error);
        return { success: false, message: 'Internal server error' };
    }
};

const deleteChat = async (userId, chatId) => {
    try {
        const chatRef = db.ref(`users/${userId}/chats/${chatId}`);
        await chatRef.remove();
        return { success: true, message: 'Chat deleted successfully' };
    } catch (error) {
        console.error('Error deleting chat:', error);
        return { success: false, message: 'Internal server error' };
    }
};

const updateChat = async (userId, chatId, updatedData) => {
    try {
        const chatRef = db.ref(`users/${userId}/chats/${chatId}`);
        await chatRef.update(updatedData);
        return { success: true, message: 'Chat updated successfully' };
    } catch (error) {
        console.error('Error updating chat:', error);
        return { success: false, message: 'Internal server error' };
    }
};

module.exports = {
    fetchChats,
    storeChat,
    deleteChat,
    updateChat
};