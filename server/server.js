const express = require('express');
const cors = require('cors');
const path = require('path');
const questionsRouter = require('./routes/questions');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', questionsRouter);

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));
// Handle favicon specifically 
app.use('/favicon.ico', express.static(path.join(__dirname, 'public/favicon.ico')));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));