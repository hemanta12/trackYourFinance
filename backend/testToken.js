const jwt = require('jsonwebtoken');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiaWF0IjoxNzM2ODA1NzI1LCJleHAiOjE3MzY4MDkzMjV9.dd3GHkBdACxMz0ERl4mI9ssIV1Tor6Qgmro4QPfdVWo';
const secret = 'yourjwtsecret'; // Replace with your actual secret key

try {
  const decoded = jwt.verify(token, secret);
  console.log('Token is valid:', decoded);
} catch (error) {
  console.error('Invalid token:', error.message);
}
