#!/bin/bash

# Kindra CBO - Local Development Setup Script
# This script sets up the development environment for the Kindra CBO Management System

set -e  # Exit on error

echo "========================================="
echo "Kindra CBO - Local Development Setup"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    echo "Please install Docker from https://www.docker.com/get-started"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is not installed${NC}"
    echo "Please install Docker Compose"
    exit 1
fi

echo -e "${GREEN}✓ Docker and Docker Compose are installed${NC}"
echo ""

# Create .env file if it doesn't exist
if [ ! -f backend/.env ]; then
    echo -e "${YELLOW}Creating .env file from .env.example...${NC}"
    cp .env.example backend/.env
    
    # Generate SECRET_KEY
    SECRET_KEY=$(python3 -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())')
    
    # Update .env with generated SECRET_KEY
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/your-secret-key-here-generate-using-django-command/$SECRET_KEY/" backend/.env
    else
        sed -i "s/your-secret-key-here-generate-using-django-command/$SECRET_KEY/" backend/.env
    fi
    
    echo -e "${GREEN}✓ Created backend/.env with generated SECRET_KEY${NC}"
else
    echo -e "${GREEN}✓ backend/.env already exists${NC}"
fi

echo ""
echo -e "${YELLOW}Building Docker containers...${NC}"
docker-compose build

echo ""
echo -e "${YELLOW}Starting services...${NC}"
docker-compose up -d postgres redis

echo ""
echo -e "${YELLOW}Waiting for database to be ready...${NC}"
sleep 5

echo ""
echo -e "${YELLOW}Running database migrations...${NC}"
docker-compose run --rm backend python manage.py migrate

echo ""
echo -e "${YELLOW}Creating superuser...${NC}"
echo "Please enter superuser credentials:"
docker-compose run --rm backend python manage.py createsuperuser

echo ""
echo -e "${YELLOW}Collecting static files...${NC}"
docker-compose run --rm backend python manage.py collectstatic --noinput

echo ""
echo -e "${YELLOW}Loading sample data (optional)...${NC}"
read -p "Do you want to load sample data? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker-compose run --rm backend python manage.py loaddata fixtures/sample_data.json || echo "No sample data available"
fi

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}Setup completed successfully!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "To start the application:"
echo "  docker-compose up"
echo ""
echo "Access points:"
echo "  Frontend:  http://localhost:3000"
echo "  Backend:   http://localhost:8000"
echo "  Admin:     http://localhost:8000/admin"
echo "  API Docs:  http://localhost:8000/api/docs"
echo ""
echo "To stop the application:"
echo "  docker-compose down"
echo ""
