# ShopLedger

## Stack
- Node.js app using Express 4 and body-parser; CommonJS modules.
- Browser UI is static HTML, CSS, and JavaScript in `public/`.
- Persistent data is stored in `data/db.json` through `lib/store.js`.

## Module map
- `routes/customers.js` — customer list and Khata settlement endpoints.
- `routes/orders.js` — order list/detail/create/cancel endpoints.
- `routes/products.js` — product and active coupon endpoints.
- `routes/reports.js` — dashboard, GST reconciliation, pricing preview, and export endpoints.
- `lib/coupons.js` — coupon lookup, validation, discount calculation, and active coupon list.
- `lib/dates.js` — today, date-key normalization, and fiscal-year helper.
- `lib/inventory.js` — product lookup, sellable stock, stock checks, reserve/release, and summary.
- `lib/invoice.js` — invoice figures and printable HTML rendering.
- `lib/ledger.js` — customer balances, Khata debits/reversals, and settlements.
- `lib/orders.js` — order add/get/cancel/list operations.
- `lib/pricing.js` — subtotal, discount, and order total calculation.
- `lib/reports.js` — dashboard summary and GST reconciliation.
- `lib/store.js` — JSON database read/write and audit log append.
- `lib/tax.js` — item GST rate/slab lookup and CGST/SGST split.

## Commands
- Start the app: `npm start` (`node server.js`).
- Run tests: `node --test`.
- `package.json` currently defines `npm test` as a placeholder that exits with an error.

## Rules
1. Write characterization tests before changing behaviour.
2. Change only the module(s) the ticket is about.
3. Tests never read or write `data/db.json`; use in-memory data.
4. Add no dependencies.
5. Make the smallest fix that works.

## Current ticket
- Invoice total and GST breakdown do not match what the customer was billed.
- Allowed files: `lib/invoice.js` (`lib/tax.js` only if truly needed).
