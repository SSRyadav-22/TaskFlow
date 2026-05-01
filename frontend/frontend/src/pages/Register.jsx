import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Input, Select, Spinner } from '../components/ui'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'member' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async e => {
    e.preventDefault(); setError(''); setLoading(true)
    try { await register(form.username, form.email, form.password, form.role); navigate('/') }
    catch (err) {
      const data = err.response?.data
      setError(typeof data === 'object' ? Object.values(data).flat().join(' ') : 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left branding */}
      <div style={{
        width: '42%', background: 'var(--bg2)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '40px 48px',
        backgroundImage: 'radial-gradient(ellipse 80% 60% at 20% 50%, rgba(99,102,241,0.07) 0%, transparent 70%)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--accent2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: '0.95rem', letterSpacing: '-0.02em' }}>
            Task<span style={{ color: 'var(--accent)' }}>Flow</span>
          </span>
        </div>
        <div>
          <div style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.25, marginBottom: 14 }}>
            Join your<br />
            <span style={{ color: 'var(--text2)', fontWeight: 400 }}>team today.</span>
          </div>
          <p style={{ fontSize: '0.857rem', color: 'var(--text3)', lineHeight: 1.7 }}>
            Create an account and start collaborating on projects with your team instantly.
          </p>
        </div>
        <p style={{ fontSize: '0.714rem', color: 'var(--text3)' }}>© 2026 TaskFlow</p>
      </div>

      {/* Right form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ width: '100%', maxWidth: 360 }} className="fade-up">
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>Create account</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>Fill in your details to get started</p>
          </div>

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            <Input label="Username" value={form.username} onChange={set('username')} placeholder="johndoe" required />
            <Input label="Email" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required />
            <Input label="Password" type="password" value={form.password} onChange={set('password')} placeholder="Min 6 characters" required />
            <Select label="Role" value={form.role} onChange={set('role')}>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </Select>

            {error && (
              <div style={{ fontSize: '0.786rem', color: 'var(--red)', background: 'var(--red-bg)', borderRadius: 'var(--radius)', padding: '8px 12px' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 4, background: 'var(--accent2)', color: '#fff', border: 'none',
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
              Create account
            </button>
          </form>

          <p style={{ marginTop: 20, fontSize: '0.786rem', color: 'var(--text3)', textAlign: 'center' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 500 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
