// devcdp-demo — a tiny Express app that serves a live dashboard and a few API
// endpoints. It exists purely to demonstrate the devcdp debugging MCP, so it
// includes REAL, RELIABLE bugs (see README.md) that devcdp can find live.

const express = require("express");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;

// ─── In-memory "database" ──────────────────────────────────────────────────────
const CUSTOMERS = ["Acme Corp", "Globex", "Initech", "Umbrella", "Soylent", "Stark Ind."];
const ITEMS     = ["Widget A", "Gearbox", "Bearing Set", "Control Panel", "Sensor Kit", "Motor Unit"];

let orders = [];
let orderSeq = 1000;

function makeOrder() {
  orderSeq += 1;
  return {
    id: orderSeq,
    customer: CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)],
    item: ITEMS[Math.floor(Math.random() * ITEMS.length)],
    qty: 1 + Math.floor(Math.random() * 40),
    status: Math.random() > 0.5 ? "Open" : "Shipped",
    ts: new Date().toISOString(),
  };
}

// Seed a few orders, then add a new one every 5s so the grid is genuinely "live".
for (let i = 0; i < 6; i++) orders.push(makeOrder());
setInterval(() => {
  orders.push(makeOrder());
  if (orders.length > 40) orders = orders.slice(-40);
}, 5000);

// ─── Realtime metrics (changes on every call) ──────────────────────────────────
app.get("/api/metrics", (req, res) => {
  const now = Date.now();
  res.json({
    ordersPerMin: 40 + Math.floor(Math.random() * 25),
    revenue: 12000 + Math.floor(Math.random() * 4000),
    activeUsers: 60 + Math.floor(Math.random() * 30),
    openOrders: orders.filter((o) => o.status === "Open").length,
    serverTime: new Date(now).toLocaleTimeString(),
  });
});

// ─── Orders list (grows over time → live grid) ─────────────────────────────────
app.get("/api/orders", (req, res) => {
  res.json({ count: orders.length, orders: [...orders].reverse() });
});

// ─── New order (called by the Save flow — note the client-side bug hits first) ──
app.post("/api/orders", (req, res) => {
  const { item, qty, customerId } = req.body || {};
  const order = { id: ++orderSeq, customer: customerId || "Unknown", item, qty, status: "Open", ts: new Date().toISOString() };
  orders.push(order);
  res.status(201).json({ saved: true, order });
});

// ─── Secure report — intentionally returns 401 unless a token is sent ──────────
// Used to demo the "blank screen because the API is failing" / auth scenario.
app.get("/api/secure-report", (req, res) => {
  const auth = req.headers["authorization"];
  if (!auth) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Missing bearer token. The report API requires authentication.",
    });
  }
  res.json({ report: "Q3 revenue up 12%", generatedAt: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`devcdp-demo running →  http://localhost:${PORT}`);
  console.log("Open this URL in the debug-chrome window, then let devcdp debug it.");
});
