# SoulSync Matrimony - Production Deployment Guide

## Overview
This guide covers the complete production deployment process for the SoulSync Matrimony Angular frontend application.

## Prerequisites

### System Requirements
- Node.js 18.x or higher
- npm 9.x or higher
- Angular CLI 17.x
- Docker (optional)
- Web server (Nginx recommended)

### Environment Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Configure environment variables
4. Build for production: `npm run build:prod`

## Environment Configuration

### Production Environment Variables
Update `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.soulsync.com/api/v1',
  wsUrl: 'wss://api.soulsync.com',
  
  // Payment Configuration
  payments: {
    stripe: {
      publishableKey: 'pk_live_YOUR_STRIPE_KEY_HERE'
    },
    paypal: {
      clientId: 'YOUR_PAYPAL_CLIENT_ID_HERE'
    }
  },
  
  // Analytics
  analytics: {
    enableGoogleAnalytics: true,
    googleAnalyticsId: 'G-YOUR_GA_ID_HERE'
  },
  
  // Push Notifications
  notifications: {
    enablePush: true,
    vapidPublicKey: 'YOUR_VAPID_PUBLIC_KEY_HERE'
  }
};
```

## Build Process

### Production Build
```bash
# Install dependencies
npm ci --production

# Build for production
ng build --configuration=production

# Verify build
ls -la dist/matrimony-frontend/
```

### Build Optimization
The production build includes:
- Tree shaking
- Dead code elimination
- Minification
- Compression
- Bundle splitting
- AOT compilation

## Deployment Options

### Option 1: Traditional Web Server (Recommended)

#### Nginx Configuration
```nginx
server {
    listen 80;
    listen 443 ssl http2;
    server_name soulsync.com www.soulsync.com;
    
    # SSL Configuration
    ssl_certificate /path/to/ssl/certificate.crt;
    ssl_certificate_key /path/to/ssl/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Root directory
    root /var/www/soulsync-frontend/dist/matrimony-frontend;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        application/atom+xml
        application/geo+json
        application/javascript
        application/x-javascript
        application/json
        application/ld+json
        application/manifest+json
        application/rdf+xml
        application/rss+xml
        application/xhtml+xml
        application/xml
        font/eot
        font/otf
        font/ttf
        image/svg+xml
        text/css
        text/javascript
        text/plain
        text/xml;
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Angular routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API proxy
    location /api/ {
        proxy_pass https://api.soulsync.com/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name soulsync.com www.soulsync.com;
    return 301 https://$server_name$request_uri;
}
```

### Option 2: Docker Deployment
```dockerfile
# Dockerfile
FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build:prod

FROM nginx:alpine
COPY --from=build /app/dist/matrimony-frontend /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
# Build and deploy
docker build -t soulsync-frontend .
docker run -d -p 80:80 -p 443:443 soulsync-frontend
```

### Option 3: Cloud Deployment (AWS S3 + CloudFront)
```bash
# Build for production
npm run build:prod

# Upload to S3
aws s3 sync dist/matrimony-frontend/ s3://soulsync-frontend-bucket --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

## Security Configuration

### Content Security Policy
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://js.stripe.com https://www.google-analytics.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https: blob:;
  connect-src 'self' https://api.soulsync.com wss://api.soulsync.com;
  frame-src 'self' https://js.stripe.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
">
```

### SSL/TLS Configuration
- Use TLS 1.2 or higher
- Implement HSTS headers
- Configure secure cipher suites
- Enable OCSP stapling

## Performance Optimization

### CDN Configuration
- Use CloudFront or similar CDN
- Configure proper cache headers
- Enable Brotli compression
- Implement HTTP/2

### Monitoring
- Set up application monitoring (New Relic, DataDog)
- Configure error tracking (Sentry)
- Monitor Core Web Vitals
- Set up uptime monitoring

## Backup and Recovery

### Database Backups
- Daily automated backups
- Weekly full backups
- Test restore procedures monthly

### Application Backups
- Version control (Git)
- Container registry backups
- Configuration backups

## Maintenance

### Regular Updates
- Security patches: Weekly
- Dependency updates: Monthly
- Angular updates: Quarterly

### Health Checks
```bash
# Application health check endpoint
curl -f https://soulsync.com/health || exit 1

# Performance monitoring
lighthouse https://soulsync.com --output=json

# Security scanning
npm audit --production
```

## Troubleshooting

### Common Issues
1. **Build failures**: Check Node.js version and dependencies
2. **Routing issues**: Verify server configuration for SPA
3. **API connectivity**: Check CORS and proxy settings
4. **Performance issues**: Review bundle size and lazy loading

### Logs Location
- Nginx: `/var/log/nginx/`
- Application: Browser console and server logs
- Docker: `docker logs container_name`

## Rollback Procedure

### Blue-Green Deployment
1. Deploy to staging environment
2. Run health checks
3. Switch traffic to new version
4. Monitor for issues
5. Rollback if necessary

### Quick Rollback
```bash
# Revert to previous version
git checkout previous-tag
npm run build:prod
# Deploy previous version
```

## Support and Maintenance

### Contact Information
- Development Team: dev@soulsync.com
- DevOps Team: devops@soulsync.com
- Emergency: +1-XXX-XXX-XXXX

### Documentation Updates
- Update this guide with any configuration changes
- Document new deployment procedures
- Maintain changelog for production releases
