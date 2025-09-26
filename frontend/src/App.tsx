import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import Login from './pages/Login'

function App() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('vistagram_token') : null
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={token ? <div style={{padding:16}}><h1>Vistagram</h1><p>Home placeholder. <Link to="/login">Switch user</Link></p></div> : <Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to={token ? '/' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
