import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { OrgProvider, useOrg } from './context/OrgContext'
import './index.css'

import Login from './pages/Login'
import Register from './pages/Register'
import OrgPicker from './pages/OrgPicker'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import Tasks from './pages/Tasks'
import Layout from './components/layout/Layout'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',color:'var(--text2)'}}>Loading…</div>
  return user ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? <Navigate to="/" replace /> : children
}

// Requires both login AND an org to be selected
function OrgGuard({ children }) {
  const { user, loading } = useAuth()
  const { currentOrg, loadingOrgs } = useOrg()
  if (loading || loadingOrgs) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',color:'var(--text2)'}}>Loading…</div>
  if (!user) return <Navigate to="/login" replace />
  if (!currentOrg) return <Navigate to="/orgs" replace />
  return children
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <OrgProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/orgs"     element={<PrivateRoute><OrgPicker /></PrivateRoute>} />
            <Route path="/" element={<OrgGuard><Layout /></OrgGuard>}>
              <Route index element={<Dashboard />} />
              <Route path="projects" element={<Projects />} />
              <Route path="projects/:id" element={<ProjectDetail />} />
              <Route path="tasks" element={<Tasks />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </OrgProvider>
    </AuthProvider>
  </React.StrictMode>
)

