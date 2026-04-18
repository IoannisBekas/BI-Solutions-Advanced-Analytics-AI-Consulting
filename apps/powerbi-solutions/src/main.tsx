import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

restoreGitHubPagesRoute()

function restoreGitHubPagesRoute() {
  const redirectKey = '__bisolutions_redirect__'

  try {
    const pendingRoute = sessionStorage.getItem(redirectKey)
    if (!pendingRoute) {
      return
    }

    sessionStorage.removeItem(redirectKey)
    const redirectUrl = new URL(pendingRoute, window.location.origin)
    if (redirectUrl.origin !== window.location.origin) {
      return
    }

    const restoredRoute = `${redirectUrl.pathname}${redirectUrl.search}${redirectUrl.hash}`
    if (restoredRoute !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
      window.history.replaceState(null, '', restoredRoute)
    }
  } catch (error) {
    console.warn('Unable to restore GitHub Pages route for Power BI Solutions.', error)
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
