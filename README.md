# LiveScore Alerts — Platform

Comprehensive landing page platform for free live cricket & football score alerts via SMS and WhatsApp with lead capture backend.

**Trilingual support**: English, Hindi, and Marathi with localStorage persistence. Language picker available on first visit and in header.

## Architecture

### Frontend
- **Zero external dependencies**: All fonts self-hosted (Syne, Baloo 2, Epilogue, IBM Plex Mono, Mukta)
- **Three form CTAs**: Header sticky form, main signup section, bottom engagement panel, plus exit-intent popup
- **Mobile-optimized**: Responsive design with touch-friendly inputs, optimized for 320px–1440px screens
- **Client-side validation**: Phone regex (10–15 digits) with visual error states
- **Language-aware typography**: Devanagari fonts with adjusted leading for matras

### Backend
- **Node.js + Express**: Lightweight async HTTP server
- **SQLite database**: Stores phone numbers, language preference, timestamp, subscription status
- **CORS-enabled**: Safe cross-origin requests from frontend
- **API-first**: RESTful `/api/subscribe` endpoint with validation

### Infrastructure
- Static HTML/CSS/JS frontend (can be deployed to CDN or static host)
- Node.js server handles form submissions and database writes
- SQLite keeps all lead data local (can be backed up or migrated to PostgreSQL)

## Installation & Setup

### Prerequisites
- Node.js 14+ and npm

### Local Development

```bash
# Install dependencies
npm install

# Start server (runs on http://localhost:3000)
npm start

# Server will:
# 1. Create leads.db automatically
# 2. Serve index.html and static assets
# 3. Listen on POST /api/subscribe
# 4. Expose GET /api/stats for monitoring
```

Open http://localhost:3000 in your browser.

## Subscription Flow

1. **User enters phone number** in sticky header, main form, or exit-intent popup
2. **Frontend validates** locally (regex: `^\+?\d{10,15}$`)
3. **Frontend POSTs** to `/api/subscribe` with phone + language headers
4. **Backend validates** again (defense in depth)
5. **Backend inserts** into `leads` table with timestamp
6. **User redirected** to `thanks.html` confirmation page

Duplicate phone numbers are handled gracefully (treated as success for UX).

## Database Schema

```sql
CREATE TABLE leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  language TEXT DEFAULT 'en',
  source TEXT DEFAULT 'web',
  status TEXT DEFAULT 'pending'
);
```

**Columns**:
- `phone`: Cleaned phone number (digits + optional country code)
- `language`: Detected from browser `Accept-Language` header (en/hi/mr)
- `source`: Always 'web' for now (ready for SMS/API integrations later)
- `status`: 'pending' → 'verified' (for SMS confirmation) → 'active'

## Deployment

### Option 1: Heroku (Recommended)

```bash
# Install Heroku CLI, then:
heroku create livescore-alerts
git push heroku main
heroku logs --tail
```

Heroku automatically runs `npm install` and starts the server via `npm start`.

### Option 2: Railway.app

1. Fork/push repo to GitHub
2. Connect repo to Railway
3. Set `Node.js` environment
4. Railway auto-detects `package.json` and deploys
5. URL assigned (e.g., `https://livescore-alerts-prod.railway.app`)

### Option 3: Self-Hosted (VPS)

```bash
# SSH into server
ssh user@example.com

# Clone repo
git clone https://github.com/user/livescore-alerts.git
cd livescore-alerts

# Install + run with process manager (pm2)
npm install
npm install -g pm2
pm2 start server.js --name livescore
pm2 startup
pm2 save

# Point domain to server IP, configure nginx reverse proxy
```

### Option 4: Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

Build and push to Docker Hub or use with docker-compose.

## API Reference

### POST `/api/subscribe`

**Request**:
```json
{
  "phone": "+91 98765 43210"
}
```

**Response** (Success):
```json
{
  "success": true,
  "message": "Subscribed successfully",
  "id": 42
}
```

**Response** (Invalid):
```json
{
  "success": false,
  "error": "Invalid phone number"
}
```

**Response** (Duplicate):
```json
{
  "success": true,
  "message": "Already subscribed"
}
```

### GET `/api/stats`

Returns subscriber count (no auth required, but should be protected in production).

```json
{
  "total_subscribers": 1250
}
```

### GET `/health`

Health check endpoint for load balancers.

## Pages

### `index.html` (Main Landing)
- Hero section with brand, value props, and live phone mockup
- Today's matches grid (4 cards: cricket + football)
- Sticky top form (always accessible)
- Main signup section (after fixtures)
- Bottom engagement form (before footer)
- Exit-intent popup (mouse leave / scroll near bottom)
- Multilingual footer with links to info pages

### `thanks.html`
- Success confirmation page
- Trophy icon + "You're on the team sheet" headline
- 3-step next steps: watch phone, ball-by-ball, reply STOP
- Back to home button

### `how-it-works.html`
- 4-step process explanation
- Coverage info (cricket leagues, football tournaments)
- Cost breakdown (free, no spam, STOP to unsubscribe)
- All trilingual

### `terms.html` + `privacy.html`
- Legal compliance for Meta/WhatsApp Business API review
- Email: `feedback@prolivescore.site` (update all 6 instances if changed)
- All 3 language versions included

## Customization

### Change Contact Email

Email appears in 6 locations (3 each in terms.html and privacy.html):
```bash
sed -i 's/feedback@prolivescore\.site/your-email@example.com/g' terms.html privacy.html
```

### Adjust Color Palette

Edit CSS variables at top of `index.html`:
```css
:root {
  --bg: #070d26;        /* deep navy background */
  --blue: #2e63ff;      /* primary brand blue */
  --wa: #25c05f;        /* WhatsApp green */
  --sms: #3d8bff;       /* SMS blue */
  /* ... more colors */
}
```

### Add New Fixtures

Edit `I18N.en.ticker` array in script section. Repeat for Hindi/Marathi.

## Next Steps (Integration Ready)

The backend is designed to hand off to these services:

1. **SMS Gateway** (Twilio, Gupshup, Netcore): Replace `/api/subscribe` logic with gateway call
2. **WhatsApp Business API**: Queue phone number for WhatsApp verification
3. **CRM/Email**: Post leads to Zapier, Make, or native webhook
4. **Analytics**: Add event tracking (Google Analytics, Mixpanel)
5. **Admin Dashboard**: Add `/admin` protected panel to view leads, export CSV, manage subscriptions

## Monitoring & Debugging

```bash
# View subscriber count
curl http://localhost:3000/api/stats

# View database directly
sqlite3 leads.db "SELECT * FROM leads ORDER BY created_at DESC LIMIT 10;"

# Check server logs
pm2 logs livescore
```

## Contact & Support

Email: `feedback@prolivescore.site`

---

**© 2026 Livescore Alerts. All rights reserved.**
