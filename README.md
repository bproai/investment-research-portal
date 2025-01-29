# Investment Research Questions Platform

Web platform for managing and tracking investment research questions, hypotheses, and insights.

## Features
- Question tracking with stage/priority management
- Detailed view with descriptions, hypotheses, and team assignments
- MongoDB backend for data persistence
- Real-time updates
- Team collaboration features
- Dark/light theme support

## Tech Stack
- Frontend: React, Tailwind CSS, shadcn/ui components
- Backend: Express.js
- Databases: 
  - MongoDB (for questions/research data)
  - MySQL (for stock data)

## Installation

```bash
# Clone repository
git clone [your-repo-url]
cd investment-questions

# Install root dependencies
npm install

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install

# Set up environment variables
cp server/.env.sample server/.env
# Edit server/.env with your configuration

# Return to root and start application
cd ..
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
│   │   │   ├── ui/     # shadcn/ui components
│   │   │   │   ├── badge.js
│   │   │   │   ├── card.jsx
│   │   │   │   ├── scroll-area.js
│   │   │   │   └── theme-toggle.jsx
│   │   │   └── QuestionViewer.js
│   │   └── App.js       
│   └── package.json
└── server/              # Express backend
    ├── routes/          
    ├── server.js
    ├── .env.sample      # Environment variables template        
    └── package.json
```

## Environment Setup

Copy the `.env.sample` file in the server directory to create your `.env` file and update it with your configuration values. The sample file includes configuration for:

- MongoDB connection
- Server settings
- MySQL database connection