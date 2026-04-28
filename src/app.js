import express from 'express';
import { config } from 'dotenv';

config();

import authRoutes from './routes/auth.route.js';


const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.use('/auth', authRoutes);


export default app;