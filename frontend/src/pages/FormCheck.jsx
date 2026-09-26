import { useEffect, useRef, useState } from 'react'
import { Camera, CircleStop, Download, LoaderCircle, Play, ScanLine, Video, X } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import StudentAppLayout from '../components/StudentAppLayout'
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision'
import './FormCheck.css'
import './FormCheckEnhancements.css'

const CONNECTIONS = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
  [11, 23], [12, 24], [23, 24], [23, 25], [25, 27], [24, 26], [26, 28],
]

function angle(first, middle, last) {
  const radians = Math.atan2(last.y - middle.y, last.x - middle.x) - Math.atan2(first.y - middle.y, first.x - middle.x)
  let degrees = Math.abs((radians * 180) / Math.PI)
  if (degrees > 180) degrees = 360 - degrees
  return degrees
}

function getFormFeedback(exercise, landmarks) {
  if (!landmarks || landmarks.length < 29) return { message: 'Step into the frame so your full body is visible.', tone: 'neutral' }
  const exerciseName = exercise.toLowerCase()
  const leftKnee = angle(landmarks[23], landmarks[25], landmarks[27])
  const rightKnee = angle(landmarks[24], landmarks[26], landmarks[28])
  const averageKnee = (leftKnee + rightKnee) / 2

  if (/squat|lunge|leg press/.test(exerciseName)) {
    if (averageKnee < 105) return { message: 'Good depth. Keep your chest steady and drive through your feet.', tone: 'good' }
    if (averageKnee < 155) return { message: 'Lower with control and keep both knees tracking over your feet.', tone: 'focus' }
    return { message: 'Stand tall, then begin by sending your hips back slowly.', tone: 'focus' }
  }

  if (/push|plank|press/.test(exerciseName)) {
    const shoulderHipDifference = Math.abs(((landmarks[11].y + landmarks[12].y) / 2) - ((landmarks[23].y + landmarks[24].y) / 2))
    return shoulderHipDifference > 0.2
      ? { message: 'Keep your hips aligned with your shoulders.', tone: 'focus' }
      : { message: 'Good alignment. Move slowly and keep your core braced.', tone: 'good' }
  }

  return { message: 'Keep the whole movement slow and controlled. Follow the tutorial cues.', tone: 'neutral' }
}

function getExerciseInstructions(exercise) {
  const name = exercise.toLowerCase()
  if (/squat|leg press/.test(name)) return ['Stand with feet about shoulder-width apart.', 'Brace your core, send your hips back, and bend your knees over your feet.', 'Drive through your feet to stand tall without locking your knees.']
  if (/push|bench press|chest press/.test(name)) return ['Set your hands or weights slightly wider than your shoulders.', 'Keep your body in one controlled line as you lower.', 'Press away while keeping your shoulders stable and breathing steadily.']
  if (/plank/.test(name)) return ['Place elbows or hands under your shoulders.', 'Brace your stomach and keep your hips level with your shoulders.', 'Breathe slowly and stop before your lower back loses position.']
  if (/lunge/.test(name)) return ['Stand tall and step one foot forward or backward.', 'Lower both knees with control while keeping the front knee over the foot.', 'Push through the front foot to return to standing.']
  if (/deadlift|hinge|bridge|row|pulldown|curl|press/.test(name)) return ['Set up with a stable stance and the equipment close to your body.', 'Move from the intended joints while keeping your spine controlled.', 'Return slowly and avoid swinging or using momentum.']
  return ['Set up in a stable position and keep the whole body visible.', 'Move slowly through a comfortable range of motion.', 'Breathe steadily and stop if you feel sharp pain or lose control.']
}

function getAverageKneeAngle(landmarks) {
  if (!landmarks || landmarks.length < 29) return null
  return (angle(landmarks[23], landmarks[25], landmarks[27]) + angle(landmarks[24], landmarks[26], landmarks[28])) / 2
}

