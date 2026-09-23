# Login Page Component Structure

This document outlines the React component structure for the Grand Astoria Hotel Management System Login Page.

## Component Hierarchy

```
App.jsx
└── LoginPage.jsx (pages/)
    ├── LoginLeftPanel.jsx (components/layout/)
    │   └── Hero Visual with Hotel Branding
    └── LoginRightPanel.jsx (components/layout/)
        ├── LanguageToggle.jsx (components/ui/)
        └── LoginForm.jsx (components/hotel/)
```

## File Structure

```
frontend/
├── src/
│   ├── pages/
│   │   └── LoginPage.jsx                    # Main login page container
│   ├── components/
│   │   ├── layout/
│   │   │   ├── LoginLeftPanel.jsx          # Left hero section with branding
│   │   │   └── LoginRightPanel.jsx         # Right authentication panel
│   │   ├── ui/
│   │   │   └── LanguageToggle.jsx          # VN/EN language switcher
│   │   └── hotel/
│   │       └── LoginForm.jsx               # Main authentication form
│   ├── styles/
│   │   └── index.css                       # Tailwind v4 + Custom styles
│   ├── App.jsx                             # Root component
│   └── main.jsx                            # Entry point
└── index.html                              # HTML template
```

## Component Details

### 1. LoginPage.jsx
- **Location**: `src/pages/LoginPage.jsx`
- **Purpose**: Main container for the login page
- **State**: Manages language selection (VN/EN)
- **Features**:
  - Background radial gradient overlay
  - Responsive grid layout (mobile stack, desktop 50/50 split)

### 2. LoginLeftPanel.jsx
- **Location**: `src/components/layout/LoginLeftPanel.jsx`
- **Purpose**: Left panel with luxury hotel imagery and branding
- **Features**:
  - Full-screen background image with hover effect
  - Brand identity (logo, tagline)
  - Editorial quote section
  - Trust badges and version info
  - Multi-layer gradient overlays

### 3. LoginRightPanel.jsx
- **Location**: `src/components/layout/LoginRightPanel.jsx`
- **Purpose**: Right panel with authentication interface
- **Props**: 
  - `language`: Current language ('vn' | 'en')
  - `setLanguage`: Function to change language
- **Features**:
  - Property/hotel cluster badge
  - Language toggle component
  - Login form
  - Role badges display
  - IT support contact info

### 4. LanguageToggle.jsx
- **Location**: `src/components/ui/LanguageToggle.jsx`
- **Purpose**: Language switcher UI component
- **Props**: 
  - `language`: Current language
  - `setLanguage`: Function to update language
- **Features**:
  - Toggle between VN/EN
  - Active state styling with golden accent
  - Smooth transitions

### 5. LoginForm.jsx
- **Location**: `src/components/hotel/LoginForm.jsx`
- **Purpose**: Main authentication form with validation
- **State Management**:
  - `username`: User's login name
  - `password`: User's password
  - `showPassword`: Toggle password visibility
  - `rememberMe`: Remember user session
  - `isLoading`: Form submission state
  - `alertMessage`: Success/error feedback
  - `alertType`: Alert category
- **Features**:
  - Username input with badge icon
  - Password input with visibility toggle
  - Show password checkbox
  - Remember me option
  - Forgot password link
  - Submit button with loading state
  - Dynamic feedback alerts
  - Form validation

## Styling Approach

### Tailwind CSS v4
- Custom theme configuration in `src/styles/index.css`
- Dark luxury hotel theme with golden accents
- Material Design 3 color system
- Custom font families:
  - **Newsreader**: Headlines and display text
  - **Hanken Grotesk**: Body text and labels

### Custom CSS Features
- Material Symbols Outlined icons
- Radial gradient backgrounds
- Glass morphism effects
- Custom input focus states with golden glow
- Enhanced scrollbar styling
- Smooth transitions and animations

## Key Design Elements

### Color Palette
- **Primary Gold**: `#D4AF37` (luxury golden accent)
- **Background**: `#0D1214` (deep dark base)
- **Surface**: Various shades for depth and hierarchy
- **Text**: High contrast with on-surface variants

### Typography Scale
- Display Large: 3.5rem (56px)
- Headline Large: 2.25rem (36px)
- Headline Medium: 1.5rem (24px)
- Body Large: 1.125rem (18px)
- Label variants for UI elements

### Responsive Breakpoints
- Mobile: Full-width stacked panels
- Tablet/Desktop (lg): 50/50 split with grid layout

## Integration Notes

### Current Dependencies Used
- **React**: Component framework
- **Tailwind CSS v4**: Utility-first styling
- **Material Symbols**: Icon system
- **Google Fonts**: Newsreader + Hanken Grotesk

### No Additional Dependencies Required
All functionality is built with existing dependencies from `package.json`.

## Future Enhancements

### Recommended Additions
1. **Authentication Service**: Connect to backend API
2. **Form Validation**: Add Zod or Yup schema validation
3. **Routing**: React Router for navigation after login
4. **State Management**: Context or Zustand for global auth state
5. **Error Handling**: Better error messages and retry logic
6. **Accessibility**: ARIA labels and keyboard navigation
7. **Internationalization**: i18n for multi-language support
8. **Animation**: Framer Motion for enhanced UX

## Usage

### Development Server
```bash
cd frontend
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Notes

- All components use functional components with React Hooks
- Styling follows Tailwind utility classes with custom theme
- Form handling is currently simulated (900ms delay)
- Language toggle updates state but doesn't change content yet
- Background image uses Google's hosted URL
- Material Icons loaded via Google Fonts CDN in CSS

