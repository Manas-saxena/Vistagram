import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy, useEffect, useState } from 'react'
import Loader from './components/Loader'
import { subscribeAuth, getAccessToken } from './services/auth'
const Login = lazy(() => import('./pages/Login'))
const Feed = lazy(() => import('./pages/Feed'))
const NewPost = lazy(() => import('./pages/NewPost'))
const PostDetail = lazy(() => import('./pages/PostDetail'))
const Signup = lazy(() => import('./pages/Signup'))

function App() {
  const [authToken, setAuthToken] = useState<string | null>(getAccessToken());

  useEffect(() => {
    const unsub = subscribeAuth(() => setAuthToken(getAccessToken()));
    return unsub;
  }, [])

  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/login" element={authToken ? <Navigate to="/" replace /> : <Login />} />
          <Route path="/signup" element={authToken ? <Navigate to="/" replace /> : <Signup />} />
          <Route path="/" element={authToken ? <Feed /> : <Navigate to="/login" replace />} />
          <Route path="/p/:id" element={authToken ? <PostDetail /> : <Navigate to="/login" replace />} />
          <Route path="/new" element={authToken ? <NewPost /> : <Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to={authToken ? '/' : '/login'} replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
