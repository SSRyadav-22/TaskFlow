import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useOrg } from '../context/OrgContext'
import { useAuth } from '../context/AuthContext'
import { Spinner, Btn, Input } from '../components/ui'

const HUES = [258, 214, 142, 32, 342, 186]

export default function OrgPicker() {
  const { myOrgs, switchOrg, refreshOrgs } = useOrg()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [allOrgs, setAllOrgs] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [newOrgName, setNewOrgName] = useState('')
  const [newOrgDesc, setNewOrgDesc] = useState('')
  const [joiningId, setJoiningId] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/orgs/').then(r => setAllOrgs(r.data.results ?? r.data)).finally(() => setLoading(false))
  }, [])

  const enter = (org) => {
    switchOrg(org)
    navigate('/')
  }

  const join = async (org) => {
    setJoiningId(org.id)
    try {
      await api.post(`/orgs/${org.id}/join/`)
      await refreshOrgs()
      enter(org)
    } catch (e) {
      setError(e.response?.data?.detail || 'Could not join.')
    } finally { setJoiningId(null) }
  }

  const createOrg = async (e) => {
    e.preventDefault(); setCreating(true); setError('')
    try {
      const res = await api.post('/orgs/', { name: newOrgName, description: newOrgDesc })
      await refreshOrgs()
      enter(res.data)
    } catch (e) {
      const d = e.response?.data
      setError(typeof d === 'object' ? Object.values(d).flat().join(' ') : 'Failed to create.')
    } finally { setCreating(false) }
  }

  const joinedIds = new Set(myOrgs.map(o => o.id))
  const discoverable = allOrgs.filter(o => !joinedIds.has(o.id))

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      backgroundImage: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(99,102,241,0.08) 0%, transparent 60%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '60px 20px 80px',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 40 }} className="fade-up">
        <div style={{
          width: 36, height: 36, borderRadius: 10, background: 'var(--accent2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
        </div>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 700, letterSpacing: '-0.025em', marginBottom: 4 }}>
          Welcome, {user?.username}
        </h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>
          Choose an organisation to continue
        </p>
      </div>

      <div style={{ width: '100%', maxWidth: 480 }}>

        {/* My orgs */}
        {myOrgs.length > 0 && (
          <section className="fade-up-1" style={{ marginBottom: 28 }}>
            <SectionLabel>Your workspaces</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {myOrgs.map((org, i) => (
                <OrgCard key={org.id} org={org} hue={HUES[org.id % HUES.length]}>
                  <Btn size="sm" onClick={() => enter(org)}>
                    Enter
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </Btn>
                </OrgCard>
              ))}
            </div>
          </section>
        )}

        {/* Discoverable orgs */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><Spinner size={20} /></div>
        ) : discoverable.length > 0 && (
          <section className="fade-up-2" style={{ marginBottom: 28 }}>
            <SectionLabel>Available to join</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {discoverable.map(org => (
                <OrgCard key={org.id} org={org} hue={HUES[org.id % HUES.length]} muted>
                  <Btn
                    variant="ghost" size="sm"
                    loading={joiningId === org.id}
                    onClick={() => join(org)}
                  >
                    Join
                  </Btn>
                </OrgCard>
              ))}
            </div>
          </section>
        )}

        {error && (
          <div style={{
            background: 'var(--red-bg)', border: '1px solid rgba(248,113,113,0.2)',
            borderRadius: 'var(--radius)', padding: '9px 13px',
            fontSize: '0.786rem', color: 'var(--red)', marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        {/* Create org */}
        <section className="fade-up-3">
          <SectionLabel>Create new workspace</SectionLabel>
          {!showCreate ? (
            <button
              onClick={() => setShowCreate(true)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                background: 'var(--surface)', border: '1px dashed var(--border2)',
                borderRadius: 'var(--radius-md)', padding: '14px 16px',
                cursor: 'pointer', color: 'var(--text2)', fontSize: '0.843rem',
                transition: 'all var(--t)',
              }}
              onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--text)' }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--text2)' }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: 7, border: '1px dashed var(--border2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </div>
              Create a new organisation
            </button>
          ) : (
            <form onSubmit={createOrg} style={{
              background: 'var(--surface)', border: '1px solid var(--border2)',
              borderRadius: 'var(--radius-md)', padding: '16px',
              display: 'flex', flexDirection: 'column', gap: 12,
            }}>
              <Input
                label="Organisation name"
                value={newOrgName}
                onChange={e => setNewOrgName(e.target.value)}
                placeholder="e.g. Acme Corp"
                required
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: '0.786rem', fontWeight: 500, color: 'var(--text2)' }}>
                  Description <span style={{ color: 'var(--text3)' }}>(optional)</span>
                </label>
                <input
                  value={newOrgDesc}
                  onChange={e => setNewOrgDesc(e.target.value)}
                  placeholder="What does your team work on?"
                  style={{
                    background: 'var(--surface2)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)', padding: '7px 11px',
                    color: 'var(--text)', fontSize: '0.857rem', outline: 'none',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <Btn variant="ghost" type="button" size="sm" onClick={() => setShowCreate(false)}>Cancel</Btn>
                <Btn type="submit" size="sm" loading={creating}>Create workspace</Btn>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  )
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: '0.714rem', fontWeight: 600, color: 'var(--text3)',
      textTransform: 'uppercase', letterSpacing: '0.08em',
      marginBottom: 8, paddingLeft: 2,
    }}>
      {children}
    </div>
  )
}

function OrgCard({ org, hue, muted, children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)', padding: '12px 14px',
      opacity: muted ? 0.8 : 1,
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: 8, flexShrink: 0,
        background: `hsl(${hue},45%,16%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.9rem', fontWeight: 700, color: `hsl(${hue},65%,65%)`,
      }}>
        {org.name[0].toUpperCase()}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{org.name}</div>
        <div style={{ fontSize: '0.714rem', color: 'var(--text3)', marginTop: 1 }}>
          {org.members_count} member{org.members_count !== 1 ? 's' : ''}
          {org.description && ` · ${org.description.slice(0, 50)}`}
        </div>
      </div>
      {children}
    </div>
  )
}
