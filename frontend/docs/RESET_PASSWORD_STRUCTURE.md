# Reset Password Page - Component Structure

## 📂 Component Hierarchy

```
App.jsx
└── ResetPasswordPage.jsx (pages/)
    ├── ResetPasswordLeftPanel.jsx (components/layout/)
    │   └── Hotel Heritage Brand Display
    └── ResetPasswordRightPanel.jsx (components/layout/)
        └── ResetPasswordForm.jsx (components/hotel/)
            ├── Username Input
            ├── New Password Input (with strength meter)
            ├── Confirm Password Input (with match validation)
            ├── Submit Button (with loading states)
            └── Success Toast Notification
```

## 📁 File Organization

```
frontend/src/
├── pages/
│   └── ResetPasswordPage.jsx ................. Main page container
│
├── components/
│   ├── layout/
│   │   ├── ResetPasswordLeftPanel.jsx ........ Hotel imagery panel
│   │   └── ResetPasswordRightPanel.jsx ....... Form container panel
│   │
│   └── hotel/
│       └── ResetPasswordForm.jsx ............. Password reset form logic
│
└── styles/
    └── index.css ............................. Shared styles (already exists)
```

## 🎯 Component Details

### 1. ResetPasswordPage.jsx
**Location**: `src/pages/ResetPasswordPage.jsx`

**Purpose**: Main container for password reset page

**Features**:
- Radial gradient background overlay
- Responsive grid layout
- Rounded card container with backdrop blur

**Layout**:
- Desktop: 50/50 split (left panel + right panel)
- Mobile: Stacked (right panel only, left hidden)

---

### 2. ResetPasswordLeftPanel.jsx
**Location**: `src/components/layout/ResetPasswordLeftPanel.jsx`

**Purpose**: Left panel with hotel branding and imagery

**Features**:
- Full-height background image
- Multi-layer gradient overlays
- Hotel classification badge (5-star)
- System version indicator
- Brand typography and tagline
- Status bar with live indicator
- Hidden on mobile (lg:flex)

**Content**:
- Top: Property badge + version
- Center: Grand Astoria branding
- Bottom: Server status + security level

---

### 3. ResetPasswordRightPanel.jsx
**Location**: `src/components/layout/ResetPasswordRightPanel.jsx`

**Purpose**: Right panel container for form

**Features**:
- Portal badge ("Cổng Quản Trị Khách Sạn")
- Back to login link
- Page title and description
- Form integration
- IT support footer
- Security compliance badges

**Content**:
- Top: Header with navigation
- Middle: Form component
- Bottom: Support info + security badges

---

### 4. ResetPasswordForm.jsx
**Location**: `src/components/hotel/ResetPasswordForm.jsx`

**Purpose**: Password reset form with validation

**State Management**:
```javascript
- username: string
- newPassword: string
- confirmPassword: string
- showNewPassword: boolean
- showConfirmPassword: boolean
- passwordStrength: 0-3 (weak/medium/strong)
- strengthText: string
- matchStatus: string ('TRÙNG KHỚP' | 'HỢP LỆ' | 'CHƯA TRÙNG')
- isSubmitting: boolean
- showSuccessToast: boolean
- isSuccess: boolean
```

**Key Features**:

#### A. Username/Employee ID Input
- Icon: account_circle
- Placeholder: Vietnamese
- Required field
- Auto-focus ready

#### B. New Password Input
- Icon: lock
- Min length: 8 characters
- Show/hide toggle
- **Real-time strength meter**:
  - 3-bar visual indicator
  - Color-coded (red/yellow/gold)
  - Text feedback
  - Criteria:
    - Length ≥ 8
    - Uppercase + numbers
    - Special characters

#### C. Confirm Password Input
- Icon: lock_reset
- Show/hide toggle
- **Real-time match validation**:
  - Updates on every keystroke
  - Shows status: TRÙNG KHỚP / HỢP LỆ / CHƯA TRÙNG
  - Color-coded feedback

#### D. Submit Button States
1. **Default**: "CẬP NHẬT MẬT KHẨU" + arrow
2. **Submitting**: Spinner + "ĐANG XỬ LÝ..."
3. **Success**: Checkmark + "ĐÃ CẬP NHẬT"

#### E. Success Toast
- Appears after successful submission
- Contains:
  - Check circle icon
  - Success title
  - Next steps message
- Animated fade-in

---

## 🎨 Password Strength Algorithm

```javascript
function calculateStrength(password) {
  let score = 0;
  
  // Criterion 1: Length
  if (password.length >= 8) score++;
  
  // Criterion 2: Uppercase + Numbers
  if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score++;
  
  // Criterion 3: Special Characters
  if (/[^A-Za-z0-9]/.test(password)) score++;
  
  return score; // 0-3
}
```

**Visual Feedback**:
- Score 0: 3 gray bars
- Score 1: 1 red bar → "Mức độ: Yếu"
- Score 2: 2 gold bars → "Mức độ: Trung bình"
- Score 3: 3 gold bars → "Mức độ: Rất an toàn"

---

## 🔄 Password Match Validation

