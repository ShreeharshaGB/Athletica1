import { useEffect, useRef, useState, useMemo } from 'react'
import {
  Camera,
  CircleStop,
  Download,
  LoaderCircle,
  Play,
  ScanLine,
  Video,
  X,
  Search,
  Dumbbell,
  Sparkles,
  Flame,
  CheckCircle2,
  ChevronRight,
  Info,
} from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import StudentAppLayout from '../components/StudentAppLayout'
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision'
import './FormCheck.css'
import './FormCheckEnhancements.css'

export const EXERCISES = [
  // Gym Exercises
  {
    id: 'squats',
    name: 'Squats',
    aliases: ['squat', 'back squat', 'barbell squat'],
    category: 'gym',
    categoryLabel: 'Gym Exercise',
    icon: '🏋️',
    difficulty: 'Intermediate',
    target: 'Quads, Glutes & Core',
    type: 'reps',
    instructions: [
      'Stand tall with feet shoulder-width apart, toes flared slightly outwards (~15°).',
      'Brace your abdominal core, hinge at your hips, and bend knees tracking over your toes.',
      'Descend until thighs are at least parallel to the floor (knee angle < 105°).',
      'Drive powerfully through your mid-foot to stand tall without excessively locking your knees.',
    ],
  },
  {
    id: 'deadlift',
    name: 'Deadlift',
    aliases: ['deadlift', 'romanian deadlift', 'rdl'],
    category: 'gym',
    categoryLabel: 'Gym Exercise',
    icon: '🏋️',
    difficulty: 'Intermediate',
    target: 'Hamstrings, Glutes & Back',
    type: 'reps',
    instructions: [
      'Stand with feet hip-width apart, the weight positioned directly over the mid-foot.',
      'Hinge deeply at your hips with a flat, neutral spine and shins perpendicular to the mat.',
      'Engage lats and grip firmly, pulling chest forward before initiating the drive.',
      'Drive the floor away by extending hips and knees in unison; finish in a tall neutral stance.',
    ],
  },
  {
    id: 'bench-press',
    name: 'Bench Press',
    aliases: ['bench press', 'chest press', 'dumbbell press'],
    category: 'gym',
    categoryLabel: 'Gym Exercise',
    icon: '🏋️',
    difficulty: 'Intermediate',
    target: 'Pectorals, Anterior Delts & Triceps',
    type: 'reps',
    instructions: [
      'Lie flat with eyes beneath the weight, feet planted firmly into the ground.',
      'Retract shoulder blades and hold weights slightly wider than shoulder width.',
      'Lower weights with control to mid-chest level (elbows angled ~75° to your torso).',
      'Press upward smoothly along a gentle arc to full extension without lifting shoulders off the bench.',
    ],
  },
  {
    id: 'overhead-press',
    name: 'Overhead Shoulder Press',
    aliases: ['overhead press', 'shoulder press', 'military press'],
    category: 'gym',
    categoryLabel: 'Gym Exercise',
    icon: '🏋️',
    difficulty: 'Intermediate',
    target: 'Shoulders, Upper Chest & Triceps',
    type: 'reps',
    instructions: [
      'Stand with feet hip-width apart, holding weights at collarbone level with elbows forward.',
      'Brace core and squeeze glutes to keep pelvis neutral and protect your lumbar spine.',
      'Press weights vertically upward until arms reach full overhead lockout (biceps by ears).',
      'Lower with strict control back to chin height before starting the next rep.',
    ],
  },
  {
    id: 'bicep-curls',
    name: 'Dumbbell Bicep Curls',
    aliases: ['bicep curl', 'curls', 'hammer curl'],
    category: 'gym',
    categoryLabel: 'Gym Exercise',
    icon: '🏋️',
    difficulty: 'Beginner',
    target: 'Biceps Brachii & Forearms',
    type: 'reps',
    instructions: [
      'Stand upright with weights at sides, palms facing forward, elbows pinned to your ribs.',
      'Curl the weights upward solely by flexing elbows, avoiding any torso swinging or momentum.',
      'Squeeze biceps hard at the peak contraction when elbows close (< 65°).',
      'Lower under controlled eccentric tension for 2-3 seconds to full extension.',
    ],
  },
  {
    id: 'barbell-rows',
    name: 'Barbell Rows',
    aliases: ['row', 'bent over row', 'barbell row'],
    category: 'gym',
    categoryLabel: 'Gym Exercise',
    icon: '🏋️',
    difficulty: 'Intermediate',
    target: 'Latissimus Dorsi & Rhomboids',
    type: 'reps',
    instructions: [
      'Hinge hips back with knees soft to establish a ~45-degree flat torso angle.',
      'Arms hang straight down under shoulders with wrists straight.',
      'Drive elbows up and back, pulling weights toward the lower ribs.',
      'Pinch shoulder blades firmly at the top, then lower with control.',
    ],
  },
  {
    id: 'lunges',
    name: 'Forward Lunges',
    aliases: ['lunge', 'walking lunge', 'reverse lunge'],
    category: 'gym',
    categoryLabel: 'Gym Exercise',
    icon: '🏋️',
    difficulty: 'Beginner',
    target: 'Quadriceps, Glutes & Balance',
    type: 'reps',
    instructions: [
      'Stand tall and take a deliberate step forward with one leg.',
      'Lower hips until front thigh is parallel to the ground and back knee hovers an inch above floor.',
      'Keep torso upright and verify your front knee tracks directly over your ankle.',
      'Push off the front heel to return cleanly to the starting position.',
    ],
  },

  // Yoga Poses
  {
    id: 'warrior-ii',
    name: 'Warrior II (Virabhadrasana II)',
    aliases: ['warrior', 'warrior 2', 'warrior ii'],
    category: 'yoga',
    categoryLabel: 'Yoga Asana',
    icon: '🧘',
    difficulty: 'Beginner',
    target: 'Hips, Groin, Chest & Stamina',
    type: 'hold',
    instructions: [
      'Step feet wide apart (~4 feet), turn front foot forward and back foot inward ~90 degrees.',
      'Bend front knee deeply to 90 degrees, keeping it directly stacked over the ankle.',
      'Extend both arms outward parallel to the mat at shoulder height, palms facing down.',
      'Stack your shoulders squarely over hips and fix your gaze serenely over front middle finger.',
    ],
  },
  {
    id: 'downward-dog',
    name: 'Downward-Facing Dog (Adho Mukha Svanasana)',
    aliases: ['downward dog', 'down dog'],
    category: 'yoga',
    categoryLabel: 'Yoga Asana',
    icon: '🧘',
    difficulty: 'Beginner',
    target: 'Hamstrings, Calves, Shoulders & Spine',
    type: 'hold',
    instructions: [
      'From hands and knees, tuck your toes and lift knees up, pushing hips towards ceiling.',
      'Create an inverted "V" shape with your body; press actively into palms and index knuckles.',
      'Draw armpits toward one another and lengthen through your entire spine.',
      'Gently ease heels toward the ground without forcing knees into painful lockout.',
    ],
  },
  {
    id: 'tree-pose',
    name: 'Tree Pose (Vrikshasana)',
    category: 'yoga',
    categoryLabel: 'Yoga Asana',
    icon: '🧘',
    difficulty: 'Beginner',
    target: 'Proprioception, Ankle & Pelvic Balance',
    type: 'hold',
    instructions: [
      'Anchor all four corners of your standing foot firmly into the earth.',
      'Place opposite foot on inner calf or inner thigh (avoid pressing directly against knee joint).',
      'Open the bent knee out to the side while keeping hip points facing squarely forward.',
      'Bring hands to prayer at chest or extend gracefully overhead, gazing at a fixed focal point.',
    ],
  },
  {
    id: 'cobra-pose',
    name: 'Cobra Pose (Bhujangasana)',
    category: 'yoga',
    categoryLabel: 'Yoga Asana',
    icon: '🧘',
    difficulty: 'Beginner',
    target: 'Spinal Extension & Heart Opening',
    type: 'hold',
    instructions: [
      'Lie face down with legs hip-distance apart, pressing tops of feet into the floor.',
      'Place hands directly beneath shoulders with elbows tucked close to your ribs.',
      'Inhale to gently peel chest and upper ribs off the floor using spinal erectors.',
      'Keep pelvis glued down and draw shoulder blades back and down away from your neck.',
    ],
  },
  {
    id: 'bridge-pose',
    name: 'Bridge Pose (Setu Bandhasana)',
    category: 'yoga',
    categoryLabel: 'Yoga Asana',
    icon: '🧘',
    difficulty: 'Beginner',
    target: 'Glutes, Hamstrings & Spine',
    type: 'hold',
    instructions: [
      'Lie on your back with knees bent and feet hip-width flat on the mat near glutes.',
      'Rest arms long by your sides with palms pressing into the floor.',
      'Press through feet to lift hips toward ceiling until thighs align with torso.',
      'Keep knees parallel and lift sternum gently toward your chin.',
    ],
  },
  {
    id: 'plank-pose',
    name: 'Plank Pose (Phalakasana)',
    category: 'yoga',
    categoryLabel: 'Yoga Asana',
    icon: '🧘',
    difficulty: 'Intermediate',
    target: 'Core, Scapular Stabilizers & Arms',
    type: 'hold',
    instructions: [
      'Stack wrists directly under shoulders with index fingers pointing forward.',
      'Step back on balls of feet so body forms one unbroken diagonal line from head to heels.',
      'Draw belly button to spine, engage quads, and press floor away to prevent shoulder blade collapse.',
      'Keep cervical spine neutral by looking slightly ahead of fingertips.',
    ],
  },
  {
    id: 'childs-pose',
    name: "Child's Pose (Balasana)",
    category: 'yoga',
    categoryLabel: 'Yoga Asana',
    icon: '🧘',
    difficulty: 'Restorative',
    target: 'Lower Back Decompression & Recovery',
    type: 'hold',
    instructions: [
      'Kneel on the floor, touch big toes together, and widen knees to edges of the mat.',
      'Fold forward at the hips, extending torso between thighs with arms reaching forward.',
      'Rest forehead gently on the mat and release tension in shoulders, neck, and jaw.',
      'Breathe deeply into the back ribs to promote neuromuscular calming.',
    ],
  },

  // Calisthenics
  {
    id: 'push-ups',
    name: 'Push-ups',
    aliases: ['pushups', 'push-up', 'push up'],
    category: 'calisthenics',
    categoryLabel: 'Calisthenics',
    icon: '🤸',
    difficulty: 'Beginner',
    target: 'Chest, Triceps & Core Bracing',
    type: 'reps',
    instructions: [
      'Establish a firm plank with hands placed slightly wider than shoulder width.',
      'Lock glutes and core so hips do not sag or hike during movement.',
      'Lower body until chest hovers just 1-2 inches above floor (elbows at ~45-60° angle).',
      'Push the ground away to full arm extension without shrugging shoulders.',
    ],
  },
  {
    id: 'pull-ups',
    name: 'Pull-ups',
    aliases: ['pullup', 'pull-up', 'chin-up', 'chinup'],
    category: 'calisthenics',
    categoryLabel: 'Calisthenics',
    icon: '🤸',
    difficulty: 'Advanced',
    target: 'Lats, Rhomboids & Forearms',
    type: 'reps',
    instructions: [
      'Hang from overhead bar with palms facing away, hands slightly wider than shoulders.',
      'Begin from a full dead hang with arms extended and shoulders packed.',
      'Pull chest up toward bar by driving elbows down and back until chin clears the bar.',
      'Lower yourself with complete control back into a dead hang without swinging.',
    ],
  },
  {
    id: 'dips',
    name: 'Parallel Bar Dips',
    aliases: ['dip', 'tricep dips', 'dips'],
    category: 'calisthenics',
    categoryLabel: 'Calisthenics',
    icon: '🤸',
    difficulty: 'Intermediate',
    target: 'Triceps, Lower Pectorals & Delts',
    type: 'reps',
    instructions: [
      'Hold top support on parallel bars with arms locked and shoulders depressed.',
      'Lower torso by bending elbows until upper arms reach approximately 90 degrees.',
      'Maintain steady torso lean and prevent shoulders from rolling forward.',
      'Drive through palms to return to full lockout at the top.',
    ],
  },
  {
    id: 'plank-hold',
    name: 'Forearm Plank Hold',
    aliases: ['plank', 'forearm plank'],
    category: 'calisthenics',
    categoryLabel: 'Calisthenics',
    icon: '🤸',
    difficulty: 'Beginner',
    target: 'Deep Core, Obliques & Glutes',
    type: 'hold',
    instructions: [
      'Rest on forearms with elbows directly under shoulders, forearms parallel.',
      'Step back on balls of feet, maintaining a rigid straight line from heels to head.',
      'Tuck tailbone slightly, squeeze glutes, and brace abs like taking a hit.',
      'Maintain position without letting lower back arch or hips sag towards floor.',
    ],
  },
  {
    id: 'mountain-climbers',
    name: 'Mountain Climbers',
    aliases: ['mountain climber', 'climbers'],
    category: 'calisthenics',
    categoryLabel: 'Calisthenics',
    icon: '🤸',
    difficulty: 'Intermediate',
    target: 'Core, Hip Flexors & Stamina',
    type: 'reps',
    instructions: [
      'Start in a tall push-up plank position with hands directly under shoulders.',
      'Quickly drive one knee toward chest without letting hips hike upward.',
      'Switch legs dynamically in a running motion, maintaining light footwork.',
      'Keep core braced and shoulders stable over wrists throughout the set.',
    ],
  },
  {
    id: 'bodyweight-squats',
    name: 'Bodyweight Air Squats',
    aliases: ['air squat', 'bodyweight squat'],
    category: 'calisthenics',
    categoryLabel: 'Calisthenics',
    icon: '🤸',
    difficulty: 'Beginner',
    target: 'Quadriceps, Glutes & Calves',
    type: 'reps',
    instructions: [
      'Stand with feet shoulder-width apart, arms held out in front for counterbalance.',
      'Sit hips back and down, keeping chest upright and weight centered.',
      'Break parallel depth with hips dropping lower than knee height.',
      'Push through floor to full hip extension, squeezing glutes at the top.',
    ],
  },
  {
    id: 'burpees',
    name: 'Standard Burpees',
    aliases: ['burpee'],
    category: 'calisthenics',
    categoryLabel: 'Calisthenics',
    icon: '🤸',
    difficulty: 'Advanced',
    target: 'Full Body Explosive Conditioning',
    type: 'reps',
    instructions: [
      'From standing, drop hands to floor and kick feet back into a plank.',
      'Lower chest completely to the floor in a controlled drop.',
      'Press up, jump feet back up towards hands, and explosively leap with hands overhead.',
      'Absorb landing softly on midfoot and immediately transition into the next rep.',
    ],
  },
]

