#!/usr/bin/env bash
# Render build script

set -o errexit

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Create logs directory
mkdir -p logs

# Collect static files
python manage.py collectstatic --no-input

# Run migrations
python manage.py migrate --no-input

echo "Build completed successfully!"
