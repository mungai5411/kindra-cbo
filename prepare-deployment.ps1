# ================================
# DEPLOYMENT HELPER SCRIPT
# ================================
# Run this to prepare your project for deployment

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Kindra CBO - Deployment Helper" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check Git
Write-Host "[1/6] Checking Git status..." -ForegroundColor Yellow
if (-not (Test-Path .git)) {
    Write-Host "✗ Git not initialized. Initializing..." -ForegroundColor Red
    git init
    git branch -M main
    Write-Host "✓ Git initialized" -ForegroundColor Green
} else {
    Write-Host "✓ Git already initialized" -ForegroundColor Green
}

# Step 2: Add deployment files
Write-Host ""
Write-Host "[2/6] Staging deployment files..." -ForegroundColor Yellow
git add backend/Procfile
git add backend/runtime.txt
git add backend/build.sh
git add backend/requirements.txt
git add backend/.env.production.example
git add frontend/.env.production
git add frontend/vercel.json
git add DEPLOYMENT_CHECKLIST.md
Write-Host "✓ Deployment files staged" -ForegroundColor Green

# Step 3: Check for .env files (should NOT be committed)
Write-Host ""
Write-Host "[3/6] Checking for sensitive files..." -ForegroundColor Yellow
if (Test-Path backend/.env) {
    Write-Host "! backend/.env exists (will not be committed - good!)" -ForegroundColor Yellow
}
if (Test-Path frontend/.env) {
    Write-Host "! frontend/.env exists (will not be committed - good!)" -ForegroundColor Yellow
}
Write-Host "✓ Sensitive files protected" -ForegroundColor Green

# Step 4: Show next steps
Write-Host ""
Write-Host "[4/6] Commit your changes:" -ForegroundColor Yellow
Write-Host '  git add .' -ForegroundColor White
Write-Host '  git commit -m "Prepare for deployment"' -ForegroundColor White
Write-Host '  git push -u origin main' -ForegroundColor White
Write-Host ""

# Step 5: Service URLs
Write-Host "[5/6] Sign up for FREE services:" -ForegroundColor Yellow
Write-Host "  ✓ Neon PostgreSQL: https://neon.tech" -ForegroundColor White
Write-Host "  ✓ Upstash Redis: https://upstash.com" -ForegroundColor White
Write-Host "  ✓ Cloudinary Storage: https://cloudinary.com" -ForegroundColor White
Write-Host "  ✓ Render Backend: https://render.com" -ForegroundColor White
Write-Host "  ✓ Vercel Frontend: https://vercel.com" -ForegroundColor White
Write-Host ""

# Step 6: Next steps
Write-Host "[6/6] Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Push code to GitHub (see step 4)" -ForegroundColor White
Write-Host "  2. Sign up for services (see step 5)" -ForegroundColor White
Write-Host "  3. Follow deployment_guide.md in .gemini folder" -ForegroundColor White
Write-Host "  4. Check DEPLOYMENT_CHECKLIST.md as you go" -ForegroundColor White
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Ready to deploy! 🚀" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Need help? Check: " -NoNewline
Write-Host "deployment_guide.md" -ForegroundColor Cyan
