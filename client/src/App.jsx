import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://task-manager-ra1a.onrender.com/api/tasks'

export default function App() {
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [filter, setFilter] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    dueDate: '',
  })

  useEffect(() => {
    let isMounted = true

    async function loadInitialTasks() {
      try {
        const response = await fetch(API_URL)

        if (!response.ok) {
          throw new Error('Could not load tasks')
        }

        const data = await response.json()

        if (isMounted) {
          setTasks(data)
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadInitialTasks()

    return () => {
      isMounted = false
    }
  }, [])

  async function fetchTasks() {
    try {
      setError('')
      const response = await fetch(API_URL)

      if (!response.ok) {
        throw new Error('Could not load tasks')
      }

      setTasks(await response.json())
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleCreateTask(event) {
    event.preventDefault()

    if (!title.trim()) {
      setError('Task title is required')
      return
    }

    try {
      setError('')
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, dueDate }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Could not create task')
      }

      setTitle('')
      setDescription('')
      setDueDate('')
      await fetchTasks()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleToggleComplete(id, currentStatus) {
    try {
      setError('')
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !currentStatus }),
      })

      if (!response.ok) {
        throw new Error('Could not update task')
      }

      await fetchTasks()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDeleteTask(id) {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return
    }

    try {
      setError('')
      const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' })

      if (!response.ok) {
        throw new Error('Could not delete task')
      }

      await fetchTasks()
    } catch (err) {
      setError(err.message)
    }
  }

  function startEditing(task) {
    setError('')
    setEditingTaskId(task.id)
    setEditForm({
      title: task.title,
      description: task.description || '',
      dueDate: task.dueDate || '',
    })
  }

  function cancelEditing() {
    setEditingTaskId(null)
    setEditForm({ title: '', description: '', dueDate: '' })
  }

  async function handleUpdateTask(event, id) {
    event.preventDefault()

    if (!editForm.title.trim()) {
      setError('Task title is required')
      return
    }

    try {
      setError('')
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Could not update task')
      }

      cancelEditing()
      await fetchTasks()
    } catch (err) {
      setError(err.message)
    }
  }

  const totalActive = useMemo(
    () => tasks.filter((task) => !task.completed).length,
    [tasks],
  )

  const totalCompleted = useMemo(
    () => tasks.filter((task) => task.completed).length,
    [tasks],
  )

  const overdueCount = useMemo(
    () => tasks.filter((task) => isOverdue(task.dueDate, task.completed)).length,
    [tasks],
  )

  const completionRate =
    tasks.length === 0 ? 0 : Math.round((totalCompleted / tasks.length) * 100)

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesFilter =
        filter === 'All' ||
        (filter === 'Active' && !task.completed) ||
        (filter === 'Completed' && task.completed)

      const matchesSearch = task.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase())

      return matchesFilter && matchesSearch
    })
  }, [filter, searchTerm, tasks])

  const visibleTaskLabel =
    filteredTasks.length === 1
      ? 'Showing 1 task'
      : `Showing ${filteredTasks.length} tasks`

  function isOverdue(dateStr, isCompleted) {
    if (!dateStr || isCompleted) {
      return false
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return new Date(dateStr) < today
  }

  return (
    <main className="min-h-screen bg-[#f7f3ea] text-stone-950">
      <div className="grid min-h-screen w-full grid-cols-1 gap-0 lg:grid-cols-[360px_1fr] xl:grid-cols-[400px_1fr]">
        <aside className="border-b border-stone-200 bg-[#1f2933] px-5 py-5 text-white sm:px-8 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:border-b-0 lg:border-r lg:border-stone-800 lg:py-6">
          <div className="flex min-h-full flex-col gap-6">
            <header>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-200">
                Daily planner
              </p>
              <h1 className="mt-4 text-4xl font-black leading-none xl:text-5xl">
                Daily Task Desk
              </h1>
              <p className="mt-4 max-w-sm text-sm leading-6 text-stone-300">
                Add tasks, keep an eye on deadlines, and clear the list one step
                at a time.
              </p>
            </header>

            <section className="grid grid-cols-3 gap-2">
              <div className="rounded-lg border border-white/10 bg-white/10 p-3">
                <p className="text-2xl font-black">{totalActive}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-stone-300">
                  Active
                </p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/10 p-3">
                <p className="text-2xl font-black">{totalCompleted}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-stone-300">
                  Done
                </p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/10 p-3">
                <p className="text-2xl font-black">{overdueCount}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-stone-300">
                  Late
                </p>
              </div>
            </section>

            <section className="rounded-lg border border-white/10 bg-[#223027] p-4">
              <div className="flex items-center justify-between text-sm font-semibold">
                <span className="text-stone-200">Completion</span>
                <span className="text-amber-200">{completionRate}%</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/30">
                <div
                  className="h-full rounded-full bg-amber-300"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </section>

            <form
              className="rounded-lg border border-white/10 bg-white p-4 text-stone-950 shadow-2xl shadow-black/20"
              onSubmit={handleCreateTask}
            >
              <h2 className="text-base font-black">Quick add</h2>
              <div className="mt-4 space-y-3">
                <input
                  className="w-full rounded-md border border-stone-300 bg-stone-50 px-3 py-2.5 text-sm outline-none transition focus:border-amber-600 focus:bg-white"
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="What needs to be done?"
                  required
                  type="text"
                  value={title}
                />
                <textarea
                  className="h-20 w-full resize-none rounded-md border border-stone-300 bg-stone-50 px-3 py-2.5 text-sm outline-none transition focus:border-amber-600 focus:bg-white"
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Notes, if needed"
                  value={description}
                />
                <input
                  className="w-full rounded-md border border-stone-300 bg-stone-50 px-3 py-2.5 text-sm outline-none transition focus:border-amber-600 focus:bg-white"
                  onChange={(event) => setDueDate(event.target.value)}
                  type="date"
                  value={dueDate}
                />
                <button
                  className="w-full rounded-md bg-amber-300 px-4 py-2.5 text-sm font-black text-stone-950 transition hover:bg-amber-200"
                  type="submit"
                >
                  Save to list
                </button>
              </div>
            </form>
          </div>
        </aside>

        <section className="px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
          <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-stone-500">
                Work list
              </p>
              <h2 className="mt-2 text-3xl font-black leading-tight text-stone-950 sm:text-4xl">
                {visibleTaskLabel}
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <label className="block">
                <span className="sr-only">Search tasks by title</span>
                <input
                  className="h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-sm outline-none transition focus:border-stone-950 sm:w-72"
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Find a task"
                  type="text"
                  value={searchTerm}
                />
              </label>

              <div className="grid grid-cols-3 rounded-md border border-stone-300 bg-white p-1">
                {['All', 'Active', 'Completed'].map((type) => (
                  <button
                    className={`rounded px-3 py-2 text-sm font-bold transition ${
                      filter === type
                        ? 'bg-stone-950 text-white'
                        : 'text-stone-500 hover:text-stone-950'
                    }`}
                    key={type}
                    onClick={() => setFilter(type)}
                    type="button"
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </p>
          )}

          {loading ? (
            <div className="rounded-lg border border-stone-200 bg-white p-10 text-center text-sm font-bold text-stone-500">
              Loading your task board...
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="rounded-lg border border-dashed border-stone-300 bg-white p-10 text-center">
              <p className="text-lg font-black text-stone-900">
                Nothing matches this view
              </p>
              <p className="mt-2 text-sm text-stone-500">
                Add a new task or adjust your filters.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((task) => {
                const overdue = isOverdue(task.dueDate, task.completed)
                const isEditing = editingTaskId === task.id

                return (
                  <article
                    className={`grid gap-4 rounded-lg border bg-white p-4 shadow-sm transition md:grid-cols-[auto_1fr_auto] ${
                      task.completed
                        ? 'border-stone-200 opacity-70'
                        : overdue
                          ? 'border-red-300 bg-red-50'
                          : 'border-stone-200 hover:border-stone-400'
                    }`}
                    key={task.id}
                  >
                    <label className="flex items-start gap-3 md:pt-1">
                      <input
                        checked={task.completed}
                        className="mt-0.5 h-5 w-5 rounded border-stone-300 accent-[#17211b]"
                        onChange={() =>
                          handleToggleComplete(task.id, task.completed)
                        }
                        type="checkbox"
                      />
                      <span className="text-xs font-black uppercase tracking-wide text-stone-500 md:hidden">
                        {task.completed ? 'Done' : 'Open'}
                      </span>
                    </label>

                    {isEditing ? (
                      <form
                        className="space-y-3"
                        onSubmit={(event) => handleUpdateTask(event, task.id)}
                      >
                        <input
                          className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-950"
                          onChange={(event) =>
                            setEditForm((currentForm) => ({
                              ...currentForm,
                              title: event.target.value,
                            }))
                          }
                          required
                          type="text"
                          value={editForm.title}
                        />
                        <textarea
                          className="h-20 w-full resize-none rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-950"
                          onChange={(event) =>
                            setEditForm((currentForm) => ({
                              ...currentForm,
                              description: event.target.value,
                            }))
                          }
                          value={editForm.description}
                        />
                        <input
                          className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-950 sm:w-48"
                          onChange={(event) =>
                            setEditForm((currentForm) => ({
                              ...currentForm,
                              dueDate: event.target.value,
                            }))
                          }
                          type="date"
                          value={editForm.dueDate}
                        />
                        <div className="flex flex-wrap gap-2">
                          <button
                            className="rounded-md bg-stone-950 px-3 py-2 text-sm font-bold text-white"
                            type="submit"
                          >
                            Save
                          </button>
                          <button
                            className="rounded-md border border-stone-300 px-3 py-2 text-sm font-bold text-stone-600"
                            onClick={cancelEditing}
                            type="button"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-black uppercase tracking-wide ${
                              task.completed
                                ? 'bg-stone-100 text-stone-500'
                                : overdue
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-amber-100 text-stone-900'
                            }`}
                          >
                            {task.completed
                              ? 'Done'
                              : overdue
                                ? 'Overdue'
                                : 'Open'}
                          </span>
                          {task.dueDate && (
                            <time
                              className="text-xs font-semibold text-stone-500"
                              dateTime={task.dueDate}
                            >
                              Due {task.dueDate}
                            </time>
                          )}
                        </div>
                        <h3
                          className={`mt-2 text-lg font-black leading-snug text-stone-950 ${
                            task.completed ? 'line-through' : ''
                          }`}
                        >
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="mt-1 text-sm leading-6 text-stone-600">
                            {task.description}
                          </p>
                        )}
                      </div>
                    )}

                    {!isEditing && (
                      <div className="flex gap-2 md:flex-col">
                        <button
                          className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-bold text-stone-700 transition hover:border-stone-950 hover:text-stone-950"
                          onClick={() => startEditing(task)}
                          type="button"
                        >
                          Edit
                        </button>
                        <button
                          className="rounded-md border border-red-200 bg-white px-3 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50"
                          onClick={() => handleDeleteTask(task.id)}
                          type="button"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
