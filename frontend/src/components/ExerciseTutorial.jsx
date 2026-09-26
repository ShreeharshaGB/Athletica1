import { useEffect, useRef } from 'react'
import { Camera, PlayCircle, X, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import './ExerciseTutorial.css'

/**
 * Intelligent exercise matcher that maps any exercise name and category
 * to its exact, dedicated biomechanic animation archetype.
 */
function getTutorialVariant(exercise) {
  const name = `${exercise?.name || ''} ${exercise?.category || ''}`.toLowerCase()

  // 1. Mountain Climbers
  if (/mountain climber/.test(name)) return 'mountainclimber'

  // 2. Glute Bridges & Hip Thrusts
  if (/glute bridge|hip thrust|bridge pose|setu bandh/.test(name)) return 'glutebridge'

  // 3. Planks (Isometric hold, not push-up dip)
  if (/plank|phalakasana/.test(name)) return 'plank'

  // 4. Bird-Dog Quadruped Extension
  if (/bird-dog|bird dog/.test(name)) return 'birddog'

  // 5. Dead Bug Core Stabilization
  if (/dead bug|deadbug/.test(name)) return 'deadbug'

  // 6. Sit-ups & Crunches
  if (/sit-up|situp|crunch|abdominal curl/.test(name)) return 'situp'

  // 7. Calf Raises
  if (/calf raise|heel raise/.test(name)) return 'calfraise'

  // 8. Cat-Cow Spinal Movement
  if (/cat-cow|cat cow|marjary/.test(name)) return 'catcow'

  // 9. Child's Pose
  if (/child's pose|child pose|balasana/.test(name)) return 'childpose'

  // 10. Push-ups & variations
  if (/push-up|pushup|push up|press-up/.test(name)) return 'pushup'

  // 11. Squats & Air Squats
  if (/squat|chair sit/.test(name)) return 'squat'

  // 12. Lunges & Split Squats
  if (/lunge|split squat|step-up|step up/.test(name)) return 'lunge'

  // 13. Bench Press & Chest Press
  if (/bench press|chest press|dumbbell press/.test(name)) return 'bench'

  // 14. Overhead Shoulder Press / Military Press
  if (/shoulder press|overhead press|military press|arnold press/.test(name)) return 'press'

  // 15. Pull-ups, Lat Pulldowns & Rows
  if (/pull-up|pull up|chin-up|chin up|lat pulldown|row|pulling/.test(name)) return 'pull'

  // 16. Deadlift & Hip Hinge
  if (/deadlift|romanian|rdl|good morning/.test(name)) return 'hinge'

  // 17. Bicep Curls & Arm Isolation
  if (/bicep|curl|arm curl|hammer curl/.test(name)) return 'bicep'

  // 18. Running, Walking, Cardio & Agility
  if (/run|sprint|shuttle|jog|walk|jack|jump|skip|hop|cardio|march|burpee/.test(name)) return 'cardio'

  // 19. Stretching & Mobility
  if (/stretch|mobility|flexib|twist|reach|roll|yoga|hamstring|hip flexor|piriformis/.test(name)) return 'stretch'

  // Default fallback
  return 'squat'
}

function getCuesForVariant(variant) {
  switch (variant) {
    case 'plank':
      return [
        'Place forearms flat under shoulders; keep neck long and gaze on floor.',
        'Brace your abdomen and squeeze glutes to form a single straight board from head to heels.',
        'Do not let hips sag down or pike into the air; breathe steadily into your ribcage.',
      ]
    case 'glutebridge':
      return [
        'Lie flat on back with knees bent and feet planted flat hip-width apart.',
        'Drive through your heels to raise your hips until knees, hips, and shoulders form a straight line.',
        'Pause and squeeze glutes hard at the apex for 1–2 seconds, then lower with control.',
      ]
    case 'mountainclimber':
      return [
        'Start in a strong high plank with hands directly beneath shoulders.',
        'Drive one knee rapidly toward your chest without bouncing hips upward.',
        'Alternate legs rhythmically while keeping your core braced and shoulders stable.',
      ]
    case 'situp':
      return [
        'Lie on back with knees bent and fingertips lightly resting at sides of head.',
        'Engage abdominal muscles to curl shoulders and torso smoothly toward your thighs.',
        'Lower back down one vertebra at a time under control without pulling on your neck.',
      ]
    case 'birddog':
      return [
        'Begin on hands and knees with wrists under shoulders and knees under hips.',
        'Slowly reach opposite arm forward and opposite leg backward until parallel to the floor.',
        'Keep hips and shoulders level with no arching in lower back; hold 2 seconds, then switch.',
      ]
    case 'deadbug':
      return [
        'Lie on back with arms straight up and knees bent at 90 degrees (tabletop).',
        'Press lower back firmly into the floor and slowly lower opposite arm and leg toward ground.',
        'Return to start and repeat with opposite limbs without letting lumbar spine arch.',
      ]
    case 'calfraise':
      return [
        'Stand tall with feet hip-width apart and knees straight but unlocked.',
        'Push down through the balls of both feet to elevate your heels as high as possible.',
        'Hold the peak contraction for 1 second, then lower heels slowly over 2 seconds.',
      ]
    case 'catcow':
      return [
        'Start on hands and knees with flat neutral back and relaxed neck.',
        'Inhale while dropping belly toward floor and lifting chest and gaze gently (Cow Pose).',
        'Exhale while tucking chin, drawing navel inward, and rounding back skyward (Cat Pose).',
      ]
    case 'childpose':
      return [
        'Kneel on floor, touch big toes together, and sit hips back onto your heels.',
        'Fold torso forward between thighs and extend arms long along the floor.',
        'Rest forehead gently on mat and take slow, deep breaths expanding the back ribcage.',
      ]
    case 'pushup':
      return [
        'Position hands slightly wider than shoulder-width with fingers spread for stability.',
        'Tuck elbows at ~45 degrees to ribs rather than flaring wide toward the shoulders.',
        'Lower chest smoothly until 2 inches from floor, then press upward forcefully to lockout.',
      ]
    case 'squat':
      return [
        'Keep weight centered through mid-foot and heels with chest proud and spine neutral.',
        'Hinge hips backward as knees track inline with second and third toes.',
        'Descend until thighs reach parallel to ground, then drive through floor to full hip lockout.',
      ]
    case 'lunge':
      return [
        'Take a generous stride forward; keep torso tall and perpendicular to the floor.',
        'Lower rear knee toward floor until both front and rear legs reach ~90° angles.',
        'Drive off front heel to return cleanly to the starting posture without leaning.',
      ]
    case 'bench':
      return [
        'Pin shoulder blades into the bench and plant feet firmly flat on the floor.',
        'Lower bar with control to lower sternum with elbows tucked at 60-75°.',
        'Drive bar vertically upward back over mid-chest to complete arm lockout.',
      ]
    case 'press':
      return [
        'Stand with feet hip-width apart, brace core tightly and squeeze glutes.',
        'Press weights vertically overhead in a straight trajectory, tilting chin slightly back.',
        'Lock arms directly above shoulders and ears without arching lower spine.',
      ]
    case 'pull':
      return [
        'Initiate the movement by depressing shoulder blades down and back.',
        'Drive elbows downward toward hips to engage the latissimus dorsi muscles.',
        'Control the negative return for 2 full seconds without jerking or swinging.',
      ]
    case 'hinge':
      return [
        'Push hips backward towards the wall behind you with soft, stable knees.',
        'Keep the bar path close to your shins with a flat, rigid spine throughout.',
        'Drive hips forward into glute contraction at top; do not hyperextend backward.',
      ]
    case 'bicep':
      return [
        'Pin elbows stationary at your ribs to prevent shoulder momentum.',
        'Curl weight upward in a smooth arc, squeezing biceps hard at the peak.',
        'Lower the weight with 2–3 seconds of continuous tension on the eccentric return.',
      ]
    case 'cardio':
      return [
        'Land softly on the balls of your feet with light, rhythmic spring turnover.',
        'Drive knees high toward hip level while synchronizing counter-arm swings.',
        'Breathe rhythmically through nose and mouth to sustain steady cardiovascular pacing.',
      ]
    case 'stretch':
    default:
      return [
        'Set up with a grounded, comfortable base and maintain relaxed diaphragmatic breathing.',
        'Move slowly into the stretch until mild tension is felt, never sharp pain.',
        'Hold smoothly for 20 to 30 seconds, relaxing deeper into posture on every exhalation.',
      ]
  }
}

function getTempoLabel(variant) {
  switch (variant) {
    case 'plank':
      return 'ISOMETRIC HOLD: KEEP CORE BRACED • STEADY BREATHING'
    case 'glutebridge':
      return 'TEMPO: 1s UP • 2s PEAK GLUTE SQUEEZE • 2s DOWN'
    case 'situp':
      return 'TEMPO: 2s CURL UP • 1s CONTRACTION • 2s LOWER'
    case 'mountainclimber':
      return 'CADENCE: RAPID RHYTHMIC KNEE TURNOVER • LEVEL HIPS'
    case 'birddog':
      return 'TEMPO: 2s EXTEND • 2s HOLD PARALLEL • 2s RETURN'
    case 'deadbug':
      return 'TEMPO: 2s LOWER OPPOSITE LIMBS • 2s RETURN'
    case 'calfraise':
      return 'TEMPO: 1s EXPLOSIVE UP • 1s PEAK HOLD • 2s LOWER'
    case 'catcow':
      return 'FLOW: 3s INHALE (COW) • 3s EXHALE (CAT)'
    case 'childpose':
      return 'RESTORATIVE: 4s INHALE • 6s RELAXATION EXHALE'
    case 'pushup':
      return 'TEMPO: 2s DOWN (ECCENTRIC) • 1s EXPLOSIVE PRESS'
    case 'squat':
      return 'TEMPO: 2s DESCENT TO PARALLEL • 1s DRIVE UP'
    case 'lunge':
      return 'TEMPO: 2s DESCENT • 1s STABILIZATION • 1s RETURN'
    default:
      return 'TEMPO: 2s CONTROLLED CADENCE • FULL RANGE OF MOTION'
  }
}

/**
 * High-Performance Kinematic 2D Canvas Engine
 * Replaces all glitchy/unsupported SVG CSS transforms with 100% mathematically
 * continuous, biologically articulated joint physics rendered at 60 FPS.
 */
function KinematicExerciseCanvas({ variant, isDark }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationId

    // Color palette based on theme
    const primaryColor = isDark ? '#2dd4bf' : '#0f766e'
    const jointColor = isDark ? '#14b8a6' : '#0d9488'
    const accentColor = '#f59e0b'
    const floorColor = isDark ? 'rgba(45, 212, 191, 0.35)' : 'rgba(15, 118, 110, 0.4)'
    const auraColor = isDark ? 'rgba(45, 212, 191, 0.15)' : 'rgba(15, 118, 110, 0.12)'

    const drawLine = (x1, y1, x2, y2, width = 8, color = primaryColor) => {
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.lineWidth = width
      ctx.lineCap = 'round'
      ctx.strokeStyle = color
      ctx.stroke()
    }

    const drawJoint = (x, y, radius = 5, color = jointColor) => {
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fillStyle = isDark ? '#111a24' : '#ffffff'
      ctx.fill()
      ctx.lineWidth = 2.5
      ctx.strokeStyle = color
      ctx.stroke()
    }

    const drawHead = (x, y, radius = 14) => {
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fillStyle = primaryColor
      ctx.fill()
      ctx.lineWidth = 2
      ctx.strokeStyle = isDark ? '#5eead4' : '#134e4a'
      ctx.stroke()
    }

    const drawFloor = () => {
      ctx.beginPath()
      ctx.moveTo(25, 220)
      ctx.lineTo(315, 220)
      ctx.lineWidth = 3
      ctx.lineCap = 'round'
      ctx.strokeStyle = floorColor
      ctx.stroke()

      // Floor contact shadow
      ctx.beginPath()
      ctx.ellipse(170, 222, 85, 5, 0, 0, Math.PI * 2)
      ctx.fillStyle = auraColor
      ctx.fill()
    }

    let startTime = performance.now()

    const render = (time) => {
      const elapsed = (time - startTime) / 1000 // seconds
      const width = canvas.width
      const height = canvas.height

      ctx.clearRect(0, 0, width, height)
      drawFloor()

      // Standard ease-in-out cosine curve (0 to 1 and back)
      const cycleDuration =
        variant === 'cardio' || variant === 'mountainclimber' ? 0.8 : 2.6
      const wave = (1 - Math.cos((2 * Math.PI * elapsed) / cycleDuration)) / 2

      // ========================================================
      // 1. PUSH-UP: Rigid plank pivoting at toes, chest lowering
      // ========================================================
      if (variant === 'pushup') {
        const toeX = 265
        const toeY = 220
        // Head and shoulder lower smoothly
        const shoulderX = 105
        const shoulderY = 135 + 46 * wave
        const headX = 80
        const headY = shoulderY - 8

        // Torso, hips, and legs form one straight plank line
        const hipX = shoulderX + (toeX - shoulderX) * 0.45
        const hipY = shoulderY + (toeY - shoulderY) * 0.45

        drawLine(headX, headY, shoulderX, shoulderY, 10)
        drawLine(shoulderX, shoulderY, hipX, hipY, 10)
        drawLine(hipX, hipY, toeX, toeY, 8)
        drawHead(headX, headY, 13)
        drawJoint(toeX, toeY, 4)
        drawJoint(hipX, hipY, 5)

        // Arms: Hands fixed on floor at (105, 220), elbow articulates backwards
        const handX = 105
        const handY = 220
        const elbowX = 105 + 26 * wave
        const elbowY = (shoulderY + handY) / 2 + 6 * wave

        drawLine(shoulderX, shoulderY, elbowX, elbowY, 7)
        drawLine(elbowX, elbowY, handX, handY, 7)
        drawJoint(shoulderX, shoulderY, 5)
        drawJoint(elbowX, elbowY, 4.5)
        drawJoint(handX, handY, 5)
      }

      // ========================================================
      // 2. PLANK: Straight horizontal hold with core breathing pulse
      // ========================================================
      else if (variant === 'plank') {
        const toeX = 265
        const toeY = 220
        const elbowX = 105
        const elbowY = 220
        const handX = 85
        const handY = 220

        // Subtle breathing micro-movement
        const breathe = Math.sin(elapsed * 2.5) * 1.5
        const shoulderX = 105
        const shoulderY = 175 + breathe
        const headX = 80
        const headY = 168 + breathe
        const hipX = shoulderX + (toeX - shoulderX) * 0.45
        const hipY = shoulderY + (toeY - shoulderY) * 0.45

        // Forearm on floor
        drawLine(elbowX, elbowY, handX, handY, 6)
        // Upper arm vertical
        drawLine(elbowX, elbowY, shoulderX, shoulderY, 7)
        // Body plank
        drawLine(shoulderX, shoulderY, hipX, hipY, 10)
        drawLine(hipX, hipY, toeX, toeY, 8)
        drawHead(headX, headY, 13)
        drawJoint(toeX, toeY, 4)
        drawJoint(elbowX, elbowY, 4.5)
        drawJoint(shoulderX, shoulderY, 5)
        drawJoint(hipX, hipY, 5)

        // Core brace pulsing halo
        const pulseR = 12 + Math.sin(elapsed * 4) * 4
        ctx.beginPath()
        ctx.arc(hipX, hipY, pulseR, 0, Math.PI * 2)
        ctx.strokeStyle = accentColor
        ctx.lineWidth = 2
        ctx.stroke()
      }

      // ========================================================
      // 3. SQUAT: Feet planted, hips sink into parallel depth
      // ========================================================
      else if (variant === 'squat') {
        const ankleX = 160
        const ankleY = 220

        // At top: standing tall. At bottom: thighs parallel
        const hipX = 160 - 28 * wave
        const hipY = 135 + 46 * wave
        const kneeX = 160 + 24 * wave
        const kneeY = 180 + 8 * wave

        const shoulderX = 160 - 6 * wave
        const shoulderY = 75 + 46 * wave
        const headX = 160
        const headY = 52 + 46 * wave

        // Arms reach forward for balance
        const handX = 195 + 15 * wave
        const handY = 85 + 46 * wave

        drawLine(ankleX - 15, ankleY, ankleX + 15, ankleY, 5) // Foot
        drawLine(ankleX, ankleY, kneeX, kneeY, 8) // Shin
        drawLine(kneeX, kneeY, hipX, hipY, 9) // Thigh
        drawLine(hipX, hipY, shoulderX, shoulderY, 10) // Torso
        drawLine(shoulderX, shoulderY, handX, handY, 6) // Arms
        drawHead(headX, headY, 14)
        drawJoint(ankleX, ankleY, 4.5)
        drawJoint(kneeX, kneeY, 5)
        drawJoint(hipX, hipY, 5.5)
        drawJoint(shoulderX, shoulderY, 5)
      }

      // ========================================================
      // 4. GLUTE BRIDGE: Supine on floor, hips drive up into bridge
      // ========================================================
      else if (variant === 'glutebridge') {
        const shoulderX = 85
        const shoulderY = 215
        const headX = 65
        const headY = 215
        const footX = 225
        const footY = 220

        // Hips start on floor, drive high into air
        const hipX = 150
        const hipY = 215 - 55 * wave
        const kneeX = 190
        const kneeY = 175 - 15 * wave

        drawLine(headX, headY, shoulderX, shoulderY, 9)
        drawLine(shoulderX, shoulderY, hipX, hipY, 10)
        drawLine(hipX, hipY, kneeX, kneeY, 9)
        drawLine(kneeX, kneeY, footX, footY, 8)
        // Arms on floor
        drawLine(shoulderX, shoulderY, 135, 218, 6)

        drawHead(headX, headY, 13)
        drawJoint(shoulderX, shoulderY, 5)
        drawJoint(hipX, hipY, 5.5)
        drawJoint(kneeX, kneeY, 5)
        drawJoint(footX, footY, 4.5)
      }

      // ========================================================
      // 5. SIT-UPS / CRUNCHES: Torso curls up toward knees
      // ========================================================
      else if (variant === 'situp') {
        const hipX = 145
        const hipY = 218
        const kneeX = 185
        const kneeY = 170
        const footX = 225
        const footY = 220

        // Torso curls from flat (wave=0) up to 45 degrees (wave=1)
        const angle = 0.05 + 0.65 * wave
        const torsoLen = 65
        const shoulderX = hipX - Math.cos(angle) * torsoLen
        const shoulderY = hipY - Math.sin(angle) * torsoLen
        const headX = shoulderX - Math.cos(angle) * 20
        const headY = shoulderY - Math.sin(angle) * 20

        drawLine(footX - 10, footY, footX + 10, footY, 5)
        drawLine(footX, footY, kneeX, kneeY, 8)
        drawLine(kneeX, kneeY, hipX, hipY, 8)
        drawLine(hipX, hipY, shoulderX, shoulderY, 10)
        // Hands behind head
        drawLine(shoulderX, shoulderY, headX, headY + 5, 5)

        drawHead(headX, headY, 13)
        drawJoint(hipX, hipY, 5)
        drawJoint(kneeX, kneeY, 5)
        drawJoint(footX, footY, 4.5)
        drawJoint(shoulderX, shoulderY, 4.5)
      }

      // ========================================================
      // 6. MOUNTAIN CLIMBERS: High plank with rapid alternating knees
      // ========================================================
      else if (variant === 'mountainclimber') {
        const handX = 95
        const handY = 220
        const shoulderX = 95
        const shoulderY = 160
        const headX = 75
        const headY = 150
        const hipX = 180
        const hipY = 175

        // Arms and torso
        drawLine(handX, handY, shoulderX, shoulderY, 7)
        drawLine(shoulderX, shoulderY, hipX, hipY, 10)
        drawHead(headX, headY, 13)
        drawJoint(handX, handY, 5)
        drawJoint(shoulderX, shoulderY, 5)
        drawJoint(hipX, hipY, 5)

        // Stride oscillation
        const stride = Math.sin(elapsed * 8)
        // Left leg
        const lKneeX = 180 - 45 * Math.max(0, stride)
        const lKneeY = 195 - 15 * Math.max(0, stride)
        const lFootX = 260 - 55 * Math.max(0, stride)
        const lFootY = 220 - 15 * Math.max(0, stride)
        drawLine(hipX, hipY, lKneeX, lKneeY, 8)
        drawLine(lKneeX, lKneeY, lFootX, lFootY, 7)
        drawJoint(lKneeX, lKneeY, 4.5)

        // Right leg (opposite phase)
        const rKneeX = 180 - 45 * Math.max(0, -stride)
        const rKneeY = 195 - 15 * Math.max(0, -stride)
        const rFootX = 260 - 55 * Math.max(0, -stride)
        const rFootY = 220 - 15 * Math.max(0, -stride)
        drawLine(
          hipX,
          hipY,
          rKneeX,
          rKneeY,
          8,
          isDark ? '#0d9488' : '#14b8a6'
        )
        drawLine(
          rKneeX,
          rKneeY,
          rFootX,
          rFootY,
          7,
          isDark ? '#0d9488' : '#14b8a6'
        )
        drawJoint(rKneeX, rKneeY, 4.5)
      }

      // ========================================================
      // 7. BIRD-DOG: Quadruped extending opposite arm and leg
      // ========================================================
      else if (variant === 'birddog') {
        const baseHandX = 120
        const baseHandY = 220
        const baseKneeX = 190
        const baseKneeY = 220
        const shoulderX = 120
        const shoulderY = 175
        const hipX = 190
        const hipY = 175
        const headX = 98
        const headY = 168

        // Planted limbs
        drawLine(baseHandX, baseHandY, shoulderX, shoulderY, 6)
        drawLine(baseKneeX, baseKneeY, hipX, hipY, 7)
        drawLine(shoulderX, shoulderY, hipX, hipY, 10)
        drawHead(headX, headY, 13)
        drawJoint(baseHandX, baseHandY, 4)
        drawJoint(baseKneeX, baseKneeY, 4.5)

        // Reaching arm forward and leg backward
        const reachHandX = 120 - 65 * wave
        const reachHandY = 175 + (220 - 175) * (1 - wave)
        const reachFootX = 190 + 75 * wave
        const reachFootY = 175 + (220 - 175) * (1 - wave)

        drawLine(shoulderX, shoulderY, reachHandX, reachHandY, 6, accentColor)
        drawLine(hipX, hipY, reachFootX, reachFootY, 7, accentColor)
        drawJoint(reachHandX, reachHandY, 4, accentColor)
        drawJoint(reachFootX, reachFootY, 4, accentColor)
      }

      // ========================================================
      // 8. DEAD BUG: On back, opposite arm and leg descending
      // ========================================================
      else if (variant === 'deadbug') {
        const shoulderX = 105
        const shoulderY = 210
        const hipX = 175
        const hipY = 210
        const headX = 85
        const headY = 208

        // Back on floor
        drawLine(headX, headY, hipX, hipY, 10)
        drawHead(headX, headY, 13)

        // Static tabletop limbs
        drawLine(shoulderX, shoulderY, shoulderX, 145, 6)
        drawLine(hipX, hipY, hipX, 155, 7)
        drawLine(hipX, 155, 215, 155, 7)

        // Dynamic moving opposite limbs (wave 0 to 1)
        const dropArmX = shoulderX - 55 * wave
        const dropArmY = 145 + 60 * wave
        const dropLegX = 175 + 80 * wave
        const dropLegY = 155 + 50 * wave

        drawLine(shoulderX, shoulderY, dropArmX, dropArmY, 6, accentColor)
        drawLine(hipX, hipY, dropLegX, dropLegY, 7, accentColor)
        drawJoint(dropArmX, dropArmY, 4)
        drawJoint(dropLegX, dropLegY, 4)
      }

      // ========================================================
      // 9. CALF RAISE: Standing tall, elevating onto tiptoes
      // ========================================================
      else if (variant === 'calfraise') {
        const toeX = 170
        const toeY = 220
        const liftY = 22 * wave // body lifts up 22px
        const ankleX = 170
        const ankleY = 215 - liftY
        const kneeX = 170
        const kneeY = 170 - liftY
        const hipX = 170
        const hipY = 130 - liftY
        const shoulderX = 170
        const shoulderY = 75 - liftY
        const headX = 170
        const headY = 52 - liftY

        drawLine(toeX - 12, toeY, toeX + 12, toeY, 5) // Floor contact
        drawLine(toeX, toeY, ankleX, ankleY, 6) // Foot arch
        drawLine(ankleX, ankleY, kneeX, kneeY, 8) // Lower leg
        drawLine(kneeX, kneeY, hipX, hipY, 9) // Thigh
        drawLine(hipX, hipY, shoulderX, shoulderY, 10) // Torso
        drawLine(shoulderX, shoulderY, 185, 115 - liftY, 6) // Arm at side
        drawHead(headX, headY, 14)
        drawJoint(ankleX, ankleY, 4.5)
        drawJoint(kneeX, kneeY, 5)
        drawJoint(hipX, hipY, 5)

        // Calf tension glow when elevated
        if (wave > 0.4) {
          ctx.beginPath()
          ctx.arc(170, (ankleY + kneeY) / 2, 9 * wave, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(245, 158, 11, 0.45)'
          ctx.fill()
        }
      }

      // ========================================================
      // 10. LUNGE: Split stance, rear knee dropping vertically
      // ========================================================
      else if (variant === 'lunge') {
        const drop = 36 * wave
        const fFootX = 215
        const fFootY = 220
        const fKneeX = 215
        const fKneeY = 180 + drop * 0.2
        const hipX = 170
        const hipY = 140 + drop
        const shoulderX = 170
        const shoulderY = 80 + drop
        const headX = 170
        const headY = 56 + drop

        const rFootX = 120
        const rFootY = 220
        const rKneeX = 135
        const rKneeY = 180 + drop * 0.95

        // Front leg
        drawLine(fFootX - 10, fFootY, fFootX + 10, fFootY, 5)
        drawLine(fFootX, fFootY, fKneeX, fKneeY, 8)
        drawLine(fKneeX, fKneeY, hipX, hipY, 9)
        // Rear leg
        drawLine(rFootX, rFootY, rKneeX, rKneeY, 7)
        drawLine(rKneeX, rKneeY, hipX, hipY, 8)
        // Torso
        drawLine(hipX, hipY, shoulderX, shoulderY, 10)
        drawHead(headX, headY, 14)
        drawJoint(fFootX, fFootY, 4.5)
        drawJoint(fKneeX, fKneeY, 5)
        drawJoint(rKneeX, rKneeY, 5)
        drawJoint(hipX, hipY, 5.5)
      }

      // ========================================================
      // 11. BENCH PRESS: Athlete on bench, barbell pressing up
      // ========================================================
      else if (variant === 'bench') {
        // Workout bench
        ctx.fillStyle = isDark ? '#1e293b' : '#334155'
        ctx.fillRect(80, 175, 170, 12)
        drawLine(105, 187, 105, 220, 5, isDark ? '#334155' : '#64748b')
        drawLine(225, 187, 225, 220, 5, isDark ? '#334155' : '#64748b')

        // Athlete on bench
        const headX = 100
        const headY = 168
        const shoulderX = 115
        const shoulderY = 172
        const hipX = 185
        const hipY = 172
        const footX = 230
        const footY = 220

        drawLine(shoulderX, shoulderY, hipX, hipY, 10)
        drawLine(hipX, hipY, 210, 172, 8)
        drawLine(210, 172, footX, footY, 8)
        drawHead(headX, headY, 13)

        // Barbell pressing up/down (wave=0 top, wave=1 chest)
        const barY = 110 + 52 * wave
        const handX = 145
        const handY = barY + 2
        const elbowX = 145 - 20 * wave
        const elbowY = (shoulderY + handY) / 2 + 10 * wave

        drawLine(shoulderX, shoulderY, elbowX, elbowY, 7)
        drawLine(elbowX, elbowY, handX, handY, 7)
        drawJoint(elbowX, elbowY, 4.5)
        drawJoint(handX, handY, 4.5)

        // Barbell & weight plates
        drawLine(110, barY, 180, barY, 5, accentColor)
        ctx.fillStyle = accentColor
        ctx.fillRect(108, barY - 10, 6, 20)
        ctx.fillRect(176, barY - 10, 6, 20)
      }

      // ========================================================
      // 12. OVERHEAD SHOULDER PRESS: Standing, pressing bar overhead
      // ========================================================
      else if (variant === 'press') {
        const ankleX = 170
        const ankleY = 220
        const kneeX = 170
        const kneeY = 175
        const hipX = 170
        const hipY = 135
        const shoulderX = 170
        const shoulderY = 85
        const headX = 170
        const headY = 62

        drawLine(ankleX - 12, ankleY, ankleX + 12, ankleY, 5)
        drawLine(ankleX, ankleY, kneeX, kneeY, 8)
        drawLine(kneeX, kneeY, hipX, hipY, 8)
        drawLine(hipX, hipY, shoulderX, shoulderY, 10)
        drawHead(headX, headY, 14)

        // Barbell path: from collarbones (y=88) to overhead lockout (y=38)
        const barY = 90 - 52 * (1 - wave)
        const handX = 165
        const handY = barY + 2
        const elbowX = 170 - 18 * wave
        const elbowY = (shoulderY + handY) / 2 + 5 * wave

        drawLine(shoulderX, shoulderY, elbowX, elbowY, 6)
        drawLine(elbowX, elbowY, handX, handY, 6)
        drawJoint(elbowX, elbowY, 4)

        // Barbell
        drawLine(120, barY, 210, barY, 5, accentColor)
        ctx.fillStyle = accentColor
        ctx.fillRect(118, barY - 9, 6, 18)
        ctx.fillRect(206, barY - 9, 6, 18)
      }

      // ========================================================
      // 13. PULL-UPS: Pulling chest up to bar
      // ========================================================
      else if (variant === 'pull') {
        // Overhead bar
        drawLine(60, 36, 280, 36, 6, isDark ? '#475569' : '#64748b')

        // Pulling up 44px
        const pullUp = 44 * wave
        const handX1 = 140
        const handX2 = 200
        const barY = 36

        const shoulderX1 = 150
        const shoulderX2 = 190
        const shoulderY = 85 - pullUp
        const headX = 170
        const headY = 65 - pullUp
        const hipX = 170
        const hipY = 150 - pullUp
        const kneeX = 170
        const kneeY = 185 - pullUp
        const footX = 170
        const footY = 215 - pullUp

        drawLine(handX1, barY, shoulderX1, shoulderY, 7)
        drawLine(handX2, barY, shoulderX2, shoulderY, 7)
        drawLine(170, shoulderY, hipX, hipY, 10)
        drawLine(hipX, hipY, kneeX, kneeY, 8)
        drawLine(kneeX, kneeY, footX, footY, 7)
        drawHead(headX, headY, 14)
        drawJoint(handX1, barY, 4.5)
        drawJoint(handX2, barY, 4.5)
        drawJoint(shoulderX1, shoulderY, 4.5)
        drawJoint(shoulderX2, shoulderY, 4.5)
      }

      // ========================================================
      // 14. BICEP CURLS: Elbow pinned, forearm curling
      // ========================================================
      else if (variant === 'bicep') {
        const ankleX = 170
        const ankleY = 220
        const kneeX = 170
        const kneeY = 175
        const hipX = 170
        const hipY = 135
        const shoulderX = 170
        const shoulderY = 82
        const headX = 170
        const headY = 60

        drawLine(ankleX, ankleY, kneeX, kneeY, 8)
        drawLine(kneeX, kneeY, hipX, hipY, 8)
        drawLine(hipX, hipY, shoulderX, shoulderY, 10)
        drawHead(headX, headY, 14)

        // Elbow pinned to ribs
        const elbowX = 170
        const elbowY = 130
        drawLine(shoulderX, shoulderY, elbowX, elbowY, 7)

        // Forearm rotates in an arc
        const curlAngle = 0.5 + 1.8 * wave
        const forearmLen = 42
        const handX = elbowX + Math.sin(curlAngle) * forearmLen
        const handY = elbowY + Math.cos(curlAngle) * forearmLen

        drawLine(elbowX, elbowY, handX, handY, 6)
        drawJoint(elbowX, elbowY, 4.5)
        // Dumbbell
        ctx.beginPath()
        ctx.arc(handX, handY, 7, 0, Math.PI * 2)
        ctx.fillStyle = accentColor
        ctx.fill()
      }

      // ========================================================
      // 15. CAT-COW: Alternating spinal wave on hands and knees
      // ========================================================
      else if (variant === 'catcow') {
        const handX = 110
        const handY = 220
        const kneeX = 205
        const kneeY = 220
        const shoulderX = 110
        const shoulderY = 175
        const hipX = 205
        const hipY = 175

        // Planted limbs
        drawLine(handX, handY, shoulderX, shoulderY, 6)
        drawLine(kneeX, kneeY, hipX, hipY, 7)
        drawJoint(handX, handY, 4.5)
        drawJoint(kneeX, kneeY, 4.5)

        // Spine curve transitions between Cow (dip) and Cat (arch)
        const spineSag = Math.sin(elapsed * 2) * 16
        const midSpineX = 158
        const midSpineY = 175 + spineSag

        ctx.beginPath()
        ctx.moveTo(shoulderX, shoulderY)
        ctx.quadraticCurveTo(midSpineX, midSpineY, hipX, hipY)
        ctx.lineWidth = 10
        ctx.lineCap = 'round'
        ctx.strokeStyle = primaryColor
        ctx.stroke()

        const headY = 168 - spineSag * 0.5
        drawHead(88, headY, 13)
      }

      // ========================================================
      // 16. CHILD'S POSE: Kneeling stretch with forward reach
      // ========================================================
      else if (variant === 'childpose') {
        const heelX = 230
        const heelY = 220
        const kneeX = 190
        const kneeY = 220
        const hipX = 210
        const hipY = 212

        // Lower body folded
        drawLine(heelX, heelY, kneeX, kneeY, 8)
        drawJoint(heelX, heelY, 4.5)

        // Breathing expansion
        const breath = Math.sin(elapsed * 2) * 2
        const shoulderX = 125
        const shoulderY = 218 + breath
        const headX = 105
        const headY = 218 + breath
        const handX = 45
        const handY = 220

        drawLine(hipX, hipY, shoulderX, shoulderY, 10)
        drawLine(shoulderX, shoulderY, handX, handY, 6)
        drawHead(headX, headY, 12)
        drawJoint(shoulderX, shoulderY, 4)
      }

      // ========================================================
      // 17. CARDIO & RUNNING CADENCE: Dynamic alternating stride
      // ========================================================
      else if (variant === 'cardio') {
        const stride = Math.sin(elapsed * 9)
        const bounce = Math.abs(Math.sin(elapsed * 9)) * 8
        const hipX = 170
        const hipY = 135 - bounce
        const shoulderX = 170
        const shoulderY = 78 - bounce
        const headX = 170
        const headY = 54 - bounce

        drawLine(hipX, hipY, shoulderX, shoulderY, 10)
        drawHead(headX, headY, 14)

        // Forward driving leg
        const fKneeX = 170 + 35 * Math.max(0, stride)
        const fKneeY = 185 - 35 * Math.max(0, stride) - bounce
        const fFootX = 170 + 20 * Math.max(0, stride)
        const fFootY = 220 - 25 * Math.max(0, stride)
        drawLine(hipX, hipY, fKneeX, fKneeY, 8)
        drawLine(fKneeX, fKneeY, fFootX, fFootY, 7)
        drawJoint(fKneeX, fKneeY, 4.5)

        // Back pushing leg
        const bKneeX = 170 - 25 * Math.max(0, -stride)
        const bKneeY = 185 - bounce
        const bFootX = 170 - 45 * Math.max(0, -stride)
        const bFootY = 220
        drawLine(
          hipX,
          hipY,
          bKneeX,
          bKneeY,
          8,
          isDark ? '#0d9488' : '#14b8a6'
        )
        drawLine(
          bKneeX,
          bKneeY,
          bFootX,
          bFootY,
          7,
          isDark ? '#0d9488' : '#14b8a6'
        )

        // Pumping arms
        drawLine(
          shoulderX,
          shoulderY,
          195,
          105 - stride * 15 - bounce,
          6,
          accentColor
        )
        drawLine(
          shoulderX,
          shoulderY,
          145,
          105 + stride * 15 - bounce,
          6,
          accentColor
        )
      }

      // ========================================================
      // 18. DEADLIFT / HINGE: Hips push back with flat back
      // ========================================================
      else {
        const ankleX = 160
        const ankleY = 220
        const kneeX = 160 + 10 * wave
        const kneeY = 180 + 5 * wave

        // Hip drives back, torso hinges forward
        const hipX = 160 - 32 * wave
        const hipY = 145 + 10 * wave
        const shoulderX = 160 + 30 * wave
        const shoulderY = 85 + 45 * wave
        const headX = shoulderX + 16 * wave
        const headY = shoulderY - 14

        drawLine(ankleX, ankleY, kneeX, kneeY, 8)
        drawLine(kneeX, kneeY, hipX, hipY, 9)
        drawLine(hipX, hipY, shoulderX, shoulderY, 10)
        drawHead(headX, headY, 14)
        drawJoint(kneeX, kneeY, 5)
        drawJoint(hipX, hipY, 5)

        // Barbell skimming close to shins
        const barX = 160 + 15 * wave
        const barY = 135 + 68 * wave
        drawLine(shoulderX, shoulderY, barX, barY, 6)
        drawLine(barX - 35, barY, barX + 35, barY, 5, accentColor)
        ctx.fillStyle = accentColor
        ctx.fillRect(barX - 37, barY - 10, 6, 20)
        ctx.fillRect(barX + 31, barY - 10, 6, 20)
      }

      animationId = requestAnimationFrame(render)
    }

    animationId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [variant, isDark])

  return (
    <div className="ath-canvas-stage-wrapper">
      <canvas
        ref={canvasRef}
        width={340}
        height={260}
        className="ath-kinematic-canvas"
        aria-label="Interactive Exercise Biomechanic Animation"
      />
    </div>
  )
}

export default function ExerciseTutorial({ exercise, onClose }) {
  const navigate = useNavigate()
  const { isDark } = useTheme()

  if (!exercise) return null

  const variant = getTutorialVariant(exercise)
  const instruction =
    exercise.instructions ||
    'Move slowly with controlled breathing and a pain-free, full range of motion.'
  const cues = getCuesForVariant(variant)
  const tempoLabel = getTempoLabel(variant)

  return (
    <div
      className="tutorial-backdrop"
      role="presentation"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        className="tutorial-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tutorial-title"
      >
        <header className="tutorial-header">
          <div>
            <span className="tutorial-kicker">
              <PlayCircle size={14} /> BIOMECHANIC MOVEMENT TUTORIAL
            </span>
            <h2 id="tutorial-title">How to: {exercise.name}</h2>
          </div>
          <button
            type="button"
            className="tutorial-close"
            onClick={onClose}
            aria-label="Close tutorial"
          >
            <X size={20} />
          </button>
        </header>

        <div className="tutorial-body">
          {/* ANIMATED STAGE */}
          <div className="tutorial-stage-wrap">
            <div className="tutorial-stage">
              <KinematicExerciseCanvas variant={variant} isDark={isDark} />

              {/* RHYTHM / CADENCE HUD */}
              <div className="tutorial-hud-bar">
                <span className="hud-phase-pulse" />
                <span className="hud-phase-label">{tempoLabel}</span>
              </div>
            </div>

            <div className="tutorial-breath-cue">
              <span>
                💨 Breathing: Inhale on descent / prep • Exhale on peak exertion
              </span>
            </div>
          </div>

          {/* DETAILS & FORM CUES */}
          <div className="tutorial-details">
            <div className="tutorial-meta">
              <span className="meta-badge target">
                🎯{' '}
                {exercise.duration ||
                  `${exercise.sets || 3} sets × ${exercise.reps || 10} reps`}
              </span>
              <span className="meta-badge gear">
                🏋️ {exercise.equipment || 'Bodyweight / Open Mat'}
              </span>
              <span className="meta-badge focus">
                ⚡ Focus: {exercise.category || 'Compound Strength'}
              </span>
            </div>

            <div className="form-focus-card">
              <h3>
                <ShieldCheck size={17} color="#14b8a6" /> Primary Form Focus
              </h3>
              <p>{instruction}</p>
            </div>

            <div className="technique-points">
              <h4>Key Form Checkpoints</h4>
              {cues.map((cue, index) => (
                <div key={index} className="cue-row">
                  <span className="cue-num">{index + 1}</span>
                  <span className="cue-text">{cue}</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="tutorial-form-button"
              onClick={() => {
                onClose()
                navigate(
                  `/student/form-check?exercise=${encodeURIComponent(
                    exercise.name
                  )}`
                )
              }}
            >
              <Camera size={17} /> Launch AI Camera Form Check
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}