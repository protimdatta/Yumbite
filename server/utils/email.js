import { Resend } from 'resend';

// Lazy singleton so the server boots even when RESEND_API_KEY is not set
// (e.g. local dev before the owner adds the key). Endpoints that need email
// return a clear 503 in that case instead of crashing the process.
let resend = null;

function getResend() {
  if (resend) return resend;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  resend = new Resend(apiKey);
  return resend;
}

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Contact form: visitor message -> owner inbox, Reply-To = visitor email
export async function sendContactEmail({ name, email, phone = '', subject = '', message }) {
  const client = getResend();
  if (!client) {
    const err = new Error('Email service is not configured');
    err.code = 'EMAIL_NOT_CONFIGURED';
    throw err;
  }
  const ownerEmail = process.env.OWNER_EMAIL;
  const from = process.env.EMAIL_FROM;
  if (!ownerEmail || !from) {
    const err = new Error('OWNER_EMAIL and EMAIL_FROM must be set');
    err.code = 'EMAIL_NOT_CONFIGURED';
    throw err;
  }

  const safeSubject = subject && subject.trim() ? subject.trim() : 'General Inquiry';
  const { data, error } = await client.emails.send({
    from,
    to: [ownerEmail],
    replyTo: email,
    subject: `[Yumbite Website] ${safeSubject} — ${name}`,
    text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || '-'}\nSubject: ${safeSubject}\n\n${message}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px">
        <h2 style="color:#111">New message from Yumbite website</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(phone || '-')}</p>
        <p><strong>Subject:</strong> ${escapeHtml(safeSubject)}</p>
        <hr />
        <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
      </div>`,
  });

  if (error) {
    console.error('Resend contact email error:', error);
    throw new Error(error.message || 'Failed to send email');
  }
  return data;
}

// Forgot password: 6-digit OTP -> user inbox (single-use, expires in 10 min)
export async function sendPasswordResetOtp({ to, name = '', otp }) {
  const client = getResend();
  if (!client) {
    const err = new Error('Email service is not configured');
    err.code = 'EMAIL_NOT_CONFIGURED';
    throw err;
  }
  const from = process.env.EMAIL_FROM;
  if (!from) {
    const err = new Error('EMAIL_FROM must be set');
    err.code = 'EMAIL_NOT_CONFIGURED';
    throw err;
  }

  const { data, error } = await client.emails.send({
    from,
    to: [to],
    subject: 'Your Yumbite password reset code',
    text: `Hi ${name || 'there'},\n\nYour Yumbite password reset code is:\n\n${otp}\n\nEnter this code on the website within 10 minutes to set a new password. It can be used once.\n\nIf you did not request this, you can ignore this email.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px">
        <h2 style="color:#111">Your password reset code</h2>
        <p>Hi ${escapeHtml(name || 'there')},</p>
        <p>Enter this 6-digit code on the Yumbite website to reset your password. It expires in <strong>10 minutes</strong> and can be used <strong>once</strong>.</p>
        <p style="font-size:32px;font-weight:bold;letter-spacing:8px;background:#f5f5f5;padding:16px 8px;text-align:center;border-radius:8px">${escapeHtml(otp)}</p>
        <p style="color:#666;font-size:13px">If you did not request this, you can ignore this email.</p>
      </div>`,
  });

  if (error) {
    console.error('Resend OTP email error:', error);
    throw new Error(error.message || 'Failed to send reset code');
  }
  return data;
}

// ---------- Branded order emails (Yumbite black / yellow / red) ----------

function siteBase() {
  return (process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
}

function fmtDate(d) {
  try {
    return new Date(d).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  } catch { return ''; }
}

// Shared branded layout: logo header, content, order card, footer contact.
// Mobile-friendly (max-width 600, fluid table). No internal/admin info.
function orderEmailShell({ headline, introHtml, order, statusLabel }) {
  const logoUrl = `${siteBase()}/images/logo.jpg`;
  const itemRows = (order.items || []).map((it) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;color:#FFF4E6">${Number(it.quantity)} × ${escapeHtml(it.name)}</td>
      <td style="padding:10px 0 10px 12px;border-bottom:1px solid #2a2a2a;text-align:right;color:#FFF4E6">৳${Number(it.price)}</td>
      <td style="padding:10px 0 10px 12px;border-bottom:1px solid #2a2a2a;text-align:right;color:#FFC400;font-weight:bold">৳${Number(it.price) * Number(it.quantity)}</td>
    </tr>`).join('');
  const deliveryLine = Number(order.deliveryFee) > 0
    ? `<tr><td colspan="2" style="padding:6px 0;color:#aaa">Delivery charge</td><td style="padding:6px 0;text-align:right;color:#FFF4E6">৳${order.deliveryFee}</td></tr>`
    : `<tr><td colspan="2" style="padding:6px 0;color:#aaa">Delivery charge</td><td style="padding:6px 0;text-align:right;color:#4ade80">Free</td></tr>`;
  const payLine = order.paymentMethod === 'COD'
    ? 'Cash on Delivery — pay when you receive your food.'
    : order.paymentStatus === 'paid'
      ? `Paid online${order.transactionId ? ` (Transaction: ${escapeHtml(order.transactionId)})` : ''}.`
      : 'Online payment — confirmation to follow.';

  return `
  <div style="margin:0;padding:0;background:#090909;font-family:Arial,Helvetica,sans-serif">
    <div style="max-width:600px;margin:0 auto;background:#111111;border-radius:12px;overflow:hidden">
      <div style="background:#000;padding:24px;text-align:center;border-bottom:3px solid #FFC400">
        <img src="${logoUrl}" alt="Yumbite" width="72" height="72" style="border-radius:50%;display:block;margin:0 auto 8px" />
        <div style="color:#FFC400;font-size:22px;font-weight:bold;letter-spacing:2px">YUMBITE</div>
        <div style="color:#FFF4E6;font-size:12px;opacity:0.7">Bite Into Happiness</div>
      </div>
      <div style="padding:28px 24px;color:#FFF4E6">
        <h1 style="color:#FFC400;font-size:22px;margin:0 0 8px">${headline}</h1>
        ${introHtml}
        <div style="background:#E50914;color:#fff;font-weight:bold;text-align:center;padding:10px;border-radius:8px;margin:16px 0;font-size:15px">
          ${escapeHtml(statusLabel)} &nbsp;•&nbsp; ${escapeHtml(order.orderNumber)}
        </div>
        <table style="width:100%;border-collapse:collapse;margin:8px 0">
          <tr>
            <th style="text-align:left;color:#888;font-size:12px;padding-bottom:6px">ITEM</th>
            <th style="text-align:right;color:#888;font-size:12px;padding-bottom:6px">PRICE</th>
            <th style="text-align:right;color:#888;font-size:12px;padding-bottom:6px">TOTAL</th>
          </tr>
          ${itemRows}
        </table>
        <table style="width:100%;border-collapse:collapse;margin-top:4px">
          <tr><td colspan="2" style="padding:6px 0;color:#aaa">Subtotal</td><td style="padding:6px 0;text-align:right;color:#FFF4E6">৳${order.subtotal}</td></tr>
          ${deliveryLine}
          <tr><td colspan="2" style="padding:10px 0 0;color:#FFF4E6;font-size:17px;font-weight:bold">Total</td><td style="padding:10px 0 0;text-align:right;color:#FFC400;font-size:19px;font-weight:bold">৳${order.total}</td></tr>
        </table>
        <div style="background:#1c1c1c;border-radius:8px;padding:14px 16px;margin-top:18px;font-size:13px;line-height:1.7;color:#ccc">
          <div><strong style="color:#FFF4E6">Order:</strong> ${escapeHtml(order.orderNumber)} • ${escapeHtml(fmtDate(order.createdAt))}</div>
          <div><strong style="color:#FFF4E6">Customer:</strong> ${escapeHtml(order.customerName)} • ${escapeHtml(order.phone)}</div>
          ${order.orderType === 'delivery' && order.address ? `<div><strong style="color:#FFF4E6">Deliver to:</strong> ${escapeHtml(order.address)}</div>` : `<div><strong style="color:#FFF4E6">Type:</strong> Pickup</div>`}
          <div><strong style="color:#FFF4E6">Payment:</strong> ${escapeHtml(payLine)}</div>
          <div><strong style="color:#FFF4E6">Estimated time:</strong> ~${order.estimatedTime} min</div>
        </div>
      </div>
      <div style="background:#000;padding:16px;text-align:center;color:#888;font-size:12px;border-top:1px solid #2a2a2a">
        Yumbite • CXRJ+JH7, Buddhist Temple Rd, Cox's Bazar<br />01313-886160 • Open Daily 11 AM – 11 PM
      </div>
    </div>
  </div>`;
}

