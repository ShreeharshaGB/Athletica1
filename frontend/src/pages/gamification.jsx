import { Award, Star, Trophy } from 'lucide-react'
import StudentAppLayout from '../components/StudentAppLayout'

const badges = [
  { name: 'First Assessment', desc: 'Completed full physical baseline test', icon: '🎯', unlocked: true },
  { name: 'Consistency Streak', desc: '3 consecutive days of workout logging', icon: '🔥', unlocked: true },
  { name: 'Hydration Hero', desc: 'Met daily water intake goal 5 days in a row', icon: '💧', unlocked: true },
  { name: 'Stamina Champion', desc: 'Improved sprint run time by >5%', icon: '⚡', unlocked: false },
  { name: 'Century Club', desc: 'Complete 100 sets of strength training', icon: '🛡️', unlocked: false },
  { name: 'Wellness Guru', desc: 'Complete 7 daily mood and sleep check-ins', icon: '🌿', unlocked: false },
]

const leaderboard = [
  { rank: 1, name: 'Pooja R.', xp: 2450, badge: '🏆 Gold' },
  { rank: 2, name: 'Karthik N.', xp: 2180, badge: '🥈 Silver' },
  { rank: 3, name: 'Ananya S.', xp: 1950, badge: '🥉 Bronze' },
  { rank: 4, name: 'You (Alex Runner)', xp: 1250, badge: 'Level 3' },
  { rank: 5, name: 'Rohan M.', xp: 1100, badge: 'Level 2' },
]

export default function Gamification() {
  return (
    <StudentAppLayout
      pageTitle="Gamification & Achievements"
      pageSubtitle="Earn XP, unlock verified fitness badges, and build positive movement momentum."
      eyebrow="REWARDS & MILESTONES"
    >
      {/* LEVEL & XP HERO */}
      <div
        className="ath-card"
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
          color: '#ffffff',
          padding: '24px 28px',
          borderRadius: '20px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
              <Star size={13} color="#facc15" fill="#facc15" /> ATHLETE STATUS
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 4px', color: '#ffffff' }}>
              Level 3 Athlete
            </h2>
            <p style={{ margin: 0, color: '#c7d2fe', fontSize: '0.88rem' }}>
              1,250 XP earned • 750 XP needed to reach Level 4
            </p>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ background: 'rgba(255,255,255,0.12)', padding: '10px 16px', borderRadius: '10px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>Current Streak</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fb923c' }}>🔥 3 Days</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.12)', padding: '10px 16px', borderRadius: '10px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>Cohort Rank</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#6ee7b7' }}>#4 School</div>
            </div>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', opacity: 0.85, marginBottom: '6px' }}>
            <span>Progress to Level 4</span>
            <span>62.5%</span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: '62.5%', height: '100%', background: 'linear-gradient(90deg, #10b981, #5eead4)', borderRadius: '4px' }} />
          </div>
        </div>
      </div>

      {/* TWO-COLUMN: BADGES + LEADERBOARD */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        {/* BADGES COLLECTION */}
        <div className="ath-card" style={{ gap: '16px' }}>
          <div className="ath-card-header">
            <h2>
              <Award size={20} color="#0f766e" />
              Badges & Accolades
            </h2>
            <span className="ath-badge success">3 UNLOCKED</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
            {badges.map((b, i) => (
              <div
                key={i}
                style={{
                  background: b.unlocked ? '#ffffff' : '#f8fafc',
                  border: b.unlocked ? '1px solid #e2e8f0' : '1px dashed #cbd5e1',
                  borderRadius: '12px',
                  padding: '14px',
                  textAlign: 'center',
                  opacity: b.unlocked ? 1 : 0.6,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <div style={{ fontSize: '1.8rem' }}>{b.icon}</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{b.name}</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.35 }}>{b.desc}</div>
                {b.unlocked && (
                  <span className="ath-badge success" style={{ fontSize: '0.68rem', marginTop: '4px' }}>
                    UNLOCKED ✓
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* LEADERBOARD */}
        <div className="ath-card" style={{ gap: '16px' }}>
          <div className="ath-card-header">
            <h2>
              <Trophy size={20} color="#f59e0b" />
              Class Cohort Leaderboard
            </h2>
            <span className="ath-badge">UPDATED HOURLY</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {leaderboard.map((student) => {
              const isMe = student.name.includes('You')
              return (
                <div
                  key={student.rank}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: isMe ? '#e6f7f2' : '#f8fafc',
                    border: isMe ? '1px solid #0f766e' : '1px solid #e2e8f0',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: student.rank <= 3 ? '#fef3c7' : '#e2e8f0', color: student.rank <= 3 ? '#92400e' : '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.82rem', fontWeight: 800 }}>
                      {student.rank}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: isMe ? '#0f766e' : '#0f172a' }}>
                        {student.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{student.badge}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f766e' }}>
                    {student.xp} XP
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </StudentAppLayout>
  )
}