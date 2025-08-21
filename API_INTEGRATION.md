# SoulSync Matrimony - API Integration Guide

## Overview
This guide provides comprehensive information about integrating with the SoulSync Matrimony backend API.

## Base Configuration

### API Endpoints
- **Production**: `https://api.soulsync.com/api/v1`
- **Staging**: `https://staging-api.soulsync.com/api/v1`
- **Development**: `http://localhost:8000/api/v1`

### WebSocket Connections
- **Production**: `wss://api.soulsync.com`
- **Staging**: `wss://staging-api.soulsync.com`
- **Development**: `ws://localhost:8000`

## Authentication

### Login Flow
```typescript
// Login request
POST /auth/login
{
  "email": "user@example.com",
  "password": "password123",
  "remember_me": true
}

// Response
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "expires_in": 3600
  }
}
```

### Token Management
```typescript
// Set authorization header for all requests
const token = localStorage.getItem('auth_token');
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};
```

### Refresh Token
```typescript
POST /auth/refresh
{
  "refresh_token": "refresh_token_here"
}
```

## Core API Endpoints

### User Management
```typescript
// Get current user profile
GET /user/profile

// Update user profile
PUT /user/profile
{
  "first_name": "John",
  "last_name": "Doe",
  "bio": "Updated bio",
  "interests": ["music", "travel"]
}

// Upload profile photo
POST /user/photos
Content-Type: multipart/form-data
{
  "photo": <file>,
  "is_primary": true
}

// Get user photos
GET /user/photos

// Delete photo
DELETE /user/photos/{photoId}
```

### Matching System
```typescript
// Get match suggestions
GET /matches/suggestions?page=1&limit=20

// Like a user
POST /matches/like
{
  "user_id": 123
}

// Pass (dislike) a user
POST /matches/pass
{
  "user_id": 123
}

// Super like a user
POST /matches/super-like
{
  "user_id": 123
}

// Get mutual matches
GET /matches/mutual?page=1&limit=20

// Block a user
POST /users/{userId}/block
```

### Chat System
```typescript
// Get conversations
GET /conversations?page=1&limit=20

// Create conversation
POST /conversations
{
  "user_id": 456
}

// Get conversation messages
GET /conversations/{conversationId}/messages?page=1&limit=50

// Send message
POST /conversations/{conversationId}/messages
{
  "message": "Hello there!",
  "type": "text"
}

// Send voice message
POST /conversations/{conversationId}/messages
Content-Type: multipart/form-data
{
  "voice_message": <file>,
  "type": "voice",
  "duration": 30
}

// Mark messages as read
PUT /conversations/{conversationId}/read
{
  "message_ids": [1, 2, 3]
}
```

### Search and Browsing
```typescript
// Browse profiles
GET /browse?page=1&limit=20&filters[age_min]=25&filters[age_max]=35

// Advanced search
POST /search
{
  "age_range": [25, 35],
  "location": "Colombo",
  "education": ["bachelor", "master"],
  "religion": "buddhist",
  "interests": ["travel", "music"]
}

// Get recent profiles
GET /browse/recent?limit=10

// Get premium profiles
GET /browse/premium?limit=10

// Get verified profiles
GET /browse/verified?limit=10
```

### Subscription Management
```typescript
// Get subscription plans
GET /subscription/plans

// Subscribe to plan
POST /subscription/subscribe
{
  "plan_id": "premium_monthly",
  "payment_method": "stripe",
  "payment_token": "token_from_stripe"
}

// Get current subscription
GET /subscription/current

// Cancel subscription
DELETE /subscription/cancel

// Get payment history
GET /subscription/payments?page=1&limit=20
```

### Horoscope System
```typescript
// Get user horoscope
GET /horoscope

// Create/Update horoscope
POST /horoscope
{
  "sun_sign": "aries",
  "moon_sign": "taurus",
  "birth_time": "10:30",
  "birth_place": "Colombo, Sri Lanka",
  "birth_date": "1990-05-15"
}

// Get compatibility report
GET /horoscope/compatibility/{userId}

// Get daily horoscope
GET /horoscope/daily/{sign}
```

### Admin API
```typescript
// Get admin dashboard stats
GET /admin/dashboard/stats

// User management
GET /admin/users?page=1&limit=20&search=john
PUT /admin/users/{userId}/status
{
  "status": "active|suspended|banned"
}

// Content management
GET /admin/content/reports?page=1&limit=20
PUT /admin/content/reports/{reportId}/action
{
  "action": "approve|reject|delete"
}

// System settings
GET /admin/settings
PUT /admin/settings
{
  "category": "email",
  "settings": {
    "smtp_host": "smtp.gmail.com",
    "smtp_port": 587
  }
}
```

## WebSocket Events

