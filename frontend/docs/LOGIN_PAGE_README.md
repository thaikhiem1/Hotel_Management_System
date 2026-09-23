# Grand Astoria Hotel PMS - Login Page

## 🎨 Overview

A luxury-themed hotel management system login page built with React, Vite, and Tailwind CSS v4. Features a sophisticated dark theme with golden accents, inspired by Material Design 3 principles.

## 🚀 Quick Start

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (if not already installed)
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Component Structure

```
LoginPage
├── LoginLeftPanel (Hero + Branding)
└── LoginRightPanel (Authentication Form)
    ├── LanguageToggle (VN/EN Switcher)
    └── LoginForm (Username/Password Form)
```

## ✨ Features

### Left Panel - Brand Experience
- 🖼️ Full-screen luxury hotel imagery with parallax hover effect
- 🏨 Grand Astoria branding with hotel class icon
- ⭐ PMS Enterprise Edition badge
- 💬 Elegant editorial quote section
- 🔒 Security badges (256-bit SSL, PCI-DSS)
- 📊 Version indicator with live status

### Right Panel - Authentication
- 🏢 Multi-property cluster selector
- 🌐 Language toggle (Vietnamese/English)
- 👤 Username input with badge icon
- 🔑 Password input with visibility toggle
- ✅ Show password checkbox
- 💾 Remember me option
- 🔗 Forgot password link
- ⚡ Loading states during authentication
- 📢 Dynamic success/error alerts
- 🎭 Role badges display (Admin, Staff, Manager)
- 📞 IT support contact information

## 🎨 Design System

### Color Palette
- **Primary Gold**: `#D4AF37` - Luxury golden accent
- **Background**: `#0D1214` - Deep dark base
- **Surface Containers**: Multiple elevation levels
- **Text Hierarchy**: High contrast on-surface variants

### Typography
- **Display**: Newsreader (serif) - Headlines and editorial content
- **Body**: Hanken Grotesk (sans-serif) - UI text and labels
- **Icons**: Material Symbols Outlined

### Responsive Design
- 📱 Mobile: Stacked single-column layout
- 💻 Tablet/Desktop: 50/50 split grid layout
- Breakpoint: `lg` (1024px)

## 🛠️ Technology Stack

- **React 19**: UI framework
- **Vite 8**: Build tool
- **Tailwind CSS v4**: Utility-first CSS
- **Material Symbols**: Icon system
- **Google Fonts**: Newsreader + Hanken Grotesk

## 📝 Form State Management

The LoginForm component manages:
- `username` - User login identifier
- `password` - User password (toggleable visibility)
- `showPassword` - Boolean for password visibility
- `rememberMe` - Session persistence option
- `isLoading` - Submit button loading state
- `alertMessage` - Feedback message text
- `alertType` - 'success' or 'error'

## 🔌 Backend Integration (Future)

Currently simulated with 900ms delay. To integrate with your Spring Boot backend:

1. Create API service in `src/services/authService.js`
2. Connect to your `/api/auth/login` endpoint
3. Handle JWT tokens and session management
4. Add error handling and validation
5. Implement navigation to dashboard

### Example Integration

```javascript
// src/services/authService.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const login = async (username, password) => {
  const response = await axios.post(`${API_URL}/api/auth/login`, {
    username,
    password
  });
  
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  
  return response.data;
};
```

## 🎯 Next Steps

1. **Authentication Service**
   - Connect to backend Spring Boot API
   - JWT token management
   - Session persistence

2. **Routing**
   - Add React Router
   - Protected routes
   - Dashboard navigation

3. **Validation**
   - Form validation with Zod/Yup
   - Error messages
   - Input sanitization

4. **Internationalization**
   - i18n library integration
   - Language-specific content
   - Date/time formatting

5. **Accessibility**
   - ARIA labels
   - Keyboard navigation
   - Screen reader support

6. **Enhanced UX**
   - Loading skeletons
   - Toast notifications (Sonner is already installed!)
   - Smooth page transitions

## 🐛 Known Issues

- ✅ Fixed: CSS @import order (moved before Tailwind)
- ⏳ Simulated authentication (not connected to backend)
- ⏳ Language toggle updates state but doesn't translate content
- ⏳ No form validation beyond HTML5 required

## 📸 Preview

The login page features:
- **Left Side**: Stunning hotel lobby image with branded overlay
- **Right Side**: Clean, professional authentication interface
- **Color Scheme**: Dark luxury with golden accent highlights
- **Animations**: Smooth transitions, hover effects, loading states

## 🤝 Contributing

This component structure follows the folder organization defined in `FOLDER_STRUCTURE.md`:
- Pages in `src/pages/`
- Layout components in `src/components/layout/`
- UI components in `src/components/ui/`
- Hotel-specific components in `src/components/hotel/`

## 📄 License

Part of the Grand Astoria Hotel Management System SE113 project.

---

**Built with ❤️ for luxury hospitality management**
