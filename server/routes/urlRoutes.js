import { Router } from 'express';
import mongoose from 'mongoose';
import { nanoid } from 'nanoid';
import Url from '../models/Url.js';

const router = Router();

function normalizeUrl(value) {
  const candidate = value.trim();
  const withProtocol = /^https?:\/\//i.test(candidate)
    ? candidate
    : `https://${candidate}`;
  const parsed = new URL(withProtocol);

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Only HTTP and HTTPS URLs are supported.');
  }

  return parsed.toString();
}

router.post('/', async (req, res, next) => {
  try {
    if (typeof req.body.originalUrl !== 'string' || !req.body.originalUrl.trim()) {
      return res.status(400).json({ message: 'Please enter a URL.' });
    }

    let originalUrl;
    try {
      originalUrl = normalizeUrl(req.body.originalUrl);
    } catch {
      return res.status(400).json({ message: 'Enter a valid HTTP or HTTPS URL.' });
    }

    const url = await Url.create({ originalUrl, shortCode: nanoid(7) });
    return res.status(201).json(url);
  } catch (error) {
    return next(error);
  }
});

router.get('/', async (_req, res, next) => {
  try {
    const urls = await Url.find().sort({ createdAt: -1 }).lean();
    return res.json(urls);
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid link ID.' });
    }

    const deletedUrl = await Url.findByIdAndDelete(req.params.id);
    if (!deletedUrl) return res.status(404).json({ message: 'Short link not found.' });

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

export default router;
