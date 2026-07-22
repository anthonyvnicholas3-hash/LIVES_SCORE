# Livescore Alerts — Deployment Guide

Complete step-by-step guide to take the Livescore Alerts platform live.

## Quick Start (Local Testing)

```bash
# Install dependencies
npm install

# Start server (development mode)
npm start

# Server runs at http://localhost:3000
# Database automatically created at ./leads.db
```

Test the platform:
- Open http://localhost:3000 in your browser
- Try subscribing via sticky header form
- Check the bottom form after scrolling
- Exit popup appears when mouse leaves window (desktop)
- Verify POST to /api/subscribe works

View leads:
```bash
node check-db.js
```

---

## Production Deployment

### Step 1: Choose Hosting Platform

#### **Option A: Heroku** (Recommended for beginners)

✅ Zero configuration  
✅ Automatic HTTPS  
✅ Easy rollback  
❌ $5–7/month minimum

**Steps:**
```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

heroku login
heroku create livescore-alerts-app
git push heroku main

# Check logs
heroku logs --tail

# Your site is live at https://livescore-alerts-app.herokuapp.com
```

---

#### **Option B: Railway.app** (Modern, flexible)

✅ Free tier available  
✅ Easy deployments  
✅ Environment variables UI  
❌ Less mature than Heroku

**Steps:**
1. Sign up at https://railway.app
2. Connect GitHub repo
3. Railway auto-detects Node.js from package.json
4. Environment variables can be set in Railway dashboard
5. Deploy runs automatically on git push

---

#### **Option C: DigitalOcean App Platform** (Balance of price & control)

✅ Affordable ($5/month)  
✅ Scalable  
✅ GitHub integration  
❌ Slightly more config

**Steps:**
```bash
# Push repo to GitHub
git remote add origin https://github.com/user/lives-score.git
git push -u origin main

# Go to app.digitalocean.com
# Click "Create" → "App"
# Connect GitHub repo
# Select Node.js auto-detection
# Set ENVIRONMENT: production
# Deploy
```

---

#### **Option D: Self-Hosted VPS** (Most control)

✅ Full control  
✅ Cheapest at scale  
❌ More setup required

**Provider**: DigitalOcean, Linode, AWS EC2, Vultr (~$4–6/month)

**Setup:**

```bash
# 1. SSH into server
ssh root@your-vps-ip

# 2. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install PM2 (process manager)
sudo npm install -g pm2

# 4. Clone repository
cd /home/ubuntu
git clone https://github.com/user/lives-score.git
cd lives-score

# 5. Install + start
npm install --production
pm2 start server.js --name livescore
pm2 startup
pm2 save

# 6. Install nginx (reverse proxy)
sudo apt-get install -y nginx

# 7. Configure nginx (create /etc/nginx/sites-available/livescore)
sudo nano /etc/nginx/sites-available/livescore
```

**Nginx config:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# 8. Enable site + test
sudo ln -s /etc/nginx/sites-available/livescore /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 9. Enable HTTPS with Let's Encrypt
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com

# 10. Auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

---

### Step 2: Custom Domain

1. **Buy domain**: Namecheap, GoDaddy, Google Domains (~$10/year)
2. **Point to your host**:
   - Heroku: Add CNAME record to your domain's DNS
   - DigitalOcean: Create A record pointing to app IP
   - VPS: Point A record to server IP
3. **Enable HTTPS**: Let's Encrypt (free, automatic on most platforms)

Example: To use `prolivescore.site`:
- Buy domain at registrar
- Update nameservers OR point DNS records to your hosting provider
- Add domain in Heroku/Railway/DigitalOcean dashboard
- HTTPS certificate auto-issued

---

### Step 3: Environment Configuration

Create `.env` file in project root (NOT committed to git):

```
NODE_ENV=production
PORT=3000
DATABASE_PATH=./leads.db
```

Update `server.js` to use:
```javascript
const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DATABASE_PATH || './leads.db';
```

---

### Step 4: Database Backup Strategy

**SQLite limitations**: Single file, not ideal for production at scale.

**Backup option 1: Regular exports (simple)**
```bash
# Backup leads.db daily
0 2 * * * cd /path/to/app && cp leads.db leads.db.backup.$(date +\%Y\%m\%d)
```

**Backup option 2: PostgreSQL upgrade (recommended)**

When ready to scale, migrate from SQLite to PostgreSQL:

```bash
npm install pg
```

Update server.js:
```javascript
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});
```

