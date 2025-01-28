// server/routes/questions.js
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const router = express.Router();

const MONGO_URL = "mongodb://localhost:27017";
const DB_NAME = "memory_db";

router.get('/questions', async (req, res) => {
    try {
        const client = await MongoClient.connect(MONGO_URL);
        const db = client.db(DB_NAME);
        const questions = await db.collection('investment_questions').find().toArray();
        await client.close();
        res.json(questions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/questions/:questionId/related/:relatedId', async (req, res) => {
    try {
        const client = await MongoClient.connect(MONGO_URL);
        const db = client.db(DB_NAME);
        const collection = db.collection('investment_questions');
        
        const { questionId, relatedId } = req.params;
        
        // Remove the related question from the array
        await collection.updateOne(
            { _id: new ObjectId(questionId) },
            { $pull: { related_questions: relatedId } }
        );
        
        // Get the updated question
        const updatedQuestion = await collection.findOne({ _id: new ObjectId(questionId) });
        await client.close();
        
        res.json(updatedQuestion);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;