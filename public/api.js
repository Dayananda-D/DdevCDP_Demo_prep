// api.js — tiny fetch helpers used by the dashboard.
// Kept separate and readable so devcdp can set breakpoints here too.

async function apiGet(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) {
    // Throw with the status so callers can show a meaningful message.
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.message || `Request failed: ${res.status}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return res.json();
}

async function apiPost(url, data) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}