function validCustomerEmail(order) {
  return order?.email && /^\S+@\S+\.\S+$/.test(order.email);
}

async function sendBrandedOrderEmail({ to, subject, headline, introHtml, order, statusLabel }) {
  const client = getResend();
  if (!client) {
    const err = new Error('Email service is not configured');
    err.code = 'EMAIL_NOT_CONFIGURED';
    throw err;
  }
  const from = process.env.EMAIL_FROM;
  if (!from) {
    const err = new Error('EMAIL_FROM must be set');
    err.code = 'EMAIL_NOT_CONFIGURED';
    throw err;
  }
  const plainItems = (order.items || []).map((it) => `${it.quantity} x ${it.name} — ৳${Number(it.price) * Number(it.quantity)}`).join('\n');
  const { data, error } = await client.emails.send({
    from,
    to: [to],
    subject,
    text: `Yumbite — ${headline}\nOrder ${order.orderNumber}\n\n${plainItems}\nSubtotal: ৳${order.subtotal}\nDelivery: ৳${order.deliveryFee || 0}\nTotal: ৳${order.total}`,
    html: orderEmailShell({ headline, introHtml, order, statusLabel }),
  });
  if (error) {
    console.error('Resend order email error:', error);
    throw new Error(error.message || 'Failed to send order email');
  }
  return data;
}

