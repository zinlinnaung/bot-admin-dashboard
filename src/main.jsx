import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './api-auth.js'

const normalizedPath = window.location.pathname.replace(/\/+$/, '') || '/'

async function bootstrap() {
  const Component =
    normalizedPath === '/reseller'
      ? (await import('./pages/ResellerDashboard.jsx')).default
      : (await import('./App.jsx')).default

  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <Component />
    </StrictMode>,
  )
}

void bootstrap()
