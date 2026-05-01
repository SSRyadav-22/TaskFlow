import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Btn, Input, Spinner } from '../components/ui'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setError(''); setLoading(true)
    try { await login(form.email, form.password); navigate('/') }
    catch (err) { setError(err.response?.data?.detail || 'Invalid credentials') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left panel */}
      <div style={{
        width: '42%', background: 'var(--bg2)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '40px 48px',
        backgroundImage: 'radial-gradient(ellipse 80% 60% at 20% 50%, rgba(99,102,241,0.07) 0%, transparent 70%)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8, background: 'var(--accent2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: '0.95rem', letterSpacing: '-0.02em' }}>
            Task<span style={{ color: 'var(--accent)' }}>Flow</span>
          </span>
        </div>

        {/* Hero text */}
        <div>
          <div style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.25, marginBottom: 14 }}>
            Manage work,<br />
            <span style={{ color: 'var(--text2)', fontWeight: 400 }}>together.</span>
          </div>
          <p style={{ fontSize: '0.857rem', color: 'var(--text3)', lineHeight: 1.7, maxWidth: 300 }}>
            Organize projects, assign tasks, and track progress in one clean workspace.
          </p>

          {/* Feature list */}
          <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {['Projects & team members', 'Kanban task boards', 'Role-based access control'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%', background: 'var(--accent-dim)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text2)' }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize: '0.714rem', color: 'var(--text3)' }}>© 2026 TaskFlow</p>
      </div>

      {/* Right panel — Form */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 20px',
      }}>
        <div style={{ width: '100%', maxWidth: 360 }} className="fade-up">
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>
              Sign in
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>Enter your credentials to continue</p>
          </div>

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input label="Email" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required />
            <Input label="Password" type="password" value={form.password} onChange={set('password')} placeholder="Password" required />

            {error && (
              <div style={{
                fontSize: '0.786rem', color: 'var(--red)',
                background: 'var(--red-bg)', borderRadius: 'var(--radius)',
                padding: '8px 12px',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 4,
                background: 'var(--accent2)', color: '#fff', border: 'none',
                borderRadius: 'var(--radius)', padding: '9px 16px',
                fontFamily: 'var(--font)', fontWeight: 500, fontSize: '0.857rem',
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'background var(--t)',
              }}
              onMouseOver={e => { if (!loading) e.currentTarget.style.background = 'var(--accent)' }}
              onMouseOut={e => e.currentTarget.style.background = 'var(--accent2)'}
            >
              {loading && <Spinner size={13} />}
              Sign in
            </button>
          </form>

          <p style={{ marginTop: 20, fontSize: '0.786rem', color: 'var(--text3)', textAlign: 'center' }}>
            No account?{' '}
            <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 500 }}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
