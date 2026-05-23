import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler';
import { initDB } from './config/db';
import authRoutes from './modules/auth/auth.routes';
import issuesRoutes from './modules/issues/issues.routes';
import { config } from './config/env';


const app = express();
const PORT = config.port;

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