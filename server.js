const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'leads.db');

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Initialize SQLite database
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Database open error:', err);
  } else {
    console.log('Connected to SQLite database at', DB_PATH);
    initializeDB();
  }
});

function initializeDB() {
  db.run(`CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    language TEXT DEFAULT 'en',
    source TEXT DEFAULT 'web',
    status TEXT DEFAULT 'pending',
    sports TEXT DEFAULT 'cricket'
  )`, (err) => {
    if (err) {
      console.error('Table creation error:', err);
    } else {
      console.log('Leads table ready');
    }
  });
}

// Phone validation
function isValidPhone(phone) {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  return /^\+?\d{10,15}$/.test(cleaned);
}

// API endpoint for subscribe
app.post('/api/subscribe', (req, res) => {
  const { phone, sports } = req.body;

  if (!phone || !isValidPhone(phone)) {
    return res.status(400).json({ success: false, error: 'Invalid phone number' });
  }

  const cleanPhone = phone.replace(/[\s\-()]/g, '');
  const language = req.headers['accept-language']?.split('-')[0] || 'en';
  const sportsStr = sports && Array.isArray(sports) ? sports.join(',') : 'cricket';

  db.run(
    `INSERT INTO leads (phone, language, source, sports) VALUES (?, ?, 'web', ?)`,
    [cleanPhone, language, sportsStr],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          // Phone already exists - update sports preferences
          db.run(
            `UPDATE leads SET sports = ? WHERE phone = ?`,
            [sportsStr, cleanPhone],
            function(err) {
              if (err) {
                console.error('Update error:', err);
                return res.status(500).json({ success: false, error: 'Database error' });
              }
              return res.json({ success: true, message: 'Updated sports preferences' });
            }
          );
          return;
        }
        console.error('Insert error:', err);
        return res.status(500).json({ success: false, error: 'Database error' });
      }
      res.json({ success: true, message: 'Subscribed successfully', id: this.lastID });
    }
  );
});

// API endpoint to get live matches from Football-Data.org
app.get('/api/live-matches', async (req, res) => {
  try {
    // Fetch live football matches from Football-Data.org (no key required for 10 req/min)
    const response = await axios.get('https://api.football-data.org/v4/competitions/PL/matches?status=LIVE', {
      timeout: 5000
    });

    const liveMatches = response.data.matches.map(match => ({
      sport: 'FOOTBALL',
      league: 'Premier League',
      team1: match.homeTeam.name,
      team2: match.awayTeam.name,
      status: match.status === 'LIVE' ? `${match.score.fullTime.home ?? '-'} - ${match.score.fullTime.away ?? '-'}` : 'Today',
      timestamp: match.utcDate
    }));

    // Manual cricket data (update this as matches happen)
    const cricketMatches = [
      {
        sport: 'CRICKET',
        league: 'Test Match',
        team1: 'India',
        team2: 'England',
        status: 'IND 245/3 (52 overs)',
        timestamp: new Date()
      }
    ];

    // Combine football + cricket, limit to 6 sports shown
    const allMatches = [...cricketMatches, ...liveMatches].slice(0, 6);

    res.json({ matches: allMatches });
  } catch (error) {
    console.error('Error fetching live matches:', error.message);
    // Return empty matches if API fails (graceful degradation)
    res.json({
      matches: [
        {
          sport: 'CRICKET',
          league: 'Test Match',
          team1: 'India',
          team2: 'England',
          status: 'IND 245/3 (52 overs)',
          timestamp: new Date()
        }
      ]
    });
  }
});

// API endpoint to get stats (for monitoring)
app.get('/api/stats', (req, res) => {
  db.get('SELECT COUNT(*) as total FROM leads', [], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ total_subscribers: row.total });
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Livescore Alerts server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Database close error:', err);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
});
