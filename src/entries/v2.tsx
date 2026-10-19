import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import '../components/v2/App.css'
import AppV2 from '../components/v2/App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppV2 />
  </StrictMode>,
)
