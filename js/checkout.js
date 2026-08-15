/**
 * Tyco checkout — renders the order ticket from the ?product= query param,
 * collects shipping details, calls /api/create-order, then mounts Revolut's
 * embedded Checkout widget to take payment. Display copy only; price and
 * Merchize routing are re-resolved server-side from lib/products.js.
 */

(function () {
  "use strict";

  var PRODUCTS = {
    "tyco-tee-classic": {
      name: "Classic Tee",
      priceDisplay: "$35.00",
      image: "../assets/img/shop/tee-classic.jpg",
      variants: [
        { code: "S", label: "S" },
        { code: "M", label: "M" },
        { code: "L", label: "L" },
        { code: "XL", label: "XL" }
      ]
    },
    "tyco-hoodie-signal": {
      name: "Signal Hoodie",
      priceDisplay: "$68.00",
      image: "../assets/img/shop/hoodie-signal.jpg",
      variants: [
        { code: "S", label: "S" },
        { code: "M", label: "M" },
        { code: "L", label: "L" },
        { code: "XL", label: "XL" }
      ]
    },
    "tyco-cap-mark": {
      name: "Mark Cap",
      priceDisplay: "$28.00",
      image: "../assets/img/shop/cap-mark.jpg",
      variants: [{ code: "OS", label: "One Size" }]
    }
  };

  var COUNTRIES = [
    ["US", "United States"], ["GB", "United Kingdom"], ["SG", "Singapore"],
    ["AU", "Australia"], ["NZ", "New Zealand"], ["LK", "Sri Lanka"],
    ["CA", "Canada"], ["DE", "Germany"], ["FR", "France"], ["IE", "Ireland"]
  ];

  var params = new URLSearchParams(window.location.search);
  var productId = params.get("product");
  var product = PRODUCTS[productId];

  var ticket = document.getElementById("tyco-ticket");
  var form = document.getElementById("tyco-checkout-form");
  var errorBox = document.getElementById("tyco-error");
  var submitBtn = document.getElementById("tyco-submit");
  var payMount = document.getElementById("tyco-pay-mount");

  if (!product || !ticket || !form) {
    if (ticket) {
      ticket.innerHTML = '<div class="tyco-ticket-body"><p>Product not found. <a href="index.html" style="color:var(--tyco-accent)">Back to shop →</a></p></div>';
    }
    return;
  }

  function renderTicket() {
    var variantOptions = product.variants
      .map(function (v) { return '<option value="' + v.code + '">' + v.label + "</option>"; })
      .join("");

    ticket.innerHTML =
      '<figure class="tyco-ticket-media"><img src="' + product.image + '" alt="' + product.name + '"></figure>' +
      '<div class="tyco-ticket-body">' +
      "<h2>" + product.name + "</h2>" +
      '<p class="tyco-ticket-variant">' + product.priceDisplay + "</p>" +
      '<div class="tyco-perf"></div>' +
      '<div class="tyco-field">' +
      "<label for=\"variant\">Size</label>" +
      '<select id="variant" name="variant" required>' + variantOptions + "</select>" +
      "</div>" +
      '<div class="tyco-field">' +
      "<label for=\"quantity\">Quantity</label>" +
      '<input type="number" id="quantity" name="quantity" min="1" max="10" value="1" required>' +
      "</div>" +
      '<div class="tyco-ticket-row"><span>Subtotal</span><span id="tyco-subtotal">' + product.priceDisplay + "</span></div>" +
      '<div class="tyco-ticket-total"><span>Total</span><span id="tyco-total">' + product.priceDisplay + "</span></div>" +
      "</div>";

    var qtyInput = document.getElementById("quantity");
    var unitPrice = parseFloat(product.priceDisplay.replace(/[^0-9.]/g, ""));
    qtyInput.addEventListener("input", function () {
      var qty = Math.max(1, parseInt(qtyInput.value, 10) || 1);
      var total = (unitPrice * qty).toFixed(2);
      document.getElementById("tyco-subtotal").textContent = "$" + total;
      document.getElementById("tyco-total").textContent = "$" + total;
    });
  }

  function renderCountryOptions() {
    var select = document.getElementById("countryCode");
    if (!select) return;
    select.innerHTML = COUNTRIES
      .map(function (c) { return '<option value="' + c[0] + '">' + c[1] + "</option>"; })
      .join("");
  }

  function showError(message) {
    errorBox.textContent = message;
    errorBox.classList.add("is-visible");
  }

  function clearError() {
    errorBox.classList.remove("is-visible");
    errorBox.textContent = "";
  }

  function loadRevolutScript(mode) {
    return new Promise(function (resolve, reject) {
      if (window.RevolutCheckout) { resolve(window.RevolutCheckout); return; }
      var script = document.createElement("script");
      script.src = mode === "prod"
        ? "https://merchant.revolut.com/embed.js"
        : "https://sandbox-merchant.revolut.com/embed.js";
      script.onload = function () { resolve(window.RevolutCheckout); };
      script.onerror = function () { reject(new Error("Could not load payment widget")); };
      document.head.appendChild(script);
    });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    clearError();
    submitBtn.disabled = true;
    submitBtn.textContent = "Preparing checkout…";

    var data = new FormData(form);
    // variant + quantity live in the ticket-stub column, not inside <form>
    // (they're visually paired with the product, not the shipping fields),
    // so they're read directly rather than via FormData.
    var variantEl = document.getElementById("variant");
    var quantityEl = document.getElementById("quantity");
    var payload = {
      productId: productId,
      variantCode: variantEl ? variantEl.value : null,
      quantity: parseInt(quantityEl ? quantityEl.value : "1", 10) || 1,
      customer: {
        email: data.get("email"),
        firstName: data.get("firstName"),
        lastName: data.get("lastName"),
        phone: data.get("phone")
      },
      shipping: {
        address1: data.get("address1"),
        address2: data.get("address2"),
        city: data.get("city"),
        region: data.get("region"),
        postcode: data.get("postcode"),
        countryCode: data.get("countryCode")
      }
    };

    fetch("/api/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        if (!res.ok) return res.json().then(function (b) { throw new Error(b.error || "Checkout failed"); });
        return res.json();
      })
      .then(function (order) {
        submitBtn.style.display = "none";
        return loadRevolutScript(order.revolutMode).then(function (RevolutCheckout) {
          var instance = RevolutCheckout(order.revolutToken, order.revolutMode);
          instance.embeddedCheckout(payMount, {
            onSuccess: function () {
              window.location.href = "order-confirmed.html?ref=" + encodeURIComponent(order.externalRef);
            },
            onError: function () {
              showError("Payment could not be completed. Please try again.");
              submitBtn.style.display = "block";
              submitBtn.disabled = false;
              submitBtn.textContent = "Continue to payment";
            },
            onCancel: function () {
              submitBtn.style.display = "block";
              submitBtn.disabled = false;
              submitBtn.textContent = "Continue to payment";
            }
          });
        });
      })
      .catch(function (err) {
        showError(err.message || "Something went wrong. Please try again.");
        submitBtn.disabled = false;
        submitBtn.textContent = "Continue to payment";
      });
  });

  renderTicket();
  renderCountryOptions();
})();
