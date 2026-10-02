const http = require('http');

const loginData = JSON.stringify({ email: 'protimdattapartha@gmail.com', password: '0190689' });

const loginOptions = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
};

const loginReq = http.request(loginOptions, (loginRes) => {
  let loginData = '';
  loginRes.on('data', (chunk) => { loginData += chunk; });
  loginRes.on('end', () => {
    const loginResult = JSON.parse(loginData);
    console.log('Login status:', loginRes.statusCode);

    if (loginResult.success && loginResult.token) {
      const token = loginResult.token;

      // Now test GET settings with token
      const settingsOptions = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/settings',
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + token
        }
      };

      const settingsReq = http.request(settingsOptions, (settingsRes) => {
        let settingsData = '';
        settingsRes.on('data', (chunk) => { settingsData += chunk; });
        settingsRes.on('end', () => {
          console.log('Settings GET status:', settingsRes.statusCode);
          console.log('Settings GET data:', settingsData.slice(0, 200));

          // Now test UPDATE settings with token
          const updateData = JSON.stringify({ restaurantName: 'Test Update', heroSmallHeading: 'TEST HEADING' });
          const updateOptions = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/settings',
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + token
            }
          };

          const updateReq = http.request(updateOptions, (updateRes) => {
            let updateData = '';
            updateRes.on('data', (chunk) => { updateData += chunk; });
            updateRes.on('end', () => {
              console.log('Settings PUT status:', updateRes.statusCode);
              console.log('Settings PUT response:', updateData.slice(0, 200));
            });
          });
          updateReq.write(updateData);
          updateReq.end();
        });
      });

      settingsReq.on('error', (e) => { console.error('Settings GET error:', e.message); });
      settingsReq.end();
    } else {
      console.log('Login failed:', loginResult.message);
    }
  });
});

loginReq.write(loginData);
loginReq.end();