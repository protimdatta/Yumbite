@echo off
cd D:\Yumbite\server
node index.js > server_output.txt 2>&1
timeout 5
curl -s http://localhost:5000/api/health