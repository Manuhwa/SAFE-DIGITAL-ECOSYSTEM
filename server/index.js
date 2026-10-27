const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Ensure data and uploads dirs exist
const dataDir = path.join(__dirname, 'data');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(path.join(uploadsDir, 'audio'))) fs.mkdirSync(path.join(uploadsDir, 'audio'), { recursive: true });

// Initialize database (tables)
try {
  require('./scripts/initDb');
} catch (e) {
  console.warn('DB init warning:', e.message);
}
try { require('./db').migrateTranscripts(); } catch (e) { console.warn('Transcript migration warning:', e.message); }
if (!fs.existsSync(path.join(uploadsDir, 'transcripts'))) fs.mkdirSync(path.join(uploadsDir, 'transcripts'), { recursive: true });

const reportsRouter = require('./routes/reports');
const educationRouter = require('./routes/education');
const legalRouter = require('./routes/legal');
const analysisRouter = require('./routes/analysis');
const adminRouter = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/reports', reportsRouter);
app.use('/api/education', educationRouter);
app.use('/api/legal', legalRouter);
app.use('/api/analysis', analysisRouter);
app.use('/api/admin', adminRouter);

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

// Unknown API routes -> JSON 404
app.use('/api', (req, res) => res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl}` }));

// Any error (multer upload limits, bad JSON, etc.) -> JSON response
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Request error:', err && err.message);
  if (res.headersSent) return;
  let status = err.status || err.statusCode || 500;
  let message = err.message || 'Server error.';
  if (err.code === 'LIMIT_FILE_SIZE') { status = 413; message = 'Audio file is too large (max 25MB).'; }
  else if (err.name === 'MulterError') { status = 400; message = `Upload error: ${err.message}`; }
  else if (err.type === 'entity.parse.failed') { status = 400; message = 'Invalid JSON in request.'; }
  res.status(status).json({ error: message });
});

process.on('unhandledRejection', (e) => console.error('Unhandled rejection:', e));

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Safe Digital Ecosystem API running at http://localhost:${PORT}`);
  console.log('Keep this terminal open. The frontend proxies /api to this server.');
});

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. The backend may already be running in another window - close it first, or check that the frontend (Vite) is not using port ${PORT}.`);
    process.exit(1);
  }
  throw e;
});