const CONNECTIONS = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
  [11, 23], [12, 24], [23, 24], [23, 25], [25, 27], [24, 26], [26, 28],
]

function angle(first, middle, last) {
  if (!first || !middle || !last) return 180
  const radians = Math.atan2(last.y - middle.y, last.x - middle.x) - Math.atan2(first.y - middle.y, first.x - middle.x)
  let degrees = Math.abs((radians * 180) / Math.PI)
  if (degrees > 180) degrees = 360 - degrees
  return degrees
}

function getFormFeedback(exerciseId, landmarks) {
  if (!landmarks || landmarks.length < 29) {
    return { message: 'Step into the frame so your full body from head to feet is visible.', tone: 'neutral' }
  }

  const leftKnee = angle(landmarks[23], landmarks[25], landmarks[27])
  const rightKnee = angle(landmarks[24], landmarks[26], landmarks[28])
  const avgKnee = (leftKnee + rightKnee) / 2

  const leftElbow = angle(landmarks[11], landmarks[13], landmarks[15])
  const rightElbow = angle(landmarks[12], landmarks[14], landmarks[16])
  const avgElbow = (leftElbow + rightElbow) / 2

  const shoulderY = (landmarks[11].y + landmarks[12].y) / 2
  const hipY = (landmarks[23].y + landmarks[24].y) / 2
  const ankleY = (landmarks[27].y + landmarks[28].y) / 2

  // Squats & Lunges & Air Squats
  if (/squat|lunge/.test(exerciseId)) {
    if (avgKnee < 105) {
      return { message: 'Great depth! Torso steady, drive powerfully through your heels.', tone: 'good' }
    }
    if (avgKnee < 150) {
      return { message: 'Lower with control — aim for thighs parallel with knees tracking over toes.', tone: 'focus' }
    }
    return { message: 'Stand tall with core braced, then begin by hinging hips back slowly.', tone: 'focus' }
  }

  // Push-ups & Bench Press & Dips
  if (/push|bench|dip/.test(exerciseId)) {
    const hipShoulderDiff = Math.abs(shoulderY - hipY)
    if (hipShoulderDiff > 0.25) {
      return { message: 'Keep hips aligned with shoulders — avoid sagging lower back or piking.', tone: 'focus' }
    }
    if (avgElbow < 100) {
      return { message: 'Full range reached! Drive up smoothly while maintaining core tension.', tone: 'good' }
    }
    if (avgElbow < 155) {
      return { message: 'Keep descent controlled, elbows tucked at ~45 degrees.', tone: 'focus' }
    }
    return { message: 'Strong lockout. Lower with a controlled 2-second tempo.', tone: 'good' }
  }

  // Bicep Curls
  if (/curl/.test(exerciseId)) {
    if (avgElbow < 70) {
      return { message: 'Peak contraction! Squeeze biceps without swinging your torso.', tone: 'good' }
    }
    if (avgElbow > 145) {
      return { message: 'Full stretch at bottom. Begin curling without leaning backwards.', tone: 'neutral' }
    }
    return { message: 'Keep elbows pinned to your ribs as you curl up.', tone: 'focus' }
  }

  // Overhead Press
  if (/overhead|shoulder/.test(exerciseId)) {
    if (avgElbow > 165 && (landmarks[15].y < shoulderY && landmarks[16].y < shoulderY)) {
      return { message: 'Full overhead extension! Core locked, avoiding lumbar arch.', tone: 'good' }
    }
    return { message: 'Press straight overhead until arms lock out by your ears.', tone: 'focus' }
  }

  // Deadlift & Barbell Rows
  if (/deadlift|row/.test(exerciseId)) {
    if (avgKnee > 130 && avgKnee < 170) {
      return { message: 'Good hinge position. Keep spine flat and pull shoulders back.', tone: 'good' }
    }
    return { message: 'Hinge deeply at hips while keeping bar close to your body.', tone: 'focus' }
  }

  // Yoga: Warrior II
  if (/warrior/.test(exerciseId)) {
    const minKnee = Math.min(leftKnee, rightKnee)
    const maxKnee = Math.max(leftKnee, rightKnee)
    if (minKnee < 115 && maxKnee > 150) {
      return { message: 'Excellent Warrior II! Front knee deep at ~90°, arms reaching long.', tone: 'good' }
    }
    return { message: 'Sink deeper into front knee while keeping back leg straight and arms level.', tone: 'focus' }
  }

  // Yoga: Downward Dog
  if (/downward/.test(exerciseId)) {
    if (hipY < shoulderY && hipY < ankleY) {
      return { message: 'Strong inverted V-shape! Reach hips high, lengthen spine.', tone: 'good' }
    }
    return { message: 'Press floor away through palms, sending tailbone up and back.', tone: 'focus' }
  }

  // Yoga: Tree Pose
  if (/tree/.test(exerciseId)) {
    const kneeDiff = Math.abs(leftKnee - rightKnee)
    if (kneeDiff > 40) {
      return { message: 'Steady tree balance! Keep chest lifted and standing leg firm.', tone: 'good' }
    }
    return { message: 'Draw one foot onto calf or inner thigh, opening the bent knee outward.', tone: 'focus' }
  }

  // Planks
  if (/plank/.test(exerciseId)) {
    const hipShoulderDiff = Math.abs(shoulderY - hipY)
    if (hipShoulderDiff < 0.12) {
      return { message: 'Rock solid plank alignment! Glutes and abs braced.', tone: 'good' }
    }
    return { message: 'Align hips with shoulders in one continuous straight line.', tone: 'focus' }
  }

  // General default
  return {
    message: 'Movement detected. Keep smooth tempo, steady breathing, and follow the posture cues.',
    tone: 'good',
  }
}