// Order placed: confirmation (customer). Skipped silently when the order
// has no valid email — never blocks order creation.
export async function sendOrderConfirmation(order) {
  if (!validCustomerEmail(order)) return { skipped: true };
  return sendBrandedOrderEmail({
    to: order.email,
    subject: `Yumbite Order Received — #${order.orderNumber}`,
    headline: 'Thank you for your order!',
    introHtml: `<p style="margin:0 0 4px">Hi ${escapeHtml(order.customerName)},</p><p style="margin:0;color:#ccc">Your order has been <strong>received</strong> and is waiting for confirmation. We will email you the moment Yumbite confirms it.</p>`,
    order,
    statusLabel: 'Order Received',
  });
}

const STATUS_MESSAGES = {
  Confirmed: {
    subject: (n) => `Yumbite Order Confirmed — #${n}`,
    headline: 'Your order is confirmed!',
    intro: 'Yumbite has confirmed your order and preparation will begin shortly.',
  },
  Preparing: {
    subject: (n) => `Yumbite Order Update — #${n}`,
    headline: 'Your order is being prepared!',
    intro: 'Your Yumbite order is now being prepared.',
  },
  Ready: {
    subject: (n) => `Yumbite Order Update — #${n}`,
    headline: 'Your order is ready!',
    intro: 'Your food is ready — please pick it up, or wait for our rider if you chose delivery.',
  },
  'Out for Delivery': {
    subject: (n) => `Yumbite Order Update — #${n}`,
    headline: 'Your order is on the way!',
    intro: 'Our rider has picked up your food and is heading to you.',
  },
  Delivered: {
    subject: (n) => `Yumbite Order Update — #${n}`,
    headline: 'Delivered — enjoy!',
    intro: 'Your Yumbite order has been delivered. Thank you for ordering from Yumbite!',
  },
  Cancelled: {
    subject: (n) => `Yumbite Order Update — #${n}`,
    headline: 'Your order was cancelled',
    intro: 'Your Yumbite order has been cancelled. If you already paid online, contact us for a refund.',
  },
};

// Status-change notification. Skipped when there is no valid customer email.
export async function sendOrderStatusUpdate(order, newStatus) {
  if (!validCustomerEmail(order)) return { skipped: true };
  const meta = STATUS_MESSAGES[newStatus];
  if (!meta) return { skipped: true };
  return sendBrandedOrderEmail({
    to: order.email,
    subject: meta.subject(order.orderNumber),
    headline: meta.headline,
    introHtml: `<p style="margin:0;color:#ccc">${meta.intro}</p>`,
    order,
    statusLabel: newStatus,
  });
}
