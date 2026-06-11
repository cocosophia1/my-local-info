@echo off
echo ==========================================
echo Starting Cloudflare Pages deployment...
echo ==========================================
echo 1. Building the project...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Build failed.
    pause
    exit /b %errorlevel%
)
echo.
echo 2. Deploying to Cloudflare Pages...
echo.
call npx wrangler pages deploy out --project-name=my-local-info
echo ==========================================
echo Deployment finished.
echo ==========================================
pause
