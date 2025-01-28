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