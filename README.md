# SnapLink URL Shortener

A full-stack URL shortener that creates compact shareable links, redirects visitors to the original URL, and tracks clicks for every link.

## Features

- Create a short URL from a long HTTP or HTTPS URL
- Redirect short URLs to their original destination
- Persist links and click counts in MongoDB
- View all created links and their click counts
- Copy generated short links from the React dashboard
- Validate URLs and show loading and error states

## Tech stack

- Frontend: React, Vite
- Backend: Node.js, Express
- Database: MongoDB, Mongoose

## Project structure

```text
url-shortener/
├── client/                 # React + Vite frontend
│   ├── src/App.jsx         # Dashboard UI and API requests
│   ├── .env                # Local frontend variables (not committed)
│   └── vite.config.js      # Development API proxy
├── server/                 # Express API
│   ├── models/Url.js       # MongoDB URL model
│   ├── routes/urlRoutes.js # Create and list endpoints
│   ├── server.js           # API server and redirect endpoint
│   └── .env                # Local backend variables (not committed)
├── package.json            # Root development scripts
└── README.md
```

## Local setup

### Prerequisites

- Node.js 18 or later
- npm
- A running local MongoDB instance, or a MongoDB Atlas connection string

### Install dependencies

From the project root:

```bash
npm install
npm run install:all
```

### Configure environment variables

Create `server/.env` from `server/.env.example` and supply your MongoDB connection string:

```bash
cp server/.env.example server/.env
```

On PowerShell, use:

```powershell
Copy-Item server\.env.example server\.env
```

`server/.env`:

| Variable | Required | Description | Local example |
| --- | --- | --- | --- |
| `MONGODB_URI` | Yes | MongoDB database connection string | `mongodb://127.0.0.1:27017/url-shortener` |
| `PORT` | Yes | Express server port | `5001` |
| `BASE_URL` | Yes | Public base URL used for short links | `http://localhost:5001` |

Optional frontend variables can be placed in `client/.env`:

| Variable | Required | Description | Local example |
| --- | --- | --- | --- |
| `VITE_API_URL` | No | API base URL. Leave unset in development to use the Vite proxy. | `http://localhost:5001` |
| `VITE_SHORT_URL_BASE` | Yes for a custom base URL | Base URL used when displaying generated short links | `http://localhost:5001` |

Environment files are ignored by Git. Never commit credentials or a MongoDB Atlas URI containing secrets.

## Run locally

Start both services from the project root:

```bash
npm run dev
```

Or run them separately:

```bash
npm run dev --prefix server
npm run dev --prefix client
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5001`

## API endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Returns API health status |
| `POST` | `/api/urls` | Creates a short URL from `{ "originalUrl": "https://example.com" }` |
| `GET` | `/api/urls` | Lists all shortened URLs and click counts |
| `DELETE` | `/api/urls/:id` | Deletes a shortened URL |
| `GET` | `/:shortCode` | Redirects to the original URL and increments its click count |

## Click counting

Each short link has a `clicks` value stored in MongoDB. When someone visits `/:shortCode`, the backend atomically increments that value with MongoDB's `$inc` operator before returning the redirect response. This keeps the count persistent and avoids lost updates from concurrent visits.

## GitHub Repository

- **Repository:** https://github.com/mayanksri24/LinkKaato-URL-Shortener
