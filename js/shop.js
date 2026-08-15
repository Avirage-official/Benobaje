/**
 * Tyco shop — client-side product data (display copy only) and product
 * grid rendering. Keep this in sync with lib/products.js when products
 * change; lib/products.js is the source of truth for price/checkout.
 */

(function () {
  "use strict";

  var PRODUCTS = [
    {
      id: "tyco-tee-classic",
      name: "Classic Tee",
      description: "Heavyweight cotton, boxy fit.",
      priceDisplay: "$35",
      image: "../assets/img/shop/tee-classic.jpg",
      sizes: ["S", "M", "L", "XL"]
    },
    {
      id: "tyco-hoodie-signal",
      name: "Signal Hoodie",
      description: "Midweight fleece, dropped shoulder.",
      priceDisplay: "$68",
      image: "../assets/img/shop/hoodie-signal.jpg",
      sizes: ["S", "M", "L", "XL"]
    },
    {
      id: "tyco-cap-mark",
      name: "Mark Cap",
      description: "Structured 6-panel, embroidered.",
      priceDisplay: "$28",
      image: "../assets/img/shop/cap-mark.jpg",
      sizes: ["One Size"]
    }
  ];

  var grid = document.querySelector(".tyco-grid");
  if (!grid) return;

  PRODUCTS.forEach(function (product, i) {
    var num = String(i + 1).padStart(2, "0") + " / " + String(PRODUCTS.length).padStart(2, "0");
    var card = document.createElement("a");
    card.className = "tyco-card";
    card.href = "checkout.html?product=" + encodeURIComponent(product.id);
    card.innerHTML =
      '<span class="tyco-card-num">' + num + "</span>" +
      '<figure class="tyco-card-media" data-file="' + product.image + '">' +
      '<img src="' + product.image + '" alt="' + product.name + '" loading="lazy">' +
      "</figure>" +
      "<h3>" + product.name + "</h3>" +
      '<p class="tyco-card-desc">' + product.description + "</p>" +
      '<div class="tyco-card-foot">' +
      '<span class="tyco-price">' + product.priceDisplay + "</span>" +
      '<span class="tyco-buy">Buy →</span>' +
      "</div>";
    grid.appendChild(card);
  });

  document.querySelectorAll(".tyco-card-media img").forEach(function (img) {
    var fig = img.closest(".tyco-card-media");
    var markLoaded = function () { fig && fig.classList.add("is-loaded"); };
    var markMissing = function () { img.classList.add("is-missing"); };
    if (img.complete) {
      img.naturalWidth > 0 ? markLoaded() : markMissing();
    } else {
      img.addEventListener("load", markLoaded);
      img.addEventListener("error", markMissing);
    }
  });
})();
