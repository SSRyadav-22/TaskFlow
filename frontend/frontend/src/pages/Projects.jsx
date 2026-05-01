import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useOrg } from '../context/OrgContext'
import { Btn, Modal, Input, Empty, Spinner } from '../components/ui'

const HUES = [258, 214, 142, 32, 342, 186, 60, 300]

export default function Projects() {
  const { user } = useAuth()
  const { currentOrg } = useOrg()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })
  const [saving, setSaving] = useState(false)

  const load = () => api.get('/projects/').then(r => setProjects(r.data.results ?? r.data)).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async e => {
    e.preventDefault(); setSaving(true)
    try { await api.post('/projects/', { ...form, org: currentOrg?.id }); setModal(false); setForm({ name: '', description: '' }); load() }
    finally { setSaving(false) }
  }

  return (
    <div style={{ padding: '36px 40px', maxWidth: 960 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }} className="fade-up">
        <div>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 700, letterSpacing: '-0.025em', marginBottom: 3 }}>Projects</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <Btn onClick={() => setModal(true)}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New project
        </Btn>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner size={24} /></div>
      ) : projects.length === 0 ? (
        <Empty message="No projects yet. Create your first one!" />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {projects.map((p, i) => {
            const hue = HUES[p.id % HUES.length]
            const isOwner = p.owner_email === user?.email
            return (
              <Link key={p.id} to={`/projects/${p.id}`} className={`fade-up-${Math.min(i + 1, 4)}`}>
                <div
                  style={{
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)', padding: '16px',
                    display: 'flex', flexDirection: 'column', gap: 12,
                    transition: 'border-color var(--t), background var(--t)',
                    cursor: 'pointer',
                  }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.background = 'var(--surface2)' }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)' }}
                >
                  {/* Top row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: `hsl(${hue},45%,16%)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.857rem', fontWeight: 600,
                      color: `hsl(${hue},70%,68%)`,
                    }}>
                      {p.name[0]?.toUpperCase()}
                    </div>
                    <span style={{
                      fontSize: '0.686rem', fontWeight: 500,
                      color: isOwner ? 'var(--accent)' : 'var(--text3)',
                      background: isOwner ? 'var(--accent-dim)' : 'var(--surface3)',
                      borderRadius: 99, padding: '2px 8px',
                    }}>
                      {isOwner ? 'Owner' : 'Member'}
                    </span>
                  </div>

                  {/* Name + desc */}
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4, letterSpacing: '-0.01em' }}>
                      {p.name}
                    </div>
                    {p.description && (
                      <p style={{
                        fontSize: '0.786rem', color: 'var(--text3)', lineHeight: 1.5,
                        overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                      }}>
                        {p.description}
                      </p>
                    )}
                  </div>

                  {/* Footer */}
                  <div style={{
                    display: 'flex', gap: 12, paddingTop: 10,
                    borderTop: '1px solid var(--border)',
                    fontSize: '0.75rem', color: 'var(--text3)',
                  }}>
                    <span>{p.members_count} member{p.members_count !== 1 ? 's' : ''}</span>
                    <span style={{ color: 'var(--border2)' }}>·</span>
                    <span>{p.tasks_count} task{p.tasks_count !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="New project">
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Project name" value={form.name} onChange={set('name')} placeholder="e.g. Marketing Q2" required />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: '0.786rem', fontWeight: 500, color: 'var(--text2)' }}>Description</label>
            <textarea
              value={form.description} onChange={set('description')}
              placeholder="What is this project about?" rows={3}
              style={{
                background: 'var(--surface2)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: '7px 11px',
                color: 'var(--text)', fontSize: '0.857rem', outline: 'none', resize: 'vertical',
                transition: 'border-color var(--t)',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Btn variant="ghost" type="button" onClick={() => setModal(false)}>Cancel</Btn>
            <Btn type="submit" loading={saving}>Create</Btn>
          </div>
        </form>
      </Modal>
    </div>
  )
}
