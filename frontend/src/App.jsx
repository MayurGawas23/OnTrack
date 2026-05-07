import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Landing from './pages/Landing'
import SignUp from './pages/SignUp'
import LogIn from './pages/Login'
import Onboard from './pages/Onboard'
import Tracker from './pages/Tracker'
import Profile from './pages/Profile'
import Analytics from './pages/Analytics'
import AiChat from './pages/AiChat'
import Layout from './components/Layout'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AuthRoute from './components/AuthRoute'
import About from './pages/About'

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path='/' element={<AuthRoute><Landing/></AuthRoute>}/>
        <Route path='/signup' element={<AuthRoute><SignUp/></AuthRoute>}/>
        <Route path='/login' element={<AuthRoute><LogIn/></AuthRoute>}/>
        <Route path='/onboard' element={<ProtectedRoute requireOnboarded={false}><Onboard/></ProtectedRoute>}/>
        <Route path='/about' element={<About/>}/>
        
        <Route element={<ProtectedRoute><Layout/></ProtectedRoute>}>
          <Route path='/tracker' element={<Tracker/>}/>
          <Route path='/profile' element={<Profile/>}/>
          <Route path='/analytics' element={<Analytics/>}/>
          <Route path='/ai-chat' element={<AiChat/>}/>
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
