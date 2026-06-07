@echo off
setlocal
cd /d "%~dp0backend"

where uv >nul 2>nul
if errorlevel 1 (
  echo uv is required for the backend environment setup.
  echo Install it from https://docs.astral.sh/uv/ and rerun this script.
  exit /b 1
)

call uv sync
if errorlevel 1 exit /b 1

call uv run uvicorn app.main:app --reload --port 8765
