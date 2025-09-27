import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy, useEffect, useState } from 'react'
import Loader from './components/Loader'
const Login = lazy(() => import('./pages/Login'))
const Feed = lazy(() => import('./pages/Feed'))
const NewPost = lazy(() => import('./pages/NewPost'))
const PostDetail = lazy(() => import('./pages/PostDetail'))

function App() {
  const [authToken,setAuthToken] = useState(localStorage.getItem('vistagram_token'));

  useEffect(()=>{
    const handler = ()=>{
        window?.addEventListener('vistagram-auth-changed', handler);
      setAuthToken(localStorage.getItem('vistagram_token'));
    }

    return ()=>{
       window?.removeEventListener('vistagram-auth-changed', handler);
    }
  },[])

  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/login" element={authToken ? <Navigate to="/" replace /> : <Login />} />
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