export default function FormCheck() {
  const [searchParams] = useSearchParams()
  const exercise = searchParams.get('exercise') || 'Squat'
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const landmarkerRef = useRef(null)
  const streamRef = useRef(null)
  const animationRef = useRef(null)
  const recorderRef = useRef(null)
  const recordedChunksRef = useRef([])
  const recordingRef = useRef(false)
  const sessionStatsRef = useRef({ frames: 0, goodFrames: 0, focusFrames: 0, reps: 0, squatPhase: 'up' })
  const [cameraReady, setCameraReady] = useState(false)
  const [loadingModel, setLoadingModel] = useState(false)
  const [recording, setRecording] = useState(false)
  const [recordedUrl, setRecordedUrl] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [feedback, setFeedback] = useState({ message: 'Start the camera to check your form.', tone: 'neutral' })
  const [error, setError] = useState('')

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
    context.strokeStyle = '#5eead4'
    context.lineWidth = Math.max(3, canvas.width / 220)
    CONNECTIONS.forEach(([first, second]) => {
      if (!landmarks[first] || !landmarks[second]) return
      context.beginPath()
      context.moveTo(landmarks[first].x * canvas.width, landmarks[first].y * canvas.height)
      context.lineTo(landmarks[second].x * canvas.width, landmarks[second].y * canvas.height)
      context.stroke()
    })
    context.fillStyle = '#f0fdfa'
    landmarks.forEach((point) => {
      context.beginPath()
      context.arc(point.x * canvas.width, point.y * canvas.height, Math.max(4, canvas.width / 150), 0, Math.PI * 2)
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
      const currentFeedback = getFormFeedback(exercise, landmarks)
      setFeedback(currentFeedback)
      if (recordingRef.current && landmarks) {
        const stats = sessionStatsRef.current
        stats.frames += 1
        if (currentFeedback.tone === 'good') stats.goodFrames += 1
        if (currentFeedback.tone === 'focus') stats.focusFrames += 1
        if (/squat/.test(exercise.toLowerCase())) {
          const kneeAngle = getAverageKneeAngle(landmarks)
          if (kneeAngle < 105) stats.squatPhase = 'down'
          if (kneeAngle > 155 && stats.squatPhase === 'down') {
            stats.reps += 1
            stats.squatPhase = 'up'
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
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 1280, height: 720 }, audio: true })
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
        setError(`Camera is working, but pose tracking could not load: ${modelError.message || 'model unavailable'}`)
      }
    } catch (cameraError) {
      setError(cameraError.name === 'NotAllowedError' ? 'Camera permission was denied. Allow camera access and try again.' : cameraError.message || 'Could not start camera or pose tracking.')
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
      const mimeType = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'].find((type) => MediaRecorder.isTypeSupported(type))
      if (!mimeType) throw new Error('This browser does not support workout recording.')
      recordedChunksRef.current = []
      sessionStatsRef.current = { frames: 0, goodFrames: 0, focusFrames: 0, reps: 0, squatPhase: 'up' }
      setAnalysis(null)
      const recorder = new MediaRecorder(streamRef.current, { mimeType })
      recorder.ondataavailable = (event) => { if (event.data.size > 0) recordedChunksRef.current.push(event.data) }
      recorder.onerror = () => { recordingRef.current = false; setRecording(false); setError('Recording stopped because the browser recorder reported an error.') }
      recorder.onstop = () => {
        if (recordedChunksRef.current.length > 0) setRecordedUrl(URL.createObjectURL(new Blob(recordedChunksRef.current, { type: mimeType })))
        const stats = sessionStatsRef.current
        setAnalysis({ ...stats, quality: stats.goodFrames > stats.focusFrames ? 'Strong control detected' : 'Review the form cues and try another round' })
      }
      recorder.start(1000)
      recorderRef.current = recorder
      recordingRef.current = true
      setRecording(true)
      setError('')
    } catch (recordingError) {
      setError(recordingError.message || 'Could not start recording.')
    }
  }

  const stopRecording = () => {
    recorderRef.current?.stop()
    recorderRef.current = null
    recordingRef.current = false
    setRecording(false)
  }

  return <StudentAppLayout pageTitle="Check My Form" pageSubtitle="Private browser-based movement feedback" eyebrow="COMPUTER VISION COACH">
    <div className="form-check-page">
      <section className="form-check-hero"><div className="form-check-icon"><ScanLine size={24} /></div><div><p>REAL-TIME FORM CHECK</p><h2>Practice {exercise} with clearer feedback.</h2><span>Your camera feed stays in this browser. Pose landmarks are used to provide general movement cues, not medical diagnoses.</span></div></section>
      <div className="form-check-grid">
        <section className="camera-card"><div className="camera-stage"><video ref={videoRef} muted playsInline /><canvas ref={canvasRef} />{!cameraReady && <div className="camera-empty"><Camera size={30} /><p>{loadingModel ? 'Loading pose tracker...' : 'Camera preview will appear here.'}</p></div>}</div><div className="camera-controls">{!cameraReady ? <button type="button" className="ath-btn ath-btn-primary" onClick={startCamera} disabled={loadingModel}>{loadingModel ? <LoaderCircle size={16} className="ath-spin" /> : <Play size={16} />}{loadingModel ? 'Preparing tracker...' : 'Start camera'}</button> : <button type="button" className="ath-btn ath-btn-secondary" onClick={stopCamera}><X size={16} /> Stop camera</button>}{cameraReady && !recording && <button type="button" className="ath-btn ath-btn-primary" onClick={startRecording}><Video size={16} /> Record workout</button>}{recording && <button type="button" className="ath-btn ath-btn-danger" onClick={stopRecording}><CircleStop size={16} /> Stop recording</button>}{recordedUrl && <a className="ath-btn ath-btn-secondary" href={recordedUrl} download={`${exercise.toLowerCase().replaceAll(' ', '-')}-form-check.webm`}><Download size={16} /> Save recording</a>}</div></section>
        <section className="form-feedback-card"><div className={`feedback-status ${feedback.tone}`}><span className="feedback-dot" /><strong>{feedback.tone === 'good' ? 'Looking good' : feedback.tone === 'focus' ? 'Form focus' : 'Coach cue'}</strong></div><p className="feedback-message">{feedback.message}</p><div className="form-check-tips"><h3>How to perform {exercise}</h3>{getExerciseInstructions(exercise).map((instruction, index) => <p className="instruction-step" key={instruction}><strong>{index + 1}</strong>{instruction}</p>)}<p>Place the camera far enough away to show your full body. Use good lighting and keep the lens around waist or chest height.</p><p>Move at a controlled pace. If you feel sharp pain, dizziness, or unusual shortness of breath, stop and seek professional guidance.</p></div>{analysis && <div className="analysis-result"><h3>Session analysis</h3><strong>{analysis.quality}</strong><p>{analysis.frames} tracked frames · {analysis.goodFrames} positive form cues · {analysis.focusFrames} form-focus cues{/^squat$/i.test(exercise) ? ` · ${analysis.reps} squat reps detected` : ''}</p><span>Use this as general movement feedback, not a medical assessment.</span></div>}{error && <p className="form-check-error" role="alert">{error}</p>}</section>
      </div>
    </div>
  </StudentAppLayout>
}