Deploy on platform that offers free PostgreSQL:
- **Railway.app**: Free PostgreSQL included
- **Heroku**: Heroku Postgres add-on
- **DigitalOcean**: Managed Postgres ($15/month)

---

### Step 5: Monitoring & Logging

**Basic monitoring:**
```bash
# Check server health
curl https://yourdomain.com/health
# {"status":"ok"}

# Check subscriber count
curl https://yourdomain.com/api/stats
# {"total_subscribers": 1250}
```

**Advanced options:**
- **Sentry**: Error tracking (free tier)
- **Loggly**: Centralized logs ($10/month)
- **New Relic**: Performance monitoring (free tier)

---

### Step 6: Integrate with SMS/WhatsApp

Once you have real leads, integrate with gateways:

#### **Twilio** (SMS + WhatsApp)
```bash
npm install twilio
```

```javascript
const twilio = require('twilio');
const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// Send SMS
client.messages.create({
  body: 'Your cricket alert here',
  from: '+1234567890',
  to: phone
});

// Send WhatsApp (requires WhatsApp Business API setup)
client.messages.create({
  body: 'Your alert here',
  from: 'whatsapp:+1234567890',
  to: 'whatsapp:' + phone
});
```

#### **Gupshup** (SMS for India)
```bash
npm install axios
```

```javascript
const axios = require('axios');

axios.post('https://api.gupshup.io/sm/api/v1/msg/send/plain', 
  { phone, message, channel: 'SMS' },
  { headers: { 'apikey': GUPSHUP_API_KEY } }
);
```

#### **WhatsApp Business API** (Official)
- Register at https://business.facebook.com
- Create WhatsApp Business account
- Phone number verification
- Message templates approval
- Use official `whatsapp-business-cloud-api` package

---

### Step 7: Privacy & Compliance

Before going live, ensure:

- ✅ **Privacy Policy**: `/privacy.html` (already included)
- ✅ **Terms of Use**: `/terms.html` (already included)
- ✅ **GDPR compliance**: Users can unsubscribe (STOP reply)
- ✅ **Data retention**: Store only what's needed (phone, timestamp, language)
- ✅ **Contact email**: Updated in terms.html & privacy.html
- ✅ **SMS opt-in**: Comply with TCPA/DND requirements for your region

India-specific (if targeting India):
- TRAI Do Not Call registry: Respect DND list
- WhatsApp Business API: Complete WhatsApp Business Profile approval

---

## Troubleshooting

### Issue: 502 Bad Gateway (Heroku)
**Solution:** App crashed. Check logs:
```bash
heroku logs --tail
npm start # Test locally first
git push heroku main
```

### Issue: Database locked
**Solution:** Multiple Node processes fighting over SQLite. Use process manager (PM2) or upgrade to PostgreSQL.

### Issue: Forms timeout / 504 Gateway Timeout
**Solution:** API endpoint too slow. Check:
```bash
# Local test
curl -X POST http://localhost:3000/api/subscribe -d '{"phone":"+919876543210"}'

# Add response time logging to server.js
app.post('/api/subscribe', (req, res) => {
  console.time('subscribe');
  // ... code ...
  console.timeEnd('subscribe');
});
```

### Issue: CORS errors in browser
**Solution:** Ensure `cors()` middleware is enabled in server.js (already there).

---

## Scaling Considerations

### When to upgrade:

| Metric | Action |
|--------|--------|
| **1K+ subscribers** | Migrate to PostgreSQL, add backup strategy |
| **10K+ daily requests** | Add Redis caching, CDN for static assets |
| **50K+ subscribers** | Multi-region deployment, load balancer |
| **Real-time scores** | WebSocket server, Kafka queue for notifications |

### Next integrations:
1. Admin dashboard (`/admin`) to view/export leads
2. Automated SMS sends (queue system + SMS gateway)
3. WhatsApp Business integration (two-way chat)
4. Analytics dashboard (lead source, conversion rates)
5. A/B testing for CTA copy & form placement

---

## Support & Monitoring Checklist

- [ ] Monitor `/api/stats` daily (trending subscriber growth)
- [ ] Backup database weekly
- [ ] Test SMS/WhatsApp gateway monthly
- [ ] Update contact email if business address changes
- [ ] Monitor error logs for API failures
- [ ] Review security patches for dependencies

---

**© 2026 Livescore Alerts. All rights reserved.**

For questions: `feedback@prolivescore.site`
