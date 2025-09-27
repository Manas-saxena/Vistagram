import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Toaster } from 'react-hot-toast'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <Toaster position="top-center" toastOptions={{
      style: { background: '#0b1220', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' }
    }} />
  </React.StrictMode>,
)
