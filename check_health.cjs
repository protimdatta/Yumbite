const http = require('http');
const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/health',
  method: 'GET'
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
  console.log('ERROR:', e.message);
  process.exit(1);
});

req.end();