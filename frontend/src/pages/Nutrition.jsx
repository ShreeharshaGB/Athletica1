import { useState } from 'react'
import { Apple, Sparkles, Flame, Droplets, Plus } from 'lucide-react'
import StudentAppLayout from '../components/StudentAppLayout'

const mealData = [
  {
    meal: 'Breakfast',
    time: '8:00 AM',
    title: 'Vegetable Upma & Boiled Sprouts',
    description: 'Semolina cooked with carrots, beans, mustard seeds + glass of milk or plant beverage.',
    calories: '340 kcal',
    protein: '14g',
    icon: '🍲',
  },
  {
    meal: 'Mid-Morning Snack',
    time: '11:00 AM',
    title: 'Fresh Seasonal Fruit & Almonds',
    description: '1 medium apple or banana + 8-10 raw soaked almonds for steady morning energy.',
    calories: '180 kcal',
    protein: '4g',
    icon: '🍎',
  },
  {
    meal: 'Lunch',
    time: '1:30 PM',
    title: 'Balanced Indian Athlete Thali',
    description: '2 rotis or brown rice, yellow dal tadka, sauteed seasonal greens, fresh curd, and mixed cucumber salad.',
    calories: '540 kcal',
    protein: '22g',
    icon: '🍛',
  },
  {
    meal: 'Evening Fuel',
    time: '4:45 PM',
    title: 'Sprouts & Roasted Chana Chaat',
    description: 'Steamed green moong with tomatoes, coriander, lemon squeeze, and tender coconut water.',
    calories: '190 kcal',
    protein: '9g',
    icon: '🥗',
  },
  {
    meal: 'Dinner',
    time: '8:00 PM',
    title: 'Warm Khichdi & Steamed Veggies',
    description: 'Light moong dal khichdi with mixed vegetables, 1 tsp ghee, and mint raita.',
    calories: '420 kcal',
    protein: '16g',
    icon: '🥘',
  },
]

