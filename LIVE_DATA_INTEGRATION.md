# Live Match Data Integration

Your site now supports 6 sports. Here's how to feed LIVE match data onto the site.

## Current Setup

Right now, the sports cards are **static** — they don't change. 

What you see:
```
🏏 CRICKET
   Updates every ball
   
🏈 FOOTBALL
   Goal alerts instant

🥊 KABADDI
   Raid alerts
   [etc...]
```

## How to Make It LIVE

### **Option 1: Fetch from Sports API** (Recommended)

Use a free sports data API to fetch live matches:

#### **Step 1: Choose an API**

**Cricket:**
- **Cricketdata.com API** — $10/month or free tier
- **ESPN Cricinfo** — No official API, but you can scrape
- **Cricket API** — Free (limited)

**Football:**
- **API-Football** (RapidAPI) — $0.01 per request
- **Football-Data.org** — Free tier available
- **ESPN** — Free data available

**Kabaddi, Hockey, Tennis, Badminton:**
- No direct free APIs available
- You'll need to manually update or use a sports data provider

#### **Step 2: Add Backend Route**

Edit `server.js` and add:

```javascript
const axios = require('axios');

// Add to server.js
app.get('/api/matches', async (req, res) => {
  try {
    // Fetch cricket matches
    const cricket = await axios.get('https://cricket-api.com/matches', {
      headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
    });
    
    // Fetch football matches
    const football = await axios.get('https://api-football-v3.p.rapidapi.com/fixtures', {
      headers: { 'x-rapidapi-key': 'YOUR_API_KEY' }
    });
    
    res.json({
      cricket: cricket.data,
      football: football.data,
      // kabaddi, hockey, tennis, badminton: manual data for now
      kabaddi: [],
      hockey: [],
      tennis: [],
      badminton: []
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});
```

#### **Step 3: Update Frontend**

In `index.html`, add JavaScript to fetch and display:

```javascript
// Before closing </script> tag

fetch('/api/matches')
  .then(res => res.json())
  .then(data => {
    // Update cricket card
    document.querySelector('[data-sport="cricket"]').innerHTML = `
      <div class="card__league">${data.cricket[0]?.league}</div>
      <div class="card__teams">${data.cricket[0]?.team1} vs ${data.cricket[0]?.team2}</div>
      <div class="card__time">
        <span>${data.cricket[0]?.status}</span>
      </div>
    `;
    
    // Update football card
    document.querySelector('[data-sport="football"]').innerHTML = `
      <div class="card__league">${data.football[0]?.league}</div>
      <div class="card__teams">${data.football[0]?.homeTeam} vs ${data.football[0]?.awayTeam}</div>
      <div class="card__time">
        <span>${data.football[0]?.status}</span>
      </div>
    `;
  });
```

---

### **Option 2: Manual Updates (No API)**

For sports without free APIs (Kabaddi, Hockey, Tennis, Badminton), you can:

**Option A: Update a JSON file**

Create `matches.json`:
```json
{
  "kabaddi": [
    {
      "league": "Pro Kabaddi League",
      "teams": "Bengal vs Tamil Nadu",
      "status": "Today 19:00"
    }
  ],
  "hockey": [
    {
      "league": "Olympic Qualifiers",
      "teams": "India vs Belgium",
      "status": "Tomorrow 14:00"
    }
  ]
}
```

Then fetch it in the frontend:

```javascript
fetch('/matches.json')
  .then(res => res.json())
  .then(data => {
    // Update cards with data
  });
```

Update `matches.json` daily, weekly, or via admin panel.

**Option B: Use a CMS**

- **Strapi** (free, open-source) — Headless CMS
- **Contentful** (free tier)
- **Airtable** + API

You edit matches in Airtable/CMS, and your site fetches them.

---

### **Option 3: Hybrid** (Recommended)

- **Cricket & Football**: Use APIs (real-time)
- **Kabaddi, Hockey, Tennis, Badminton**: Manual JSON updates

---

## Free Sports Data APIs

### Cricket
```
CricketData.com API
Endpoint: https://cricketapi.cricketdata.com/matches
Free: 100 requests/day
```

### Football
```
Football-Data.org
Endpoint: https://www.football-data.org/competitions
Free: 10 requests/minute (no key needed)
```

### Tennis
```
Tennis-Explorer (RapidAPI)
~$1-5/month
```

### General Sports
```
SofaScore API (undocumented but works)
MySportsFeeds (paid)
ESPN (scraping required)
```

---

## Complete Example: Cricket API Integration

```javascript
// In server.js

app.get('/api/matches/cricket', async (req, res) => {
  try {
    const response = await axios.get(
      'https://api.example.com/cricket/matches',
      {
        headers: { 'X-API-Key': process.env.CRICKET_API_KEY }
      }
    );
    
    // Transform data to our format
    const matches = response.data.map(match => ({
      league: match.series_name,
      team1: match.team1.name,
      team2: match.team2.name,
      status: match.status_text,
      score1: match.team1.score,
      score2: match.team2.score
    }));
    
    res.json(matches);
  } catch (error) {
    res.json([]); // Return empty if API fails
  }
});
```

```html
<!-- In index.html, inside hero section -->

<script>
  // Fetch and update cricket card
  fetch('/api/matches/cricket')
    .then(res => res.json())
    .then(matches => {
      if (matches.length > 0) {
        const match = matches[0];
        document.querySelector('[data-sport="cricket"]').innerHTML = `
          <div class="card__league">${match.league}</div>
          <div class="card__teams">
            ${match.team1} <span class="card__vs">vs</span> ${match.team2}
          </div>
          <div class="card__time">
            <span>${match.status}</span>
          </div>
          <div style="margin-top:0.8rem;font-size:0.85rem;color:var(--blue-hi)">
            ${match.score1 || '-'} vs ${match.score2 || '-'}
          </div>
        `;
      }
    })
    .catch(console.error);
</script>
```

---

## Quick Setup (15 minutes)

1. **Get API key** from Football-Data.org (free, no signup needed)
2. **Add to `server.js`**:
   ```javascript
   app.get('/api/matches', async (req, res) => {
     const matches = await fetch('https://www.football-data.org/competitions/PL/matches?status=LIVE');
     res.json(await matches.json());
   });
   ```
3. **Add to `index.html`** in hero section:
   ```javascript
   fetch('/api/matches')
     .then(r => r.json())
     .then(data => {
       // Update football card with live data
     });
   ```
4. **Test** at http://localhost:3000

---

## Automatic Refresh

Add auto-refresh every 30 seconds:

```javascript
// In index.html

setInterval(() => {
  fetch('/api/matches/cricket')
    .then(res => res.json())
    .then(data => {
      // Update cards with new data
    });
}, 30000); // Refresh every 30 seconds
```

---

## What You Should Do This Week

1. **Sign up** for Football-Data.org (free) and Cricket API of your choice
2. **Add 1 API endpoint** to `server.js` for football or cricket
3. **Test** with hardcoded data first, then real API data
4. **For other sports** (Kabaddi, Hockey, etc.), use manual JSON updates for now

This way you have LIVE football and cricket, and can update other sports as needed.

---

**Questions?** Test locally first at http://localhost:3000, then deploy!
