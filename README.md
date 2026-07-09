# LiveScore Alerts — Landing Page

Landing page for free live cricket & football score alerts via SMS and WhatsApp.

Available in **English, Hindi and Marathi** — visitors pick a language from a
first-visit popup or the switcher in the header, and the choice is remembered
(localStorage) across visits. All copy lives in the `I18N` dictionary at the
bottom of `index.html`.

## Run it

A single static page — no build step, no dependencies. Fonts are self-hosted
in `fonts/`, so the page renders identically offline and without any
third-party requests. Typography: **Syne** (display, from the Awwwards free
fonts collection, SIL OFL) with **Epilogue** for body text and IBM Plex Mono
for scores/labels; Hindi and Marathi render in **Baloo 2** and **Mukta**.

```sh
open index.html          # macOS
# or serve it:
python3 -m http.server 8000
```

To deploy, upload the four HTML pages and the `fonts/` folder to any static
host. Alongside `index.html` there are three info pages, all trilingual and
linked from the footer (needed for Meta/WhatsApp Business review):

- `how-it-works.html`
- `terms.html`
- `privacy.html`

**Before going live**, replace the placeholder contact address
`support@yourdomain.com` in `terms.html` and `privacy.html` (it appears in
all three language versions in each file) with your real support email.

## How subscribing works

The subscribe form asks for a mobile number only. It validates the number
client-side and redirects to `thanks.html` — **no data is stored or sent
anywhere**. When you are ready to collect real subscribers, replace the
`window.location.href='thanks.html'` line at the bottom of `index.html` with
a POST to your backend or SMS/WhatsApp gateway, keeping the redirect as the
success step.
