@echo off
setlocal
cd /d "%~dp0brain-dump-frontend"
if not exist "node_modules" (
  npm.cmd install
)
set NEXT_PUBLIC_API_URL=http://127.0.0.1:8765
npm.cmd run dev
