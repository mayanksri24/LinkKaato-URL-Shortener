import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import Url from './models/Url.js';
import urlRoutes from './routes/urlRoutes.js';

const app = express();
const port = process.env.PORT || 5000;
const baseUrl = (process.env.BASE_URL || `http://localhost:${port}`).replace(/\/$/, '');

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => res.json({ status: 'ok', service: 'url-shortener-api' }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/urls', urlRoutes);

app.get('/:shortCode', async (req, res, next) => {
  try {
    const url = await Url.findOneAndUpdate(
      { shortCode: req.params.shortCode },
      { $inc: { clicks: 1 } },
      { new: true }
    );

    if (!url) return res.status(404).send('Short link not found.');
    return res.redirect(url.originalUrl);
  } catch (error) {
    return next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: 'Something went wrong. Please try again.' });
});

async function start() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is missing. Copy .env.example to .env and configure it.');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  app.listen(port, () => {
    console.log(`API listening on ${baseUrl}`);
  });
}

start().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
