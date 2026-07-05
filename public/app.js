// app.js — wires up the dashboard: live clock, live metrics, live orders grid,
// the Save button (which triggers the intentional bug in saveHandler.js), and
// the Secure Report button (which triggers a real 401 from the API).

let knownOrderIds = new Set();

// ── Live clock ────────────────────────────────────────────────────────────────
function tickClock() {
  document.querySelector("#clock").textContent = new Date().toLocaleTimeString();
}

// ── Live metrics (polls every 2s) ─────────────────────────────────────────────
async function refreshMetrics() {
  try {
    const m = await apiGet("/api/metrics");
    document.querySelector("#m-opm").textContent = m.ordersPerMin;
    document.querySelector("#m-rev").textContent = "$" + m.revenue.toLocaleString();
    document.querySelector("#m-users").textContent = m.activeUsers;
    document.querySelector("#m-open").textContent = m.openOrders;
    document.querySelector("#m-time").textContent = m.serverTime;
  } catch (err) {
    console.error("metrics refresh failed", err);
  }
}

// ── Live orders grid (polls every 5s) ─────────────────────────────────────────
async function refreshOrders() {
  try {
    const data = await apiGet("/api/orders");
    const body = document.querySelector("#orders-body");
    document.querySelector("#orders-count").textContent = data.count + " orders";
    body.innerHTML = "";
    for (const o of data.orders) {
      const isNew = !knownOrderIds.has(o.id);
      knownOrderIds.add(o.id);
      const tr = document.createElement("tr");
      if (isNew && knownOrderIds.size > data.orders.length) tr.className = "new";
      tr.innerHTML =
        `<td>#${o.id}</td><td>${o.customer}</td><td>${o.item}</td>` +
        `<td>${o.qty}</td><td><span class="badge ${o.status}">${o.status}</span></td>`;
      body.appendChild(tr);
    }
  } catch (err) {
    console.error("orders refresh failed", err);
  }
}

// ── Secure report button (triggers a real 401) ────────────────────────────────
async function loadSecureReport() {
  const hint = document.querySelector("#report-hint");
  hint.className = "hint";
  hint.textContent = "Loading report…";
  try {
    // NOTE: we deliberately send no Authorization header, so this 401s.
    const report = await apiGet("/api/secure-report");
    hint.className = "hint ok";
    hint.textContent = report.report;
  } catch (err) {
    hint.className = "hint err";
    hint.textContent = `Report failed (${err.status || "error"}): ${err.message}`;
  }
}

// ── Wire everything up ────────────────────────────────────────────────────────
function init() {
  document.querySelector("#save-btn").addEventListener("click", saveNewOrder);
  document.querySelector("#report-btn").addEventListener("click", loadSecureReport);

  tickClock();
  refreshMetrics();
  refreshOrders();

  setInterval(tickClock, 1000);
  setInterval(refreshMetrics, 2000);
  setInterval(refreshOrders, 5000);
}

document.addEventListener("DOMContentLoaded", init);
