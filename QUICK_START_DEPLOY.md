# Quick Start - Deployment Commands

## Prerequisites
1. GitHub account
2. Git installed on your computer

## Step 1: Push to GitHub

```powershell
# Navigate to project
cd c:\Users\munga\OneDrive\Desktop\kindra

# Run deployment preparation script
.\prepare-deployment.ps1

# Initialize git (if not done)
git init
git branch -M main

# Add all files
git add .

# Commit
git commit -m "Prepare for cloud deployment"

# Create GitHub repo at: https://github.com/new
# Name it: kindra-cbo

# Connect and push
git remote add origin https://github.com/YOUR_USERNAME/kindra-cbo.git
git push -u origin main
```

## Step 2: Setup Free Services (15 minutes)

### A. Neon PostgreSQL (Database)
1. Go to: https://neon.tech
2. Sign up with GitHub
3. Create project: `kindra-cbo-db`
4. Copy connection string (looks like):
   ```
   postgres://username:password@ep-xxx.neon.tech/neondb?sslmode=require
   ```
5. Save this for Step 3!

### B. Upstash Redis (Cache)
1. Go to: https://upstash.com
2. Sign up
3. Create database: `kindra-redis`
4. Copy the Redis URL (looks like):
   ```
   rediss://default:password@endpoint.upstash.io:6379
   ```
5. Save this for Step 3!

### C. Cloudinary (File Storage)
1. Go to: https://cloudinary.com/users/register_free
2. Sign up
3. Dashboard → Account Details
4. Copy these 3 values:
   - Cloud Name: `dxxxxxxxx`
   - API Key: `123456789012345`
   - API Secret: `xxxxxxxxxxxxx`
5. Save these for Step 3!

## Step 3: Deploy Backend (Render)

1. Go to: https://render.com
2. Sign Up with GitHub
3. Click **"New +"** → **"Web Service"**
4. Connect your `kindra-cbo` repository
5. Configure:
   - **Name**: `kindra-backend`
   - **Region**: Frankfurt
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `./build.sh`
   - **Start Command**: `gunicorn kindra_cbo.wsgi:application --bind 0.0.0.0:$PORT`
   - **Plan**: Free

6. Click **"Advanced"** → **"Add Environment Variable"**

   Add these ONE BY ONE:

   | Key | Value |
   |-----|-------|
   | `SECRET_KEY` | Go to https://djecrety.ir/ and copy the key |
   | `DEBUG` | `False` |
   | `ALLOWED_HOSTS` | `.onrender.com` |
   | `DATABASE_URL` | Paste from Neon (Step 2A) |
   | `REDIS_URL` | Paste from Upstash (Step 2B) |
   | `CELERY_BROKER_URL` | Same as REDIS_URL |
   | `CLOUDINARY_CLOUD_NAME` | From Cloudinary (Step 2C) |
   | `CLOUDINARY_API_KEY` | From Cloudinary (Step 2C) |
   | `CLOUDINARY_API_SECRET` | From Cloudinary (Step 2C) |
   | `CORS_ALLOWED_ORIGINS` | `https://kindra-cbo.vercel.app` |
   | `CSRF_TRUSTED_ORIGINS` | `https://kindra-cbo.vercel.app` |

7. Click **"Create Web Service"**

8. Wait 5-10 minutes for deployment...

9. Once deployed, click **"Shell"** tab and run:
   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   # Enter: username, email, password
   python manage.py collectstatic --noinput
   ```

10. Copy your backend URL: `https://kindra-backend.onrender.com`

## Step 4: Deploy Frontend (Vercel)

```powershell
# Install Vercel CLI
npm install -g vercel

# Update frontend API URL
cd c:\Users\munga\OneDrive\Desktop\kindra\frontend

# Edit .env.production - update with YOUR backend URL:
# VITE_API_URL=https://kindra-backend.onrender.com/api/v1

# Commit this change
git add .env.production
git commit -m "Update production API URL"
git push

# Deploy to Vercel
vercel login
# Follow browser login

vercel --prod
# Answer prompts:
#   - Set up and deploy? Y
#   - Which scope? (your account)
#   - Link to existing project? N
#   - Project name? kindra-cbo
#   - Directory? ./
#   - Override settings? N
```

11. Copy your frontend URL: `https://kindra-cbo.vercel.app`

## Step 5: Update CORS

1. Go back to Render → Your service → Environment
2. Update these variables with YOUR Vercel URL:
   ```
   CORS_ALLOWED_ORIGINS=https://kindra-cbo.vercel.app,https://kindra-cbo-git-main.vercel.app
   CSRF_TRUSTED_ORIGINS=https://kindra-cbo.vercel.app,https://kindra-cbo-git-main.vercel.app
   ```
3. Service will auto-redeploy (2-3 minutes)

## Step 6: Test Everything! ✅

### Test Backend
1. Visit: `https://kindra-backend.onrender.com/admin`
2. Login with superuser credentials
3. Should see Django admin panel ✓

### Test Frontend
1. Visit: `https://kindra-cbo.vercel.app`
2. Should see your app loading ✓

### Test Integration
1. Try registering a new user
2. Try logging in
3. Check if data appears in admin panel

## Step 7: Set Up Monitoring (Optional but Recommended)

### UptimeRobot (Keeps backend awake)
1. Go to: https://uptimerobot.com
2. Sign up (free)
3. Add New Monitor:
   - Type: HTTP(s)
   - URL: `https://kindra-backend.onrender.com/api/v1/health/`
   - Name: Kindra Backend
   - Interval: 5 minutes
4. This pings your backend every 5 min to keep it awake!

## 🎉 You're Live!

**Your URLs:**
- Frontend: `https://kindra-cbo.vercel.app`
- Backend: `https://kindra-backend.onrender.com`
- Admin Panel: `https://kindra-backend.onrender.com/admin`

## Future Updates

To deploy updates:
```powershell
# Make your changes
git add .
git commit -m "Description of changes"
git push

# Both Vercel and Render will auto-deploy!
```

## Troubleshooting

**Backend not loading?**
- Check Render logs: Dashboard → Your service → Logs
- Verify all environment variables are set

**CORS errors in frontend?**
- Check CORS_ALLOWED_ORIGINS includes your Vercel URL
- Check frontend .env.production has correct backend URL

**Need help?**
- Check `deployment_guide.md` in .gemini folder
- Check Render/Vercel documentation
- Review error logs in Render dashboard

## Important Notes

⚠️ **First load might be slow** - Render free tier spins down after 15 minutes of inactivity. First request takes ~30 seconds to spin up. Use UptimeRobot to prevent this!

✅ **Everything is FREE** - $0/month for this entire stack

✅ **Auto-deploy enabled** - Just `git push` to deploy updates

✅ **SSL/HTTPS included** - Automatic and free

---

**Total Setup Time:** ~30-45 minutes
**Monthly Cost:** $0
**Your app is production-ready!** 🚀
