import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../api/client'
import { Card, PageHeader, StatusBadge, PriorityBadge, Badge, Spinner, Empty, Btn } from '../components/ui'

const STATUSES = [
  { value: '', label: 'All statuses' },
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
]
const PRIORITIES = [
  { value: '', label: 'All priorities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

const filterSelectStyle = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: '6px 12px',
  color: 'var(--text2)',
  fontSize: '0.8rem',
  outline: 'none',
  cursor: 'pointer',
  transition: 'border-color 0.16s ease',
}

export default function Tasks() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  const filters = {
    status:   searchParams.get('status')   || '',
    priority: searchParams.get('priority') || '',
    project:  searchParams.get('project')  || '',
    mine:     searchParams.get('mine')     || '',
    overdue:  searchParams.get('overdue')  || '',
  }

  const setFilter = (key, val) => {
    const next = new URLSearchParams(searchParams)
    if (val) next.set(key, val); else next.delete(key)
    setSearchParams(next)
  }

  useEffect(() => {
    api.get('/projects/').then(r => setProjects(r.data.results ?? r.data))
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v) })
    api.get(`/tasks/?${params}`).then(r => setTasks(r.data.results ?? r.data)).finally(() => setLoading(false))
  }, [searchParams.toString()])

  const updateStatus = async (taskId, status) => {
    await api.patch(`/tasks/${taskId}/status/`, { status })
    setTasks(ts => ts.map(t => t.id === taskId ? { ...t, status } : t))
  }

  const clearFilters = () => setSearchParams({})
  const hasFilters = Object.values(filters).some(Boolean)

  return (
    <div style={{ padding: '40px 36px', maxWidth: 1020 }}>
      <PageHeader
        title="Tasks"
        subtitle={`${tasks.length} task${tasks.length !== 1 ? 's' : ''}${hasFilters ? ' · filtered' : ''}`}
        action={hasFilters && (
          <Btn variant="ghost" size="sm" onClick={clearFilters}>
            Clear filters
          </Btn>
        )}
      />

      {/* Filter bar */}
      <div
        className="fade-up-1"
        style={{
          display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)', padding: '10px 14px',
          alignItems: 'center',
        }}
      >
        <FilterIcon />
        <select
          value={filters.status}
          onChange={e => setFilter('status', e.target.value)}
          style={{ ...filterSelectStyle, color: filters.status ? 'var(--text)' : 'var(--text3)' }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        >
          {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>

        <select
          value={filters.priority}
          onChange={e => setFilter('priority', e.target.value)}
          style={{ ...filterSelectStyle, color: filters.priority ? 'var(--text)' : 'var(--text3)' }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        >
          {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>

        <select
          value={filters.project}
          onChange={e => setFilter('project', e.target.value)}
          style={{ ...filterSelectStyle, color: filters.project ? 'var(--text)' : 'var(--text3)' }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        >
          <option value="">All projects</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>

        <div style={{ display: 'flex', gap: 6, marginLeft: 4 }}>
          <TogglePill
            active={!!filters.mine}
            onClick={() => setFilter('mine', filters.mine ? '' : 'true')}
            label="My tasks"
          />
          <TogglePill
            active={!!filters.overdue}
            onClick={() => setFilter('overdue', filters.overdue ? '' : 'true')}
            label="Overdue"
            danger
          />
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner size={28} /></div>
      ) : tasks.length === 0 ? (
        <Empty message="No tasks match your filters." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tasks.map((task, i) => (
            <Card
              key={task.id}
              className={`fade-up-${Math.min(i + 1, 4)}`}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '13px 16px',
                borderColor: task.is_overdue ? 'rgba(248,113,113,0.22)' : 'var(--border)',
                background: task.is_overdue ? 'rgba(248,113,113,0.025)' : 'var(--surface)',
              }}
            >
              {/* Status selector */}
              <select
                value={task.status}
                onChange={e => updateStatus(task.id, e.target.value)}
                style={{
                  background: 'var(--surface2)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)', padding: '5px 8px',
                  color: 'var(--text2)', fontSize: '0.73rem', cursor: 'pointer', flexShrink: 0,
                  outline: 'none',
                }}
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>

              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{
                  fontWeight: 500, fontSize: '0.875rem', marginBottom: 3,
                  textDecoration: task.status === 'done' ? 'line-through' : 'none',
                  color: task.status === 'done' ? 'var(--text3)' : 'var(--text)',
                }}>
                  {task.title}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text3)', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <span>{task.project_name}</span>
                  {task.assigned_to_email && <span>· {task.assigned_to_email}</span>}
                  {task.due_date && <span>· Due {task.due_date}</span>}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 6, flexShrink: 0, alignItems: 'center' }}>
                {task.is_overdue && <Badge label="Overdue" color="red" />}
                <PriorityBadge priority={task.priority} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function TogglePill({ active, onClick, label, danger }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 12px', borderRadius: 'var(--radius)', fontSize: '0.78rem',
        fontWeight: 500, cursor: 'pointer', transition: 'all 0.16s ease',
        border: '1px solid',
        background: active
          ? (danger ? 'var(--red-bg)' : 'var(--accent-subtle)')
          : 'transparent',
        borderColor: active
          ? (danger ? 'rgba(248,113,113,0.3)' : 'rgba(91,141,239,0.3)')
          : 'var(--border)',
        color: active
          ? (danger ? 'var(--red)' : 'var(--accent)')
          : 'var(--text3)',
      }}
    >
      {label}
    </button>
  )
}

function FilterIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
    </svg>
  )
}