export default function FormCheck() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialEx = searchParams.get('exercise') || 'Squats'
  const initialCategory = searchParams.get('category') || 'all'

  // Match initial exercise
  const matched = EXERCISES.find(
    (e) => e.name.toLowerCase() === initialEx.toLowerCase() || e.id === initialEx.toLowerCase() || e.aliases?.includes(initialEx.toLowerCase())
  ) || EXERCISES[0]

  const [selectedExercise, setSelectedExercise] = useState(matched)
  const [activeCategory, setActiveCategory] = useState(initialCategory)
  const [searchQuery, setSearchQuery] = useState('')

  // Video & CV tracking
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const landmarkerRef = useRef(null)
  const streamRef = useRef(null)
  const animationRef = useRef(null)
  const recorderRef = useRef(null)
  const recordedChunksRef = useRef([])
  const recordingRef = useRef(false)
  const sessionStatsRef = useRef({ frames: 0, goodFrames: 0, focusFrames: 0, reps: 0, phase: 'ready' })

  const [cameraReady, setCameraReady] = useState(false)
  const [loadingModel, setLoadingModel] = useState(false)
  const [recording, setRecording] = useState(false)
  const [recordedUrl, setRecordedUrl] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [liveReps, setLiveReps] = useState(0)
  const [feedback, setFeedback] = useState({ message: 'Start the camera to begin posture check.', tone: 'neutral' })
  const [error, setError] = useState('')

  // Filtered exercises list
  const filteredExercises = useMemo(() => {
    return EXERCISES.filter((ex) => {
      const matchCategory = activeCategory === 'all' || ex.category === activeCategory
      const matchSearch =
        !searchQuery.trim() ||
        ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase())
      return matchCategory && matchSearch
    })
  }, [activeCategory, searchQuery])

  // Handle exercise selection
  const handleSelectExercise = (ex) => {
    setSelectedExercise(ex)
    sessionStatsRef.current.reps = 0
    sessionStatsRef.current.phase = 'ready'
    setLiveReps(0)
    setSearchParams({ exercise: ex.name, category: activeCategory })
  }

  // Cleanup on unmount
  useEffect(() => () => {
    cancelAnimationFrame(animationRef.current)
    streamRef.current?.getTracks().forEach((track) => track.stop())
    landmarkerRef.current?.close()
  }, [])

  useEffect(() => () => {
    if (recordedUrl) URL.revokeObjectURL(recordedUrl)
  }, [recordedUrl])

  const drawPose = (landmarks) => {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video || !video.videoWidth) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const context = canvas.getContext('2d')
    context.clearRect(0, 0, canvas.width, canvas.height)

    // Lines
    context.strokeStyle = '#2dd4bf'
    context.lineWidth = Math.max(3, canvas.width / 200)
    CONNECTIONS.forEach(([first, second]) => {
      if (!landmarks[first] || !landmarks[second]) return
      context.beginPath()
      context.moveTo(landmarks[first].x * canvas.width, landmarks[first].y * canvas.height)
      context.lineTo(landmarks[second].x * canvas.width, landmarks[second].y * canvas.height)
      context.stroke()
    })

    // Joint Points
    context.fillStyle = '#f0fdf4'
    landmarks.forEach((point) => {
      context.beginPath()
      context.arc(point.x * canvas.width, point.y * canvas.height, Math.max(4, canvas.width / 140), 0, Math.PI * 2)
      context.fill()
    })
  }

  const trackFrame = () => {
    const video = videoRef.current
    const landmarker = landmarkerRef.current
    if (video && landmarker && video.readyState >= 2) {
      const result = landmarker.detectForVideo(video, performance.now())
      const landmarks = result.landmarks?.[0]
      drawPose(landmarks)

      const currentFeedback = getFormFeedback(selectedExercise.id, landmarks)
      setFeedback(currentFeedback)

      // Rep Counting & Stats Logic
      if (landmarks && landmarks.length >= 29) {
        const stats = sessionStatsRef.current
        stats.frames += 1
        if (currentFeedback.tone === 'good') stats.goodFrames += 1
        if (currentFeedback.tone === 'focus') stats.focusFrames += 1

        const leftKnee = angle(landmarks[23], landmarks[25], landmarks[27])
        const rightKnee = angle(landmarks[24], landmarks[26], landmarks[28])
        const avgKnee = (leftKnee + rightKnee) / 2

        const leftElbow = angle(landmarks[11], landmarks[13], landmarks[15])
        const rightElbow = angle(landmarks[12], landmarks[14], landmarks[16])
        const avgElbow = (leftElbow + rightElbow) / 2

        // Squats & Air Squats
        if (/squat/.test(selectedExercise.id)) {
          if (avgKnee < 110) stats.phase = 'inflection'
          if (avgKnee > 155 && stats.phase === 'inflection') {
            stats.reps += 1
            stats.phase = 'standing'
            setLiveReps(stats.reps)
          }
        }
        // Push-ups & Dips
        else if (/push|dip/.test(selectedExercise.id)) {
          if (avgElbow < 100) stats.phase = 'inflection'
          if (avgElbow > 155 && stats.phase === 'inflection') {
            stats.reps += 1
            stats.phase = 'lockout'
            setLiveReps(stats.reps)
          }
        }
        // Curls
        else if (/curl/.test(selectedExercise.id)) {
          if (avgElbow < 70) stats.phase = 'contracted'
          if (avgElbow > 145 && stats.phase === 'contracted') {
            stats.reps += 1
            stats.phase = 'extended'
            setLiveReps(stats.reps)
          }
        }
      }
    }
    animationRef.current = requestAnimationFrame(trackFrame)
  }

  const startCamera = async () => {
    setError('')
    setLoadingModel(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 1280, height: 720 },
        audio: true,
      })
      streamRef.current = stream
      videoRef.current.srcObject = stream
      await videoRef.current.play()
      setCameraReady(true)

      try {
        const vision = await FilesetResolver.forVisionTasks('/mediapipe/wasm')
        landmarkerRef.current = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: '/mediapipe/pose_landmarker_lite.task', delegate: 'GPU' },
          runningMode: 'VIDEO',
          numPoses: 1,
        })
        animationRef.current = requestAnimationFrame(trackFrame)
      } catch (modelError) {
        setError(`Camera is active, but pose tracking model could not load: ${modelError.message || 'Check connection'}`)
      }
    } catch (cameraError) {
      setError(
        cameraError.name === 'NotAllowedError'
          ? 'Camera permission was denied. Please allow camera access in your browser settings.'
          : cameraError.message || 'Could not access webcam.'
      )
      streamRef.current?.getTracks().forEach((track) => track.stop())
    } finally {
      setLoadingModel(false)
    }
  }

  const stopCamera = () => {
    cancelAnimationFrame(animationRef.current)
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setCameraReady(false)
    setRecording(false)
  }

  const startRecording = () => {
    if (!streamRef.current) return
    try {
      const mimeType = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'].find((t) =>
        MediaRecorder.isTypeSupported(t)
      )
      if (!mimeType) throw new Error('Video recording not supported in this browser.')
      recordedChunksRef.current = []
      sessionStatsRef.current = { frames: 0, goodFrames: 0, focusFrames: 0, reps: 0, phase: 'ready' }
      setAnalysis(null)
      setLiveReps(0)

      const recorder = new MediaRecorder(streamRef.current, { mimeType })
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) recordedChunksRef.current.push(event.data)
      }
      recorder.onerror = () => {
        recordingRef.current = false
        setRecording(false)
        setError('Recorder reported an unexpected error.')
      }
      recorder.onstop = () => {
        if (recordedChunksRef.current.length > 0) {
          setRecordedUrl(URL.createObjectURL(new Blob(recordedChunksRef.current, { type: mimeType })))
        }
        const stats = sessionStatsRef.current
        setAnalysis({
          ...stats,
          quality: stats.goodFrames >= stats.focusFrames ? 'Consistent Form & Control' : 'Focus Needed On Alignment',
        })
      }
      recorder.start(1000)
      recorderRef.current = recorder
      recordingRef.current = true
      setRecording(true)
      setError('')
    } catch (err) {
      setError(err.message || 'Failed to start recording.')
    }
  }

  const stopRecording = () => {
    recorderRef.current?.stop()
    recorderRef.current = null
    recordingRef.current = false
    setRecording(false)
  }

  return (
    <StudentAppLayout
      pageTitle="Check My Form"
      pageSubtitle="Real-time computer vision movement feedback across gym exercises, yoga, and calisthenics."
      eyebrow="COMPUTER VISION COACH"
    >
      <div className="form-check-page">
        {/* HERO BANNER */}
        <section className="form-check-hero">
          <div className="form-check-icon">
            <ScanLine size={24} />
          </div>
          <div>
            <p>AI VISION BIOMECHANICS COACH</p>
            <h2>Practice {selectedExercise.name} with real-time feedback.</h2>
            <span>
              All camera analysis runs privately in your browser. Choose any exercise below to switch cues, rep tracking, and instructional checkpoints instantly.
            </span>
          </div>
        </section>

        {/* EXERCISE CATALOG & SELECTOR */}
        <section
          className="ath-card"
          style={{
            marginTop: '20px',
            padding: '20px 24px',
            borderRadius: '16px',
            background: 'var(--ath-surface, #ffffff)',
            border: '1px solid var(--ath-border, #e2e8f0)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--ath-dark, #0f172a)' }}>
                Choose Your Exercise
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--ath-text-muted, #64748b)' }}>
                Select from {EXERCISES.length} calibrated movements across Gym, Yoga, and Calisthenics.
              </p>
            </div>

            {/* Search Box */}
            <div style={{ position: 'relative', width: '220px' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search exercise..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 12px 7px 32px',
                  borderRadius: '20px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.82rem',
                  outline: 'none',
                  background: '#f8fafc',
                }}
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
            {[
              { id: 'all', label: 'All Movements', count: EXERCISES.length },
              { id: 'gym', label: '🏋️ Gym Exercises', count: EXERCISES.filter((e) => e.category === 'gym').length },
              { id: 'yoga', label: '🧘 Yoga Asanas', count: EXERCISES.filter((e) => e.category === 'yoga').length },
              { id: 'calisthenics', label: '🤸 Calisthenics', count: EXERCISES.filter((e) => e.category === 'calisthenics').length },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`ath-tab ${activeCategory === cat.id ? 'active' : ''}`}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  border: activeCategory === cat.id ? '1px solid #0f766e' : '1px solid #e2e8f0',
                  background: activeCategory === cat.id ? '#e6f7f2' : '#f8fafc',
                  color: activeCategory === cat.id ? '#0f766e' : '#475569',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.label} ({cat.count})
              </button>
            ))}
          </div>

          {/* Exercise Select Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '10px',
              maxHeight: '260px',
              overflowY: 'auto',
              paddingRight: '4px',
            }}
          >
            {filteredExercises.map((ex) => {
              const isSelected = selectedExercise.id === ex.id
              return (
                <div
                  key={ex.id}
                  onClick={() => handleSelectExercise(ex)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: isSelected ? '2px solid #0f766e' : '1px solid #e2e8f0',
                    background: isSelected ? '#f0fdf9' : '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 2px 8px rgba(15, 118, 110, 0.12)' : 'none',
                  }}
                >
                  <span style={{ fontSize: '1.3rem' }}>{ex.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.86rem', fontWeight: 800, color: isSelected ? '#0f766e' : '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {ex.name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {ex.target}
                    </div>
                  </div>
                  {isSelected && <CheckCircle2 size={16} color="#0f766e" style={{ flexShrink: 0 }} />}
                </div>
              )
            })}
          </div>
        </section>

        {/* WORKOUT CAMERA & FEEDBACK SECTION */}
        <div className="form-check-grid" style={{ marginTop: '20px' }}>
          {/* CAMERA FEED & CONTROLS */}
          <section className="camera-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>{selectedExercise.icon}</span>
                <strong style={{ fontSize: '0.98rem', color: '#0f172a' }}>{selectedExercise.name}</strong>
                <span className="ath-badge info" style={{ fontSize: '0.7rem' }}>
                  {selectedExercise.categoryLabel}
                </span>
              </div>

              {liveReps > 0 && (
                <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: '4px 10px', borderRadius: '16px', fontWeight: 800, fontSize: '0.8rem' }}>
                  ⚡ {liveReps} Reps Completed
                </div>
              )}
            </div>

            <div className="camera-stage">
              <video ref={videoRef} muted playsInline />
              <canvas ref={canvasRef} />
              {!cameraReady && (
                <div className="camera-empty">
                  <Camera size={34} />
                  <p>{loadingModel ? 'Loading pose tracker...' : 'Camera preview will appear here.'}</p>
                  <span style={{ fontSize: '0.75rem', opacity: 0.75 }}>
                    Click "Start Camera" to initiate real-time computer vision
                  </span>
                </div>
              )}
            </div>

            <div className="camera-controls">
              {!cameraReady ? (
                <button
                  type="button"
                  className="ath-btn ath-btn-primary"
                  onClick={startCamera}
                  disabled={loadingModel}
                >
                  {loadingModel ? <LoaderCircle size={16} className="ath-spin" /> : <Play size={16} />}
                  {loadingModel ? 'Preparing tracker...' : 'Start Camera'}
                </button>
              ) : (
                <button type="button" className="ath-btn ath-btn-secondary" onClick={stopCamera}>
                  <X size={16} /> Stop Camera
                </button>
              )}

              {cameraReady && !recording && (
                <button type="button" className="ath-btn ath-btn-primary" onClick={startRecording}>
                  <Video size={16} /> Record Session
                </button>
              )}

              {recording && (
                <button type="button" className="ath-btn ath-btn-danger" onClick={stopRecording}>
                  <CircleStop size={16} /> Stop Recording
                </button>
              )}

              {recordedUrl && (
                <a
                  className="ath-btn ath-btn-secondary"
                  href={recordedUrl}
                  download={`${selectedExercise.name.toLowerCase().replaceAll(' ', '-')}-form-check.webm`}
                >
                  <Download size={16} /> Save Recording
                </a>
              )}
            </div>
          </section>

          {/* REAL-TIME FEEDBACK & INSTRUCTIONS */}
          <section className="form-feedback-card">
            <div className={`feedback-status ${feedback.tone}`}>
              <span className="feedback-dot" />
              <strong>{feedback.tone === 'good' ? 'Posture Aligned ✓' : feedback.tone === 'focus' ? 'Form Focus' : 'Coach Cue'}</strong>
            </div>

            <p className="feedback-message">{feedback.message}</p>

            <div className="form-check-tips">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Info size={16} color="#0f766e" />
                How to perform {selectedExercise.name}
              </h3>

              {selectedExercise.instructions.map((instruction, index) => (
                <p className="instruction-step" key={instruction}>
                  <strong>{index + 1}</strong>
                  {instruction}
                </p>
              ))}

              <div style={{ marginTop: '16px', padding: '10px 12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.78rem', color: '#64748b' }}>
                💡 <strong>Target:</strong> {selectedExercise.target} • <strong>Difficulty:</strong> {selectedExercise.difficulty}
              </div>
            </div>

            {analysis && (
              <div className="analysis-result">
                <h3>Session Analysis</h3>
                <strong>{analysis.quality}</strong>
                <p>
                  {analysis.frames} tracked frames · {analysis.goodFrames} aligned cues · {analysis.focusFrames} corrective adjustments
                  {analysis.reps > 0 ? ` · ${analysis.reps} completed reps` : ''}
                </p>
                <span>Automated biomechanical telemetry for training feedback.</span>
              </div>
            )}

            {error && (
              <p className="form-check-error" role="alert" style={{ marginTop: '14px' }}>
                {error}
              </p>
            )}
          </section>
        </div>
      </div>
    </StudentAppLayout>
  )
}