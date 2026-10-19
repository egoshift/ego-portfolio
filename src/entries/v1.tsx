import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import '../components/v1/App.css'
import AppV1 from '../components/v1/App'
import { WindowProvider } from '../contexts/Window.context'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WindowProvider>
      <AppV1 />
    </WindowProvider>
  </StrictMode>,
)
