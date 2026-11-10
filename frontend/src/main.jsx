import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.jsx'
import { ThemeProvider } from './contexts/ThemeContext'

// Font icon đã nằm trong gói; chỉ hiện icon sau khi font sẵn sàng để không lộ chữ tên icon.
// Nếu font không nạp được vẫn hiện (không để icon ẩn mãi).
const showIcons = () => document.documentElement.classList.add('icons-ready')
if (document.fonts?.load) {
  document.fonts.load("24px 'Material Symbols Outlined Variable'", 'check').then(showIcons, showIcons)
} else {
  showIcons()
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
