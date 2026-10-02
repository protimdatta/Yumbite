// Health check script
const http = require('http');
const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/health',
  method: 'GET',
  timeout: 3000
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    console.log('BODY:', data);
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.log('ERROR connecting to localhost:5000', e.message);
  process.exit(1);
});

req.on('timeout', () => {
  console.log('TIMEOUT connecting to localhost:5000');
  req.destroy();
  process.exit(1);
});

req.end();