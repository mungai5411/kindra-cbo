# Kindra CBO - Cloud Deployment Guide

## Overview

This guide covers deploying the Kindra CBO Management System to cloud platforms. We'll focus on AWS, but the principles apply to other platforms (DigitalOcean, Azure, Google Cloud).

## Prerequisites

- Domain name (e.g., kindra.org)
- Cloud platform account (AWS/DigitalOcean/etc.)
- SSL certificate (or use Let's Encrypt)
- External service accounts (SendGrid, etc.)

## Deployment Options

### Option 1: AWS (Recommended for Production)

#### Services Used:
- **EC2**: Application servers
- **RDS**: PostgreSQL database
- **ElastiCache**: Redis cache
- **S3**: File storage
- **CloudFront**: CDN
- **Route 53**: DNS
- **ELB**: Load balancer
- **ACM**: SSL certificates

#### Step-by-Step Deployment

**1. Set Up Database (RDS)**

```bash
# Create PostgreSQL RDS instance
aws rds create-db-instance \
  --db-instance-identifier kindra-cbo-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password <secure-password> \
  --allocated-storage 20
```

**2. Set Up Redis (ElastiCache)**

```bash
# Create Redis cluster
aws elasticache create-cache-cluster \
  --cache-cluster-id kindra-cbo-redis \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --num-cache-nodes 1
```

**3. Set Up S3 Bucket**

```bash
# Create S3 bucket for media files
aws s3 mb s3://kindra-cbo-media

# Set bucket policy for public read access (for public files)
aws s3api put-bucket-policy \
  --bucket kindra-cbo-media \
  --policy file://s3-policy.json
```

**4. Launch EC2 Instance**

```bash
# Launch Ubuntu 22.04 instance
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t3.medium \
  --key-name your-key-pair \
  --security-group-ids sg-xxxxxxxxx \
  --subnet-id subnet-xxxxxxxxx \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=kindra-cbo-app}]'
```

**5. Configure EC2 Instance**

SSH into the instance and run:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Clone repository
git clone <repository-url> /home/ubuntu/kindra
cd /home/ubuntu/kindra

# Create .env file
cp .env.example backend/.env
# Edit backend/.env with production values

# Start application
docker-compose -f docker-compose.prod.yml up -d
```

**6. Set Up SSL with Let's Encrypt**

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d kindra.org -d www.kindra.org

# Auto-renewal is set up automatically
```

**7. Configure DNS (Route 53)**

- Point your domain to the EC2 instance's Elastic IP
- Set up A records for `kindra.org` and `www.kindra.org`

### Option 2: DigitalOcean (Cost-Effective)

#### Services Used:
- **Droplet**: Application server
- **Managed PostgreSQL**: Database
- **Managed Redis**: Cache
- **Spaces**: Object storage (S3-compatible)

#### Deployment Steps

**1. Create Droplet**

```bash
# Create Ubuntu 22.04 droplet (4GB RAM recommended)
doctl compute droplet create kindra-cbo \
  --image ubuntu-22-04-x64 \
  --size s-2vcpu-4gb \
  --region nyc3
```

**2. Create Managed Database**

- Go to DigitalOcean console
- Create Managed PostgreSQL database
- Note connection details

**3. Create Spaces Bucket**

- Create a Space for media files
- Note access keys

**4. Deploy Application**

```bash
# SSH into droplet
ssh root@<droplet-ip>

# Follow same Docker setup as AWS EC2
# Update .env with DigitalOcean services
```

### Option 3: Heroku (Easiest, Limited Customization)

```bash
# Install Heroku CLI
# Login
heroku login

# Create app
heroku create kindra-cbo

# Add PostgreSQL
heroku addons:create heroku-postgresql:standard-0

# Add Redis
heroku addons:create heroku-redis:premium-0

# Set environment variables
heroku config:set SECRET_KEY=<your-secret-key>
heroku config:set DEBUG=False

# Deploy
git push heroku main

# Run migrations
heroku run python manage.py migrate

# Create superuser
heroku run python manage.py createsuperuser
```

## Environment Variables

Set these in your production environment:

```bash
# Django
SECRET_KEY=<generate-secure-key>
DEBUG=False
ALLOWED_HOSTS=kindra.org,www.kindra.org

# Database
DB_NAME=kindra_cbo_db
DB_USER=admin
DB_PASSWORD=<secure-password>
DB_HOST=<rds-endpoint>
DB_PORT=5432

# Redis
REDIS_HOST=<elasticache-endpoint>
REDIS_PORT=6379
REDIS_PASSWORD=<redis-password>

# AWS S3
AWS_ACCESS_KEY_ID=<your-key>
AWS_SECRET_ACCESS_KEY=<your-secret>
AWS_STORAGE_BUCKET_NAME=kindra-cbo-media
AWS_S3_REGION_NAME=us-east-1

# Email (SendGrid)
SENDGRID_API_KEY=<your-key>
SENDGRID_FROM_EMAIL=info@kindra.org

# Sentry
SENTRY_DSN=<your-sentry-dsn>
SENTRY_ENVIRONMENT=production
```

## Post-Deployment Checklist

- [ ] SSL certificate installed and working
- [ ] Database backups configured
- [ ] Monitoring set up (Sentry, CloudWatch, etc.)
- [ ] Domain DNS configured
- [ ] Email service tested
- [ ] Payment gateways tested (sandbox mode first)
- [ ] Static files serving correctly
- [ ] Media uploads working
- [ ] Celery workers running
- [ ] Celery beat scheduler running
- [ ] Log rotation configured
- [ ] Firewall rules configured
- [ ] Security headers verified

## Monitoring & Maintenance

### Set Up Monitoring

**Sentry (Error Tracking)**:
```python
# Already configured in settings.py
# Just set SENTRY_DSN in environment
```

**AWS CloudWatch (if using AWS)**:
```bash
# Install CloudWatch agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i amazon-cloudwatch-agent.deb
```

### Automated Backups

**Database Backup (Cron Job)**:
```bash
# Add to crontab
0 2 * * * /home/ubuntu/kindra/scripts/backup_database.sh
```

### Updates & Maintenance

```bash
# Pull latest code
cd /home/ubuntu/kindra
git pull origin main

# Rebuild containers
docker-compose -f docker-compose.prod.yml build

# Run migrations
docker-compose -f docker-compose.prod.yml run --rm backend python manage.py migrate

# Restart services
docker-compose -f docker-compose.prod.yml up -d
```

## Scaling

### Horizontal Scaling

- Use load balancer (AWS ELB, DigitalOcean Load Balancer)
- Run multiple app instances
- Use managed database with read replicas
- Use CDN for static files (CloudFront, DigitalOcean Spaces CDN)

### Vertical Scaling

- Upgrade instance size
- Increase database resources
- Add more Redis memory

## Security Best Practices

1. **Never commit secrets** to version control
2. **Use environment variables** for all sensitive data
3. **Enable HTTPS only** in production
4. **Set up firewall rules** to restrict access
5. **Regular security updates** for all dependencies
6. **Enable database encryption** at rest
7. **Use VPC/Private networking** for internal services
8. **Implement rate limiting** on API endpoints
9. **Regular security audits** and penetration testing
10. **Monitor logs** for suspicious activity

## Cost Optimization

- Use reserved instances for predictable workloads
- Set up auto-scaling for variable loads
- Use S3 lifecycle policies for old files
- Monitor and optimize database queries
- Use CDN to reduce bandwidth costs
- Implement caching strategies

## Support

For deployment issues:
- Email: tech@kindra.org
- Documentation: https://docs.kindra.org
- Status Page: https://status.kindra.org
