import { useEffect, useState } from 'react'
import { BookOpen, CheckCircle2, LogIn, RefreshCw, Users } from 'lucide-react'
import StudentAppLayout from '../components/StudentAppLayout'
import { apiRequest } from '../lib/api.js'
import './Classrooms.css'

export default function StudentClassrooms() {
  const [classrooms, setClassrooms] = useState([])
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loadClassrooms = async () => {
    setLoading(true)
    try {
      const response = await apiRequest('/student/classrooms')
      setClassrooms(response.classrooms || [])
    } catch (err) {
      setError(err.message || 'Could not load joined classrooms.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadClassrooms() }, [])

  const handleJoin = async (event) => {
    event.preventDefault()
    if (!code.trim()) {
      setError('Enter the invite code your teacher shared.')
      return
    }
    setJoining(true)
    setError('')
    setMessage('')
    try {
      const response = await apiRequest('/student/classrooms/join', { method: 'POST', body: { code: code.trim() } })
      setClassrooms((current) => current.some((item) => item.id === response.classroom.id) ? current : [response.classroom, ...current])
      setCode('')
      setMessage(response.message)
    } catch (err) {
      setError(err.message || 'Could not join classroom.')
    } finally {
      setJoining(false)
    }
  }

  return (
    <StudentAppLayout eyebrow="YOUR LEARNING SPACES" pageTitle="Classrooms" pageSubtitle="Join your teacher's fitness and wellness groups">
      <div className="classroom-page">
        <section className="classroom-hero student-hero"><div className="classroom-hero-icon"><Users size={25} /></div><div><p className="classroom-eyebrow">STUDENT PORTAL</p><h2>Join a classroom with a code.</h2><p>Enter the invite code shared by your teacher to see your class community and stay connected to the right training group.</p></div></section>
        <section className="classroom-panel join-panel">
          <div className="classroom-panel-heading"><div><LogIn size={18} /><h3>Join a classroom</h3></div></div>
          <form className="join-form" onSubmit={handleJoin}><input value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="Enter invite code" maxLength={8} aria-label="Classroom invite code" /><button type="submit" className="ath-btn ath-btn-primary" disabled={joining}>{joining ? <RefreshCw size={16} className="ath-spin" /> : <LogIn size={16} />}{joining ? 'Joining...' : 'Join classroom'}</button></form>
          {message && <p className="classroom-success" role="status"><CheckCircle2 size={16} /> {message}</p>}
          {error && <p className="classroom-error" role="alert">{error}</p>}
        </section>
        <section className="joined-classrooms"><div className="classroom-section-heading"><h3>Joined classrooms</h3><button type="button" className="classroom-icon-button" onClick={loadClassrooms} disabled={loading} title="Refresh classrooms"><RefreshCw size={16} className={loading ? 'ath-spin' : ''} /></button></div>
          {loading ? <p className="classroom-empty">Loading classrooms...</p> : classrooms.length === 0 ? <div className="classroom-empty-state"><BookOpen size={28} /><p>No classrooms yet. Enter a code above to join your first one.</p></div> : <div className="student-classroom-grid">{classrooms.map((classroom) => <article className="student-classroom-card" key={classroom.id}><div className="student-classroom-icon"><BookOpen size={19} /></div><div><h4>{classroom.name}</h4><p>{classroom.description || 'Fitness and wellness classroom'}</p><span>Teacher: {classroom.teacher?.name || 'Faculty Coach'} <span className="classroom-dot">•</span> {classroom.memberCount} members</span></div></article>)}</div>}
        </section>
      </div>
    </StudentAppLayout>
  )
}