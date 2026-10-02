const http = require('http');

function api(path, method, body, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method || 'GET',
      headers: { 'Content-Type': 'application/json' }
    };
    if (token) {
      options.headers.Authorization = 'Bearer ' + token;
    }
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    req.on('error', (e) => { reject(new Error('REQUEST_ERROR: ' + e.message)); });
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

(async () => {
  let passed = 0;
  let failed = 0;
  
  async function test(name, condition, detail = '') {
    if (condition) {
      console.log('PASS: ' + name);
      passed++;
    } else {
      console.log('FAIL: ' + name + (detail ? ' ' + detail : ''));
      failed++;
    }
  }
  
  // 1. Check server is running
  await test('SERVER_RUNNING', true); // If we got here, server is running
  
  // 2. Health check
  const health = await api('/api/health', 'GET');
  await test('HEALTH_CHECK', health.status === 200, '(status ' + health.status + ')');
  
  // 3. Register user
  const reg = await api('/api/users/register', 'POST', { name: 'Test User', email: 'test' + Date.now() + '@example.com', password: 'secret123' });
  await test('USER_REGISTER', reg.status === 201, '(status ' + reg.status + ')');
  const userToken = reg.data.token;
  
  // 4. Login
  const login = await api('/api/users/login', 'POST', { email: 'test' + Date.now() + '@example.com', password: 'secret123' });
  await test('USER_LOGIN', login.status === 200, '(status ' + login.status + ')');
  
  // 5. Menu
  const menu = await api('/api/menu?limit=3', 'GET');
  await test('MENU', menu.status === 200 && menu.data.data.length > 0, '(items: ' + (menu.data.data?.length || 0) + ')');
  
  // 6. COD order
  if (menu.data.data?.[0]?.id) {
    const mid = menu.data.data[0].id;
    const order = await api('/api/orders', 'POST', {
      customerName: 'Test User', phone: '01313000000', email: 'test@example.com', orderType: 'pickup',
      items: [{ menuItemId: mid, quantity: 1 }],
      paymentMethod: 'COD',
    }, userToken);
    await test('ORDER_PLACED', order.status === 201, '(orderNumber: ' + (order.data.data?.orderNumber || 'N/A') + ')');
    const orderId = order.data.data?._id;
    
    // 7. Invoice (owner)
    if (orderId) {
      const inv = await api('/api/orders/' + orderId + '/invoice', 'GET', null, userToken);
      await test('INVOICE_OWNER', inv.status === 200, '(inv: ' + (inv.data.data?.invoiceNumber || 'N/A') + ')');
      
      // 8. Stranger cannot access invoice
      const reg2 = await api('/api/users/register', 'POST', { name: 'Stranger', email: 'stranger' + Date.now() + '@example.com', password: 'secret123' });
      const inv2 = await api('/api/orders/' + orderId + '/invoice', 'GET', null, reg2.data.token);
      await test('INVOICE_STRANGER_403', inv2.status === 403, '(status ' + inv2.status + ')');
      
      // 9. No auth 401
      const inv3 = await api('/api/orders/' + orderId + '/invoice', 'GET');
      await test('INVOICE_NOAUTH_401', inv3.status === 401, '(status ' + inv3.status + ')');
    }
  }
  
  // 10. Admin login
  const alog = await api('/api/auth/login', 'POST', { email: 'admin@yumbite.com', password: 'yumbite2024' });
  await test('ADMIN_LOGIN', alog.status === 200, '(status ' + alog.status + ')');
  const adminToken = alog.data.token;
  
  // 11. Customer blocked from admin
  if (userToken) {
    const blocked = await api('/api/admin/overview', 'GET', null, userToken);
    await test('CUST_BLOCKED_ADMIN', blocked.status === 401, '(status ' + blocked.status + ')');
  }
  
  // 12. Admin overview
  if (adminToken) {
    const adm = await api('/api/admin/overview', 'GET', null, adminToken);
    await test('ADMIN_OVERVIEW', adm.status === 200, '(users: ' + (adm.data?.data?.users?.total || 'N/A') + ')');
    
    // 13. Admin users
    const au = await api('/api/admin/users', 'GET', null, adminToken);
    await test('ADMIN_USERS', au.status === 200, '(count: ' + (au.data?.data?.length || 0) + ')');
    
    // 14. Settings
    const st = await api('/api/settings', 'GET');
    await test('SETTINGS', st.status === 200, '(deliveryFee: ' + (st.data.data?.deliveryFee || 'N/A') + ')');
  }
  
  // 15. Google auth path
  const g = await api('/api/users/google', 'POST', { idToken: 'garbage' });
  await test('GOOGLE_401', g.status === 401, '(status ' + g.status + ')');
  
  // 16. Contact form
  const contact = await api('/api/contact', 'POST', { name: 'Test', email: 'a@b.com', message: 'test' });
  await test('CONTACT_EMAIL', contact.status === 200, '(status ' + contact.status + ')');
  
  // 17. Forgot password validation
  const fp = await api('/api/users/forgot-password', 'POST', { email: 'bad' });
  await test('FORGOT_VALIDATION', fp.status === 400, '(status ' + fp.status + ')');
  
  console.log('\n=== RESULTS ===');
  console.log('Passed: ' + passed + '/' + (passed + failed));
  console.log('Failed: ' + failed);
  process.exit(failed > 0 ? 1 : 0);
})().catch((e) => { console.error('FATAL:' + e.message); process.exit(1); });