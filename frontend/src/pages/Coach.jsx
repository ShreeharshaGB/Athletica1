import { useState } from 'react'
import { Accessibility, Bot, Dumbbell, LoaderCircle, Send, Sparkles, Utensils } from 'lucide-react'
import StudentAppLayout from '../components/StudentAppLayout'
import { apiRequest } from '../lib/api.js'
import './Coach.css'

const starterMessage = {
  role: 'assistant',
  content:
    'I’m your Athletica Coach. Ask me about today’s workout, recovery, meal ideas, or how to adapt your plan to the time and equipment you have.',
}

const quickPrompts = [
  { label: 'Plan today', prompt: 'Create a workout for today based on my goal, fitness level, available time, and current plan. Include easier and harder options.', icon: Dumbbell },
  { label: 'No equipment', prompt: 'Create a complete no-equipment home workout for me. Include warm-up, exercises, rest, easier options, harder options, and cool-down.', icon: Accessibility },
  { label: 'Calisthenics', prompt: 'Create a beginner-friendly calisthenics progression for me using bodyweight only. Include regressions, progressions, and safe technique cues.', icon: Dumbbell },
  { label: 'Yoga flow', prompt: 'Create a gentle yoga and mobility flow for my goal and experience level, including breathing, timing, transitions, and a calm cool-down.', icon: Sparkles },
  { label: 'Meal idea', prompt: 'Suggest a practical post-workout meal that fits my diet preference.', icon: Utensils },
]

function getDemoCoachResponse(message) {
  const prompt = message.toLowerCase()

  if (/no[- ]equipment|home workout|bodyweight/.test(prompt)) {
    return 'Demo Coach response: No-equipment home workout\n\nWarm-up: 4 minutes of marching, arm circles, and easy bodyweight squats.\n\nMain set: 3 rounds of 10 squats, 8 incline push-ups against a wall or table, 10 reverse lunges per side, 20-second plank, and 30 seconds of marching. Rest 60 seconds between rounds.\n\nEasier option: use a chair for support and reduce the round count. Harder option: slow each lowering phase to 3 seconds. Cool down with gentle hip and shoulder mobility.'
  }

  if (/calisthenic|pull[- ]up|push[- ]up progression|bodyweight progression/.test(prompt)) {
    return 'Demo Coach response: Calisthenics progression\n\nStart with 3 sessions per week. Push progression: wall push-up, incline push-up, knee push-up, then full push-up. Pull progression: supported row, backpack row, and assisted pull-up if a safe bar is available.\n\nUse 3 sets, stopping 2 repetitions before failure. Progress when you can complete all sets with controlled form. Include squats, lunges, hollow holds, and gentle mobility for a balanced routine.'
  }

  if (/yoga|mobility|stretch|flexib/.test(prompt)) {
    return 'Demo Coach response: Gentle yoga flow\n\nTry 12 minutes: 5 slow breaths in child\'s pose, 6 cat-cow cycles, low lunge for 45 seconds per side, downward dog for 5 breaths, seated forward fold for 45 seconds, and 2 minutes of relaxed breathing.\n\nKeep the movement comfortable and never force a stretch. Use a folded towel or cushion for support.'
  }

  if (/meal|food|diet|nutrition|indian|vegetarian|vegan|protein/.test(prompt)) {
    return 'Demo Coach response: Indian post-workout meal\n\nA practical vegetarian option is 2 pesarattu with curd or a dairy-free alternative, plus fruit and water. Another option is rajma rice with cucumber salad. These provide carbohydrates for recovery and plant protein for muscle support.\n\nIn the connected version, the coach would also remove foods listed in your allergies and adjust the suggestion to your saved diet plan.'
  }

  if (/recover|recovery|sleep|rest/.test(prompt)) {
    return 'Demo Coach response: Recovery plan\n\nToday, take a 10-minute easy walk, drink water regularly, eat a balanced meal with protein and carbohydrates, and aim for a consistent sleep window. Keep tomorrow\'s training easier if soreness changes your movement quality.'
  }

  return 'Demo Coach response: Personalized guidance\n\nI would first use your goal, fitness level, available time, equipment, Indian food preferences, allergies, restrictions, and recent activity. Tell me whether you want a workout, meal plan, recovery advice, or exercise substitution for a more specific recommendation.'
}

export default function Coach() {
  const isDemo = import.meta.env.DEV && !localStorage.getItem('athletica_token')
  const [messages, setMessages] = useState([starterMessage])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const sendMessage = async (content = draft) => {
    const trimmed = content.trim()
    if (!trimmed || sending) return

    const userMessage = { role: 'user', content: trimmed }
    const conversation = [...messages, userMessage]
    setMessages(conversation)
    setDraft('')
    setError('')
    setSending(true)

    try {
      if (isDemo) {
        await new Promise((resolve) => setTimeout(resolve, 500))
        setMessages([
          ...conversation,
          {
            role: 'assistant',
            content: getDemoCoachResponse(trimmed),
          },
        ])
        return
      }

      const response = await apiRequest('/student/coach/chat', {
        method: 'POST',
        body: {
          message: trimmed,
          history: messages.slice(-8),
        },
      })
      setMessages([...conversation, { role: 'assistant', content: response.reply }])
    } catch (err) {
      setError(err.message || 'The coach is unavailable right now. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    sendMessage()
  }

  return (
    <StudentAppLayout
      pageTitle="AI Coach"
      pageSubtitle="Personal guidance from your Athletica profile, plan, and meal history"
    >
      <div className="coach-page">
        {isDemo && <div className="coach-demo-notice">Development demo mode: responses are local examples. Connect the backend to test real Gemini personalization.</div>}
        <section className="coach-intro">
          <div className="coach-intro-icon"><Bot size={24} /></div>
          <div>
            <p className="coach-eyebrow">PERSONALIZED COACHING</p>
            <h2>Make your next choice a little clearer.</h2>
            <p>Ask for an adjustment, a meal direction, or a simple action for today. Your coach uses the fitness information already saved in Athletica.</p>
          </div>
        </section>

        <section className="coach-shell" aria-label="Athletica AI Coach">
          <div className="coach-quick-actions">
            <span>Start with a prompt</span>
            <div>
              {quickPrompts.map(({ label, prompt, icon: Icon }) => (
                <button key={label} type="button" onClick={() => sendMessage(prompt)} disabled={sending}>
                  <Icon size={16} /> {label}
                </button>
              ))}
            </div>
          </div>

          <div className="coach-messages" aria-live="polite">
            {messages.map((message, index) => (
              <div className={`coach-message ${message.role}`} key={`${message.role}-${index}`}>
                <div className="coach-avatar">{message.role === 'assistant' ? <Bot size={16} /> : 'You'}</div>
                <p>{message.content}</p>
              </div>
            ))}
            {sending && (
              <div className="coach-message assistant">
                <div className="coach-avatar"><Bot size={16} /></div>
                <p className="coach-thinking"><LoaderCircle size={16} /> Thinking through your plan...</p>
              </div>
            )}
          </div>

          {error && <p className="coach-error" role="alert">{error}</p>}

          <form className="coach-composer" onSubmit={handleSubmit}>
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ask about training, meals, recovery, or your progress..."
              rows={2}
              maxLength={2000}
              disabled={sending}
              aria-label="Message the AI coach"
            />
            <button type="submit" aria-label="Send message" disabled={sending || !draft.trim()}>
              <Send size={18} />
            </button>
          </form>
          <p className="coach-disclaimer">General wellness guidance only. It is not medical advice or a diagnosis.</p>
        </section>
      </div>
    </StudentAppLayout>
  )
}