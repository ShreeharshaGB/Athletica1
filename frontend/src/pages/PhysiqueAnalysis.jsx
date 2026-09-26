import { useState, useEffect, useRef } from 'react'
import {
  Sparkles,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Dumbbell,
  HeartPulse,
  Target,
  ShieldAlert,
  Calendar,
  X,
  Eye,
  Info,
  Camera,
} from 'lucide-react'
import StudentAppLayout from '../components/StudentAppLayout'
import CameraCaptureModal from '../components/CameraCaptureModal'
import { apiRequest, API_BASE_URL } from '../lib/api.js'
import './PhysiqueAnalysis.css'

export default function PhysiqueAnalysis() {
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [loadingInitial, setLoadingInitial] = useState(true)
  const [analysis, setAnalysis] = useState(null)
  const [error, setError] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [cameraModalOpen, setCameraModalOpen] = useState(false)
  const fileInputRef = useRef(null)
  const nativeCameraInputRef = useRef(null)

  // Fetch student's latest completed analysis on mount without re-running Gemini
  useEffect(() => {
    let active = true

    async function fetchLatestAnalysis() {
      try {
        setLoadingInitial(true)
        const data = await apiRequest('/student/physique-analysis')
        if (active && data?.analysis) {
          setAnalysis(data.analysis)
        }
      } catch (err) {
        // Non-blocking on initial load
        console.warn('No previous physique analysis found or failed to load:', err.message)
      } finally {
        if (active) setLoadingInitial(false)
      }
    }

    fetchLatestAnalysis()

    return () => {
      active = false
    }
  }, [])

  // Clean up object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handleFileChange = (selectedFile) => {
    if (!selectedFile) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
    if (!allowedTypes.includes(selectedFile.type.toLowerCase())) {
      setError('Please select a valid image file (JPG, PNG, or WEBP).')
      return
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('Image file size must be less than 5MB.')
      return
    }

    setError('')
    setFile(selectedFile)

    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl)
    }

    const objectUrl = URL.createObjectURL(selectedFile)
    setPreviewUrl(objectUrl)
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0])
    }
  }

  const handleRemoveImage = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl)
    }
    setFile(null)
    setPreviewUrl('')
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    if (nativeCameraInputRef.current) {
      nativeCameraInputRef.current.value = ''
    }
  }

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please choose or upload a physique photo before analyzing.')
      return
    }

    setError('')
    setAnalyzing(true)

    try {
      const formData = new FormData()
      formData.append('image', file)

      const result = await apiRequest('/student/physique-analysis', {
        method: 'POST',
        body: formData,
      })

      if (result?.analysis) {
        setAnalysis(result.analysis)
      } else {
        throw new Error('Analysis completed but no structured data was returned.')
      }
    } catch (err) {
      console.error('Physique analysis failed:', err)
      setError(err.message || 'Analysis could not be completed. Please try again with a clearer photo.')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleResetForNewUpload = () => {
    handleRemoveImage()
    setAnalysis(null)
    setError('')
  }

  return (
    <StudentAppLayout
      pageTitle="AI Physique Analysis"
      pageSubtitle="Upload a clear physique photo to receive AI-powered fitness guidance."
      eyebrow="ATHLETICA AI VISION"
    >
      <div className="physique-container">
        {/* ================= ERROR ALERT ================= */}
        {error && (
          <div className="physique-alert-box" role="alert">
            <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <strong style={{ display: 'block', marginBottom: '2px' }}>Analysis Notice</strong>
              <span>{error}</span>
            </div>
            <button
              type="button"
              className="ath-btn ath-btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              onClick={handleAnalyze}
              disabled={analyzing}
            >
              Retry
            </button>
          </div>
        )}

        {/* ================= UPLOAD CARD (WHEN NOT ANALYZING AND NO ACTIVE ANALYSIS VIEW) ================= */}
        {(!analysis || file) && (
          <div className="physique-card">
            <div className="physique-card-header">
              <h2 className="physique-card-title">
                <Sparkles size={20} color="#0f766e" />
                Upload Physique Photo
              </h2>
              {file && (
                <button
                  type="button"
                  className="ath-btn ath-btn-secondary"
                  onClick={handleRemoveImage}
                  disabled={analyzing}
                  style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                >
                  <X size={15} /> Remove Image
                </button>
              )}
            </div>

            {/* Hidden File Input for Gallery */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              onChange={(e) => handleFileChange(e.target.files[0])}
              disabled={analyzing}
            />

            {/* Hidden File Input for Native Camera */}
            <input
              ref={nativeCameraInputRef}
              type="file"
              accept="image/*"
              capture="user"
              style={{ display: 'none' }}
              onChange={(e) => handleFileChange(e.target.files?.[0])}
              disabled={analyzing}
            />

            {/* Camera Capture Modal */}
            <CameraCaptureModal
              isOpen={cameraModalOpen}
              onClose={() => setCameraModalOpen(false)}
              onCapture={(capturedFile) => handleFileChange(capturedFile)}
              title="Capture Physique Photo"
              subtitle="Stand 6-8 feet away in upright posture with good ambient lighting."
              initialFacingMode="user"
            />

            {/* DUAL SELECTION OPTIONS (When no preview yet) */}
            {!previewUrl ? (
              <div className="ath-upload-options-grid">
                {/* OPTION 1: SELECT FROM GALLERY */}
                <div
                  className={`ath-upload-option-card ${dragActive ? 'drag-active' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click()
                  }}
                >
                  <div className="ath-upload-option-icon">
                    <ImageIcon size={28} />
                  </div>
                  <div>
                    <h4 className="ath-upload-option-title">Select from Gallery</h4>
                    <p className="ath-upload-option-desc">
                      Upload an existing front or side posture photo from your device (JPG, PNG, WEBP).
                    </p>
                  </div>
                  <button type="button" className="ath-btn ath-btn-secondary ath-upload-option-btn">
                    <Upload size={15} /> Browse Gallery
                  </button>
                </div>

                {/* OPTION 2: TAKE PHOTO WITH CAMERA */}
                <div
                  className="ath-upload-option-card"
                  onClick={() => setCameraModalOpen(true)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') setCameraModalOpen(true)
                  }}
                >
                  <div className="ath-upload-option-icon" style={{ background: '#f0fdfa', color: '#0f766e', borderColor: '#ccfbf1' }}>
                    <Camera size={28} />
                  </div>
                  <div>
                    <h4 className="ath-upload-option-title">Take Photo with Camera</h4>
                    <p className="ath-upload-option-desc">
                      Activate camera directly, line up your frame, and snap your posture photo on the spot.
                    </p>
                  </div>
                  <button type="button" className="ath-btn ath-btn-primary ath-upload-option-btn">
                    <Camera size={15} /> Open Camera
                  </button>
                </div>
              </div>
            ) : (
              <div className="physique-preview-wrap">
                <div className="physique-preview-box">
                  <img src={previewUrl} alt="Physique preview" className="physique-preview-img" />
                </div>

                <div className="physique-preview-actions">
                  <button
                    type="button"
                    className="ath-btn ath-btn-secondary"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={analyzing}
                    title="Select different image from gallery"
                  >
                    <ImageIcon size={16} /> Gallery
                  </button>

                  <button
                    type="button"
                    className="ath-btn ath-btn-secondary"
                    onClick={() => setCameraModalOpen(true)}
                    disabled={analyzing}
                    title="Take new photo with camera"
                  >
                    <Camera size={16} /> Camera
                  </button>

                  <button
                    type="button"
                    className="ath-btn ath-btn-secondary"
                    onClick={handleRemoveImage}
                    disabled={analyzing}
                  >
                    <RotateCcw size={16} /> Clear
                  </button>

                  <button
                    type="button"
                    className="ath-btn ath-btn-primary"
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    style={{ minWidth: '180px' }}
                  >
                    <Sparkles size={16} />
                    {analyzing ? 'Analyzing...' : 'Analyze My Physique'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= LOADING STATE ================= */}
        {analyzing && (
          <div className="physique-card">
            <div className="physique-loading-state">
              <div className="physique-spinner" />
              <h3 className="physique-loading-title">Analyzing your physique...</h3>
              <p className="physique-loading-sub">
                Gemini AI is examining visual posture alignment, kinetic balance, and athletic conditioning focus areas.
              </p>
            </div>
          </div>
        )}

        {/* ================= RESULTS DISPLAY ================= */}
        {!analyzing && analysis && (
          <>
            {/* Suitable vs Unsuitable Check */}
            {!analysis.isSuitableImage ? (
              <div className="physique-card">
                <div className="physique-alert-box" style={{ background: '#fef2f2', borderColor: '#fecaca', color: '#991b1b' }}>
                  <ShieldAlert size={24} style={{ flexShrink: 0 }} />
                  <div>
                    <h3 style={{ margin: '0 0 6px', fontSize: '1rem', fontWeight: 700 }}>
                      Clearer Photo Required
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.5 }}>
                      {analysis.unsuitableReason ||
                        'The uploaded photo could not be evaluated. Please ensure the photograph is clear, properly lit, and shows your physical posture.'}
                    </p>
                  </div>
                </div>

                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
                  <button
                    type="button"
                    className="ath-btn ath-btn-primary"
                    onClick={handleResetForNewUpload}
                  >
                    <RotateCcw size={16} /> Upload Another Photo
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* TOP SUMMARY CARD */}
                <div className="physique-card">
                  <div className="physique-card-header">
                    <div>
                      <h2 className="physique-card-title">
                        <Sparkles size={20} color="#0f766e" />
                        Posture & Conditioning Summary
                      </h2>
                      {analysis.createdAt && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                          <Calendar size={14} />
                          <span>Analyzed on {new Date(analysis.createdAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className={`physique-badge physique-badge-${analysis.confidence || 'medium'}`}>
                        {analysis.confidence || 'Medium'} Confidence
                      </span>
                      <button
                        type="button"
                        className="ath-btn ath-btn-secondary"
                        onClick={handleResetForNewUpload}
                        style={{ padding: '8px 14px', fontSize: '0.84rem' }}
                      >
                        <RotateCcw size={15} /> Analyze New Photo
                      </button>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.98rem', lineHeight: 1.6, color: '#1e293b', margin: 0 }}>
                    {analysis.summary}
                  </p>
                </div>

                {/* DETAILED FOCUS AREAS GRID */}
                <div className="physique-results-grid">
                  {/* Visible Observations */}
                  <div className="physique-section-card">
                    <h3 className="physique-section-head">
                      <Eye size={18} color="#0f766e" />
                      Visible Observations
                    </h3>
                    <ul className="physique-list">
                      {analysis.visibleObservations && analysis.visibleObservations.length > 0 ? (
                        analysis.visibleObservations.map((obs, idx) => (
                          <li key={idx} className="physique-list-item">
                            <span className="physique-bullet" />
                            <span>{obs}</span>
                          </li>
                        ))
                      ) : (
                        <li className="physique-list-item">Balanced posture observed.</li>
                      )}
                    </ul>
                  </div>

                  {/* Strength Focus */}
                  <div className="physique-section-card">
                    <h3 className="physique-section-head">
                      <Dumbbell size={18} color="#f97316" />
                      Strength Focus
                    </h3>
                    <ul className="physique-list">
                      {analysis.strengthFocus && analysis.strengthFocus.length > 0 ? (
                        analysis.strengthFocus.map((item, idx) => (
                          <li key={idx} className="physique-list-item">
                            <span className="physique-bullet" style={{ background: '#f97316' }} />
                            <span>{item}</span>
                          </li>
                        ))
                      ) : (
                        <li className="physique-list-item">Core and posterior chain stabilization.</li>
                      )}
                    </ul>
                  </div>

                  {/* Mobility Focus */}
                  <div className="physique-section-card">
                    <h3 className="physique-section-head">
                      <RotateCcw size={18} color="#8b5cf6" />
                      Mobility Focus
                    </h3>
                    <ul className="physique-list">
                      {analysis.mobilityFocus && analysis.mobilityFocus.length > 0 ? (
                        analysis.mobilityFocus.map((item, idx) => (
                          <li key={idx} className="physique-list-item">
                            <span className="physique-bullet" style={{ background: '#8b5cf6' }} />
                            <span>{item}</span>
                          </li>
                        ))
                      ) : (
                        <li className="physique-list-item">Hip flexor and thoracic mobility.</li>
                      )}
                    </ul>
                  </div>

                  {/* Conditioning Focus */}
                  <div className="physique-section-card">
                    <h3 className="physique-section-head">
                      <HeartPulse size={18} color="#ef4444" />
                      Conditioning Focus
                    </h3>
                    <ul className="physique-list">
                      {analysis.conditioningFocus && analysis.conditioningFocus.length > 0 ? (
                        analysis.conditioningFocus.map((item, idx) => (
                          <li key={idx} className="physique-list-item">
                            <span className="physique-bullet" style={{ background: '#ef4444' }} />
                            <span>{item}</span>
                          </li>
                        ))
                      ) : (
                        <li className="physique-list-item">Muscular endurance circuits.</li>
                      )}
                    </ul>
                  </div>

                  {/* Recommended Focus Priorities */}
                  <div className="physique-section-card">
                    <h3 className="physique-section-head">
                      <Target size={18} color="#0f766e" />
                      Recommended Priorities
                    </h3>
                    <ul className="physique-list">
                      {analysis.recommendedFocus && analysis.recommendedFocus.length > 0 ? (
                        analysis.recommendedFocus.map((item, idx) => (
                          <li key={idx} className="physique-list-item">
                            <span className="physique-bullet" />
                            <span>{item}</span>
                          </li>
                        ))
                      ) : (
                        <li className="physique-list-item">Maintain consistent multi-joint resistance training.</li>
                      )}
                    </ul>
                  </div>

                  {/* Beginner Actions */}
                  <div className="physique-section-card">
                    <h3 className="physique-section-head">
                      <CheckCircle2 size={18} color="#10b981" />
                      Action Steps
                    </h3>
                    <ul className="physique-list">
                      {analysis.beginnerActions && analysis.beginnerActions.length > 0 ? (
                        analysis.beginnerActions.map((item, idx) => (
                          <li key={idx} className="physique-list-item">
                            <span className="physique-bullet" style={{ background: '#10b981' }} />
                            <span>{item}</span>
                          </li>
                        ))
                      ) : (
                        <li className="physique-list-item">Incorporate daily dynamic warmups before training.</li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* ================= DISCLAIMER ================= */}
                <div className="physique-disclaimer-box">
                  <Info size={18} style={{ flexShrink: 0, marginTop: '2px' }} color="#64748b" />
                  <div>
                    <strong>Athletica Non-Medical Fitness Guidance Disclaimer: </strong>
                    <span>
                      {analysis.disclaimer ||
                        'This AI-generated analysis is intended for general physical education, posture alignment, and wellness guidance only. It is not medical advice, a clinical diagnosis, or a measurement of exact body composition.'}
                    </span>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </StudentAppLayout>
  )
}
