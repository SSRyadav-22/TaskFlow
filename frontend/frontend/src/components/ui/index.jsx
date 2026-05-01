/* ─── Button ─── */
export function Btn({ children, variant = 'primary', size = 'md', loading, style: s, ...p }) {
  const disabled = p.disabled || loading
  const sizes = { sm: { padding: '4px 10px', fontSize: '0.786rem' }, md: { padding: '6px 14px', fontSize: '0.857rem' } }
  const vars = {
    primary: { background: 'var(--accent2)', color: '#fff', border: '1px solid transparent' },
    ghost:   { background: 'transparent', color: 'var(--text2)', border: '1px solid var(--border2)' },
    danger:  { background: 'transparent', color: 'var(--red)', border: '1px solid rgba(248,113,113,0.2)' },
  }
  return (
    <button
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        fontWeight: 500, borderRadius: 'var(--radius)',
        transition: 'all var(--t)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        userSelect: 'none', whiteSpace: 'nowrap',
        ...sizes[size],
        ...vars[variant],
        ...s,
      }}
      onMouseOver={e => {
        if (disabled) return
        if (variant === 'primary') e.currentTarget.style.background = 'var(--accent)'
        if (variant === 'ghost') { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.color = 'var(--text)' }
        if (variant === 'danger') e.currentTarget.style.background = 'var(--red-bg)'
      }}
      onMouseOut={e => {
        if (variant === 'primary') e.currentTarget.style.background = 'var(--accent2)'
        if (variant === 'ghost') { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text2)' }
        if (variant === 'danger') e.currentTarget.style.background = 'transparent'
      }}
      {...p}
    >
      {loading && <Spinner size={12} />}
      {children}
    </button>
  )
}

/* ─── Input ─── */
export function Input({ label, error, style: s, ...p }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && <label style={{ fontSize: '0.786rem', fontWeight: 500, color: 'var(--text2)' }}>{label}</label>}
      <input
        style={{
          background: 'var(--surface2)',
          border: `1px solid ${error ? 'var(--red)' : 'var(--border)'}`,
          borderRadius: 'var(--radius)', padding: '7px 11px',
          color: 'var(--text)', fontSize: '0.857rem', outline: 'none', width: '100%',
          transition: 'border-color var(--t), box-shadow var(--t)', ...s,
        }}
        onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-dim)' }}
        onBlur={e => { e.target.style.borderColor = error ? 'var(--red)' : 'var(--border)'; e.target.style.boxShadow = 'none' }}
        {...p}
      />
      {error && <span style={{ fontSize: '0.714rem', color: 'var(--red)' }}>{error}</span>}
    </div>
  )
}

/* ─── Select ─── */
export function Select({ label, children, style: s, ...p }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && <label style={{ fontSize: '0.786rem', fontWeight: 500, color: 'var(--text2)' }}>{label}</label>}
      <select
        style={{
          background: 'var(--surface2)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '7px 11px',
          color: 'var(--text)', fontSize: '0.857rem', outline: 'none', width: '100%', cursor: 'pointer',
          transition: 'border-color var(--t)', ...s,
        }}
        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
        onBlur={e => e.target.style.borderColor = 'var(--border)'}
        {...p}
      >
        {children}
      </select>
    </div>
  )
}

/* ─── Card ─── */
export function Card({ children, style: s, ...p }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)', ...s,
    }} {...p}>
      {children}
    </div>
  )
}

/* ─── Modal ─── */
export function Modal({ open, onClose, title, children, width = 480 }) {
  if (!open) return null
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 999,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'fadeIn 0.15s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg2)', border: '1px solid var(--border2)',
          borderRadius: 'var(--radius-lg)', width: '92%', maxWidth: width,
          animation: 'fadeUp 0.2s ease',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
          overflow: 'hidden',
        }}
      >
        {/* Modal header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: '1px solid var(--border)',
        }}>
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{title}</span>
          <button
            onClick={onClose}
            style={{
              width: 24, height: 24, borderRadius: 'var(--radius)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text3)', fontSize: '0.9rem', transition: 'all var(--t)',
            }}
            onMouseOver={e => { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.color = 'var(--text)' }}
            onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text3)' }}
          >
            ✕
          </button>
        </div>
        {/* Modal body */}
        <div style={{ padding: '20px' }}>{children}</div>
      </div>
    </div>
  )
}

/* ─── Badge ─── */
export function Badge({ label, color = 'accent' }) {
  const map = {
    accent: { bg: 'var(--accent-dim)',  color: 'var(--accent)' },
    green:  { bg: 'var(--green-bg)',    color: 'var(--green)' },
    amber:  { bg: 'var(--amber-bg)',    color: 'var(--amber)' },
    red:    { bg: 'var(--red-bg)',      color: 'var(--red)' },
    purple: { bg: 'var(--purple-bg)',   color: 'var(--purple)' },
    gray:   { bg: 'var(--surface3)',    color: 'var(--text3)' },
  }
  const c = map[color] || map.gray
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      background: c.bg, color: c.color,
      fontSize: '0.714rem', fontWeight: 500, letterSpacing: '0.03em',
      padding: '2px 7px', borderRadius: 99,
    }}>
      {label}
    </span>
  )
}

/* ─── Spinner ─── */
export function Spinner({ size = 16 }) {
  return (
    <span style={{
      display: 'inline-block', width: size, height: size,
      border: `1.5px solid rgba(255,255,255,0.12)`,
      borderTopColor: 'var(--accent)',
      borderRadius: '50%', animation: 'spin 0.6s linear infinite', flexShrink: 0,
    }} />
  )
}

/* ─── Status / Priority badges ─── */
export function StatusBadge({ status }) {
  const map = { todo: ['To Do', 'gray'], in_progress: ['In Progress', 'accent'], done: ['Done', 'green'] }
  const [label, color] = map[status] || [status, 'gray']
  return <Badge label={label} color={color} />
}

export function PriorityBadge({ priority }) {
  const map = { low: ['Low', 'green'], medium: ['Medium', 'amber'], high: ['High', 'red'] }
  const [label, color] = map[priority] || [priority, 'gray']
  return <Badge label={label} color={color} />
}

/* ─── PageHeader ─── */
export function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }} className="fade-up">
      <div>
        <h1 style={{ fontSize: '1.286rem', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 }}>{title}</h1>
        {subtitle && <p style={{ color: 'var(--text3)', fontSize: '0.786rem', marginTop: 3 }}>{subtitle}</p>}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  )
}

/* ─── Empty ─── */
export function Empty({ message = 'Nothing here yet.' }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{
        width: 40, height: 40, margin: '0 auto 12px',
        background: 'var(--surface2)', borderRadius: 'var(--radius-md)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="1.5" strokeLinecap="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/>
        </svg>
      </div>
      <p style={{ fontSize: '0.843rem', color: 'var(--text3)', fontWeight: 400 }}>{message}</p>
    </div>
  )
}
