@echo off
REM Kindra CBO - Local Development Setup Script (Windows)
REM This script sets up the development environment for the Kindra CBO Management System

echo =========================================
echo Kindra CBO - Local Development Setup
echo =========================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo Error: Docker is not installed
    echo Please install Docker Desktop from https://www.docker.com/get-started
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo Error: Docker Compose is not installed
    echo Please install Docker Compose
    exit /b 1
)

echo [OK] Docker and Docker Compose are installed
echo.

REM Create .env file if it doesn't exist
if not exist backend\.env (
    echo Creating .env file from .env.example...
    copy .env.example backend\.env
    echo [OK] Created backend\.env
    echo.
    echo IMPORTANT: Please edit backend\.env and set your SECRET_KEY
    echo You can generate one using: python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
    echo.
) else (
    echo [OK] backend\.env already exists
    echo.
)

echo Building Docker containers...
docker-compose build

echo.
echo Starting services...
docker-compose up -d postgres redis

echo.
echo Waiting for database to be ready...
timeout /t 5 /nobreak >nul

echo.
echo Running database migrations...
docker-compose run --rm backend python manage.py migrate

echo.
echo Creating superuser...
echo Please enter superuser credentials:
docker-compose run --rm backend python manage.py createsuperuser

echo.
echo Collecting static files...
docker-compose run --rm backend python manage.py collectstatic --noinput

echo.
echo =========================================
echo Setup completed successfully!
echo =========================================
echo.
echo To start the application:
echo   docker-compose up
echo.
echo Access points:
echo   Frontend:  http://localhost:3000
echo   Backend:   http://localhost:8000
echo   Admin:     http://localhost:8000/admin
echo   API Docs:  http://localhost:8000/api/docs
echo.
echo To stop the application:
echo   docker-compose down
echo.
pause
