import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { Card, Btn, Modal, Input, Select, PageHeader, StatusBadge, PriorityBadge, Badge, Spinner, Empty } from '../components/ui'

export default function ProjectDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [allUsers, setAllUsers] = useState([])  // for 'Add member' modal only
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('tasks')
  const [taskModal, setTaskModal] = useState(false)
  const [memberModal, setMemberModal] = useState(false)
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assigned_to: '', priority: 'medium', due_date: '', status: 'todo' })
  const [memberForm, setMemberForm] = useState({ user_id: '', role: 'member' })
  const [saving, setSaving] = useState(false)

  const isAdmin = user?.role === 'admin' || project?.project_members?.find(m => m.user === user?.id)?.role === 'admin'

  const load = async () => {
    const [pRes, tRes, uRes] = await Promise.all([
      api.get(`/projects/${id}/`),
      api.get(`/tasks/?project=${id}`),
      api.get('/auth/users/'),
    ])
    setProject(pRes.data)
    setTasks(tRes.data.results ?? tRes.data)
    setAllUsers(uRes.data.results ?? uRes.data)
    setLoading(false)
  }

  useEffect(() => { load() }, [id])

  const setT = k => e => setTaskForm(f => ({ ...f, [k]: e.target.value }))
  const setM = k => e => setMemberForm(f => ({ ...f, [k]: e.target.value }))

  const submitTask = async e => {
    e.preventDefault(); setSaving(true)
    try {
      await api.post('/tasks/', {
        ...taskForm, project: parseInt(id),
        assigned_to: taskForm.assigned_to || null,
      })
      setTaskModal(false)
      setTaskForm({ title: '', description: '', assigned_to: '', priority: 'medium', due_date: '', status: 'todo' })
      load()
    } finally { setSaving(false) }
  }

  const submitMember = async e => {
    e.preventDefault(); setSaving(true)
    try {
      await api.post(`/projects/${id}/add-member/`, { user_id: parseInt(memberForm.user_id), role: memberForm.role })
      setMemberModal(false); setMemberForm({ user_id: '', role: 'member' }); load()
    } finally { setSaving(false) }
  }

  const updateStatus = async (taskId, status) => {
    await api.patch(`/tasks/${taskId}/status/`, { status })
    setTasks(ts => ts.map(t => t.id === taskId ? { ...t, status } : t))
  }

  const removeMember = async (userId) => {
    if (!confirm('Remove this member?')) return
    await api.delete(`/projects/${id}/remove-member/${userId}/`)
    load()
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <Spinner size={28} />
    </div>
  )

  const grouped = {
    todo:        tasks.filter(t => t.status === 'todo'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    done:        tasks.filter(t => t.status === 'done'),
  }

  const cols = [
    { key: 'todo',        label: 'To Do',       color: 'var(--text3)',  dot: '#52525f' },
    { key: 'in_progress', label: 'In Progress',  color: 'var(--accent)', dot: 'var(--accent)' },
    { key: 'done',        label: 'Done',         color: 'var(--green)',  dot: 'var(--green)' },
  ]

  return (
    <div style={{ padding: '40px 36px', maxWidth: 1100 }}>
      <PageHeader
        title={project?.name}
        subtitle={project?.description || `${project?.tasks_count} tasks · ${project?.members_count} members`}
        action={isAdmin && (
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn variant="ghost" size="sm" onClick={() => setMemberModal(true)}>
              + Member
            </Btn>
            <Btn size="sm" onClick={() => setTaskModal(true)}>
              + Task
            </Btn>
          </div>
        )}
      />

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 2, marginBottom: 24,
        borderBottom: '1px solid var(--border)',
      }}>
        {['tasks', 'members'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '8px 16px', fontSize: '0.845rem', fontWeight: tab === t ? 600 : 400,
              color: tab === t ? 'var(--text)' : 'var(--text3)',
              borderBottom: `2px solid ${tab === t ? 'var(--accent)' : 'transparent'}`,
              marginBottom: -1, transition: 'all var(--transition)',
              background: 'none', textTransform: 'capitalize', letterSpacing: '0.01em',
            }}
            onMouseOver={e => { if (tab !== t) e.currentTarget.style.color = 'var(--text2)' }}
            onMouseOut={e => { if (tab !== t) e.currentTarget.style.color = 'var(--text3)' }}
          >
            {t}
            {t === 'tasks' && (
              <span style={{
                marginLeft: 6, fontSize: '0.7rem', background: 'var(--surface2)',
                borderRadius: 99, padding: '1px 6px', color: 'var(--text3)',
              }}>
                {tasks.length}
              </span>
            )}
            {t === 'members' && (
              <span style={{
                marginLeft: 6, fontSize: '0.7rem', background: 'var(--surface2)',
                borderRadius: 99, padding: '1px 6px', color: 'var(--text3)',
              }}>
                {project?.project_members?.length ?? 0}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Kanban */}
      {tab === 'tasks' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          {cols.map(col => (
            <div key={col.key}>
              {/* Column header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                marginBottom: 12, padding: '0 2px',
              }}>
                <div style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: col.dot, flexShrink: 0,
                }} />
                <span style={{
                  fontSize: '0.75rem', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                  color: col.color,
                }}>
                  {col.label}
                </span>
                <span style={{
                  fontSize: '0.7rem', background: 'var(--surface2)',
                  borderRadius: 99, padding: '1px 7px', color: 'var(--text3)',
                  border: '1px solid var(--border)',
                }}>
                  {grouped[col.key].length}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {grouped[col.key].length === 0 && (
                  <div style={{
                    border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)',
                    padding: '20px', textAlign: 'center',
                    color: 'var(--text3)', fontSize: '0.78rem',
                  }}>
                    Empty
                  </div>
                )}
                {grouped[col.key].map(task => (
                  <TaskCard key={task.id} task={task} onStatusChange={updateStatus} isAdmin={isAdmin} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Members */}
      {tab === 'members' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 560 }}>
          {project?.project_members?.length === 0 && <Empty message="No members yet." />}
          {project?.project_members?.map(m => (
            <Card key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px' }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent2) 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '0.82rem', color: '#fff', flexShrink: 0,
                boxShadow: '0 2px 8px var(--accent-subtle)',
              }}>
                {m.username?.[0]?.toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{m.username}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>{m.user_email}</div>
              </div>
              <Badge label={m.role} color={m.role === 'admin' ? 'purple' : 'gray'} />
              {isAdmin && m.user !== user?.id && (
                <Btn variant="danger" size="sm" onClick={() => removeMember(m.user)}>Remove</Btn>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Task modal */}
      <Modal open={taskModal} onClose={() => setTaskModal(false)} title="New task" width={500}>
        <form onSubmit={submitTask} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          <Input label="Title" value={taskForm.title} onChange={setT('title')} placeholder="Task title" required />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: '0.77rem', fontWeight: 500, color: 'var(--text2)' }}>Description</label>
            <textarea
              value={taskForm.description}
              onChange={setT('description')}
              rows={2}
              style={{
                background: 'var(--surface)', border: '1px solid var(--border2)',
                borderRadius: 'var(--radius)', padding: '8px 12px',
                color: 'var(--text)', fontSize: '0.875rem', outline: 'none', resize: 'vertical',
                transition: 'border-color var(--transition)',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border2)'}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Select label="Priority" value={taskForm.priority} onChange={setT('priority')}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
            <Select label="Status" value={taskForm.status} onChange={setT('status')}>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </Select>
          </div>
          <Select label="Assign to (project members only)" value={taskForm.assigned_to} onChange={setT('assigned_to')}>
            <option value="">— Unassigned —</option>
            {project?.project_members?.map(m => (
              <option key={m.user} value={m.user}>
                {m.username} · {m.role}
              </option>
            ))}
          </Select>
          <Input label="Due date" type="date" value={taskForm.due_date} onChange={setT('due_date')} />
          <div style={{ height: 1, background: 'var(--border)' }} />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Btn variant="ghost" type="button" onClick={() => setTaskModal(false)}>Cancel</Btn>
            <Btn type="submit" loading={saving}>Create task</Btn>
          </div>
        </form>
      </Modal>

      {/* Member modal */}
      <Modal open={memberModal} onClose={() => setMemberModal(false)} title="Add member" width={400}>
        <form onSubmit={submitMember} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Select label="User" value={memberForm.user_id} onChange={setM('user_id')} required>
            <option value="">Select a user…</option>
            {allUsers.filter(u => !project?.project_members?.find(m => m.user === u.id)).map(u => (
              <option key={u.id} value={u.id}>{u.username} ({u.email})</option>
            ))}
          </Select>
          <Select label="Role" value={memberForm.role} onChange={setM('role')}>
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </Select>
          <div style={{ height: 1, background: 'var(--border)' }} />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Btn variant="ghost" type="button" onClick={() => setMemberModal(false)}>Cancel</Btn>
            <Btn type="submit" loading={saving}>Add member</Btn>
          </div>
        </form>
      </Modal>
    </div>
  )
}

function TaskCard({ task, onStatusChange, isAdmin }) {
  const overdue = task.is_overdue
  return (
    <Card style={{
      padding: '12px 14px',
      borderColor: overdue ? 'rgba(248,113,113,0.22)' : 'var(--border)',
      background: overdue ? 'rgba(248,113,113,0.025)' : 'var(--surface)',
    }}>
      <div style={{
        fontWeight: 500, fontSize: '0.875rem', marginBottom: 6,
        lineHeight: 1.4,
        textDecoration: task.status === 'done' ? 'line-through' : 'none',
        color: task.status === 'done' ? 'var(--text3)' : 'var(--text)',
      }}>
        {task.title}
      </div>
      {task.description && (
        <p style={{
          fontSize: '0.77rem', color: 'var(--text2)', marginBottom: 10,
          overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.5,
        }}>
          {task.description}
        </p>
      )}
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: task.assigned_to_email || isAdmin ? 10 : 0 }}>
        <PriorityBadge priority={task.priority} />
        {overdue && <Badge label="Overdue" color="red" />}
        {task.due_date && (
          <span style={{ fontSize: '0.68rem', color: overdue ? 'var(--red)' : 'var(--text3)', display: 'flex', alignItems: 'center' }}>
            Due {task.due_date}
          </span>
        )}
      </div>
      {task.assigned_to_email && (
        <div style={{
          fontSize: '0.71rem', color: 'var(--text3)', marginBottom: isAdmin ? 10 : 0,
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <span>→</span> {task.assigned_to_email}
        </div>
      )}
      {isAdmin && (
        <select
          value={task.status}
          onChange={e => onStatusChange(task.id, e.target.value)}
          style={{
            width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '5px 8px',
            color: 'var(--text2)', fontSize: '0.73rem', cursor: 'pointer', outline: 'none',
          }}
        >
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      )}
    </Card>
  )
}
