# devcdp-demo

A small demo web app with **live data** and a couple of **intentional, reliable bugs** — built to demonstrate the **devcdp** debugging MCP during the team session.

It's a fake "Nimbus Ops — Orders Dashboard": live metrics that update every 2 seconds, an orders grid that grows every few seconds, a New Order form, and a Secure Report button.

---

## Run it

```
cd C:\Users\dd\Project\devcdp-demo
npm install
npm start
```

Then open **http://localhost:3000** — importantly, open it in the **debug-chrome** window (the one launched by `debug-chrome.bat`, on port 9222), so devcdp can attach.

---

## What's live (the "realtime data")

- **Metrics cards** poll `/api/metrics` every 2s — numbers change each time.
- **Live Orders grid** polls `/api/orders` every 5s — a new order appears on its own every ~5s (new rows flash).
- **Clock** ticks every second.

This gives you real, moving network traffic to show in the demo.

---

## The staged bugs (what to demo)

### Bug 1 — "Save Order does nothing" (the star of the demo)
Click **Save Order**. Nothing happens (it silently fails). In `public/saveHandler.js`, `collectFormData()` never sets a `customer`, but `saveNewOrder()` reads `formData.customer.id` → `TypeError: Cannot read properties of undefined (reading 'id')`.

- The **console** shows *where* it breaks.
- A **breakpoint** in `saveHandler.js` shows *why*: `formData.customer` is `undefined`.

**Demo prompt to Claude:**
> "Connect to my browser and debug why the Save Order button does nothing. Find the exact line."

### Bug 2 — "Secure Report fails" (the network / auth scenario)
Click **Load Secure Report**. It fails. `/api/secure-report` returns **401 Unauthorized** because the client sends no bearer token. Great for showing devcdp read a real failed request + response body.

**Demo prompt to Claude:**
> "The Secure Report button isn't working. Check the network and tell me why."

### (Optional) Live network
Just point out the repeating `/api/metrics` and `/api/orders` calls in devcdp's network view to show it seeing live traffic.

---

## Files

```
devcdp-demo/
  server.js              Express server: static files + API + live data
  public/
    index.html           the dashboard
    styles.css           styling
    api.js               fetch helpers
    saveHandler.js       ← Bug 1 lives here (readable, breakpoint-friendly)
    app.js               wiring: clock, metrics, orders, buttons
  README.md
```

Scripts are plain and unbundled on purpose, so breakpoints land on real, readable lines during the demo.
