import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const faviconElement = document.getElementById('app-favicon') as HTMLLinkElement | null
const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)')

const updateFaviconForTheme = (isDarkMode: boolean) => {
  if (!faviconElement) {
    return
  }

  faviconElement.href = isDarkMode ? '/venture-logo-small-dark.png' : '/venture-logo-small.png'
}

updateFaviconForTheme(colorSchemeQuery.matches)
colorSchemeQuery.addEventListener('change', (event) => updateFaviconForTheme(event.matches))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
