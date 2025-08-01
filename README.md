# SoulSync Matrimony Frontend

A modern Angular application for the SoulSync Matrimony platform, featuring a clean, scalable, and modular architecture.

## 🏗️ Project Structure

The project follows a feature-based architecture with clear separation of concerns:

```
src/app/
├── core/                           # Core application functionality
│   ├── services/                   # Application services
│   │   ├── auth.service.ts
│   │   ├── chat.service.ts
│   │   ├── match.service.ts
│   │   ├── notification.service.ts
│   │   ├── payment.service.ts
│   │   ├── profile.service.ts
│   │   └── websocket.service.ts
│   ├── guards/                     # Route guards
│   │   ├── auth.guard.ts
│   │   └── role.guard.ts
│   ├── interceptors/               # HTTP interceptors
│   │   └── auth.interceptor.ts
│   └── models/                     # Data models
│       ├── chat.model.ts
│       ├── match.model.ts
│       ├── notification.model.ts
│       └── user.model.ts
├── shared/                         # Shared components and utilities
│   ├── components/                 # Reusable UI components
│   │   ├── chat-message/
│   │   ├── loading-spinner/
│   │   ├── modal/
│   │   ├── notification-item/
│   │   ├── pagination/
│   │   ├── photo-gallery/
│   │   ├── search-filter/
│   │   ├── subscription-plan/
│   │   ├── toast/
│   │   └── user-card/
│   ├── directives/                 # Custom directives
│   ├── pipes/                      # Custom pipes
│   └── ui/                         # UI utilities and styles
├── auth/                           # Authentication feature
│   ├── login/
│   ├── register/
│   ├── forgot-password/
│   └── reset-password/
├── dashboard/                      # User dashboard
│   └── user-dashboard/
├── profile/                        # User profile management
│   ├── profile-view/
│   ├── profile-edit/
│   └── photo-upload/
├── match/                          # Match management
│   └── match-suggestions/
├── chat/                           # Chat functionality
│   ├── chat-box/
│   └── chat-list/
├── search/                         # User search
│   └── search-users/
├── notifications/                  # Notification management
│   └── notification/
├── subscription/                   # Subscription management
│   └── subscription-plans/
├── settings/                       # User settings
│   └── account-settings/
├── admin/                          # Admin panel
│   ├── admin-dashboard/
│   ├── user-management/
│   ├── report-management/
│   ├── content-management/
│   └── settings/
├── layouts/                        # Layout components
│   ├── auth-layout/
│   └── main-layout/
├── error/                          # Error pages
│   ├── unauthorized/
│   └── page-not-found/
├── app.component.ts                # Root component
├── app.component.html
├── app.component.css
├── app.config.ts                   # Application configuration
├── app.routes.ts                   # Application routes
└── app.routes.server.ts
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Angular CLI (v17 or higher)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd matrimony-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
ng serve
```

4. Open your browser and navigate to `http://localhost:4200`

## 🏛️ Architecture Principles

### 1. Feature-Based Organization
- Each feature has its own directory with related components, services, and models
- Features are self-contained and can be easily moved or removed
- Clear separation between user-facing features and admin features

### 2. Core Module
- Contains application-wide services, guards, interceptors, and models
- No feature-specific logic should be in the core module
- Provides the foundation for all features

### 3. Shared Module
- Reusable components, directives, and pipes
- UI components that are used across multiple features
- Consistent styling and behavior across the application

### 4. Standalone Components
- All components are standalone for better tree-shaking
- No NgModules required
- Easier testing and maintenance

## 📁 Directory Structure Details

### Core (`/core`)
Contains the fundamental building blocks of the application:

- **Services**: Business logic and API communication
- **Guards**: Route protection and authorization
- **Interceptors**: HTTP request/response processing
- **Models**: TypeScript interfaces and data structures

### Shared (`/shared`)
Reusable components and utilities:

- **Components**: UI components used across features
- **Directives**: Custom Angular directives
- **Pipes**: Data transformation utilities
- **UI**: Global styles and design system

### Features
Each feature directory contains:

- Feature-specific components
- Feature-specific services (if needed)
- Feature-specific models (if needed)
- Feature-specific routing (if needed)

## 🛠️ Development Guidelines

### Component Structure
Each component follows the standard Angular structure:
```
component-name/
├── component-name.component.ts
├── component-name.component.html
└── component-name.component.scss
```

### Naming Conventions
- **Files**: kebab-case (e.g., `user-profile.component.ts`)
- **Classes**: PascalCase (e.g., `UserProfileComponent`)
- **Selectors**: kebab-case with app prefix (e.g., `app-user-profile`)
- **Directories**: kebab-case (e.g., `user-profile/`)

### Service Organization
- Core services in `/core/services`
- Feature-specific services in feature directories
- Services are singleton by default
- Use dependency injection for service communication

### Routing
- Main routes in `app.routes.ts`
- Feature-specific routes can be lazy-loaded
- Use route guards for protection
- Implement proper error handling

## 🧪 Testing

### Unit Tests
```bash
ng test
```

### E2E Tests
```bash
ng e2e
```

## 📦 Building

### Development Build
```bash
ng build
```

### Production Build
```bash
ng build --configuration production
```

## 🔧 Configuration

### Environment Files
- `src/environments/environment.ts` - Development configuration
- `src/environments/environment.prod.ts` - Production configuration

### Angular Configuration
- `angular.json` - Angular CLI configuration
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.js` - Tailwind CSS configuration

## 📚 Additional Resources

- [Angular Documentation](https://angular.io/docs)
- [Angular Style Guide](https://angular.io/guide/styleguide)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🤝 Contributing

1. Follow the established folder structure
2. Use the provided naming conventions
3. Write unit tests for new components and services
4. Update documentation as needed
5. Follow the Angular style guide

## 📄 License

This project is licensed under the MIT License.