### Connection Setup
```typescript
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

const echo = new Echo({
  broadcaster: 'pusher',
  key: process.env.PUSHER_APP_KEY,
  cluster: process.env.PUSHER_APP_CLUSTER,
  wsHost: window.location.hostname,
  wsPort: 6001,
  wssPort: 6001,
  forceTLS: false,
  encrypted: true,
  disableStats: true,
  auth: {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
});
```

### Chat Events
```typescript
// Listen for new messages
echo.private(`conversation.${conversationId}`)
  .listen('MessageSent', (e) => {
    console.log('New message:', e.message);
  });

// Listen for typing indicators
echo.private(`conversation.${conversationId}`)
  .listen('UserTyping', (e) => {
    console.log('User typing:', e.user_id);
  });

// Listen for message read receipts
echo.private(`conversation.${conversationId}`)
  .listen('MessagesRead', (e) => {
    console.log('Messages read:', e.message_ids);
  });
```

### Match Events
```typescript
// Listen for new matches
echo.private(`user.${userId}`)
  .listen('NewMatch', (e) => {
    console.log('New match:', e.match);
  });

// Listen for likes
echo.private(`user.${userId}`)
  .listen('UserLiked', (e) => {
    console.log('Someone liked you:', e.user);
  });
```

### Notification Events
```typescript
// Listen for general notifications
echo.private(`user.${userId}`)
  .listen('NotificationSent', (e) => {
    console.log('New notification:', e.notification);
  });
```

## Error Handling

### Standard Error Response Format
```typescript
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field_name": ["Field specific error message"]
  },
  "error_code": "VALIDATION_ERROR"
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `429` - Rate Limited
- `500` - Server Error

### Error Handling Implementation
```typescript
// Global error interceptor
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Handle authentication error
          this.authService.logout();
          this.router.navigate(['/auth/login']);
        } else if (error.status === 422) {
          // Handle validation errors
          this.showValidationErrors(error.error.errors);
        } else if (error.status === 429) {
          // Handle rate limiting
          this.showRateLimitError();
        }
        return throwError(error);
      })
    );
  }
}
```

## File Upload

### Image Upload
```typescript
// Upload profile photo
const formData = new FormData();
formData.append('photo', file);
formData.append('is_primary', 'true');

POST /user/photos
Content-Type: multipart/form-data
Body: formData

// Constraints
- Max file size: 5MB
- Allowed formats: JPEG, PNG, GIF, WebP
- Max dimensions: 2048x2048
```

### Voice Message Upload
```typescript
// Upload voice message
const formData = new FormData();
formData.append('voice_message', audioBlob);
formData.append('duration', '30');

POST /conversations/{conversationId}/messages
Content-Type: multipart/form-data
Body: formData

// Constraints
- Max file size: 10MB
- Allowed formats: MP3, M4A, WAV
- Max duration: 2 minutes
```

## Rate Limiting

### Limits
- **Authentication**: 5 requests per minute
- **API calls**: 100 requests per minute
- **File uploads**: 10 requests per minute
- **Search**: 20 requests per minute

### Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1609459200
```

## Pagination

### Request Parameters
```typescript
GET /endpoint?page=1&limit=20&sort=created_at&order=desc
```

### Response Format
```typescript
{
  "success": true,
  "data": [...],
  "meta": {
    "current_page": 1,
    "total_pages": 10,
    "total_items": 200,
    "items_per_page": 20,
    "has_next_page": true,
    "has_previous_page": false
  }
}
```

## Testing

### API Testing with Postman
1. Import the Postman collection from `/docs/postman/`
2. Set environment variables
3. Run authentication request
4. Test other endpoints

### Integration Testing
```typescript
// Example test
describe('User API', () => {
  it('should get user profile', async () => {
    const response = await request(app)
      .get('/api/v1/user/profile')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
      
    expect(response.body.success).toBe(true);
    expect(response.body.data.user).toBeDefined();
  });
});
```

## Security Considerations

### CSRF Protection
```typescript
// Include CSRF token in headers
const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
headers['X-CSRF-TOKEN'] = csrfToken;
```

### CORS Configuration
```typescript
// Allowed origins
const allowedOrigins = [
  'https://soulsync.com',
  'https://www.soulsync.com',
  'https://app.soulsync.com'
];
```

### Input Validation
- Sanitize all user inputs
- Validate file uploads
- Check content length limits
- Use parameterized queries

## Support and Troubleshooting

### Common Issues
1. **CORS errors**: Check allowed origins
2. **Authentication failures**: Verify token format
3. **File upload failures**: Check file size and format
4. **WebSocket connection issues**: Verify connection URL and authentication

### Debug Mode
```typescript
// Enable debug logging
localStorage.setItem('debug', 'api:*');
```

### Contact
- API Documentation: https://docs.soulsync.com
- Support: api-support@soulsync.com
- GitHub Issues: https://github.com/soulsync/issues
