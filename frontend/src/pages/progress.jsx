import { useState } from 'react'
import { TrendingUp, Award, Calendar, ArrowUpRight, ArrowDownRight, Target } from 'lucide-react'
import StudentAppLayout from '../components/StudentAppLayout'

const progressData = {
  Week: {
    fitness: '78 → 82',
    fitnessChange: '+4 pts',
    isPositiveFitness: true,
    weight: '58 → 57',
    weightChange: '-1 kg',
    endurance: '15 → 20',
    enduranceChange: '+5 mins',
    chartValues: [76, 78, 79, 80, 80, 81, 82],
    chartLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  },
  Month: {
    fitness: '72 → 82',
    fitnessChange: '+10 pts',
    isPositiveFitness: true,
    weight: '60 → 57',
    weightChange: '-3 kg',
    endurance: '12 → 20',
    enduranceChange: '+8 mins',
    chartValues: [72, 74, 76, 77, 79, 81, 82],
    chartLabels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'],
  },
  '3 Months': {
    fitness: '65 → 82',
    fitnessChange: '+17 pts',
    isPositiveFitness: true,
    weight: '63 → 57',
    weightChange: '-6 kg',
    endurance: '10 → 20',
    enduranceChange: '+10 mins',
    chartValues: [65, 68, 71, 74, 76, 79, 82],
    chartLabels: ['Month 1', 'Month 2', 'Month 3'],
  },
}

export default function Progress() {
  const [activePeriod, setActivePeriod] = useState('Week')
  const current = progressData[activePeriod]

  return (
    <StudentAppLayout
      pageTitle="Progress & Performance Analytics"
      pageSubtitle="Empirical tracking of your fitness assessment improvements, endurance growth, and body metrics."
      eyebrow="ANALYTICS & TRENDS"
    >
      {/* PERIOD SELECTOR TABS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div className="ath-tabs">
          {['Week', 'Month', '3 Months'].map((period) => (
            <button
              key={period}
              type="button"
              className={`ath-tab ${activePeriod === period ? 'active' : ''}`}
              onClick={() => setActivePeriod(period)}
            >
              {period}
            </button>
          ))}
        </div>
        <span className="ath-badge success" style={{ padding: '6px 12px' }}>
          Overall Trajectory: Steadily Improving
        </span>
      </div>

      {/* METRICS ROW */}
      <div className="ath-metrics-row">
        <div className="ath-metric-card">
          <div className="ath-metric-top">
            <div className="ath-metric-icon teal">
              <TrendingUp size={20} />
            </div>
            <span className="ath-badge success" style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              <ArrowUpRight size={13} /> {current.fitnessChange}
            </span>
          </div>
          <div>
            <div className="ath-metric-label">Fitness Score Trend</div>
            <div className="ath-metric-val">{current.fitness}</div>
          </div>
          <div className="ath-metric-subtext">Verified assessment trajectory</div>
        </div>

        <div className="ath-metric-card">
          <div className="ath-metric-top">
            <div className="ath-metric-icon blue">
              <Target size={20} />
            </div>
            <span className="ath-badge success" style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              <ArrowDownRight size={13} /> {current.weightChange}
            </span>
          </div>
          <div>
            <div className="ath-metric-label">Body Weight Trend</div>
            <div className="ath-metric-val">{current.weight} <span style={{ fontSize: '0.9rem', color: '#64748b' }}>kg</span></div>
          </div>
          <div className="ath-metric-subtext">Optimal body composition</div>
        </div>

        <div className="ath-metric-card">
          <div className="ath-metric-top">
            <div className="ath-metric-icon purple">
              <Calendar size={20} />
            </div>
            <span className="ath-badge info" style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              <ArrowUpRight size={13} /> {current.enduranceChange}
            </span>
          </div>
          <div>
            <div className="ath-metric-label">Aerobic Stamina</div>
            <div className="ath-metric-val">{current.endurance} <span style={{ fontSize: '0.9rem', color: '#64748b' }}>mins</span></div>
          </div>
          <div className="ath-metric-subtext">Sustained sprint capacity</div>
        </div>

        <div className="ath-metric-card">
          <div className="ath-metric-top">
            <div className="ath-metric-icon orange">
              <Award size={20} />
            </div>
            <span className="ath-badge">RANK #4</span>
          </div>
          <div>
            <div className="ath-metric-label">Consistency Score</div>
            <div className="ath-metric-val">92%</div>
          </div>
          <div className="ath-metric-subtext">Top 10% in school cohort</div>
        </div>
      </div>

      {/* CHART VISUALIZER */}
      <div className="ath-card" style={{ gap: '20px' }}>
        <div className="ath-card-header">
          <h2>Fitness Score Trajectory ({activePeriod})</h2>
          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Target Goal: 85+</span>
        </div>

        {/* Responsive SVG Chart */}
        <div style={{ width: '100%', overflowX: 'auto', padding: '10px 0' }}>
          <div style={{ minWidth: '400px', height: '220px', position: 'relative' }}>
            <svg viewBox="0 0 700 200" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0f766e" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#0f766e" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              {[40, 80, 120, 160].map((y) => (
                <line key={y} x1="30" y1={y} x2="680" y2={y} stroke="#f1f5f9" strokeWidth="1" />
              ))}

              {/* Area path */}
              <path
                d={`M 50 ${200 - (current.chartValues[0] - 60) * 5} ${current.chartValues
                  .map((val, idx) => {
                    const x = 50 + (idx * 600) / (current.chartValues.length - 1)
                    const y = 200 - (val - 60) * 5
                    return `L ${x} ${y}`
                  })
                  .join(' ')} L ${50 + 600} 200 L 50 200 Z`}
                fill="url(#scoreGradient)"
              />

              {/* Line path */}
              <path
                d={`M 50 ${200 - (current.chartValues[0] - 60) * 5} ${current.chartValues
                  .map((val, idx) => {
                    const x = 50 + (idx * 600) / (current.chartValues.length - 1)
                    const y = 200 - (val - 60) * 5
                    return `L ${x} ${y}`
                  })
                  .join(' ')}`}
                fill="none"
                stroke="#0f766e"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Data points */}
              {current.chartValues.map((val, idx) => {
                const x = 50 + (idx * 600) / (current.chartValues.length - 1)
                const y = 200 - (val - 60) * 5
                return (
                  <g key={idx}>
                    <circle cx={x} cy={y} r="5.5" fill="#ffffff" stroke="#0f766e" strokeWidth="3" />
                    <text x={x} y={y - 12} textAnchor="middle" fontSize="11" fontWeight="700" fill="#0f172a">
                      {val}
                    </text>
                  </g>
                )
              })}
            </svg>

            {/* Labels row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 40px', marginTop: '10px' }}>
              {current.chartLabels.map((label, i) => (
                <span key={i} style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </StudentAppLayout>
  )
}