# SoulSync Matrimony - Angular Frontend

A modern, responsive Angular application for the SoulSync Matrimony platform, designed to help users find their perfect match with a beautiful, romantic interface.

## 🚀 Features

- **Modern Angular 19** with standalone components
- **Romantic UI/UX** with soft pink, rose gold, and lavender color scheme
- **Responsive Design** optimized for mobile and desktop
- **Real-time Features** with WebSocket integration
- **Authentication System** with JWT tokens
- **Role-based Access Control** for admin features
- **Progressive Web App** capabilities
- **Tailwind CSS** for styling

## 🛠 Tech Stack

- **Framework**: Angular 19
- **Styling**: Tailwind CSS
- **State Management**: RxJS Observables
- **HTTP Client**: Angular HttpClient with interceptors
- **Routing**: Angular Router with lazy loading
- **Forms**: Angular Reactive Forms
- **Authentication**: JWT with HTTP interceptors
- **Real-time**: WebSocket integration
- **Icons**: Emoji-based icons for romantic feel

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd matrimony-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   - Copy `src/environments/environment.ts` and update API URLs
   - Set your backend API endpoint
   - Configure WebSocket URL

4. **Start development server**
   ```bash
   npm start
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 🏗 Project Structure

```
src/
├── app/
│   ├── auth/                    # Authentication components
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── dashboard/               # Dashboard components
│   ├── profile/                 # Profile management
│   ├── matches/                 # Matching system
│   ├── chat/                    # Messaging system
│   ├── search/                  # User search
│   ├── subscription/            # Payment & subscriptions
│   ├── notifications/           # Notification system
│   ├── settings/                # User settings
│   ├── admin/                   # Admin panel
│   ├── errors/                  # Error pages
│   ├── layouts/                 # Layout components
│   ├── guards/                  # Route guards
│   ├── interceptors/            # HTTP interceptors
│   ├── models/                  # TypeScript interfaces
│   └── services/                # API services
├── environments/                # Environment configuration
└── styles.css                   # Global styles
```

## 🎨 Design System

### Color Palette
- **Primary**: Soft pink (#ec4899)
- **Rose**: Rose gold (#f43f5e)
- **Lavender**: Purple (#a855f7)
- **Beige**: Warm beige (#e5d9cc)
- **Gold**: Accent gold (#f59e0b)

### Typography
- **Headings**: Playfair Display (romantic serif)
- **Body**: Inter (clean sans-serif)

### Components
- **Cards**: Soft shadows with rounded corners
- **Buttons**: Gradient backgrounds with hover effects
- **Forms**: Clean inputs with focus states
- **Icons**: Emoji-based for romantic feel

## 🔐 Authentication

The app uses JWT tokens for authentication with automatic token refresh:

```typescript
// Login
this.authService.login(credentials).subscribe(response => {
  // Token automatically stored
  this.router.navigate(['/dashboard']);
});

// Protected routes
canActivate: [AuthGuard]
```

## 📱 Responsive Design

- **Mobile-first** approach
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Touch-friendly** interface
- **Progressive enhancement**

## 🔄 State Management

Uses RxJS Observables for reactive state management:

```typescript
// User state
this.authService.currentUser$.subscribe(user => {
  this.currentUser = user;
});

// Real-time updates
this.websocketService.messages$.subscribe(message => {
  // Handle new messages
});
```

## 🚀 Deployment

### Development
```bash
npm start
```

### Production Build
```bash
npm run build
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 80
CMD ["npm", "start"]
```

## 🧪 Testing

```bash
# Unit tests
npm test

# E2E tests
npm run e2e

# Coverage
npm run test:coverage
```

## 📊 Performance

- **Lazy loading** for all feature modules
- **Code splitting** for optimal bundle sizes
- **Image optimization** with WebP support
- **Service Worker** for caching
- **Tree shaking** for unused code elimination

## 🔧 Configuration

### Environment Variables

```typescript
// environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api/v1',
  wsUrl: 'ws://localhost:6001',
  // ... other config
};
```

### API Integration

The frontend integrates with the Laravel backend API:

- **Base URL**: `/api/v1`
- **Authentication**: Bearer token
- **Real-time**: WebSocket connections
- **File uploads**: Multipart form data

## 🎯 Key Features

### User Features
- ✅ User registration and login
- ✅ Profile creation and editing
- ✅ Photo upload and management
- ✅ Match discovery and suggestions
- ✅ Real-time messaging
- ✅ User search and filtering
- ✅ Subscription management
- ✅ Notification system

### Admin Features
- ✅ User management
- ✅ Content moderation
- ✅ Report handling
- ✅ Analytics dashboard
- ✅ System settings

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- 📧 Email: support@soulsync.com
- 📖 Documentation: [API Docs](../matrimony-backend/API_DOCUMENTATION_COMPLETE.md)
- 🐛 Issues: GitHub Issues

## 🎉 Acknowledgments

- Built with ❤️ for connecting hearts
- Powered by Angular and Laravel
- Designed for modern web experiences
