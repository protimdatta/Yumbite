// Shared invoice PDF builder — used by the Invoice page and My Orders.
// Builds a standalone, print-safe branded document from invoice data and
// saves it as YumBite-Invoice-<INVOICE_NO>.pdf via html2pdf.js.

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fmtDate(d) {
  try {
    return new Date(d).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  } catch { return ''; }
}

export function buildInvoiceHtml({ invoiceNumber, invoiceGeneratedAt, order }) {
  const rows = (order.items || []).map((it) => `
    <tr>
      <td style="padding:9px 0;border-bottom:1px solid #e5e5e5">${esc(it.name)}<br/><span style="color:#777;font-size:11px">Qty ${Number(it.quantity)} × ৳${Number(it.price)}</span></td>
      <td style="padding:9px 0;border-bottom:1px solid #e5e5e5;text-align:right;font-weight:bold">৳${Number(it.price) * Number(it.quantity)}</td>
    </tr>`).join('');
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;color:#111;max-width:640px;margin:0 auto;padding:32px;background:#fff">
    <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:4px solid #FFC400;padding-bottom:16px">
      <div>
        <div style="font-size:26px;font-weight:bold;letter-spacing:2px">YUM<span style="color:#E50914">BITE</span></div>
        <div style="font-size:11px;color:#555">Bite Into Happiness • Cox's Bazar</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:13px;color:#555">INVOICE</div>
        <div style="font-size:17px;font-weight:bold">${esc(invoiceNumber)}</div>
      </div>
    </div>
    <div style="display:flex;justify-content:space-between;margin:16px 0;font-size:12px;color:#333">
      <div>
        <div style="color:#888;font-size:11px">BILLED TO</div>
        <div style="font-weight:bold">${esc(order.customerName)}</div>
        <div>${esc(order.phone)}</div>
        ${order.email ? `<div>${esc(order.email)}</div>` : ''}
        ${order.orderType === 'delivery' && order.address ? `<div>${esc(order.address)}</div>` : ''}
      </div>
      <div style="text-align:right">
        <div><span style="color:#888">Order:</span> <strong>${esc(order.orderNumber)}</strong></div>
        <div><span style="color:#888">Date:</span> ${esc(fmtDate(order.createdAt))}</div>
        <div><span style="color:#888">Type:</span> ${order.orderType === 'delivery' ? 'Delivery' : 'Pickup'}</div>
        <div><span style="color:#888">Invoice date:</span> ${esc(fmtDate(invoiceGeneratedAt))}</div>
      </div>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:13px">
      <tr style="background:#111;color:#FFC400">
        <th style="text-align:left;padding:10px">ITEM</th>
        <th style="text-align:right;padding:10px">AMOUNT</th>
      </tr>
      ${rows}
    </table>
    <table style="width:100%;border-collapse:collapse;font-size:13px;margin-top:8px">
      <tr><td style="padding:5px 0;color:#555">Subtotal</td><td style="text-align:right;padding:5px 0">৳${order.subtotal}</td></tr>
      <tr><td style="padding:5px 0;color:#555">Delivery charge</td><td style="text-align:right;padding:5px 0">${Number(order.deliveryFee) > 0 ? `৳${order.deliveryFee}` : 'Free'}</td></tr>
      <tr><td style="padding:10px 0 0;font-size:16px;font-weight:bold">Grand Total</td><td style="text-align:right;padding:10px 0 0;font-size:16px;font-weight:bold">৳${order.total}</td></tr>
    </table>
    <div style="display:flex;gap:8px;margin-top:16px;font-size:12px">
      <div style="flex:1;background:#f5f5f5;border-radius:6px;padding:10px"><span style="color:#888">Payment:</span> <strong>${order.paymentMethod === 'SSLCommerz' ? 'Online' : 'Cash on Delivery'}</strong> (${esc(order.paymentStatus)})${order.transactionId ? `<br/><span style="color:#888">Txn:</span> ${esc(order.transactionId)}` : ''}</div>
      <div style="flex:1;background:#f5f5f5;border-radius:6px;padding:10px"><span style="color:#888">Order status:</span> <strong>${esc(order.status)}</strong></div>
    </div>
    <div style="margin-top:20px;padding-top:12px;border-top:1px solid #e5e5e5;font-size:11px;color:#777;text-align:center">
      Yumbite • CXRJ+JH7, Buddhist Temple Rd, Cox's Bazar • 01313-886160 • Open Daily 11 AM – 11 PM<br/>Thank you for ordering with Yumbite!
    </div>
  </div>`;
}

export async function downloadInvoicePdf({ invoiceNumber, invoiceGeneratedAt, order }) {
  const [{ default: html2pdf }] = await Promise.all([import('html2pdf.js')]);
  const el = document.createElement('div');
  el.innerHTML = buildInvoiceHtml({ invoiceNumber, invoiceGeneratedAt, order });
  // html2canvas needs the node in the DOM to measure correctly
  el.style.position = 'fixed';
  el.style.left = '-9999px';
  el.style.top = '0';
  document.body.appendChild(el);
  try {
    await html2pdf()
      .set({
        margin: 10,
        filename: `YumBite-Invoice-${invoiceNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .from(el.firstElementChild)
      .save();
  } finally {
    document.body.removeChild(el);
  }
}
