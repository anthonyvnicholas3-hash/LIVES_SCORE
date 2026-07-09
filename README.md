# LiveScore Alerts — Landing Page

Landing page for free live cricket & football score alerts via SMS and WhatsApp.

## Run it

Static files only — no build step, no dependencies. Fonts (Big Shoulders
Display, Archivo, IBM Plex Mono) are self-hosted in `fonts/`, so the pages
render identically offline and without any third-party requests:

```sh
open index.html          # macOS
# or serve it:
python3 -m http.server 8000
```

## Where sign-ups go

Nowhere, by design (for now). The form validates the visitor's input
client-side and then redirects to `thanks.html` — a styled thank-you page.
No data is stored or sent to any server.

When you're ready to actually collect subscribers, replace the
`window.location.href='thanks.html'` line at the bottom of `index.html`
with a POST to your backend or form service (Google Sheets via Apps
Script, Formspree, or your own API + SMS/WhatsApp gateway like Twilio or
Gupshup), keeping the redirect as the success step.
