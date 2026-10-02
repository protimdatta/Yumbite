import('./config/db.js').then(m => {
  console.log('DB module loaded OK');
  console.log('isMemoryDB:', m.isMemoryDB());
}).catch(e => console.error(e.message));