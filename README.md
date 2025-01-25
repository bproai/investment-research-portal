# Investment Research Questions Platform

Web platform for managing and tracking investment research questions, hypotheses, and insights.

## Features
- Question tracking with stage/priority management
- Detailed view with descriptions, hypotheses, and team assignments
- MongoDB backend for data persistence
- Real-time updates
- Team collaboration features

## Tech Stack
- Frontend: React, Tailwind CSS
- Backend: Express.js, MongoDB
- Database: MongoDB (memory_db)

## Installation

```bash
# Clone repository
git clone [your-repo-url]
cd investment-questions

# Install dependencies
npm run install:all

# Start application
npm start
```

## Database Schema

### Investment Questions Collection
- Title: Research question
- Category: Investment categories
- Stage: brainstorm/research/analysis/thesis/vetted
- Priority: 1-5
- Description: Detailed explanation
- Hypothesis: Initial investment thesis
- Team: Assigned analysts
- Source: Information sources
- Confidence Score: 0-1 rating

## Project Structure
```
investment-questions/
├── client/               # React frontend
│   ├── src/
│   │   ├── components/  
│   │   └── App.js       
│   └── package.json
└── server/              # Express backend
    ├── routes/          
    ├── server.js        
    └── package.json
```

## Environment Setup
```
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=memory_db
PORT=5001
```