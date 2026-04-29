import { config } from 'dotenv';
config();

import express from 'express';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.route.js';
import adminRoutes from './routes/admin.route.js';
import userRoutes from './routes/user.route.js';


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/user', userRoutes);

export default app;