```javascript
function checkMatch(newPassword, confirmPassword) {
  if (!confirmPassword) return 'TRÙNG KHỚP' (neutral);
  
  if (newPassword === confirmPassword) {
    return 'HỢP LỆ' (gold color);
  } else {
    return 'CHƯA TRÙNG' (error color);
  }
}
```

---

## 🚀 Form Submission Flow

```
User fills form
    │
    ├─► Username
    ├─► New Password (validates strength)
    └─► Confirm Password (validates match)
         │
         ▼
    [Click "CẬP NHẬT MẬT KHẨU"]
         │
         ├─► Check if passwords match
         │   ├─► If not: Show alert, stop
         │   └─► If yes: Continue
         │
         ├─► setIsSubmitting(true)
         ├─► Button shows "ĐANG XỬ LÝ..."
         │
         ▼
    [900ms Simulated API Call]
         │
         ▼
    [Success Response]
         │
         ├─► setIsSubmitting(false)
         ├─► setShowSuccessToast(true)
         ├─► setIsSuccess(true)
         ├─► Button shows "ĐÃ CẬP NHẬT"
         │
         └─► Show success toast notification
         
    ⏳ TODO: Redirect to login page
```

---

## 🎨 Design System (Shared with Login Page)

### Colors
- Primary Gold: `#d4af37`
- Background: `#0b1514`
- Surface Container: `#172120`
- Text (on-surface): `#dae5e3`
- Secondary: `#b1ccc8`
- Error: `#ffb4ab`

### Typography
- Headline Medium: 24-36px (Newsreader)
- Body Medium: 15px (Hanken Grotesk)
- Label Medium: 12px (Hanken Grotesk)
- Label Small: 11px (Hanken Grotesk)

### Icons
- Material Symbols Outlined
- Size: 20-24px
- Dynamic colors based on state

---

## 📱 Responsive Behavior

### Desktop (≥ 1024px)
```
┌─────────────┬─────────────┐
│             │             │
│  Left       │  Right      │
│  Panel      │  Panel      │
│  (Hotel     │  (Form)     │
│  Imagery)   │             │
│             │             │
│  50%        │  50%        │
└─────────────┴─────────────┘
```

### Mobile (< 1024px)
```
┌─────────────────────┐
│                     │
│  Right Panel        │
│  (Form Only)        │
│                     │
│  Left Panel Hidden  │
│                     │
└─────────────────────┘
```

---

## 🔗 Navigation Links

### From Login Page
```jsx
<a href="/reset-password">Quên mật khẩu?</a>
```

### Back to Login (2 places)
1. Top right corner
2. Below submit button

```jsx
<a href="/login">Quay lại đăng nhập</a>
```

---

## ✨ Key Features Summary

✅ **Username validation** - Required field
✅ **Password strength meter** - 3-level visual indicator
✅ **Real-time password matching** - Instant feedback
✅ **Show/hide password** - Toggle visibility for both fields
✅ **Loading states** - Button transforms during submission
✅ **Success notification** - Toast message after successful reset
✅ **Form validation** - Client-side validation before submission
✅ **Accessibility** - ARIA labels and semantic HTML
✅ **Responsive design** - Mobile-first approach
✅ **Consistent styling** - Matches login page design system

---

## 🔧 Future Enhancements

### Backend Integration
```javascript
// src/services/authService.js
export const resetPassword = async (username, newPassword) => {
  const response = await axios.post(`${API_URL}/auth/reset-password`, {
    username,
    newPassword
  });
  return response.data;
};
```

### React Router Integration
```javascript
// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

<BrowserRouter>
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/reset-password" element={<ResetPasswordPage />} />
  </Routes>
</BrowserRouter>
```

### Email Verification
- Add email input field
- Send verification code
- Validate code before password reset

### Security Enhancements
- Rate limiting on submit
- CAPTCHA integration
- Password history check
- Account lockout after failed attempts

---

## 📊 Comparison: Login vs Reset Password

| Feature | Login Page | Reset Password Page |
|---------|------------|---------------------|
| **Left Panel** | ✅ Same hotel branding | ✅ Same hotel branding |
| **Right Panel** | Login form | Reset password form |
| **Inputs** | 2 (username, password) | 3 (username, new, confirm) |
| **Validation** | Basic required | Advanced strength meter |
| **Submit Action** | Login | Update password |
| **Extra Features** | Language toggle, remember me | Strength meter, match validation |

---

## 🧪 Testing Checklist

- [ ] Username input accepts text
- [ ] New password shows strength meter
- [ ] Strength meter updates correctly (weak/medium/strong)
- [ ] Confirm password shows match status
- [ ] Match status updates in real-time
- [ ] Show/hide toggles work for both password fields
- [ ] Form validates minimum 8 characters
- [ ] Submit button shows loading state
- [ ] Success toast appears after submission
- [ ] "Quay lại đăng nhập" links work
- [ ] Responsive on mobile devices
- [ ] All icons display correctly
- [ ] Form can't submit with mismatched passwords

---

**Status**: ✅ Fully Implemented and Ready for Testing
**Next Step**: Integrate with Backend API for actual password reset functionality
