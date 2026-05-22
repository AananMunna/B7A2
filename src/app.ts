import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { initDB } from './config/db';
import authRoutes from './modules/auth/auth.routes';
import issuesRoutes from './modules/issues/issues.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ success: true, message: 'DevPulse API is running ' });
});

app.use('/api/auth', authRoutes);
app.use('/api/issues', issuesRoutes);


app.use(errorHandler);

const startServer = async () => {
  await initDB();
  app.listen(PORT, () => {
    console.log(` Server running on port ${PORT}`);
  });
};

startServer();

export default app;