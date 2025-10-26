const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const connectDB = require('./configs/db.conn');
const authRoutes = require('./routes/auth.routes');
const skillRoutes = require('./routes/skill.routes');
const positionRoutes = require('./routes/position.routes');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const corsOptions = { origin: '*' };

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

app.get('/', (_, res) => {
  res.send('Hello World!');
});

app.use('/auth', authRoutes);
app.use('/skill', skillRoutes);
app.use('/position', positionRoutes);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
