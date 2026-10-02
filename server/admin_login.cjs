const http = require('http');

const data = JSON.stringify({ email: 'protimdattapartha@gmail.com', password: '0190689' });

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let result = '';
  res.on('data', (chunk) => { result += chunk; });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', result);
  });
});

req.on('error', (e) => { console.error('ERROR:', e.message); });
req.write(data);
req.end();