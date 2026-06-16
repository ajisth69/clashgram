Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Starting Clashgram Proxy Worker Deployment" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Navigate to worker folder
cd clashgram-proxy-worker

# Install dependencies
Write-Host "`n[1/3] Installing dependencies..." -ForegroundColor Yellow
npm install

# Authenticate with Cloudflare
Write-Host "`n[2/3] Authenticating with Cloudflare..." -ForegroundColor Yellow
Write-Host "Please authorize the login in the browser window that opens." -ForegroundColor White
npx wrangler login

# Deploy
Write-Host "`n[3/3] Deploying worker to Cloudflare..." -ForegroundColor Yellow
npm run deploy

Write-Host "`n==========================================" -ForegroundColor Green
Write-Host "Deployment Completed Successfully!" -ForegroundColor Green
Write-Host "Copy the URL printed above and paste it into Clashgram settings." -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Read-Host "Press Enter to exit"
