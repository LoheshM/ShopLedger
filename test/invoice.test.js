'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const invoice = require('../lib/invoice');
const pricing = require('../lib/pricing');

function line(name, price, qty, hsn, gstRate) {
  const item = {
    name,
    price,
    qty,
    hsn
  };
  if (gstRate !== undefined) item.gstRate = gstRate;
  return item;
}

function compare(order) {
  return {
    invoice: invoice.computeInvoiceFigures(order),
    checkout: pricing.computeTotals(order.items, order.coupon || '')
  };
}

function checkoutSummary(totals) {
  return {
    subtotal: totals.subtotal,
    discount: totals.discount,
    tax: totals.tax,
    cgst: totals.cgst,
    sgst: totals.sgst,
    total: totals.total
  };
}

test('CURRENT BEHAVIOUR: order #1001 mixed 5% and 12% rates without a coupon', function () {
  const order = {
    id: 1001,
    coupon: '',
    items: [
      line('5% slab item', 100, 1, '1006', 5),
      line('12% slab item', 100, 1, '0405', 12)
    ]
  };
  const result = compare(order);

  assert.deepEqual(result.invoice, {
    subtotal: 200,
    discount: 0,
    tax: 17,
    cgst: 8.5,
    sgst: 8.5,
    total: 217,
    rows: [
      { name: '5% slab item', sku: '-', hsn: '1006', qty: 1, price: 100, gstPercent: 5, line: 100, lineTax: 5 },
      { name: '12% slab item', sku: '-', hsn: '0405', qty: 1, price: 100, gstPercent: 12, line: 100, lineTax: 12 }
    ]
  });
  assert.deepEqual(checkoutSummary(result.checkout), {
    subtotal: 200, discount: 0, tax: 17, cgst: 8.5, sgst: 8.5, total: 217
  });
});

test('CURRENT BEHAVIOUR: order #1002 SAVE10 matches checkout and discounts before GST', function () {
  const order = {
    id: 1002,
    coupon: 'SAVE10',
    items: [
      line('Rice', 640, 1, '1006', 5),
      line('Sunflower oil', 190, 2, '1512', 5)
    ]
  };
  const result = compare(order);

  assert.deepEqual(result.invoice, {
    subtotal: 1020,
    discount: 102,
    tax: 45.9,
    cgst: 22.95,
    sgst: 22.95,
    total: 963.9,
    rows: [
      { name: 'Rice', sku: '-', hsn: '1006', qty: 1, price: 640, gstPercent: 5, line: 640, lineTax: 28.8 },
      { name: 'Sunflower oil', sku: '-', hsn: '1512', qty: 2, price: 190, gstPercent: 5, line: 380, lineTax: 17.1 }
    ]
  });
  assert.deepEqual(checkoutSummary(result.checkout), {
    subtotal: 1020, discount: 102, tax: 45.9, cgst: 22.95, sgst: 22.95, total: 963.9
  });
});

test('CURRENT BEHAVIOUR: order #1004 SAVE10 invoice applies the maximum discount before GST', function () {
  const order = {
    id: 1004,
    coupon: 'SAVE10',
    items: [line('Groundnut oil', 1120, 2, '1508')]
  };
  const result = compare(order);

  assert.deepEqual(result.invoice, {
    subtotal: 2240,
    discount: 150,
    tax: 104.5,
    cgst: 52.25,
    sgst: 52.25,
    total: 2194.5,
    rows: [
      { name: 'Groundnut oil', sku: '-', hsn: '1508', qty: 2, price: 1120, gstPercent: 5, line: 2240, lineTax: 104.5 }
    ]
  });
  assert.deepEqual(checkoutSummary(result.checkout), {
    subtotal: 2240, discount: 150, tax: 104.5, cgst: 52.25, sgst: 52.25, total: 2194.5
  });
});

test('CURRENT BEHAVIOUR: order #1008 all 18% rates without a coupon', function () {
  const order = {
    id: 1008,
    coupon: '',
    items: [
      line('Packaged tea', 140, 1, '0902', 18),
      line('Sherbet concentrate', 180, 2, '2106', 18)
    ]
  };
  const result = compare(order);

  assert.deepEqual(result.invoice, {
    subtotal: 500,
    discount: 0,
    tax: 90,
    cgst: 45,
    sgst: 45,
    total: 590,
    rows: [
      { name: 'Packaged tea', sku: '-', hsn: '0902', qty: 1, price: 140, gstPercent: 18, line: 140, lineTax: 25.2 },
      { name: 'Sherbet concentrate', sku: '-', hsn: '2106', qty: 2, price: 180, gstPercent: 18, line: 360, lineTax: 64.8 }
    ]
  });
  assert.deepEqual(checkoutSummary(result.checkout), {
    subtotal: 500, discount: 0, tax: 90, cgst: 45, sgst: 45, total: 590
  });
});

test('CURRENT BEHAVIOUR: invoice figures match checkout for the ticket orders', function () {
  const orders = [
    {
      id: 1001,
      coupon: '',
      items: [
        line('5% slab item', 100, 1, '1006', 5),
        line('12% slab item', 100, 1, '0405', 12)
      ]
    },
    {
      id: 1002,
      coupon: 'SAVE10',
      items: [
        line('Rice', 640, 1, '1006', 5),
        line('Sunflower oil', 190, 2, '1512', 5)
      ]
    },
    {
      id: 1004,
      coupon: 'SAVE10',
      items: [line('Groundnut oil', 1120, 2, '1508')]
    },
    {
      id: 1008,
      coupon: '',
      items: [
        line('Packaged tea', 140, 1, '0902', 18),
        line('Sherbet concentrate', 180, 2, '2106', 18)
      ]
    }
  ];

  for (const order of orders) {
    const invoiceFigures = invoice.computeInvoiceFigures(order);
    const checkoutFigures = pricing.computeTotals(order.items, order.coupon);

    assert.deepEqual({
      subtotal: invoiceFigures.subtotal,
      discount: invoiceFigures.discount,
      tax: invoiceFigures.tax,
      cgst: invoiceFigures.cgst,
      sgst: invoiceFigures.sgst,
      total: invoiceFigures.total
    }, checkoutSummary(checkoutFigures), `order #${order.id}`);
  }
});
