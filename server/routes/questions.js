// server/routes/questions.js
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const router = express.Router();

const MONGO_URL = "mongodb://localhost:27017";
const DB_NAME = "memory_db";

router.get('/questions', async (req, res) => {
    try {
        const db = req.app.locals.mongodb;
        const questions = await db.collection('investment_questions').find().toArray();
        res.json(questions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get latest stock prices
router.get('/stock-price/:symbol', async (req, res) => {
    try {
        const { symbol } = req.params;
        const db = req.app.locals.db;

        // Get the latest 5 data points from historical_stock_data1
        const [rows] = await db.query(
            'SELECT date, open, high, low, close, volume FROM historical_stock_data1 WHERE symbol = ? ORDER BY date DESC LIMIT 5',
            [symbol]
        );

        if (rows && rows.length > 0) {
            // Reverse the array so it's in chronological order
            const data = rows.reverse();
            res.json({
                symbol,
                data: data.map(row => ({
                    date: row.date,
                    open: row.open,
                    high: row.high,
                    low: row.low,
                    close: row.close,
                    volume: row.volume
                }))
            });
        } else {
            res.status(404).json({ error: 'Stock not found' });
        }
    } catch (error) {
        console.error('Error getting stock price:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/questions/:questionId/stocks', async (req, res) => {
    try {
        const db = req.app.locals.mongodb;
        const collection = db.collection('investment_questions');
        
        const { questionId } = req.params;
        const { symbol } = req.body;

        if (!symbol) {
            res.status(400).json({ error: 'Stock symbol is required' });
            return;
        }

        // Add stock symbol if it doesn't already exist
        const result = await collection.updateOne(
            { _id: new ObjectId(questionId) },
            { $addToSet: { related_stocks: symbol.toUpperCase() } }
        );

        if (result.matchedCount === 0) {
            res.status(404).json({ error: 'Question not found' });
            return;
        }

        const updatedQuestion = await collection.findOne({ _id: new ObjectId(questionId) });
        res.json(updatedQuestion);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

router.delete('/questions/:questionId/stocks/:symbol', async (req, res) => {
    try {
        const db = req.app.locals.mongodb;
        const collection = db.collection('investment_questions');
        
        const { questionId, symbol } = req.params;
        
        const result = await collection.updateOne(
            { _id: new ObjectId(questionId) },
            { $pull: { related_stocks: symbol.toUpperCase() } }
        );

        if (result.matchedCount === 0) {
            res.status(404).json({ error: 'Question not found' });
            return;
        }
        
        const updatedQuestion = await collection.findOne({ _id: new ObjectId(questionId) });
        res.json(updatedQuestion);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Add a sticky note to a question
router.post('/questions/:questionId/sticky-notes', async (req, res) => {
    try {
        const db = req.app.locals.mongodb;
        const collection = db.collection('investment_questions');
        
        const { questionId } = req.params;
        const { content, color = '#FEF3C7' } = req.body;

        if (!content) {
            res.status(400).json({ error: 'Note content is required' });
            return;
        }

        const note = {
            id: new ObjectId(),
            content,
            color,
            created_at: new Date()
        };

        const result = await collection.updateOne(
            { _id: new ObjectId(questionId) },
            { $push: { sticky_notes: note } }
        );

        if (result.modifiedCount === 0) {
            res.status(404).json({ error: 'Question not found' });
            return;
        }

        const updatedQuestion = await collection.findOne({ _id: new ObjectId(questionId) });
        res.json(updatedQuestion);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete a sticky note
router.delete('/questions/:questionId/sticky-notes/:noteId', async (req, res) => {
    try {
        const db = req.app.locals.mongodb;
        const collection = db.collection('investment_questions');
        
        const { questionId, noteId } = req.params;
        
        const result = await collection.updateOne(
            { _id: new ObjectId(questionId) },
            { $pull: { sticky_notes: { id: new ObjectId(noteId) } } }
        );

        if (result.modifiedCount === 0) {
            res.status(404).json({ error: 'Question or note not found' });
            return;
        }

        const updatedQuestion = await collection.findOne({ _id: new ObjectId(questionId) });
        res.json(updatedQuestion);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

router.delete('/questions/:questionId/related/:relatedId', async (req, res) => {
    try {
        const client = await MongoClient.connect(MONGO_URL);
        const db = client.db(DB_NAME);
        const collection = db.collection('investment_questions');
        
        const { questionId, relatedId } = req.params;
        
        // Log the document before update
        const beforeDoc = await collection.findOne({ _id: new ObjectId(questionId) });
        console.log('Document before update:', beforeDoc);
        
        const result = await collection.updateOne(
            { _id: new ObjectId(questionId) },
            { $pull: { related_questions: new ObjectId(relatedId) } }
        );
        
        // Log the update result
        console.log('Update result:', result);
        
        const updatedQuestion = await collection.findOne({ _id: new ObjectId(questionId) });
        console.log('Document after update:', updatedQuestion);
        
        await client.close();
        res.json(updatedQuestion);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;