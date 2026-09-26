import { useEffect, useState } from 'react'
import { BookOpen, Check, Clipboard, Plus, RefreshCw, Users } from 'lucide-react'
import StudentAppLayout from '../components/StudentAppLayout'
import { apiRequest } from '../lib/api.js'
import './Classrooms.css'

export default function TeacherClassrooms() {
  const [classrooms, setClassrooms] = useState([])
  const [form, setForm] = useState({ name: '', description: '' })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [copiedCode, setCopiedCode] = useState('')

  const loadClassrooms = async () => {
    setLoading(true)
    try {
      const response = await apiRequest('/teacher/classrooms')
      setClassrooms(response.classrooms || [])
    } catch (err) {
      setError(err.message || 'Could not load classrooms.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadClassrooms() }, [])

  const handleCreate = async (event) => {
    event.preventDefault()
    if (!form.name.trim()) {
      setError('Enter a classroom name.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const response = await apiRequest('/teacher/classrooms', {
        method: 'POST',
        body: { name: form.name.trim(), description: form.description.trim() },
      })
      setClassrooms((current) => [response.classroom, ...current])
      setForm({ name: '', description: '' })
    } catch (err) {
      setError(err.message || 'Could not create classroom.')
    } finally {
      setSubmitting(false)
    }
  }

  const copyCode = async (code) => {
    await navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(''), 1800)
  }

  return (
    <StudentAppLayout eyebrow="FACULTY CLASSROOMS" pageTitle="Classrooms" pageSubtitle="Create a space for your students and invite them with one code">
      <div className="classroom-page">
        <section className="classroom-hero">
          <div className="classroom-hero-icon"><BookOpen size={25} /></div>
          <div><p className="classroom-eyebrow">TEACHER WORKSPACE</p><h2>Bring each class into one place.</h2><p>Create classrooms for different sections, teams, or training groups. Share the invite code with students so they can join from their portal.</p></div>
        </section>

        <div className="classroom-grid">
          <section className="classroom-panel">
            <div className="classroom-panel-heading"><div><Plus size={18} /><h3>Create classroom</h3></div></div>
            <form onSubmit={handleCreate} className="classroom-form">
              <label>Classroom name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Grade 10 Fitness" maxLength={100} /></label>
              <label>Description <span>(optional)</span><textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Add a short focus or schedule note" rows={4} maxLength={500} /></label>
              <button type="submit" className="ath-btn ath-btn-primary" disabled={submitting}>{submitting ? <RefreshCw size={16} className="ath-spin" /> : <Plus size={16} />}{submitting ? 'Creating...' : 'Create classroom'}</button>
            </form>
          </section>

          <section className="classroom-panel classroom-list-panel">
            <div className="classroom-panel-heading"><div><BookOpen size={18} /><h3>Your classrooms</h3></div><button type="button" className="classroom-icon-button" onClick={loadClassrooms} disabled={loading} title="Refresh classrooms"><RefreshCw size={16} className={loading ? 'ath-spin' : ''} /></button></div>
            {error && <p className="classroom-error" role="alert">{error}</p>}
            {loading ? <p className="classroom-empty">Loading classrooms...</p> : classrooms.length === 0 ? <p className="classroom-empty">You have not created a classroom yet.</p> : (
              <div className="classroom-cards">
                {classrooms.map((classroom) => {
                  const copied = copiedCode === classroom.inviteCode
                  return <article className="classroom-card" key={classroom.id}>
                    <div className="classroom-card-top"><div><h4>{classroom.name}</h4><p>{classroom.description || 'No description added.'}</p></div><span className="classroom-member-count"><Users size={15} /> {classroom.memberCount}</span></div>
                    <div className="classroom-code-row"><div><span>INVITE CODE</span><strong>{classroom.inviteCode}</strong></div><button type="button" onClick={() => copyCode(classroom.inviteCode)}>{copied ? <Check size={15} /> : <Clipboard size={15} />} {copied ? 'Copied' : 'Copy code'}</button></div>
                  </article>
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </StudentAppLayout>
  )
}