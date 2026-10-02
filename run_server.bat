@echo off
cd D:\Yumbite\server
node index.js > startup.log 2>&1
timeout 3
curl -s http://localhost:5000/api/health