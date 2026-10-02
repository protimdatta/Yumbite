const http = require('http');

// First, let's check if the server is responding to any route
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
          resolve({ status: res.statusCode, data: parsed, body: data, headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, data: data, body: data, headers: {} });
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
    // Test health first
    const health = await api('/api/health', 'GET');
    console.log('Health:', health.status, health.data ? health.data.message : '');
    
    // Test settings GET
    const settings = await api('/api/settings', 'GET');
    console.log('Settings GET:', settings.status, settings.data ? settings.data.message : settings.data);
    
    // List all routes by trying common paths
    console.log('\nTrying other routes:');
    for (const path of ['/api/menu', '/api/orders', '/api/auth/login', '/api/users/register']) {
      try {
        const r = await api(path, 'GET');
        console.log(`  ${path}: ${r.status} ${r.data?.success ? '(success)' : ''}`);
      } catch(e) {
        console.log(`  ${path}: ERROR ${e.message.slice(0, 30)}`);
      }
    }
  } catch (e) {
    console.error('FATAL:', e.message);
  }
})();