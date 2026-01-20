# OAK Estimator - Modern React Version

A fully modernized construction cost estimation application built with React, TypeScript, and Tailwind CSS.

## Tech Stack

- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Firebase** - Authentication and real-time database
- **Radix UI** - Accessible component primitives

## Features

✨ **Modern Design**
- Dark theme with beautiful gradients
- Smooth animations and transitions
- Glass morphism effects
- Responsive layout

🔐 **Authentication**
- Google Sign-In
- User profile management
- Secure Firebase auth

💾 **Data Management**
- Real-time Firebase sync
- Offline persistence
- Multi-project support
- Auto-save functionality

♿ **Accessibility**
- ARIA labels and roles
- Keyboard navigation
- Screen reader support
- Focus management

📊 **Core Features** (In Development)
- [ ] Project settings and company information
- [ ] Line items table with drag & drop
- [ ] Material database browser (2,953 items)
- [ ] Calculator with basic & engineering modes
- [ ] PDF export functionality
- [ ] Real-time cost calculations
- [ ] AI Gap Analysis

## Getting Started

### Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Project Structure

```
src/
├── components/
│   ├── auth/           # Authentication components
│   ├── layout/         # Layout components (Header, Sidebar)
│   ├── projects/       # Project management components
│   ├── line-items/     # Line items table
│   ├── materials/      # Material browser
│   ├── calculator/     # Calculator component
│   └── ui/             # Reusable UI components
├── contexts/           # React contexts (Auth, Project)
├── hooks/              # Custom hooks
├── services/           # Firebase services
├── types/              # TypeScript interfaces
├── lib/                # Utilities and helpers
└── data/               # Static data (materials database)
```

## Architecture Highlights

### Type Safety
- Full TypeScript coverage
- Strict mode enabled
- Type-safe API calls
- Validated form inputs

### State Management
- React Context API for global state
- Custom hooks for reusability
- Optimistic UI updates
- Real-time sync with Firestore

### Performance
- Code splitting
- Lazy loading
- Virtual scrolling for large lists
- Optimized re-renders

### Security
- No inline event handlers
- Input sanitization
- Firebase Security Rules
- HTTPS only

## Development Progress

- [x] Project setup (Vite + React + TypeScript)
- [x] Tailwind CSS configuration
- [x] Firebase modular SDK integration
- [x] Component architecture and folder structure
- [x] State management (Context API + hooks)
- [x] Authentication components
- [ ] Project settings components
- [ ] Line items table
- [ ] Material browser
- [ ] Calculator component
- [ ] PDF export
- [ ] Accessibility features
- [ ] Animations and transitions

## Environment Variables

Create a `.env` file in the root directory:

```env
# Firebase credentials are currently hardcoded in src/services/firebase.ts
# For production, move these to environment variables
```

## Contributing

This is a modernization of the original OAK Estimator. The goal is to:
1. Improve code maintainability
2. Enhance user experience
3. Add modern features
4. Ensure accessibility
5. Optimize performance

## License

MIT
