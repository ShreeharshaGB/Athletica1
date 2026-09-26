import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Sparkles,
  Trophy,
  Activity,
  Zap,
  Target,
  Flame,
  CheckCircle2,
  Circle,
  ArrowRight,
  RefreshCw,
  Sliders,
  Share2,
  Check,
  ChevronRight,
  ShieldCheck,
  X,
  Award,
  Compass,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../lib/api.js'
import { useAuth } from '../context/AuthContext'
import StudentAppLayout from '../components/StudentAppLayout'

const SPORTS_DATABASE = [
  {
    id: 'sprint-track',
    name: '100m / 200m Sprint & Hurdles',
    category: 'Track & Speed',
    icon: '⚡',
    primaryAttributes: ['Explosive Acceleration', 'Fast-Twitch Muscle Fiber', 'Reaction Time'],
    benchmarkPace: '11.8s - 12.8s sprint baseline',
    description: 'High burst velocity, low ground-contact time, and high posterior-chain force output.',
    weights: { speed: 0.45, agility: 0.25, strength: 0.15, core: 0.15 },
    drills: [
      { name: '30m Flying Starts', volume: '5 reps with 3 min full recovery', focus: 'Maximal sprint acceleration mechanics' },
      { name: 'A-Skips & Bounds', volume: '4 sets x 20m', focus: 'Hip drive and ground-strike elasticity' },
      { name: 'Resisted Band Sprints', volume: '6 sets x 15m', focus: 'Initial drive-phase angle and power' },
    ],
    pathway: 'District Junior Athletics Meet → State Sprint Championship → National Youth Games',
    equipment: 'Running shoes or spikes, track or firm dirt surface, timer',
  },
  {
    id: 'football-wing',
    name: 'Football (Winger / Midfielder)',
    category: 'Ball & Team',
    icon: '⚽',
    primaryAttributes: ['Repeated Sprint Ability', 'Change of Direction', 'Anaerobic Recovery'],
    benchmarkPace: '10.2s shuttle agility & 80+ stamina score',
    description: 'Rapid pace transitions, cutting agility, and ability to sustain high work rate across 90 minutes.',
    weights: { agility: 0.35, speed: 0.3, endurance: 0.2, core: 0.15 },
    drills: [
      { name: 'Cone Zig-Zag Slalom Sprints', volume: '6 sets x 20m', focus: 'Deceleration and rapid directional shift' },
      { name: 'Box-to-Box Interval Shuttle', volume: '8 reps with 45s rest', focus: 'Aerobic-anaerobic energy crossover' },
      { name: 'Single-Leg Lateral Hops', volume: '3 sets x 12 reps/leg', focus: 'Knee and ankle stabilizer strength' },
    ],
    pathway: 'School Varsity Squad → District League Division → Youth Academy Selection',
    equipment: 'Football, agility cones, open field/turf',
  },
  {
    id: 'badminton-singles',
    name: 'Badminton (Singles Court)',
    category: 'Racket Sports',
    icon: '🏸',
    primaryAttributes: ['Lateral Deceleration', 'Wrist / Forearm Elasticity', 'Fast Reaction'],
    benchmarkPace: 'Sub-10.5s shuttle run & high flexibility',
    description: 'Constant lunging, court repositioning, quick explosive vertical leaps and eccentric braking.',
    weights: { agility: 0.4, flexibility: 0.25, speed: 0.2, core: 0.15 },
    drills: [
      { name: '6-Corner Shadow Footwork', volume: '5 sets x 1 min', focus: 'Fluid court coverage and center recovery' },
      { name: 'Reaction Ball Split Jumps', volume: '4 sets x 15 catches', focus: 'Visual perception and split-step timing' },
      { name: 'Deep Lunge Recovery Drives', volume: '3 sets x 10 reps/side', focus: 'Eccentric quad control under deep bend' },
    ],
    pathway: 'Inter-Collegiate Tournament → District Open Championship → State Ranking Circuit',
    equipment: 'Racket, shuttlecocks, badminton court or flat surface',
  },
  {
    id: 'basketball-guard',
    name: 'Basketball (Point / Shooting Guard)',
    category: 'Ball & Team',
    icon: '🏀',
    primaryAttributes: ['Vertical Launch', 'Lateral Shuffling', 'Spatial Coordination'],
    benchmarkPace: '30+ push-ups & rapid lateral quickness',
    description: 'High vertical jump index, rapid defensive slide endurance, and upper-body passing power.',
    weights: { speed: 0.25, agility: 0.3, strength: 0.25, core: 0.2 },
    drills: [
      { name: 'Defensive Slide to Sprint Drops', volume: '5 sets x 15m', focus: 'Low-center-of-gravity lateral power' },
      { name: 'Continuous Rim Touches', volume: '4 sets x 8 jumps', focus: 'Stretch-shortening plyometric cycle' },
      { name: 'Push-up into Tuck Jump', volume: '4 sets x 8 reps', focus: 'Explosive ground-to-air transition' },
    ],
    pathway: 'Inter-School League → Regional Youth Tournament → State Team Trials',
    equipment: 'Basketball, hoop / target, court',
  },
  {
    id: 'middle-distance',
    name: '800m - 1500m Middle Distance',
    category: 'Track & Speed',
    icon: '🏃',
    primaryAttributes: ['VO2 Max Aerobic Engine', 'Lactate Threshold', 'Pacing Discipline'],
    benchmarkPace: 'Sustained endurance with low fatigue rate',
    description: 'High oxygen utilization efficiency, steady biomechanical rhythm, and mental resilience under fatigue.',
    weights: { endurance: 0.5, core: 0.2, speed: 0.2, flexibility: 0.1 },
    drills: [
      { name: '400m Cruise Repeats', volume: '6 reps @ 85% with 90s jog', focus: 'Aerobic threshold maintenance' },
      { name: 'Tempo Hill Surges', volume: '5 reps x 150m incline', focus: 'Stride extension and hip flexor power' },
      { name: 'Core Hollow Holds & Planks', volume: '4 sets x 45s', focus: 'Upper torso stability during deep breathing' },
    ],
    pathway: 'School Cross-Country → State Track Meet → Junior National Championships',
    equipment: 'Distance running shoes, road/track or trail',
  },
  {
    id: 'martial-arts',
    name: 'Combat Sports & Martial Arts (Judo / Karate / Wrestling)',
    category: 'Combat & Martial',
    icon: '🥋',
    primaryAttributes: ['Core Torque', 'Grip & Upper Body Power', 'Kinetic Balance'],
    benchmarkPace: '35+ sit-ups, 30+ push-ups, high flexibility',
    description: 'Rotational leverage, dynamic torso anchoring, and high explosive strength-to-weight ratio.',
    weights: { strength: 0.35, core: 0.3, flexibility: 0.2, agility: 0.15 },
    drills: [
      { name: 'Isometric Partner / Band Push-Pull', volume: '4 sets x 30s', focus: 'Rotational anti-extension core strength' },
      { name: 'Burpee to Sprawl Reaction', volume: '5 sets x 10 reps', focus: 'Rapid level changes and defensive posture' },
      { name: 'Bridge & Neck Mobility Sequence', volume: '3 sets x 8 reps', focus: 'Spinal articulation and joint integrity' },
    ],
    pathway: 'District Martial Arts Championship → State Invitational → National Federation Trials',
    equipment: 'Mat / padded surface, resistance bands or training partner',
  },
  {
    id: 'calisthenics-gym',
    name: 'Gymnastics & Bodyweight Calisthenics',
    category: 'Precision & Focus',
    icon: '🤸',
    primaryAttributes: ['Relative Bodyweight Strength', 'Shoulder / Hip Mobility', 'Balance'],
    benchmarkPace: '26cm+ sit-and-reach flexibility & 35+ pushups',
    description: 'Exceptional strength-to-bodyweight ratio, full-range articular control, and scapular stability.',
    weights: { flexibility: 0.4, strength: 0.3, core: 0.3 },
    drills: [
      { name: 'Hollow Body Rock Progression', volume: '4 sets x 20 reps', focus: 'Posterior pelvic tilt and anterior chain power' },
      { name: 'Scapular Pull-ups & Dips', volume: '4 sets x 10 reps', focus: 'Shoulder girdle stabilization' },
      { name: 'Wall Handstand Hold', volume: '4 sets x 30-45s', focus: 'Proprioception and vertical line alignment' },
    ],
    pathway: 'Club Calisthenics Showcase → Regional Artistic Meet → National Youth Federation',
    equipment: 'Pull-up bar, floor mat, parallel bars or sturdy ledge',
  },
  {
    id: 'grassroots-kho',
    name: 'Kho-Kho & Kabaddi (Indigenous Agility)',
    category: 'Combat & Martial',
    icon: '🚩',
    primaryAttributes: ['Sudden Dive & Low Dodge', 'Ground-Level Acceleration', 'High-Speed Reflexes'],
    benchmarkPace: 'Rapid shuttle turns & instinctive reaction',
    description: 'Explosive low-center crouch sprints, 180-degree pole diving, and extreme tendon elasticity.',
    weights: { agility: 0.45, speed: 0.3, core: 0.15, strength: 0.1 },
    drills: [
      { name: 'Crouched Zig-Zag Dash', volume: '6 sets x 15m', focus: 'Low hip height during aggressive acceleration' },
      { name: 'Pole Turn & Dive Simulation', volume: '5 sets x 8 turns', focus: 'Centrifugal deceleration and grip' },
      { name: 'Frog Leaps into Backpedal', volume: '4 sets x 12m', focus: 'Quad endurance and quick foot turnover' },
    ],
    pathway: 'Inter-School Taluk Tournaments → District Selection → National Kho-Kho / Kabaddi League',
    equipment: 'Open field / mud court, 2 turning posts',
  },
]

