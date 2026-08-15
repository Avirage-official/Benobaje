/**
 * Tyco product catalog — single source of truth, used server-side only.
 *
 * The checkout API (api/create-order.js) looks products up from here, never
 * from anything the browser sends — price and Merchize routing must never be
 * trusted from client input. shop/index.html and js/shop.js carry their own
 * small display copy of this same data for rendering the grid; keep the two
 * in sync when you add or edit products.
 *
 * merchizeVariantCode: the exact variant/SKU code from your Merchize catalog
 * (Merchize dashboard → Products) — required for api/webhooks/revolut.js to
 * tell Merchize what to fulfil. Placeholder values below MUST be replaced
 * before going live.
 */

const PRODUCTS = {
  "tyco-tee-classic": {
    id: "tyco-tee-classic",
    name: "Classic Tee",
    description: "Heavyweight cotton, boxy fit.",
    currency: "USD",
    variants: [
      { code: "S", label: "S", merchizeVariantCode: "REPLACE_WITH_MERCHIZE_VARIANT_CODE", amountMinor: 3500 },
      { code: "M", label: "M", merchizeVariantCode: "REPLACE_WITH_MERCHIZE_VARIANT_CODE", amountMinor: 3500 },
      { code: "L", label: "L", merchizeVariantCode: "REPLACE_WITH_MERCHIZE_VARIANT_CODE", amountMinor: 3500 },
      { code: "XL", label: "XL", merchizeVariantCode: "REPLACE_WITH_MERCHIZE_VARIANT_CODE", amountMinor: 3500 }
    ],
    images: ["/assets/img/shop/tee-classic.jpg"]
  },
  "tyco-hoodie-signal": {
    id: "tyco-hoodie-signal",
    name: "Signal Hoodie",
    description: "Midweight fleece, dropped shoulder.",
    currency: "USD",
    variants: [
      { code: "S", label: "S", merchizeVariantCode: "REPLACE_WITH_MERCHIZE_VARIANT_CODE", amountMinor: 6800 },
      { code: "M", label: "M", merchizeVariantCode: "REPLACE_WITH_MERCHIZE_VARIANT_CODE", amountMinor: 6800 },
      { code: "L", label: "L", merchizeVariantCode: "REPLACE_WITH_MERCHIZE_VARIANT_CODE", amountMinor: 6800 },
      { code: "XL", label: "XL", merchizeVariantCode: "REPLACE_WITH_MERCHIZE_VARIANT_CODE", amountMinor: 6800 }
    ],
    images: ["/assets/img/shop/hoodie-signal.jpg"]
  },
  "tyco-cap-mark": {
    id: "tyco-cap-mark",
    name: "Mark Cap",
    description: "Structured 6-panel, embroidered.",
    currency: "USD",
    variants: [
      { code: "OS", label: "One Size", merchizeVariantCode: "REPLACE_WITH_MERCHIZE_VARIANT_CODE", amountMinor: 2800 }
    ],
    images: ["/assets/img/shop/cap-mark.jpg"]
  }
};

function getProduct(productId) {
  return PRODUCTS[productId] || null;
}

function getVariant(productId, variantCode) {
  const product = getProduct(productId);
  if (!product) return null;
  const variant = product.variants.find((v) => v.code === variantCode);
  if (!variant) return null;
  return { product, variant };
}

module.exports = { PRODUCTS, getProduct, getVariant };
