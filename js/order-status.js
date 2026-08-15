/**
 * Polls /api/order-status for the ref in the URL and reflects it onto the
 * 3-step tracker. Payment confirmation and the Merchize handoff both happen
 * asynchronously via webhook, so the page may load a few seconds ahead of
 * the backend catching up — hence the short poll rather than a single fetch.
 */

(function () {
  "use strict";

  var params = new URLSearchParams(window.location.search);
  var ref = params.get("ref");

  var refEl = document.getElementById("tyco-ref");
  var stepPaid = document.getElementById("step-paid");
  var stepFulfil = document.getElementById("step-fulfil");
  var stepShipped = document.getElementById("step-shipped");
  var trackingEl = document.getElementById("tyco-tracking");

  if (!ref) {
    if (refEl) refEl.textContent = "No order reference found.";
    return;
  }
  refEl.textContent = "Order " + ref;

  function setStep(el, state) {
    el.classList.remove("is-done", "is-active");
    if (state) el.classList.add(state);
  }

  function render(order) {
    if (!order) return;

    if (order.revolutStatus === "paid") setStep(stepPaid, "is-done");
    else setStep(stepPaid, "is-active");

    if (order.merchizeStatus) setStep(stepFulfil, "is-done");
    else if (order.revolutStatus === "paid") setStep(stepFulfil, "is-active");
    else setStep(stepFulfil, null);

    var shipped = order.merchizeStatus && /ship/i.test(order.merchizeStatus);
    if (shipped) setStep(stepShipped, "is-done");
    else if (order.merchizeStatus) setStep(stepShipped, "is-active");
    else setStep(stepShipped, null);

    if (order.trackingNumber) {
      trackingEl.innerHTML = order.trackingUrl
        ? 'Tracking: <a href="' + order.trackingUrl + '" target="_blank" rel="noopener">' + order.trackingNumber + "</a>"
        : "Tracking: " + order.trackingNumber;
    }
  }

  var attempts = 0;
  function poll() {
    attempts += 1;
    fetch("/api/order-status?ref=" + encodeURIComponent(ref))
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (order) {
        render(order);
        if (attempts < 10 && (!order || !order.merchizeStatus)) {
          setTimeout(poll, 3000);
        }
      })
      .catch(function () {});
  }

  poll();
})();
