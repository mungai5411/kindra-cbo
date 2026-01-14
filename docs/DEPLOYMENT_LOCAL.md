# Kindra CBO - Local Deployment Guide

## Prerequisites

- Docker Desktop installed and running
- Git installed
- At least 4GB RAM available
- 10GB free disk space

## Quick Start

### Windows

1. **Clone the repository**:
   ```cmd
   git clone <repository-url>
   cd kindra
   ```

2. **Run setup script**:
   ```cmd
   scripts\setup_local.bat
   ```

3. **Start the application**:
   ```cmd
   docker-compose up
   ```

### Linux/Mac

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd kindra
   ```

2. **Make scripts executable**:
   ```bash
   chmod +x scripts/*.sh
   ```

3. **Run setup script**:
   ```bash
   ./scripts/setup_local.sh
   ```

4. **Start the application**:
   ```bash
   docker-compose up
   ```

## Access Points

Once the application is running:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin
- **API Documentation**: http://localhost:8000/api/docs

## Default Credentials

After running the setup script, you'll create a superuser. Use those credentials to log in.

## Manual Setup (Without Docker)

### Backend Setup

1. **Create virtual environment**:
   ```bash
   cd backend
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # Linux/Mac
   source venv/bin/activate
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Create .env file**:
   ```bash
   cp ../.env.example .env
   # Edit .env and set your SECRET_KEY
   ```

4. **Run migrations**:
   ```bash
   python manage.py migrate
   ```

5. **Create superuser**:
   ```bash
   python manage.py createsuperuser
   ```

6. **Start server**:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Create .env file**:
   ```bash
   cp .env.example .env
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

## Troubleshooting

### Docker Issues

**Problem**: Containers won't start
- **Solution**: Ensure Docker Desktop is running and you have enough resources allocated

**Problem**: Port already in use
- **Solution**: Stop any services running on ports 3000, 8000, 5432, or 6379

**Problem**: Database connection errors
- **Solution**: Wait for PostgreSQL to fully start (check with `docker-compose logs postgres`)

### Backend Issues

**Problem**: Module not found errors
- **Solution**: Ensure you're in the virtual environment and all dependencies are installed

**Problem**: Database errors
- **Solution**: Run `python manage.py migrate` to apply migrations

### Frontend Issues

**Problem**: npm install fails
- **Solution**: Delete `node_modules` and `package-lock.json`, then run `npm install` again

**Problem**: API connection errors
- **Solution**: Check that backend is running and `VITE_API_URL` in `.env` is correct

## Stopping the Application

### Docker
```bash
docker-compose down
```

### Manual
- Press `Ctrl+C` in the terminal running each service

## Data Management

### Backup Database
```bash
./scripts/backup_database.sh
```

### Reset Database
```bash
docker-compose down -v  # This will delete all data!
docker-compose up -d postgres
docker-compose run --rm backend python manage.py migrate
docker-compose run --rm backend python manage.py createsuperuser
```

## Next Steps

- Review the [API Documentation](http://localhost:8000/api/docs)
- Explore the [Admin Panel](http://localhost:8000/admin)
- Read the [User Guide](./USER_GUIDE.md)
- Check the [Development Guide](./DEVELOPMENT.md) for contributing

## Support

For issues or questions:
- Check the [Troubleshooting](#troubleshooting) section
- Review the [FAQ](./FAQ.md)
- Contact: tech@kindra.org
