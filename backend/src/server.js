const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const emailRoutes = require('./routes/email.routes');
const contentRoutes = require('./routes/content.routes');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/email', emailRoutes);
app.use('/api/content', contentRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 