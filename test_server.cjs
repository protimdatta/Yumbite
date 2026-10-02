const { spawn } = require('child_process');
const http = require('http');

// Start the server
const server = spawn('node', ['index.js'], {
  cwd: 'D:\\Yumbite\\server',
  stdio: 'pipe',
  env: process.env
});

// Wait for server to start
let serverReady = false;
let attempts = 0;
const maxAttempts = 20;

function checkHealth() {
  attempts++;
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/health',
      method: 'GET',
      timeout: 1000
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ ok: true, status: res.statusCode, body: data });
      });
    });
    req.on('error', (e) => {
      resolve({ ok: false, error: e.message });
    });
    req.on('timeout', () => {
      req.destroy();
      resolve({ ok: false, error: 'timeout' });
    });
    req.end();
  });
}

async function run() {
  // Wait for server to be ready
  while (attempts < maxAttempts) {
    const result = await checkHealth();
    if (result.ok) {
      serverReady = true;
      console.log('HEALTH CHECK PASSED:', result.body);
      break;
    }
    console.log(`Attempt ${attempts}: ${result.error}`);
    await new Promise(r => setTimeout(r, 1000));
  }
  
  if (!serverReady) {
    console.log('Server not ready after max attempts');
    process.exit(1);
  }
  
  // Test a few API endpoints
  console.log('\n--- API TESTS ---');
  
  // Test menu endpoint
  const menuReq = http.request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/menu',
    method: 'GET',
    timeout: 1000
  }, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log('MENU:', res.statusCode, data.slice(0, 200));
    });
  });
  menuReq.on('error', (e) => { console.log('MENU ERROR:', e.message); });
  menuReq.end();
  
  // Test orders (should need auth)
  const ordersReq = http.request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/orders',
    method: 'GET',
    timeout: 1000
  }, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log('ORDERS (no auth):', res.statusCode);
    });
  });
  ordersReq.on('error', (e) => { console.log('ORDERS ERROR:', e.message); });
  ordersReq.end();
  
  // Wait for all requests to complete
  await new Promise(r => setTimeout(r, 2000));
  
  // Kill the server
  server.kill();
  console.log('\n--- TEST COMPLETE ---');
  process.exit(0);
}

run().catch(e => { console.error('FATAL:', e); process.exit(1); });