const mysql = require('mysql2/promise');
require('dotenv').config(); // Load environment variables from .env file

(async () => {
  try {
    // Create a connection to the MySQL database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log('Connected to the database.');

    // SQL query to create the `expenses` table
    const createExpensesTableQuery = `
      CREATE TABLE IF NOT EXISTS expenses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        amount FLOAT NOT NULL,
        category VARCHAR(255) NOT NULL,
        payment_type VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        CONSTRAINT fk_expenses_user_id FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `;

    // Execute the query
    await connection.query(createExpensesTableQuery);
    console.log('Expenses table created successfully.');

    // Close the connection
    await connection.end();
    console.log('Connection closed.');
  } catch (error) {
    console.error('Error creating expenses table:', error);
  }
})();
