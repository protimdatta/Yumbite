// SSLCommerz integration (sandbox-first).
// All secrets stay in backend env vars — the frontend never sees them and
// the frontend's word about payment is never trusted. Only server-side
// validation against SSLCommerz can flip an order to paid.

const SANDBOX_BASE = 'https://sandbox.sslcommerz.com';
const LIVE_BASE = 'https://securepay.sslcommerz.com';

function base() {
  return process.env.SSLCOMMERZ_SANDBOX !== 'false' ? SANDBOX_BASE : LIVE_BASE;
}

export function isOnlinePayConfigured() {
  return Boolean(process.env.SSLCOMMERZ_STORE_ID && process.env.SSLCOMMERZ_STORE_PASSWORD);
}

export function backendBaseUrl() {
  return (process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`).replace(/\/$/, '');
}

// Step 1: create a payment session, get the GatewayPageURL to redirect to
export async function initPayment({ tranId, total, customerName, email, phone, address }) {
  const storeId = process.env.SSLCOMMERZ_STORE_ID;
  const storePass = process.env.SSLCOMMERZ_STORE_PASSWORD;
  if (!storeId || !storePass) {
    const err = new Error('Online payment is not configured');
    err.code = 'PAY_NOT_CONFIGURED';
    throw err;
  }

  const baseUrl = backendBaseUrl();
  const params = new URLSearchParams({
    store_id: storeId,
    store_passwd: storePass,
    total_amount: String(Math.round(total)),
    currency: 'BDT',
    tran_id: tranId,
    success_url: `${baseUrl}/api/payments/ssl/success`,
    fail_url: `${baseUrl}/api/payments/ssl/fail`,
    cancel_url: `${baseUrl}/api/payments/ssl/cancel`,
    ipn_url: `${baseUrl}/api/payments/ssl/ipn`,
    cus_name: customerName || 'Yumbite Customer',
    cus_email: email || 'customer@yumbite.local',
    cus_phone: phone || '01313886160',
    cus_add1: address || 'Cox\'s Bazar',
    cus_city: 'Cox\'s Bazar',
    cus_country: 'Bangladesh',
    shipping_method: 'NO',
    product_name: 'Yumbite Food Order',
    product_category: 'Food',
    product_profile: 'general',
  });

  const res = await fetch(`${base()}/gwprocess/v4/api.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  if (!res.ok) throw new Error(`Payment gateway unreachable (HTTP ${res.status})`);
  const data = await res.json();
  if (data.status !== 'SUCCESS' || !data.GatewayPageURL) {
    throw new Error(data.failedreason || 'Payment session could not be created');
  }
  return { gatewayUrl: data.GatewayPageURL, sessionKey: data.sessionkey || '' };
}

// Step 2: server-side validation — the ONLY thing that can mark paid.
// Uses the validation API (val_id from success callback / IPN).
export async function validatePayment({ valId, expectedAmount }) {
  const storeId = process.env.SSLCOMMERZ_STORE_ID;
  const storePass = process.env.SSLCOMMERZ_STORE_PASSWORD;
  if (!storeId || !storePass) {
    const err = new Error('Online payment is not configured');
    err.code = 'PAY_NOT_CONFIGURED';
    throw err;
  }

  const q = new URLSearchParams({
    val_id: valId,
    store_id: storeId,
    store_passwd: storePass,
    format: 'json',
  });
  const res = await fetch(`${base()}/validator/api/validationserverAPI.php?${q.toString()}`);
  if (!res.ok) throw new Error(`Gateway validation unreachable (HTTP ${res.status})`);
  const data = await res.json();

  // SSLCommerz returns status VALID / VALIDATED on genuine success
  if (data.status !== 'VALID' && data.status !== 'VALIDATED') {
    return { valid: false, reason: data.error || `Gateway status: ${data.status || 'UNKNOWN'}`, raw: data };
  }
  if (data.currency !== 'BDT') {
    return { valid: false, reason: 'Currency mismatch', raw: data };
  }
  const paidAmount = Number(data.amount);
  if (!Number.isFinite(paidAmount) || Math.round(paidAmount) !== Math.round(expectedAmount)) {
    return { valid: false, reason: `Amount mismatch (expected ${expectedAmount}, got ${data.amount})`, raw: data };
  }
  return {
    valid: true,
    tranId: data.tran_id,
    valId: data.val_id,
    cardType: data.card_type || '',
    bankTranId: data.bank_tran_id || '',
    raw: data,
  };
}

// Minimal safe subset of the gateway payload for reconciliation (no secrets)
export function safePaymentDetails(validation) {
  if (!validation?.raw) return undefined;
  const r = validation.raw;
  return {
    valId: r.val_id,
    cardType: r.card_type,
    bankTranId: r.bank_tran_id,
    tranDate: r.tran_date,
    currency: r.currency,
    amount: r.amount,
    validatedAt: new Date().toISOString(),
  };
}
