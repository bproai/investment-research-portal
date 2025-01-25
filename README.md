# Investment Questions Viewer

Web application for managing and viewing investment research questions.

## Features
- Question list with filtering and sorting
- Detailed view of questions with formatted content
- MongoDB integration for data persistence
- Real-time updates

## Setup

### Prerequisites
- Node.js >= 14
- MongoDB >= 4.4
- npm or yarn

### Installation

```bash
# Clone repository
git clone [repository-url]
cd investment-questions

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Configuration
Create `.env` in server directory:
```
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=memory_db
PORT=5000
```

### Running the Application

```bash
# Start MongoDB
mongod

# Start server (new terminal)
cd server
npm start

# Start client (new terminal)
cd client
npm start
```

Access application at http://localhost:3000

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

## API Endpoints
- GET /api/questions - List all questions
- GET /api/questions/:id - Get question details

## Technologies
- Frontend: React, Tailwind CSS
- Backend: Express, MongoDB
- UI Components: shadcn/ui
