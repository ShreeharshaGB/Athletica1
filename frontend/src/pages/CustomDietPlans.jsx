import { useEffect, useState } from 'react'
import { Apple, CheckCircle2, History, Save, ShieldCheck } from 'lucide-react'
import StudentAppLayout from '../components/StudentAppLayout'
import { apiRequest } from '../lib/api.js'
import './PlanBuilders.css'

const sampleMeals = `Breakfast | Pesarattu with coconut chutney | 350 | 16 | 48 | 9
Lunch | Rajma rice with cucumber salad | 520 | 22 | 82 | 10
Snack | Banana and roasted chana | 240 | 9 | 42 | 4
Dinner | Vegetable khichdi with curd | 430 | 18 | 62 | 12`

function parseMeals(text) {
  return text.split('\n').map((line) => line.trim()).filter(Boolean).map((line) => {
    const [mealType, foods, calories, proteinGrams, carbsGrams, fatGrams] = line.split('|').map((part) => part.trim())
    return { mealType, foods, calories: Number(calories) || 0, proteinGrams: Number(proteinGrams) || 0, carbsGrams: Number(carbsGrams) || 0, fatGrams: Number(fatGrams) || 0 }
  }).filter((meal) => meal.mealType && meal.foods)
}

export default function CustomDietPlans() {
  const [form, setForm] = useState({ name: 'My Indian performance diet', goal: 'Support training and recovery', dietPreference: 'Vegetarian', restrictions: 'No beef, low fried food', allergies: '' })
  const [meals, setMeals] = useState(sampleMeals)
  const [history, setHistory] = useState([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => { apiRequest('/student/diet-plans').then((response) => setHistory(response.plans || [])).catch(() => {}) }, [])

  const saveDiet = async (event) => {
    event.preventDefault()
    const parsedMeals = parseMeals(meals)
    if (!form.name.trim() || parsedMeals.length === 0) { setError('Add a plan name and at least one meal.'); return }
    setSaving(true); setError(''); setMessage('')
    try {
      const response = await apiRequest('/student/diet-plans', { method: 'POST', body: { ...form, restrictions: form.restrictions, allergies: form.allergies, meals: parsedMeals } })
      setHistory((current) => [response.plan, ...current]); setMessage('Custom diet saved and made active.')
    } catch (err) { setError(err.message || 'Could not save custom diet.') } finally { setSaving(false) }
  }

  return <StudentAppLayout pageTitle="Custom Diet Plans" pageSubtitle="Save Indian meals around your goals and restrictions" eyebrow="NUTRITION PLAN BUILDER">
    <div className="builder-page">
      <section className="builder-hero diet-hero"><div className="builder-hero-icon"><Apple size={24} /></div><div><p>PERSONALIZED NUTRITION</p><h2>Keep your food choices practical.</h2><span>Save regional Indian meals, restrictions, allergies, and macro estimates for the AI Coach to use later.</span></div></section>
      <div className="builder-grid">
        <form className="builder-panel" onSubmit={saveDiet}>
          <div className="builder-heading"><h3><ShieldCheck size={18} /> Create a custom diet</h3></div>
          <label>Plan name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
          <label>Goal<input value={form.goal} onChange={(event) => setForm({ ...form, goal: event.target.value })} /></label>
          <label>Diet preference<input value={form.dietPreference} onChange={(event) => setForm({ ...form, dietPreference: event.target.value })} placeholder="Vegetarian, vegan, eggetarian..." /></label>
          <label>Restrictions<input value={form.restrictions} onChange={(event) => setForm({ ...form, restrictions: event.target.value })} placeholder="No peanuts, lactose-free, halal..." /></label>
          <label>Allergies<input value={form.allergies} onChange={(event) => setForm({ ...form, allergies: event.target.value })} placeholder="Separate multiple items with commas" /></label>
          <label>Meals <span>One line per meal</span><textarea value={meals} onChange={(event) => setMeals(event.target.value)} rows={9} /></label>
          <p className="builder-help">Format: <strong>Meal type | Foods | Calories | Protein | Carbs | Fat</strong></p>
          {message && <p className="builder-success"><CheckCircle2 size={16} /> {message}</p>}{error && <p className="builder-error">{error}</p>}
          <button type="submit" className="ath-btn ath-btn-primary" disabled={saving}><Save size={16} /> {saving ? 'Saving...' : 'Save custom diet'}</button>
        </form>
        <section className="builder-panel"><div className="builder-heading"><h3><History size={18} /> Saved diet history</h3></div>{history.length === 0 ? <p className="builder-muted">Your saved diets will appear here.</p> : <div className="history-list">{history.map((plan) => <article className="history-card" key={plan.id}><div><h4>{plan.name}</h4><p>{plan.dietPreference} · {plan.meals?.length || 0} meals</p></div><span>{plan.status}</span></article>)}</div>}</section>
      </div>
    </div>
  </StudentAppLayout>
}