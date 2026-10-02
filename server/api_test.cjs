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
          resolve({ status: res.statusCode, data: parsed, body: data });
        } catch {
          resolve({ status: res.statusCode, data: data, body: data });
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
  try {
    // Test 1: GET settings (public - no auth)
    console.log('--- Test 1: GET /api/settings (public) ---');
    const get = await api('/api/settings', 'GET');
    console.log('Status:', get.status);
    console.log('Data:', JSON.stringify(get.data));
    
    // Test 2: GET settings with admin token
    console.log('\n--- Test 2: GET /api/settings (with admin token) ---');
    const alog = await api('/api/auth/login', 'POST', { email: 'admin@yumbite.com', password: 'yumbite2024' });
    console.log('Admin login:', alog.status, alog.data?.success ? '(success)' : '');
    const atok = alog.data?.token;
    
    if (atok) {
      const getAuth = await api('/api/settings', 'GET', null, atok);
      console.log('Status with token:', getAuth.status);
      console.log('Data with token:', JSON.stringify(getAuth.data));
    }
    
    // Test 3: UPDATE settings (admin)
    console.log('\n--- Test 3: PUT /api/settings (admin) ---');
    if (atok && getAuth.data?.data) {
      const update = await api('/api/settings', 'PUT', {
        restaurantName: 'Test Update',
        heroSmallHeading: 'TEST HEADING',
      }, atok);
      console.log('Status:', update.status);
      console.log('Data:', JSON.stringify(update.data));
    }
    
  } catch (e) {
    console.error('FATAL:', e.message);
  }
})();