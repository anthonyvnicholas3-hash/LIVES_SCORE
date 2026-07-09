# LiveScore Alerts — Landing Page

Landing page for free live cricket & football score alerts via SMS and WhatsApp.

## Run it

It's a single static file — no build step, no dependencies:

```sh
open index.html          # macOS
# or serve it:
python3 -m http.server 8000
```

## Hooking up the form

The subscribe form currently validates input client-side and shows a success
state. To wire it to a real backend, replace the `TODO` block in the inline
script at the bottom of `index.html` with a `fetch()` POST to your
subscription endpoint / SMS gateway (Twilio, Gupshup, WhatsApp Business API,
etc.).
