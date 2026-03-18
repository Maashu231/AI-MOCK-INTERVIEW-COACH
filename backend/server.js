require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const interviewRoutes = require('./routes/interview');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/api', interviewRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'AI Mock Interview Coach Server is Running!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});