export default function Nutrition() {
  const [activeTab, setActiveTab] = useState("Today's Plan")
  const [waterGlasses, setWaterGlasses] = useState(5)

  const handleAddWater = () => {
    if (waterGlasses < 12) setWaterGlasses((prev) => prev + 1)
  }

  return (
    <StudentAppLayout
      pageTitle="Personalized Nutrition & Fueling"
      pageSubtitle="Targeted dietary schedules aligned with your daily metabolic and athletic demands."
      eyebrow="NUTRITION & HYDRATION"
    >
      {/* TABS */}
      <div className="ath-tabs">
        <button
          type="button"
          className={`ath-tab ${activeTab === "Today's Plan" ? 'active' : ''}`}
          onClick={() => setActiveTab("Today's Plan")}
        >
          Today&apos;s Plan
        </button>
        <button
          type="button"
          className={`ath-tab ${activeTab === 'Hydration' ? 'active' : ''}`}
          onClick={() => setActiveTab('Hydration')}
        >
          Hydration Tracker
        </button>
        <button
          type="button"
          className={`ath-tab ${activeTab === 'Tips' ? 'active' : ''}`}
          onClick={() => setActiveTab('Tips')}
        >
          Dietary Guidelines
        </button>
      </div>

      {/* TODAY'S PLAN TAB */}
      {activeTab === "Today's Plan" && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Calorie & Macro Target Card */}
          <div
            className="ath-card"
            style={{
              background: 'linear-gradient(135deg, #0f766e 0%, #134e4a 100%)',
              color: '#ffffff',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '24px 28px',
              flexWrap: 'wrap',
              gap: '20px',
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', background: 'rgba(255,255,255,0.18)', padding: '4px 10px', borderRadius: '20px' }}>
                DAILY ENERGY TARGET
              </span>
              <h2 style={{ fontSize: '1.7rem', fontWeight: 800, margin: '12px 0 4px', color: '#ffffff' }}>
                1,670 / 2,100 kcal
              </h2>
              <p style={{ margin: 0, color: '#ccfbf1', fontSize: '0.88rem' }}>
                80% of daily fuel target consumed • Balanced carbohydrate & clean protein ratio
              </p>
            </div>

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px 16px', borderRadius: '10px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>Protein</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>65g / 75g</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px 16px', borderRadius: '10px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>Carbs</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>210g / 250g</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px 16px', borderRadius: '10px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>Fats</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>45g / 55g</div>
              </div>
            </div>
          </div>

          {/* Meals List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 750, color: '#0f172a', margin: '4px 0 0' }}>
              Recommended Meals
            </h3>
            {mealData.map((meal, index) => (
              <div
                key={index}
                className="ath-card"
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '18px 22px',
                  gap: '16px',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ fontSize: '2rem', width: '48px', height: '48px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {meal.icon}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="ath-badge">{meal.meal}</span>
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{meal.time}</span>
                    </div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 750, color: '#0f172a', margin: '4px 0 2px' }}>
                      {meal.title}
                    </h4>
                    <p style={{ fontSize: '0.84rem', color: '#64748b', margin: 0, maxWidth: '520px' }}>
                      {meal.description}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f766e' }}>{meal.calories}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{meal.protein} protein</div>
                  </div>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HYDRATION TAB */}
      {activeTab === 'Hydration' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          <div className="ath-card" style={{ gap: '16px' }}>
            <div className="ath-card-header">
              <h2>
                <Droplets size={20} color="#3b82f6" />
                Daily Hydration Progress
              </h2>
              <span className="ath-badge info">GOAL: 8–10 GLASSES</span>
            </div>

            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                {waterGlasses} <span style={{ fontSize: '1.2rem', color: '#64748b' }}>/ 8</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '8px' }}>
                {(waterGlasses * 0.25).toFixed(1)} Liters logged today
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', margin: '20px 0', flexWrap: 'wrap' }}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: '32px',
                      height: '42px',
                      borderRadius: '6px',
                      background: i < waterGlasses ? '#3b82f6' : '#e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      transition: 'background 0.2s',
                    }}
                  >
                    {i < waterGlasses ? '✓' : ''}
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="ath-btn ath-btn-primary"
                onClick={handleAddWater}
                style={{ background: '#3b82f6' }}
              >
                <Plus size={16} /> Log 250ml Glass
              </button>
            </div>
          </div>

          <div className="ath-card" style={{ gap: '14px' }}>
            <div className="ath-card-header">
              <h2>Hydration Insights</h2>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
              Physical performance drops up to 15% with just 2% bodyweight dehydration. Drink in steady intervals throughout the school day rather than chugging large amounts at once.
            </p>
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>Electrolyte Tip</span>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 0' }}>
                Add a pinch of rock salt and lemon to water after strenuous sports practice to naturally restore sodium and potassium levels.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TIPS TAB */}
      {activeTab === 'Tips' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <div className="ath-card" style={{ gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Apple size={22} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 750, color: '#0f172a', margin: 0 }}>Whole-Grain Stability</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, lineHeight: 1.55 }}>
              Choose millets, oats, and whole wheat rotis over refined flour to keep blood sugar stable through study sessions and workouts.
            </p>
          </div>

          <div className="ath-card" style={{ gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={22} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 750, color: '#0f172a', margin: 0 }}>Plant-Based Protein</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, lineHeight: 1.55 }}>
              Incorporate legumes, paneer, tofu, sattu, and curd in at least two meals daily to support muscular repair and connective tissue health.
            </p>
          </div>

          <div className="ath-card" style={{ gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#fff7ed', color: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Flame size={22} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 750, color: '#0f172a', margin: 0 }}>Pre-Workout Fueling</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, lineHeight: 1.55 }}>
              A small banana or a handful of raisins 30 minutes before training provides immediate glycogen without taxing digestion.
            </p>
          </div>
        </div>
      )}
    </StudentAppLayout>
  )
}