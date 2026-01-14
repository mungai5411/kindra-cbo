# Kindra CBO System - Testing Guide

## Quick Test Checklist

### Backend Testing

#### 1. System Check
```bash
cd backend
python manage.py check
```
**Expected**: "System check identified no issues (0 silenced)."

#### 2. Database Migrations
```bash
python manage.py makemigrations --dry-run
```
**Expected**: "No changes detected"

#### 3. Run Development Server
```bash
python manage.py runserver
```
**Expected**: Server starts on http://127.0.0.1:8000/

#### 4. Test API Endpoints

**Admin Panel**:
- URL: http://localhost:8000/admin
- Should load Django admin login page

**API Documentation**:
- URL: http://localhost:8000/api/docs
- Should load Swagger UI

**Blog API**:
```bash
curl http://localhost:8000/api/v1/blog/posts/
```
**Expected**: JSON response with empty results or blog posts

**Donations API**:
```bash
curl http://localhost:8000/api/v1/donations/campaigns/
```
**Expected**: JSON response with campaigns

### Frontend Testing

#### 1. Install Dependencies
```bash
cd frontend
npm install
```
**Expected**: All dependencies installed successfully

#### 2. Build Check
```bash
npm run build
```
**Expected**: Build completes without errors

#### 3. Run Development Server
```bash
npm run dev
```
**Expected**: Server starts on http://localhost:3000/

#### 4. Test Pages

**Home Page**:
- URL: http://localhost:3000/
- Should display welcome message and navigation buttons

**Blog Page**:
- URL: http://localhost:3000/blog
- Should display "No blog posts available yet" or list of posts

**Donations Page**:
- URL: http://localhost:3000/donate
- Should display campaign cards with progress bars

**Login Page**:
- URL: http://localhost:3000/login
- Should display login form

**Dashboard** (requires login):
- URL: http://localhost:3000/dashboard
- Should redirect to login if not authenticated

### Docker Testing

#### 1. Build Containers
```bash
docker-compose build
```
**Expected**: All services build successfully

#### 2. Start Services
```bash
docker-compose up
```
**Expected**: All services start (postgres, redis, backend, frontend, celery, nginx)

#### 3. Check Service Health
```bash
docker-compose ps
```
**Expected**: All services showing as "Up"

#### 4. Test Nginx Proxy
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API: http://localhost/api/v1/blog/posts/

### Integration Testing

#### 1. Backend + Frontend
1. Start backend: `cd backend && python manage.py runserver`
2. Start frontend: `cd frontend && npm run dev`
3. Open http://localhost:3000
4. Navigate to blog page
5. Check browser console for API calls

#### 2. Full Docker Stack
1. Run: `docker-compose up`
2. Access: http://localhost:3000
3. Test all pages
4. Check logs: `docker-compose logs -f`

## Common Issues and Solutions

### Backend Issues

**Issue**: `ModuleNotFoundError`
- **Solution**: Activate virtual environment and run `pip install -r requirements.txt`

**Issue**: Database errors
- **Solution**: Run `python manage.py migrate`

**Issue**: Port 8000 already in use
- **Solution**: Stop other Django servers or use different port: `python manage.py runserver 8001`

### Frontend Issues

**Issue**: Module not found errors
- **Solution**: Run `npm install` in frontend directory

**Issue**: Build fails
- **Solution**: Delete `node_modules` and `package-lock.json`, then run `npm install` again

**Issue**: Port 3000 already in use
- **Solution**: Kill process on port 3000 or change port in `vite.config.ts`

### Docker Issues

**Issue**: Containers won't start
- **Solution**: Ensure Docker Desktop is running

**Issue**: Database connection errors
- **Solution**: Wait for PostgreSQL to fully start (check logs)

**Issue**: Permission denied errors
- **Solution**: On Linux, add user to docker group: `sudo usermod -aG docker $USER`

## Performance Testing

### Load Testing (Optional)

Using Apache Bench:
```bash
# Test API endpoint
ab -n 1000 -c 10 http://localhost:8000/api/v1/blog/posts/

# Test frontend
ab -n 1000 -c 10 http://localhost:3000/
```

### Database Query Performance
```bash
# Enable query logging in Django settings
# Check logs for slow queries
```

## Security Testing

### Basic Security Checks

1. **HTTPS in Production**: Verify SSL certificate
2. **CORS Settings**: Check allowed origins
3. **Authentication**: Test JWT token expiration
4. **Rate Limiting**: Test API rate limits
5. **SQL Injection**: Use parameterized queries (Django ORM handles this)

## Test Results Template

```
Date: _______________
Tester: _______________

Backend Tests:
[ ] System check passed
[ ] Migrations up to date
[ ] Server starts successfully
[ ] Admin panel accessible
[ ] API documentation loads
[ ] Blog API responds
[ ] Donations API responds

Frontend Tests:
[ ] Dependencies installed
[ ] Build completes
[ ] Dev server starts
[ ] Home page loads
[ ] Blog page loads
[ ] Donations page loads
[ ] Login page loads
[ ] Dashboard redirects when not authenticated

Docker Tests:
[ ] Containers build successfully
[ ] All services start
[ ] Services are healthy
[ ] Nginx proxy works

Integration Tests:
[ ] Frontend connects to backend API
[ ] Authentication flow works
[ ] Data displays correctly

Issues Found:
_______________________________
_______________________________
_______________________________
```

## Next Steps After Testing

1. ✅ Fix any issues found during testing
2. ✅ Create sample data for demonstration
3. ✅ Set up production environment
4. ✅ Configure external services (SendGrid, etc.)
5. ✅ Deploy to staging
6. ✅ User acceptance testing
7. ✅ Production deployment

## Automated Testing (Future)

### Backend Unit Tests
```bash
cd backend
python manage.py test
```

### Frontend Unit Tests
```bash
cd frontend
npm test
```

### E2E Tests
```bash
cd frontend
npm run test:e2e
```

---

**For support**: Contact tech@kindra.org
