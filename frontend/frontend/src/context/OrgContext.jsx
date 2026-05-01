import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/client'

const OrgContext = createContext(null)

export function OrgProvider({ children }) {
  const [currentOrg, setCurrentOrgState] = useState(() => {
    try { return JSON.parse(localStorage.getItem('taskflow_org')) } catch { return null }
  })
  const [myOrgs, setMyOrgs] = useState([])
  const [loadingOrgs, setLoadingOrgs] = useState(true)

  const fetchMyOrgs = async () => {
    // Don't call the API if we have no token — user isn't logged in yet
    const token = localStorage.getItem('access')
    if (!token) {
      setLoadingOrgs(false)
      return
    }
    try {
      const res = await api.get('/orgs/mine/')
      setMyOrgs(res.data)
      // If saved org no longer in list, clear it
      if (currentOrg && !res.data.find(o => o.id === currentOrg.id)) {
        clearOrg()
      }
    } catch {
      // Silently fail — auth errors are handled by client.js interceptor
      setMyOrgs([])
    } finally {
      setLoadingOrgs(false)
    }
  }

  useEffect(() => { fetchMyOrgs() }, [])

  const switchOrg = (org) => {
    setCurrentOrgState(org)
    localStorage.setItem('taskflow_org', JSON.stringify(org))
  }

  const clearOrg = () => {
    setCurrentOrgState(null)
    localStorage.removeItem('taskflow_org')
  }

  const refreshOrgs = () => fetchMyOrgs()

  return (
    <OrgContext.Provider value={{ currentOrg, myOrgs, loadingOrgs, switchOrg, clearOrg, refreshOrgs }}>
      {children}
    </OrgContext.Provider>
  )
}

export const useOrg = () => useContext(OrgContext)
