import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './styles/App.css'
import PageLogin from "./pages/Login/PageLogin";
function App() {
  const [count, setCount] = useState(0)

  return (
    <PageLogin/>
  )
}

export default App
