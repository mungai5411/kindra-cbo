@echo off
echo Starting Kindra Backend (Production Mode)...
echo Server listening on http://0.0.0.0:8000
python -m waitress --listen=0.0.0.0:8000 kindra_cbo.wsgi:application
pause
