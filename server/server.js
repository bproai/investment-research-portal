// server/server.js
const express = require('express');
const cors = require('cors');
const questionsRouter = require('./routes/questions');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', questionsRouter);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));