const MILESTONES_STORAGE_KEY = 'athletica_talent_milestones'

export default function TalentDiscovery() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [assessment, setAssessment] = useState(null)
  const [profile, setProfile] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedSport, setSelectedSport] = useState(null)
  const [copiedToast, setCopiedToast] = useState(false)
  const [simulationMode, setSimulationMode] = useState(false)
  const [simValues, setSimValues] = useState({
    pushUps: 28,
    sitUps: 32,
    runTime: 12.0,
    flexibility: 24,
    shuttleRun: 10.2,
  })

  // Completed development milestones checklist (persisted in localStorage)
  const [completedMilestones, setCompletedMilestones] = useState(() => {
    try {
      const saved = localStorage.getItem(MILESTONES_STORAGE_KEY)
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  const toggleMilestone = (id) => {
    const updated = { ...completedMilestones, [id]: !completedMilestones[id] }
    setCompletedMilestones(updated)
    try {
      localStorage.setItem(MILESTONES_STORAGE_KEY, JSON.stringify(updated))
    } catch (e) {
      console.warn('Could not save milestone:', e)
    }
  }

  // Load real assessment and profile data
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [assessRes, profileRes] = await Promise.allSettled([
        apiRequest('/student/assessment'),
        apiRequest('/student/profile'),
      ])

      if (assessRes.status === 'fulfilled' && assessRes.value?.assessment) {
        const a = assessRes.value.assessment
        setAssessment(a)
        setSimValues({
          pushUps: a.pushUps || 25,
          sitUps: a.sitUps || 30,
          runTime: a.runTime || 12.5,
          flexibility: a.flexibility || 22,
          shuttleRun: a.shuttleRun || 10.8,
        })
      }

      if (profileRes.status === 'fulfilled' && profileRes.value?.profile) {
        setProfile(profileRes.value.profile)
      }
    } catch (err) {
      console.error('Error fetching talent assessment:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Current active metrics (either from simulation sliders or real assessment)
  const currentMetrics = useMemo(() => {
    if (simulationMode) {
      return simValues
    }
    if (assessment) {
      return {
        pushUps: assessment.pushUps || 25,
        sitUps: assessment.sitUps || 30,
        runTime: assessment.runTime || 12.5,
        flexibility: assessment.flexibility || 22,
        shuttleRun: assessment.shuttleRun || 10.8,
      }
    }
    // Default baseline if unassessed
    return {
      pushUps: 26,
      sitUps: 32,
      runTime: 12.2,
      flexibility: 24,
      shuttleRun: 10.4,
    }
  }, [simulationMode, simValues, assessment])

  // Compute calculated sub-aptitudes (0-100 scale)
  const aptitudes = useMemo(() => {
    // Speed: 10s is 100, 16s is 40
    const speedScore = Math.min(100, Math.max(40, Math.round(100 - (currentMetrics.runTime - 10) * 10)))
    // Agility: 9.0s shuttle is 100, 13.0s is 40
    const agilityScore = Math.min(100, Math.max(40, Math.round(100 - (currentMetrics.shuttleRun - 9) * 15)))
    // Strength: 45 pushups is 100, 10 is 40
    const strengthScore = Math.min(100, Math.max(40, Math.round(40 + (currentMetrics.pushUps - 10) * 1.7)))
    // Core: 50 situps is 100, 15 is 40
    const coreScore = Math.min(100, Math.max(40, Math.round(40 + (currentMetrics.sitUps - 15) * 1.7)))
    // Flexibility: 32cm is 100, 10cm is 40
    const flexScore = Math.min(100, Math.max(40, Math.round(40 + (currentMetrics.flexibility - 10) * 2.7)))
    // Estimated Endurance: balance of core + speed sustain
    const enduranceScore = Math.min(100, Math.max(45, Math.round(coreScore * 0.5 + speedScore * 0.3 + agilityScore * 0.2)))

    return {
      speed: speedScore,
      agility: agilityScore,
      strength: strengthScore,
      core: coreScore,
      flexibility: flexScore,
      endurance: enduranceScore,
    }
  }, [currentMetrics])

  // Ranked sports with match percentages based on aptitude weights
  const scoredSports = useMemo(() => {
    return SPORTS_DATABASE.map((sport) => {
      let scoreSum = 0
      let weightSum = 0
      Object.entries(sport.weights).forEach(([key, weight]) => {
        if (aptitudes[key] != null) {
          scoreSum += aptitudes[key] * weight
          weightSum += weight
        }
      })
      const matchScore = weightSum > 0 ? Math.round(scoreSum / weightSum) : 75
      return {
        ...sport,
        matchScore: Math.min(99, Math.max(60, matchScore)),
      }
    }).sort((a, b) => b.matchScore - a.matchScore)
  }, [aptitudes])

  const filteredSports = useMemo(() => {
    if (selectedCategory === 'All') return scoredSports
    return scoredSports.filter((s) => s.category === selectedCategory)
  }, [scoredSports, selectedCategory])

  const topSport = scoredSports[0]

  // Copy talent profile for scout / coach sharing
  const handleCopyReport = () => {
    const reportText = `🏆 ATHLETICA TALENT DISCOVERY REPORT
Athlete: ${user?.name || 'Student Athlete'} (${profile?.gender || 'Co-Ed'}, Age ${profile?.age || 18})
Primary Talent Archetype: ${topSport.name} (${topSport.matchScore}% Match)

PHYSIOLOGICAL APTITUDES:
• Sprint Speed: ${aptitudes.speed}/100
• Agility & Direction Change: ${aptitudes.agility}/100
• Kinetic Strength: ${aptitudes.strength}/100
• Core Stability: ${aptitudes.core}/100
• Joint Flexibility: ${aptitudes.flexibility}/100
• Cardiovascular Stamina: ${aptitudes.endurance}/100

TOP SPORT MATCHES:
1. ${scoredSports[0]?.name} - ${scoredSports[0]?.matchScore}% Compatibility
2. ${scoredSports[1]?.name} - ${scoredSports[1]?.matchScore}% Compatibility
3. ${scoredSports[2]?.name} - ${scoredSports[2]?.matchScore}% Compatibility

Verified via Athletica Standardized Physical Baseline Testing.`

    navigator.clipboard?.writeText(reportText).then(() => {
      setCopiedToast(true)
      setTimeout(() => setCopiedToast(false), 3000)
    })
  }

  const categories = ['All', 'Track & Speed', 'Ball & Team', 'Racket Sports', 'Combat & Martial', 'Precision & Focus']

  const milestoneItems = [
    { id: 'm1', title: 'Complete 2 sprint acceleration sessions', desc: 'Focus on 30m flying start mechanics', points: 35 },
    { id: 'm2', title: 'Perform 4 sets of lateral agility shuttles', desc: 'Sharpen low-center directional braking', points: 40 },
    { id: 'm3', title: 'Daily 10-minute posterior chain & hip mobility', desc: 'Preserves range of motion under high load', points: 25 },
    { id: 'm4', title: 'Log 1 coach or peer-supervised form assessment', desc: 'Validate technical mechanics in real-time', points: 50 },
  ]

  const completedCount = Object.values(completedMilestones).filter(Boolean).length
  const milestoneProgress = Math.round((completedCount / milestoneItems.length) * 100)

  return (
    <StudentAppLayout
      eyebrow="AI TALENT IDENTIFICATION & SCOUTING"
      pageTitle="Talent Discovery & Athletic Potential"
      pageSubtitle="Algorithmic assessment of physiological strengths to match you with compatible competitive sports."
      actions={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className={`ath-btn ${simulationMode ? 'ath-btn-primary' : 'ath-btn-secondary'}`}
            onClick={() => setSimulationMode(!simulationMode)}
            style={{ height: '38px', padding: '0 14px' }}
          >
            <Sliders size={15} /> {simulationMode ? 'Active Simulator' : 'Simulate Gains'}
          </button>
          <button
            type="button"
            className="ath-btn ath-btn-secondary"
            onClick={handleCopyReport}
            style={{ height: '38px', padding: '0 14px' }}
            title="Copy Talent Scout Report"
          >
            {copiedToast ? <Check size={15} color="#10b981" /> : <Share2 size={15} />}
            <span>{copiedToast ? 'Copied!' : 'Export Report'}</span>
          </button>
        </div>
      }
    >
      {/* SIMULATOR BANNER IF ACTIVE */}
      {simulationMode && (
        <div
          className="ath-card"
          style={{
            background: 'var(--ath-surface)',
            border: '2px dashed var(--ath-primary)',
            padding: '18px 22px',
            borderRadius: '16px',
            gap: '14px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sliders size={18} color="var(--ath-primary)" />
              <strong style={{ fontSize: '0.95rem', color: 'var(--ath-dark)' }}>
                Interactive Performance Calibration Simulator
              </strong>
            </div>
            <button
              type="button"
              className="ath-btn ath-btn-secondary"
              onClick={() => setSimulationMode(false)}
              style={{ padding: '4px 10px', fontSize: '0.78rem' }}
            >
              Reset to Actual Records
            </button>
          </div>
          <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--ath-text-muted)' }}>
            Drag the sliders below to simulate how physical conditioning gains shift your sport compatibility in real-time.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginTop: '6px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>
                <span>Sprint Time (50m):</span>
                <span style={{ color: 'var(--ath-primary)' }}>{simValues.runTime}s</span>
              </div>
              <input
                type="range"
                min="9.5"
                max="15.0"
                step="0.1"
                value={simValues.runTime}
                onChange={(e) => setSimValues({ ...simValues, runTime: parseFloat(e.target.value) })}
                style={{ width: '100%', accentColor: 'var(--ath-primary)' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>
                <span>Push-ups (1 min):</span>
                <span style={{ color: 'var(--ath-primary)' }}>{simValues.pushUps} reps</span>
              </div>
              <input
                type="range"
                min="10"
                max="55"
                step="1"
                value={simValues.pushUps}
                onChange={(e) => setSimValues({ ...simValues, pushUps: parseInt(e.target.value, 10) })}
                style={{ width: '100%', accentColor: 'var(--ath-primary)' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>
                <span>Sit & Reach Flexibility:</span>
                <span style={{ color: 'var(--ath-primary)' }}>{simValues.flexibility} cm</span>
              </div>
              <input
                type="range"
                min="10"
                max="36"
                step="1"
                value={simValues.flexibility}
                onChange={(e) => setSimValues({ ...simValues, flexibility: parseInt(e.target.value, 10) })}
                style={{ width: '100%', accentColor: 'var(--ath-primary)' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>
                <span>Shuttle Run Agility:</span>
                <span style={{ color: 'var(--ath-primary)' }}>{simValues.shuttleRun}s</span>
              </div>
              <input
                type="range"
                min="8.8"
                max="13.0"
                step="0.1"
                value={simValues.shuttleRun}
                onChange={(e) => setSimValues({ ...simValues, shuttleRun: parseFloat(e.target.value) })}
                style={{ width: '100%', accentColor: 'var(--ath-primary)' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* TOP HERO BANNER */}
      <div
        className="ath-card"
        style={{
          background: 'linear-gradient(135deg, #0f766e 0%, #1e3a8a 100%)',
          color: '#ffffff',
          padding: '28px 30px',
          borderRadius: '20px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 12px 32px rgba(15, 118, 110, 0.25)',
        }}
      >
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.2)', padding: '5px 12px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
            <Sparkles size={14} /> AI TALENT SCOUT ENGINE
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.85rem)', fontWeight: 800, margin: '0 0 8px', color: '#ffffff', lineHeight: 1.2 }}>
                Primary Match: {topSport?.name}
              </h2>
              <p style={{ fontSize: '0.92rem', color: '#e2e8f0', margin: 0, maxWidth: '680px', lineHeight: 1.55 }}>
                Based on your kinetic test telemetry, your explosive rate of force development and rapid recovery indices put you in the{' '}
                <strong>top 7th percentile</strong> for dynamic acceleration sports.
              </p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '16px', padding: '14px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, color: '#ccfbf1' }}>
                Sport Compatibility
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.1, marginTop: '2px' }}>
                {topSport?.matchScore}%
              </div>
              <div style={{ fontSize: '0.75rem', color: '#a7f3d0', marginTop: '2px' }}>
                High Tier Candidate
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6 PHYSIOLOGICAL APTITUDE METRIC CARDS */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '1.12rem', fontWeight: 750, color: 'var(--ath-dark)', margin: 0 }}>
              Physiological Aptitude Matrix
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: 'var(--ath-text-muted)' }}>
              Calibrated from your actual athletic assessment test records
            </p>
          </div>
          {!assessment && !simulationMode && (
            <Link
              to="/student/assessment"
              className="ath-btn ath-btn-secondary"
              style={{ fontSize: '0.78rem', padding: '6px 12px' }}
            >
              Take Assessment <ArrowRight size={13} />
            </Link>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
          <div className="ath-card" style={{ padding: '16px', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1.2rem' }}>⚡</span>
              <span className="ath-badge" style={{ background: 'var(--ath-primary-light)', color: 'var(--ath-primary)' }}>Speed</span>
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--ath-text-muted)' }}>Sprint Velocity</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--ath-dark)' }}>{aptitudes.speed}/100</div>
            <div style={{ width: '100%', height: '6px', background: 'var(--ath-border-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${aptitudes.speed}%`, height: '100%', background: '#0f766e', borderRadius: '4px' }} />
            </div>
          </div>

          <div className="ath-card" style={{ padding: '16px', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1.2rem' }}>🎯</span>
              <span className="ath-badge info">Agility</span>
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--ath-text-muted)' }}>Reaction & Cut</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--ath-dark)' }}>{aptitudes.agility}/100</div>
            <div style={{ width: '100%', height: '6px', background: 'var(--ath-border-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${aptitudes.agility}%`, height: '100%', background: '#3b82f6', borderRadius: '4px' }} />
            </div>
          </div>

          <div className="ath-card" style={{ padding: '16px', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1.2rem' }}>💪</span>
              <span className="ath-badge success">Power</span>
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--ath-text-muted)' }}>Upper Kinetic Chain</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--ath-dark)' }}>{aptitudes.strength}/100</div>
            <div style={{ width: '100%', height: '6px', background: 'var(--ath-border-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${aptitudes.strength}%`, height: '100%', background: '#10b981', borderRadius: '4px' }} />
            </div>
          </div>

          <div className="ath-card" style={{ padding: '16px', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1.2rem' }}>🛡️</span>
              <span className="ath-badge" style={{ background: '#fef3c7', color: '#92400e' }}>Core</span>
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--ath-text-muted)' }}>Trunk Equilibrium</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--ath-dark)' }}>{aptitudes.core}/100</div>
            <div style={{ width: '100%', height: '6px', background: 'var(--ath-border-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${aptitudes.core}%`, height: '100%', background: '#f59e0b', borderRadius: '4px' }} />
            </div>
          </div>

          <div className="ath-card" style={{ padding: '16px', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1.2rem' }}>🤸</span>
              <span className="ath-badge" style={{ background: '#f5f3ff', color: '#7c3aed' }}>Mobility</span>
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--ath-text-muted)' }}>Joint Range</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--ath-dark)' }}>{aptitudes.flexibility}/100</div>
            <div style={{ width: '100%', height: '6px', background: 'var(--ath-border-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${aptitudes.flexibility}%`, height: '100%', background: '#8b5cf6', borderRadius: '4px' }} />
            </div>
          </div>

          <div className="ath-card" style={{ padding: '16px', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1.2rem' }}>🫀</span>
              <span className="ath-badge" style={{ background: '#ecfeff', color: '#0891b2' }}>Stamina</span>
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--ath-text-muted)' }}>Aerobic Recovery</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--ath-dark)' }}>{aptitudes.endurance}/100</div>
            <div style={{ width: '100%', height: '6px', background: 'var(--ath-border-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${aptitudes.endurance}%`, height: '100%', background: '#06b6d4', borderRadius: '4px' }} />
            </div>
          </div>
        </div>
      </div>

      {/* FILTER TABS & MATCHED COMPETITIVE SPORTS */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '1.18rem', fontWeight: 750, color: 'var(--ath-dark)', margin: 0 }}>
              Ranked Sport Compatibility
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: 'var(--ath-text-muted)' }}>
              Click any sport card to inspect specialized development drills and competitive pathways
            </p>
          </div>

          {/* Category Tabs */}
          <div className="ath-tabs">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`ath-tab ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* SPORT CARDS GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '18px' }}>
          {filteredSports.map((sport) => {
            const isHighMatch = sport.matchScore >= 85
            return (
              <div
                key={sport.id}
                className="ath-card"
                style={{
                  gap: '14px',
                  justifyContent: 'space-between',
                  border: isHighMatch ? '1px solid rgba(20, 184, 166, 0.4)' : '1px solid var(--ath-border)',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
                onClick={() => setSelectedSport(sport)}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '10px',
                          background: 'var(--ath-border-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.3rem',
                        }}
                      >
                        {sport.icon}
                      </div>
                      <div>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--ath-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {sport.category}
                        </span>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 750, color: 'var(--ath-dark)', margin: '2px 0 0' }}>
                          {sport.name}
                        </h4>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span
                        className="ath-badge"
                        style={{
                          background: isHighMatch ? '#dcfce7' : '#f1f5f9',
                          color: isHighMatch ? '#15803d' : '#475569',
                          fontWeight: 800,
                          fontSize: '0.78rem',
                        }}
                      >
                        {sport.matchScore}% Match
                      </span>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.84rem', color: 'var(--ath-text-muted)', lineHeight: 1.5, margin: '8px 0 12px' }}>
                    {sport.description}
                  </p>

                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--ath-text-light)', textTransform: 'uppercase' }}>
                      Key Physical Assets
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                      {sport.primaryAttributes.map((attr, i) => (
                        <span key={i} className="ath-badge" style={{ fontSize: '0.72rem' }}>
                          {attr}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    borderTop: '1px solid var(--ath-border)',
                    paddingTop: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    color: 'var(--ath-primary)',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                  }}
                >
                  <span>Explore Drills & Pathway</span>
                  <ChevronRight size={16} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* WORKING TALENT CULTIVATION MILESTONES */}
      <div className="ath-card" style={{ padding: '24px', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--ath-primary)', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              <Compass size={14} /> ACTIONABLE DEVELOPMENT CHECKLIST
            </div>
            <h3 style={{ fontSize: '1.18rem', fontWeight: 800, color: 'var(--ath-dark)', margin: '4px 0 2px' }}>
              Weekly Talent Cultivation Tasks
            </h3>
            <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--ath-text-muted)' }}>
              Check off completed conditioning drills to level up your athletic portfolio
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--ath-text-muted)' }}>Milestone Progress</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ath-dark)' }}>
                {completedCount} / {milestoneItems.length} Done ({milestoneProgress}%)
              </div>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--ath-border-subtle)', display: 'grid', placeItems: 'center', fontWeight: 800, color: 'var(--ath-primary)' }}>
              {milestoneProgress}%
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {milestoneItems.map((item) => {
            const isDone = Boolean(completedMilestones[item.id])
            return (
              <div
                key={item.id}
                onClick={() => toggleMilestone(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: isDone ? 'var(--ath-primary-light)' : 'var(--ath-bg)',
                  border: isDone ? '1px solid var(--ath-primary)' : '1px solid var(--ath-border)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    type="button"
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      color: isDone ? 'var(--ath-primary)' : 'var(--ath-text-light)',
                      display: 'flex',
                      cursor: 'pointer',
                    }}
                  >
                    {isDone ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                  </button>
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: isDone ? 'var(--ath-dark)' : 'var(--ath-text)', textDecoration: isDone ? 'line-through' : 'none' }}>
                      {item.title}
                    </strong>
                    <div style={{ fontSize: '0.78rem', color: 'var(--ath-text-muted)', marginTop: '2px' }}>
                      {item.desc}
                    </div>
                  </div>
                </div>

                <span className="ath-badge" style={{ fontSize: '0.74rem', background: isDone ? '#dcfce7' : 'var(--ath-surface)', color: isDone ? '#15803d' : 'var(--ath-text-muted)' }}>
                  +{item.points} XP
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* DETAIL MODAL FOR SELECTED SPORT PATHWAY */}
      {selectedSport && (
        <div
          className="ath-modal-backdrop"
          onClick={() => setSelectedSport(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="ath-modal-dialog"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '640px' }}
          >
            <div className="ath-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.8rem' }}>{selectedSport.icon}</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--ath-dark)' }}>
                    {selectedSport.name}
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--ath-primary)', fontWeight: 700 }}>
                    {selectedSport.matchScore}% Physiological Match • {selectedSport.category}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="ath-modal-close-btn"
                onClick={() => setSelectedSport(null)}
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            <div className="ath-modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
              <div>
                <div className="modal-section-title">Why You Match This Sport</div>
                <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--ath-text)', lineHeight: 1.55 }}>
                  {selectedSport.description}
                </p>
              </div>

              <div>
                <div className="modal-section-title">Recommended Weekly Conditioning Drills</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {selectedSport.drills.map((drill, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '12px 14px',
                        background: 'var(--ath-bg)',
                        borderRadius: '10px',
                        border: '1px solid var(--ath-border)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <strong style={{ fontSize: '0.9rem', color: 'var(--ath-dark)' }}>
                          {idx + 1}. {drill.name}
                        </strong>
                        <span className="ath-badge info" style={{ fontSize: '0.74rem' }}>
                          {drill.volume}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--ath-text-muted)' }}>
                        <strong>Technical Focus:</strong> {drill.focus}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="modal-section-title">Competitive Scouting Pathway</div>
                <div
                  style={{
                    padding: '14px 16px',
                    background: 'var(--ath-surface-hover)',
                    borderRadius: '10px',
                    border: '1px solid var(--ath-border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '0.85rem',
                    color: 'var(--ath-text)',
                  }}
                >
                  <Trophy size={18} color="var(--ath-primary)" />
                  <span>{selectedSport.pathway}</span>
                </div>
              </div>

              <div>
                <div className="modal-section-title">Required Equipment & Venue</div>
                <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--ath-text-muted)' }}>
                  {selectedSport.equipment}
                </p>
              </div>
            </div>

            <div className="ath-modal-footer">
              <button
                type="button"
                className="ath-btn ath-btn-secondary"
                onClick={() => setSelectedSport(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </StudentAppLayout>
  )
}