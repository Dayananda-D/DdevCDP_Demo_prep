// saveHandler.js — handles saving a new order.
//
// ⚠️ INTENTIONAL BUG (for the devcdp demo):
// collectFormData() never sets a `customer` property, but saveNewOrder()
// reads `formData.customer.id`. That throws:
//     TypeError: Cannot read properties of undefined (reading 'id')
// The console shows WHERE it breaks; only a breakpoint here shows WHY
// (formData.customer is undefined). This is the star of the live demo.

// Reads the form fields into a plain object.
function collectFormData() {
  const data = {
    item: document.querySelector("#f-item").value,
    qty: document.querySelector("#f-qty").value,
    // NOTE: the selected customer is intentionally NOT collected here.
    // (In a real bug, someone renamed the field and forgot this line.)
  };
  return data;
}

// Builds the payload the API expects and sends it.
function saveNewOrder() {
  const hint = document.querySelector("#save-hint");
  hint.className = "hint";
  hint.textContent = "Saving…";

  const formData = collectFormData();

  // ⚠️ BUG LINE: formData.customer is undefined, so reading .id throws.
  const payload = {
    item: formData.item,
    qty: Number(formData.qty),
    customerId: formData.customer.id,
  };

  postOrder(payload, hint);
}

// Sends the order to the server and reports the result.
async function postOrder(payload, hint) {
  try {
    const result = await apiPost("/api/orders", payload);
    hint.className = "hint ok";
    hint.textContent = `Saved order #${result.order.id}`;
  } catch (err) {
    hint.className = "hint err";
    hint.textContent = "Could not save order.";
  }
}
