import React from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '60vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div
            className="ath-card"
            style={{
              maxWidth: '520px',
              textAlign: 'center',
              padding: '36px 28px',
              gap: '16px',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#fef2f2',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle size={28} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--ath-dark, #0f172a)' }}>
              Something went wrong loading this view
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--ath-text-muted, #64748b)', margin: 0, lineHeight: 1.5 }}>
              {this.state.error?.message || 'An unexpected error occurred while rendering this section.'}
            </p>
            <button
              type="button"
              className="ath-btn ath-btn-primary"
              onClick={this.handleReload}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}
            >
              <RotateCcw size={16} /> Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
