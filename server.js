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

// Comprehensive live sports dashboard from FREE APIs
app.get('/api/live-matches', async (req, res) => {
  try {
    const league = req.query.league || 'PL'; // Default: Premier League
    const competitionMap = {
      'PL': { id: 'PL', name: 'Premier League' },
      'LA': { id: 'LA', name: 'La Liga' },
      'SA': { id: 'SA', name: 'Serie A' },
      'BL1': { id: 'BL1', name: 'Bundesliga' },
      'CL': { id: 'CL', name: 'Champions League' }
    };

    const comp = competitionMap[league] || competitionMap['PL'];

    // Fetch LIVE + SCHEDULED matches
    const [liveRes, standingsRes, scoresRes] = await Promise.all([
      axios.get(`https://api.football-data.org/v4/competitions/${comp.id}/matches?status=LIVE`, { timeout: 5000 }),
      axios.get(`https://api.football-data.org/v4/competitions/${comp.id}/standings`, { timeout: 5000 }),
      axios.get(`https://api.football-data.org/v4/competitions/${comp.id}/scorers?limit=5`, { timeout: 5000 })
    ]).catch(err => {
      console.error('API Error:', err.message);
      return [{ data: { matches: [] } }, { data: { standings: [] } }, { data: { scorers: [] } }];
    });

    // Format live matches
    const liveMatches = (liveRes.data.matches || []).map(m => ({
      id: m.id,
      sport: 'FOOTBALL',
      league: comp.name,
      team1: m.homeTeam.name,
      team1Logo: m.homeTeam.crest,
      team2: m.awayTeam.name,
      team2Logo: m.awayTeam.crest,
      score1: m.score.fullTime.home,
      score2: m.score.fullTime.away,
      status: m.status === 'LIVE' ? `${m.minute || '0'}' LIVE` : 'SCHEDULED',
      matchday: m.season?.currentMatchday,
      utcDate: m.utcDate,
      stage: m.stage
    }));

    // Format standings (league table)
    const standings = (standingsRes.data.standings?.[0]?.table || []).map(t => ({
      pos: t.position,
      team: t.team.name,
      logo: t.team.crest,
      played: t.playedGames,
      wins: t.won,
      draws: t.draw,
      losses: t.lost,
      goalsFor: t.goalsFor,
      goalsAgainst: t.goalsAgainst,
      goalDiff: t.goalDifference,
      points: t.points
    }));

    // Format top scorers
    const scorers = (scoresRes.data.scorers || []).map(s => ({
      name: s.player.name,
      goals: s.goals,
      team: s.team.name,
      assists: s.assists || 0
    }));

    // Cricket fallback
    const cricketMatches = [
      {
        id: 'cri-1',
        sport: 'CRICKET',
        league: 'Test Match',
        team1: 'India',
        team2: 'England',
        score1: 245,
        score2: null,
        status: 'IND 245/3 (52 overs)',
        utcDate: new Date()
      }
    ];

    res.json({
      competition: comp,
      liveMatches,
      standings,
      topScorers: scorers,
      cricket: cricketMatches,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Dashboard error:', error.message);
    res.json({
      competition: { id: 'PL', name: 'Premier League' },
      liveMatches: [],
      standings: [],
      topScorers: [],
      cricket: [],
      timestamp: new Date()
    });
  }
});

// Get available competitions
app.get('/api/competitions', (req, res) => {
  res.json({
    competitions: [
      { id: 'PL', name: '⚽ Premier League', flag: '🇬🇧' },
      { id: 'LA', name: '⚽ La Liga', flag: '🇪🇸' },
      { id: 'SA', name: '⚽ Serie A', flag: '🇮🇹' },
      { id: 'BL1', name: '⚽ Bundesliga', flag: '🇩🇪' },
      { id: 'CL', name: '🏆 Champions League', flag: '🌍' }
    ]
  });
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
