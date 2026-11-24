import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { DynamicIslandProvider } from './components/DynamicIsland'
import Home from './pages/Home'
import Membership from './pages/Membership'
import Trainers from './pages/Trainers'
import Schedule from './pages/Schedule'
import Gallery from './pages/Gallery'
import Contact from './pages/Contact'
import Auth from './pages/Auth'
import MemberPortal from './pages/MemberPortal'
import AdminDashboard from './pages/AdminDashboard'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Global Dynamic Island — renders on top of everything */}
        <DynamicIslandProvider />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/trainers" element={<Trainers />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/portal" element={<MemberPortal />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
