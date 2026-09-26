import React, { useState, useEffect, useRef } from 'react'
import { Camera, RefreshCw, X, Check, RotateCcw, AlertCircle, Sparkles } from 'lucide-react'
import './CameraCaptureModal.css'

export default function CameraCaptureModal({
  isOpen,
  onClose,
  onCapture,
  title = 'Take Photo with Camera',
  subtitle = 'Frame your subject clearly and click the capture button.',
  initialFacingMode = 'environment',
}) {
  const [stream, setStream] = useState(null)
  const [facingMode, setFacingMode] = useState(initialFacingMode)
  const [capturedDataUrl, setCapturedDataUrl] = useState(null)
  const [capturedBlob, setCapturedBlob] = useState(null)
  const [error, setError] = useState('')
  const [flash, setFlash] = useState(false)
  const [cameraLoading, setCameraLoading] = useState(false)

  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const nativeCameraInputRef = useRef(null)

  // Start Camera Stream
  const startCamera = async (mode = facingMode) => {
    setError('')
    setCameraLoading(true)
    setCapturedDataUrl(null)
    setCapturedBlob(null)

    // Stop any existing tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (!navigator?.mediaDevices?.getUserMedia) {
      setError('Live camera feed is not supported on this browser. Use native camera capture below.')
      setCameraLoading(false)
      return
    }

    try {
      const constraints = {
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = mediaStream
      setStream(mediaStream)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        await videoRef.current.play().catch(() => {})
      }
    } catch (err) {
      console.warn('Camera stream error:', err)
      // If environment facing failed, retry with user
      if (mode === 'environment') {
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          })
          streamRef.current = fallbackStream
          setStream(fallbackStream)
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream
            await videoRef.current.play().catch(() => {})
          }
          setCameraLoading(false)
          return
        } catch {
          // ignore
        }
      }

      let msg = 'Could not access camera. Please verify camera permissions in your browser.'
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Camera permission was denied. Please allow camera access in your browser settings or use the native camera option below.'
      } else if (err.name === 'NotFoundError') {
        msg = 'No camera device found on this system.'
      }
      setError(msg)
    } finally {
      setCameraLoading(false)
    }
  }

  // Effect to manage stream lifecycle
  useEffect(() => {
    if (isOpen) {
      startCamera(facingMode)
    } else {
      // Clean up when modal closes
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }
      setStream(null)
      setCapturedDataUrl(null)
      setCapturedBlob(null)
      setError('')
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }
    }
  }, [isOpen])

  // Flip Camera Mode (user vs environment)
  const handleToggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment'
    setFacingMode(nextMode)
    startCamera(nextMode)
  }

  // Snap the photo from active video element
  const handleSnapPhoto = () => {
    if (!videoRef.current) return

    setFlash(true)
    setTimeout(() => setFlash(false), 200)

    const videoEl = videoRef.current
    const canvas = document.createElement('canvas')
    const width = videoEl.videoWidth || 1280
    const height = videoEl.videoHeight || 720
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d')
    // If front facing camera, flip horizontally for mirror effect natural feel
    if (facingMode === 'user') {
      ctx.translate(width, 0)
      ctx.scale(-1, 1)
    }
    ctx.drawImage(videoEl, 0, 0, width, height)

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const dataUrl = canvas.toDataURL('image/jpeg', 0.92)
          setCapturedDataUrl(dataUrl)
          setCapturedBlob(blob)

          // Pause video
          if (videoRef.current) {
            videoRef.current.pause()
          }
        }
      },
      'image/jpeg',
      0.92
    )
  }

  // Retake photo: discard snapshot and resume video
  const handleRetake = () => {
    setCapturedDataUrl(null)
    setCapturedBlob(null)
    if (videoRef.current && streamRef.current) {
      videoRef.current.play().catch(() => {})
    }
  }

  // Confirm photo: create File object, invoke callback, close modal
  const handleConfirmPhoto = () => {
    if (!capturedBlob) return

    const timestamp = Date.now()
    const file = new File([capturedBlob], `photo_capture_${timestamp}.jpg`, {
      type: 'image/jpeg',
      lastModified: timestamp,
    })

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    onCapture(file)
    onClose()
  }

  // Handle direct native camera input file selection
  const handleNativeCameraFile = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }
      onCapture(file)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="ath-camera-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="ath-camera-modal" onClick={(e) => e.stopPropagation()}>
        {/* Hidden native camera capture input as ultimate fallback */}
        <input
          type="file"
          ref={nativeCameraInputRef}
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={handleNativeCameraFile}
        />

        {/* Modal Header */}
        <div className="ath-camera-header">
          <div className="ath-camera-header-info">
            <h3>
              <Camera size={20} color="#0f766e" />
              {title}
            </h3>
            <p>{capturedDataUrl ? 'Preview your snapshot before analyzing.' : subtitle}</p>
          </div>
          <button
            type="button"
            className="ath-camera-close-btn"
            onClick={onClose}
            aria-label="Close camera"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body / Viewfinder */}
        <div className="ath-camera-body">
          {capturedDataUrl ? (
            <img src={capturedDataUrl} alt="Captured snapshot preview" className="ath-camera-preview-img" />
          ) : (
            <>
              <video
                ref={videoRef}
                className="ath-camera-video"
                autoPlay
                playsInline
                muted
                style={{
                  transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
                  display: error ? 'none' : 'block',
                }}
              />

              {!error && (
                <div className="ath-camera-viewfinder-overlay">
                  <span className="ath-camera-corner-tl" />
                  <span className="ath-camera-corner-tr" />
                  <span className="ath-camera-corner-bl" />
                  <span className="ath-camera-corner-br" />

                  <div className="ath-camera-live-badge">
                    <span className="ath-camera-live-dot" /> LIVE VIEWFINDER
                  </div>
                </div>
              )}

              {/* Shutter Flash Animation */}
              <div className={`ath-camera-flash ${flash ? 'active' : ''}`} />

              {/* Camera Loading Spinner */}
              {cameraLoading && (
                <div style={{ color: '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <RefreshCw size={28} className="ath-spin" color="#14b8a6" />
                  <span style={{ fontSize: '0.85rem' }}>Initializing camera...</span>
                </div>
              )}

              {/* Camera Error / Permission Fallback */}
              {error && (
                <div className="ath-camera-error-wrap">
                  <AlertCircle size={36} color="#f87171" />
                  <div style={{ fontWeight: 700, fontSize: '0.98rem' }}>Camera Unavailable</div>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#cbd5e1' }}>{error}</p>
                  <button
                    type="button"
                    className="ath-btn ath-btn-primary"
                    onClick={() => nativeCameraInputRef.current?.click()}
                    style={{ marginTop: '10px' }}
                  >
                    <Camera size={16} /> Open Native Device Camera
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="ath-camera-footer">
          {capturedDataUrl ? (
            /* Confirmation Actions */
            <div className="ath-camera-confirm-actions">
              <button
                type="button"
                className="ath-btn ath-btn-secondary"
                onClick={handleRetake}
              >
                <RotateCcw size={16} /> Retake Photo
              </button>
              <button
                type="button"
                className="ath-btn ath-btn-primary"
                onClick={handleConfirmPhoto}
                style={{ minWidth: '160px' }}
              >
                <Check size={16} /> Use This Photo
              </button>
            </div>
          ) : (
            /* Live Capture Controls */
            <>
              <div>
                <button
                  type="button"
                  className="ath-btn ath-btn-secondary"
                  onClick={handleToggleFacingMode}
                  title="Switch Camera (Front / Rear)"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', padding: '8px 12px' }}
                  disabled={cameraLoading || !!error}
                >
                  <RefreshCw size={14} /> Flip Camera
                </button>
              </div>

              {/* Shutter Button */}
              <button
                type="button"
                className="ath-shutter-btn"
                onClick={handleSnapPhoto}
                disabled={cameraLoading || !!error}
                aria-label="Capture photo"
                title="Click to capture picture"
              >
                <div className="ath-shutter-inner">
                  <Camera size={22} />
                </div>
              </button>

              <div>
                <button
                  type="button"
                  className="ath-btn ath-btn-secondary"
                  onClick={() => nativeCameraInputRef.current?.click()}
                  title="Open system camera"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', padding: '8px 12px' }}
                >
                  <Camera size={14} /> Native Camera
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
