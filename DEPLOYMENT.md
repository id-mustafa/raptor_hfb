# Raptor HFB Deployment Guide - Render

## Prerequisites

1. **GitHub Repository**: Push your code to GitHub
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **Database**: You'll need a PostgreSQL database

## Deployment Steps

### Option 1: Using Render Dashboard (Recommended)

1. **Connect GitHub Repository**
   - Go to Render Dashboard
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Web Service**
   ```
   Name: raptor-hfb
   Environment: Docker
   Branch: main
   Dockerfile Path: ./Dockerfile
   ```

3. **Set Environment Variables**
   ```
   DATABASE_URL=postgresql://user:pass@host:port/dbname
   PYTHON_VERSION=3.12
   NODE_VERSION=22
   PORT=10000
   ```

4. **Advanced Settings**
   ```
   Health Check Path: /api/docs
   Auto-Deploy: Yes
   ```

### Option 2: Using render.yaml (Infrastructure as Code)

1. **Push render.yaml to your repo** (already created)
2. **Connect via Blueprint**
   - Go to Render Dashboard
   - Click "New +" → "Blueprint"
   - Connect your repository
   - Render will read render.yaml automatically

## Database Setup

### Option A: Render PostgreSQL (Recommended)

1. **Create Database**
   - Dashboard → "New +" → "PostgreSQL"
   - Name: `raptor-hfb-db`
   - Plan: Starter ($7/month)

2. **Get Connection String**
   - Copy the "External Database URL"
   - Add to your web service environment variables as `DATABASE_URL`

### Option B: External Database (Supabase, etc.)

1. **Create database on your provider**
2. **Get connection string**
3. **Add to environment variables**

## Environment Variables Setup

In your Render web service, add these environment variables:

```bash
# Required
DATABASE_URL=postgresql://user:pass@host:port/dbname

# Optional
SPORTSDATA_API_KEY=your_api_key_here
ENVIRONMENT=production
SECRET_KEY=your_secret_key_here
ALLOWED_ORIGINS=https://your-domain.com
```

## Frontend Configuration

If using Expo for mobile:

1. **Update API Base URL**
   ```typescript
   // In your frontend config
   const API_BASE_URL = process.env.NODE_ENV === 'production' 
     ? 'https://your-render-app.onrender.com/api'
     : 'http://localhost:4402';
   ```

2. **Build for Web** (if needed)
   ```bash
   cd frontend
   npm run build:web
   ```

## Database Migration

After deployment, run database migrations:

1. **Connect to your deployed app**
2. **Run migration script** (create one if needed)
   ```python
   # In backend/migrate.py
   from sqlmodel import SQLModel
   from backend.db import engine
   from backend.models import *  # Import all models
   
   def create_tables():
       SQLModel.metadata.create_all(engine)
   
   if __name__ == "__main__":
       create_tables()
   ```

3. **Execute via Render Shell**
   - Go to your service → "Shell"
   - Run: `python backend/migrate.py`

## Troubleshooting

### Common Issues

1. **Port Configuration**
   - Render sets `PORT` environment variable
   - Make sure Caddy uses `$PORT`

2. **Database Connection**
   - Verify `DATABASE_URL` format
   - Check SSL requirements (add `?sslmode=require` if needed)

3. **Build Failures**
   - Check build logs in Render dashboard
   - Verify all dependencies in requirements.txt

4. **Frontend Not Loading**
   - Check if Expo is configured for web
   - Verify proxy configuration in Caddyfile

### Health Check

Your app should respond at:
- `https://your-app.onrender.com/api/docs` - API documentation
- `https://your-app.onrender.com/` - Frontend

## Scaling

- **Starter Plan**: $7/month, good for development
- **Standard Plan**: $25/month, better performance
- **Pro Plan**: $85/month, production ready

## Monitoring

1. **Render Dashboard**: View logs, metrics, deployments
2. **Health Checks**: Automatic monitoring
3. **Alerts**: Set up via Render dashboard

## Custom Domain (Optional)

1. **Add Custom Domain** in Render dashboard
2. **Configure DNS** with your domain provider
3. **SSL Certificate** is automatic

## Backup Strategy

1. **Database Backups**: Render PostgreSQL includes daily backups
2. **Code Backups**: GitHub repository
3. **Environment Variables**: Document in secure location

## Cost Estimation

- **Web Service**: $7-25/month
- **PostgreSQL**: $7/month
- **Total**: ~$14-32/month for starter setup

## Next Steps After Deployment

1. **Test all endpoints**
2. **Verify database connections**
3. **Test betting functionality**
4. **Set up monitoring/alerts**
5. **Configure custom domain** (optional)
