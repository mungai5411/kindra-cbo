# 🚀 Quick Start - Kindra CBO System

## ✅ System Status
- Backend: ✅ Running on port 8000
- Frontend: ⏳ Ready to start on port 3000

## 🎯 To View the Landing Page

### Step 1: Start Frontend (if not running)
```bash
.\start_frontend.bat
```

### Step 2: Open Browser
Navigate to: **http://localhost:3000**

You should see:
- **Hero Section**: Purple gradient with "Empowering Lives, Building Futures"
- **Stats Cards**: 4 cards showing impact numbers
- **Features**: 4 impact areas with icons
- **CTA Section**: Donation and login buttons
- **Footer**: Professional branding

## 🔑 Login Credentials

**Admin Panel**: http://localhost:8000/admin

1. **Admin**: admin@kindra.org / admin123
2. **Case Manager**: casemanager@kindra.org / case123
3. **Volunteer**: volunteer@kindra.org / volunteer123
4. **Donations**: donations@kindra.org / donate123
5. **Staff**: staff@kindra.org / staff123

## 📍 Important URLs

- **Landing Page**: http://localhost:3000
- **Admin Panel**: http://localhost:8000/admin
- **API Docs**: http://localhost:8000/api/docs
- **Blog API**: http://localhost:8000/api/v1/blog/posts/

## 🎨 What's on the Landing Page

✨ **Professional Design**:
- Gradient hero section with animations
- Responsive stats cards
- Feature cards with hover effects
- Call-to-action section
- Professional footer

🎯 **Interactive Elements**:
- "Make a Donation" button → /donate
- "Read Our Stories" button → /blog
- "Staff Login" button → /login
- Smooth hover animations

## 🐛 If Frontend Doesn't Display

1. **Check if server is running**:
   - Look for "ready in X ms" message
   - Should show local URL

2. **Check browser console** (F12):
   - Look for JavaScript errors
   - Check network tab for failed requests

3. **Restart frontend**:
   ```bash
   # Stop current server (Ctrl+C)
   cd frontend
   npm run dev
   ```

## 📦 Sample Data Available

- 3 Blog Posts
- 3 Donation Campaigns
- 3 Donors with Donations
- 5 Test Users (different roles)

## 🎉 You're All Set!

The system is ready to use. Enjoy exploring the professional landing page!
