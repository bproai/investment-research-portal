require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const os = require('os');
const mysql = require('mysql2/promise');
const { MongoClient } = require('mongodb');

// Function to get the local network IP address
function getLocalNetworkIP() {
  const interfaces = os.networkInterfaces();
  for (const interfaceName of Object.keys(interfaces)) {
    const interface = interfaces[interfaceName];
    for (const config of interface) {
      // Skip internal and non-IPv4 addresses
      if (config.family === 'IPv4' && !config.internal) {
        return config.address;
      }
    }
  }
  return 'localhost'; // Fallback
}
const questionsRouter = require('./routes/questions');

const app = express();
const MONGO_URL = "mongodb://localhost:27017";
const DB_NAME = "memory_db";

async function initializeDatabase() {
  console.log('Starting database initialization...');
  console.log('Environment variables:', {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT
  });

  try {
    // Create MySQL connection pool
    const pool = mysql.createPool({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      port: parseInt(process.env.MYSQL_PORT, 10),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    console.log('Pool created, testing connection...');

    // Test connection
    const connection = await pool.getConnection();
    console.log('Successfully connected to MySQL database');

    try {
      // Get table structure
      console.log('Querying table structure...');
      const [tableStructure] = await connection.query('DESCRIBE historical_stock_data1');
      console.log('\nTable structure for historical_stock_data1:');
      console.table(tableStructure);

      // Get sample data
      console.log('Querying sample data...');
      const [sampleData] = await connection.query('SELECT * FROM historical_stock_data1 LIMIT 5');
      console.log('\nSample data from historical_stock_data1:');
      console.table(sampleData);
    } catch (queryError) {
      console.error('Error executing queries:', queryError);
      throw queryError;
    } finally {
      connection.release();
    }

    return pool;
  } catch (error) {
    console.error('Database initialization error:', error.message);
    console.error('Full error:', error);
    throw error;
  }
}

// Initialize app
async function startServer() {
  try {
    console.log('Starting server initialization...');
    
    // Initialize MySQL
    const pool = await initializeDatabase();
    app.locals.db = pool;

    // Initialize MongoDB
    const mongoClient = await MongoClient.connect(MONGO_URL);
    const mongodb = mongoClient.db(DB_NAME);
    app.locals.mongodb = mongodb;

    app.use(cors());
    app.use(express.json());
    
    // Add endpoint to get server IP and port
    app.get('/api/server-info', (req, res) => {
      res.json({
        ip: getLocalNetworkIP(),
        port: PORT
      });
    });

    app.use('/api', questionsRouter);

    // Add endpoint for stock data date range from stock_data.historical_stock_data table
    app.get('/api/stock-dates', async (req, res) => {
      try {
        const query = 'SELECT MIN(`date`) as minDate, MAX(`date`) as maxDate FROM stock_data.historical_stock_data WHERE bar_size="1 min"';
        console.log('Executing query:', query);
        const [rows] = await app.locals.db.query(query);
        res.json(rows[0]);
      } catch (error) {
        console.error('Error fetching stock dates:', error);
        res.status(500).json({ error: 'Failed to fetch stock dates' });
      }
    });

    // Serve static files from public directory
    app.use(express.static(path.join(__dirname, 'public')));
    // Handle favicon specifically 
    app.use('/favicon.ico', express.static(path.join(__dirname, 'public/favicon.ico')));

    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error('Failed to start server:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Start the server
console.log('Initializing server...');
startServer().catch(err => {
  console.error('Top level error:', err);
  process.exit(1);
});