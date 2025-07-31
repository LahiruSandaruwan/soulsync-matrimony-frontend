# SoulSync Matrimony Frontend - Development Guide

## 🚀 Git Workflow

### Branch Strategy
- **`main`** - Production-ready code
- **`develop`** - Development branch for integration
- **Feature branches** - Created from `develop` for new features

### Development Workflow

#### 1. Starting a New Feature
```bash
# Switch to develop branch
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/feature-name

# Make your changes and commit
git add .
git commit -m "feat: add feature description"

# Push feature branch
git push -u origin feature/feature-name
```

#### 2. Merging Features
```bash
# Create Pull Request from feature branch to develop
# After review and approval, merge to develop

# Update local develop
git checkout develop
git pull origin develop
```

#### 3. Releasing to Production
```bash
# When develop is stable, merge to main
git checkout main
git merge develop
git push origin main
```

## 🛠 Development Setup

### Prerequisites
- Node.js 18+ (Angular 19 compatible)
- npm or yarn
- Git

### Installation
```bash
# Clone repository
git clone https://github.com/LahiruSandaruwan/soulsync-matrimony-frontend.git
cd matrimony-frontend

# Install dependencies
npm install

# Start development server
npm start
```

### Environment Configuration
- Copy `src/environments/environment.ts` and update API URLs
- Set backend API endpoint
- Configure WebSocket URL for real-time features

## 📝 Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

feat: new feature
fix: bug fix
docs: documentation changes
style: formatting, missing semicolons, etc.
refactor: code refactoring
test: adding tests
chore: build process, tooling changes
```

### Examples
```bash
git commit -m "feat(auth): add social login with Google"
git commit -m "fix(profile): resolve photo upload issue"
git commit -m "docs(readme): update installation instructions"
```

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### E2E Tests
```bash
npm run e2e
```

### Coverage
```bash
npm run test:coverage
```

## 🏗 Project Structure

```
src/
├── app/
│   ├── auth/           # Authentication components
│   ├── dashboard/      # Dashboard components
│   ├── layouts/        # Layout components
│   ├── guards/         # Route guards
│   ├── interceptors/   # HTTP interceptors
│   ├── models/         # TypeScript interfaces
│   ├── services/       # API services
│   └── errors/         # Error pages
├── environments/       # Environment configuration
└── styles.css         # Global styles
```

## 🎨 Design System

### Colors
- **Primary**: #ec4899 (Soft pink)
- **Rose**: #f43f5e (Rose gold)
- **Lavender**: #a855f7 (Purple)
- **Beige**: #e5d9cc (Warm beige)
- **Gold**: #f59e0b (Accent gold)

### Typography
- **Headings**: Playfair Display (romantic serif)
- **Body**: Inter (clean sans-serif)

### Components
- Use Tailwind CSS classes
- Follow responsive design principles
- Include emoji icons for romantic feel

## 🔧 Code Quality

### Linting
```bash
npm run lint
```

### Formatting
```bash
npm run format
```

### Type Checking
```bash
npm run type-check
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

## 📞 Team Collaboration

### Pull Request Process
1. Create feature branch from `develop`
2. Implement feature with tests
3. Create Pull Request to `develop`
4. Code review and approval
5. Merge to `develop`
6. Deploy to staging for testing
7. Merge `develop` to `main` for production

### Code Review Checklist
- [ ] Code follows project conventions
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No console errors or warnings
- [ ] Responsive design tested
- [ ] Accessibility standards met

## 🐛 Troubleshooting

### Common Issues

#### Node Version Issues
```bash
# Use Node.js 18+ for Angular 19
nvm use 18
```

#### Dependency Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Build Issues
```bash
# Clear Angular cache
ng cache clean
```

## 📚 Resources

- [Angular Documentation](https://angular.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [RxJS Documentation](https://rxjs.dev/)

## 🎯 Next Steps

1. **Backend Integration** - Connect to Laravel API
2. **Real-time Features** - Implement WebSocket connections
3. **Profile Management** - Complete user profile system
4. **Match Discovery** - Implement matching algorithm
5. **Chat System** - Real-time messaging
6. **Payment Integration** - Subscription management
7. **Admin Panel** - Admin dashboard and tools

---

**Built with ❤️ for connecting hearts** 