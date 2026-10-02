import('http').then(http => {
  // Just check if settings route exists by looking at the index
  import('./routes/settingRoutes.js').then(ms => {
    console.log('Setting routes exported:', Object.keys(ms));
  }).catch(e => console.error('Setting routes error:', e.message));
  
  import('./index.js').then(app => {
    console.log('App loaded');
  }).catch(e => console.error('App error:', e.message));
}).catch(e => console.error('Fatal:', e.message));