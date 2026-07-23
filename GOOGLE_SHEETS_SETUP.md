# Google Sheets Lead Capture Setup (5 minutes, no coding)

Your site is now 100% static HTML — no server, no database, no Node.js needed.
Every signup gets written straight into a Google Sheet you own.

## Step 1: Create the Sheet

1. Go to sheets.google.com → create a new blank sheet
2. Name it "Livescore Alerts Leads"
3. In row 1, add these headers: `Timestamp | Phone | Sports | Language`

## Step 2: Add the Script

1. In your Sheet, click **Extensions → Apps Script**
2. Delete any placeholder code and paste this:

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  sheet.appendRow([
    new Date(),
    data.phone || '',
    (data.sports || []).join(', '),
    data.language || 'mr'
  ]);
  return ContentService
    .createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. Click the **Save** icon (disk icon), name the project "Leads Webhook"

## Step 3: Deploy as Web App

1. Click **Deploy → New deployment**
2. Click the gear icon next to "Select type" → choose **Web app**
3. Fill in:
   - Description: `Leads webhook`
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Click **Deploy**
5. Click **Authorize access** → choose your Google account → click **Advanced** → **Go to Leads Webhook (unsafe)** → **Allow**
   (This warning is normal — it's your own script, on your own account.)
6. Copy the **Web app URL** it gives you (looks like `https://script.google.com/macros/s/AKfycb.../exec`)

## Step 4: Paste the URL into index.html

1. Open `index.html`
2. Find this line near the top of the `<script>` section:
   ```javascript
   var SHEET_WEBHOOK_URL = 'PASTE_YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
   ```
3. Replace the placeholder with your copied URL:
   ```javascript
   var SHEET_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycb.../exec';
   ```
4. Save and re-upload `index.html` to Namecheap

## Step 5: Test it

1. Visit your live site, submit the form with a test number
2. Check your Google Sheet — a new row should appear within a second or two

## Notes

- **No server needed.** Just upload the static files (index.html, privacy.html, terms.html, how-it-works.html, thanks.html, fonts/) to `public_html` directly — no `/livescore` subfolder, no Node.js App setup required in Namecheap.
- If you ever redeploy the Apps Script (edit the code), you must do **Deploy → Manage deployments → Edit (pencil) → New version → Deploy** for changes to go live — the URL stays the same.
- To view/export leads any time, just open the Google Sheet directly, or File → Download → CSV.
