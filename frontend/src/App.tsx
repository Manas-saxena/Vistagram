import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import Loader from './components/Loader'
const Login = lazy(() => import('./pages/Login'))
const Feed = lazy(() => import('./pages/Feed'))
const NewPost = lazy(() => import('./pages/NewPost'))
const PostDetail = lazy(() => import('./pages/PostDetail'))

function App() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('vistagram_token') : null
  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/login" element={token ? <Navigate to="/" replace /> : <Login />} />
          <Route path="/" element={token ? <Feed /> : <Navigate to="/login" replace />} />
          <Route path="/p/:id" element={token ? <PostDetail /> : <Navigate to="/login" replace />} />
          <Route path="/new" element={token ? <NewPost /> : <Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to={token ? '/' : '/login'} replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
