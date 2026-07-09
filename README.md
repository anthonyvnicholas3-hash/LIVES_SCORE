# LiveScore Alerts — Landing Page

Landing page for free live cricket & football score alerts via SMS and WhatsApp.

Available in **English, Hindi and Marathi** — visitors pick a language from a
first-visit popup or the switcher in the header, and the choice is remembered
(localStorage) across visits. All copy lives in the `I18N` dictionary at the
bottom of `index.html`.

## Run it

A single static page — no build step, no dependencies. Fonts (Big Shoulders
Display, Archivo, IBM Plex Mono, plus Teko and Mukta for Devanagari) are
self-hosted in `fonts/`, so the page renders identically offline and without
any third-party requests:

```sh
open index.html          # macOS
# or serve it:
python3 -m http.server 8000
```

To deploy, upload `index.html` and the `fonts/` folder to any static host.

## How subscribing works

There is no form. The Subscribe button links out to ESPNcricinfo's SMS
alerts sign-up page:

https://www.espncricinfo.com/ci/content/site/tweetviasms

To point it somewhere else later, change that URL on the subscribe section's
button in `index.html` (and the `sublede` copy in the `I18N` dictionary if
the wording should change).
