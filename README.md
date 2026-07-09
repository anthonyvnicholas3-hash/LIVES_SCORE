# LiveScore Alerts — Landing Page

Landing page for free live cricket & football score alerts via SMS and WhatsApp.

## Run it

It's a single static file — no build step, no dependencies:

```sh
open index.html          # macOS
# or serve it:
python3 -m http.server 8000
```

## Where sign-ups go

Form submissions are saved as rows in a Google Sheet you own, via a small
Google Apps Script webhook (`google-apps-script/Code.gs`). Until you complete
the one-time setup below, the form runs in **demo mode**: it validates and
shows the success screen, but nothing is saved.

### One-time setup (~5 minutes)

1. Go to [sheets.new](https://sheets.new) and create a blank spreadsheet.
   Name it e.g. **LiveScore Sign-ups**.
2. In the sheet, open **Extensions → Apps Script**.
3. Delete the placeholder code and paste in the full contents of
   [`google-apps-script/Code.gs`](google-apps-script/Code.gs). Save.
4. Click **Deploy → New deployment**, choose type **Web app**, and set:
   - *Execute as*: **Me**
   - *Who has access*: **Anyone**
5. Click **Deploy**, authorize when prompted, and copy the **Web app URL**
   (it looks like `https://script.google.com/macros/s/…/exec`).
6. In `index.html`, find this line near the bottom and paste your URL in:

   ```js
   var SHEETS_WEBHOOK_URL = 'PASTE_YOUR_APPS_SCRIPT_URL_HERE';
   ```

That's it. Each sign-up appends a row with timestamp, name, phone, chosen
channels (WhatsApp/SMS) and match preference to the **Sign-ups** tab of your
sheet. To verify, submit the form once and check the sheet.

> Note: "Anyone" access means the URL accepts anonymous POSTs — that's what
> lets a public landing page write to it. The sheet itself stays private to
> your Google account. If you later update `Code.gs`, redeploy via
> **Deploy → Manage deployments → Edit → New version**, or the change won't
> go live.

### Sending the actual alerts

Collecting numbers is step one; sending live scores needs an SMS/WhatsApp
provider (Twilio, Gupshup, WhatsApp Business API, MSG91, …). When you pick
one, the subscriber list can be read straight out of the Google Sheet or
exported as CSV.
