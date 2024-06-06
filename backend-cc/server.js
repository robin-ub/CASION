const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
const firebaseAdminMiddleware = require('./src/middleware/firebaseAdmin');

const app = express();
const port = process.env.PORT || 3000;

const userRouter = require("./src/routes/userRoutes.js")
const chatRouter = require("./src/routes/chatRoutes.js")
const diseaseRouter = require("./src/routes/diseaseRoutes.js")
const medicalHistoryRoutes = require('./src/routes/medicalHistoryRoutes');

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/auth', userRouter);
app.use('/chat', chatRouter);
app.use('/disease', diseaseRouter);
app.use('/history', medicalHistoryRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

