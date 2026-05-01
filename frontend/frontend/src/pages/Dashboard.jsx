import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { StatusBadge, PriorityBadge, Spinner, Badge } from '../components/ui'

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/tasks/dashboard/').then(r => setData(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <Spinner size={24} />
    </div>
  )

  const s = data?.summary || {}

  const stats = [
    { label: 'Total',       value: s.total ?? 0,       color: null },
    { label: 'To Do',       value: s.todo ?? 0,        color: 'var(--text2)' },
    { label: 'In Progress', value: s.in_progress ?? 0, color: 'var(--accent)' },
    { label: 'Done',        value: s.done ?? 0,        color: 'var(--green)' },
    { label: 'Overdue',     value: s.overdue ?? 0,     color: 'var(--red)' },
  ]

  return (
    <div style={{ padding: '36px 40px', maxWidth: 960 }}>
      {/* Greeting */}
      <div style={{ marginBottom: 32 }} className="fade-up">
        <h1 style={{ fontSize: '1.3rem', fontWeight: 700, letterSpacing: '-0.025em', marginBottom: 3 }}>
          Good to see you, {user?.username}
        </h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>
          Here's what's happening with your tasks
        </p>
      </div>

      {/* Stat row */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 1,
        background: 'var(--border)', borderRadius: 'var(--radius-md)',
        overflow: 'hidden', marginBottom: 28,
        border: '1px solid var(--border)',
      }} className="fade-up-1">
        {stats.map((st, i) => (
          <div key={st.label} style={{
            background: 'var(--surface)', padding: '16px 18px',
          }}>
            <div style={{
              fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.04em',
              color: st.color || 'var(--text)', lineHeight: 1, marginBottom: 5,
            }}>
              {st.value}
            </div>
            <div style={{ fontSize: '0.714rem', color: 'var(--text3)', fontWeight: 400 }}>
              {st.label}
            </div>
          </div>
        ))}
      </div>

      {/* Two panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Panel
          title="My Tasks"
          link="/tasks?mine=true"
          empty={data?.my_tasks?.length === 0}
          emptyMsg="No tasks assigned to you."
          className="fade-up-2"
        >
          {data?.my_tasks?.map(task => <TaskRow key={task.id} task={task} />)}
        </Panel>

        <Panel
          title="Overdue"
          badge={s.overdue > 0 ? <Badge label={s.overdue} color="red" /> : null}
          link="/tasks?overdue=true"
          empty={data?.overdue_tasks?.length === 0}
          emptyMsg="No overdue tasks 🎉"
          emptyGreen
          className="fade-up-3"
        >
          {data?.overdue_tasks?.map(task => <TaskRow key={task.id} task={task} overdue />)}
        </Panel>
      </div>
    </div>
  )
}

function Panel({ title, badge, link, empty, emptyMsg, emptyGreen, children, className }) {
  return (
    <div className={className} style={{
      background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
    }}>
      {/* Panel header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px', borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 600, fontSize: '0.857rem' }}>{title}</span>
          {badge}
        </div>
        <Link to={link} style={{
          fontSize: '0.75rem', color: 'var(--text3)',
          display: 'flex', alignItems: 'center', gap: 3,
          transition: 'color var(--t)',
        }}
          onMouseOver={e => e.currentTarget.style.color = 'var(--accent)'}
          onMouseOut={e => e.currentTarget.style.color = 'var(--text3)'}
        >
          View all
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </Link>
      </div>

      {/* Content */}
      <div style={{ padding: '8px 0' }}>
        {empty
          ? <p style={{ padding: '20px 16px', fontSize: '0.8rem', color: emptyGreen ? 'var(--green)' : 'var(--text3)' }}>{emptyMsg}</p>
          : children
        }
      </div>
    </div>
  )
}

function TaskRow({ task, overdue }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '8px 16px',
      borderLeft: overdue ? '2px solid var(--red)' : '2px solid transparent',
      transition: 'background var(--t)',
    }}
      onMouseOver={e => e.currentTarget.style.background = 'var(--surface2)'}
      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
    >
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <div style={{ fontSize: '0.843rem', fontWeight: 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {task.title}
        </div>
        <div style={{ fontSize: '0.714rem', color: 'var(--text3)', marginTop: 1 }}>{task.project_name}</div>
      </div>
      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
        <StatusBadge status={task.status} />
        <PriorityBadge priority={task.priority} />
      </div>
    </div>
  )
}
