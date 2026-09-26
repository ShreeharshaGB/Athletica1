import { useState, useEffect, useRef, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Flame,
  Dumbbell,
  Sparkles,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Info,
  Clock,
  Search,
  X,
  ShieldAlert,
  Calendar,
  Layers,
  HeartPulse,
  Camera,
  PenLine,
  Utensils,
  Plus,
  Minus,
  Check,
} from 'lucide-react'
import StudentAppLayout from '../components/StudentAppLayout'
import { apiRequest } from '../lib/api.js'
import {
  INDIAN_REGIONAL_FOODS,
  REGIONAL_FOOD_CATEGORIES,
} from '../data/indianRegionalFoods.js'
import './Nutrition.css'

export default function Nutrition() {
  // Today's Nutrition State
  const [todayTotals, setTodayTotals] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    mealsCount: 0,
  })
  const [loadingToday, setLoadingToday] = useState(true)

  // Recent Meals State
  const [recentMeals, setRecentMeals] = useState([])
  const [loadingMeals, setLoadingMeals] = useState(true)
  const [mealHistoryPeriod, setMealHistoryPeriod] = useState('all')

  // ACTIVE LOGGING METHOD: 'photo' | 'describe' | 'choose'
  const [activeLogTab, setActiveLogTab] = useState('photo')

  // --- METHOD 1: 📷 UPLOAD PHOTO STATE ---
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [analyzingPhoto, setAnalyzingPhoto] = useState(false)
  const [photoResult, setPhotoResult] = useState(null)
  const [photoError, setPhotoError] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)

  // --- METHOD 2: ✍️ DESCRIBE FOOD STATE ---
  const [mealDescription, setMealDescription] = useState('')
  const [analyzingText, setAnalyzingText] = useState(false)
  const [textResult, setTextResult] = useState(null)
  const [textError, setTextError] = useState('')

  // --- METHOD 3: 🍛 CHOOSE A MEAL STATE ---
  const [chooseSearch, setChooseSearch] = useState('')
  const [chooseRegion, setChooseRegion] = useState('All Regions')
  const [chooseDiet, setChooseDiet] = useState('All')
  const [servingsMap, setServingsMap] = useState({})
  const [loggingCuratedId, setLoggingCuratedId] = useState(null)
  const [curatedSuccessMsg, setCuratedSuccessMsg] = useState('')

  // --- INDIAN FOOD EXPLORER STATE ---
  const [explorerRegion, setExplorerRegion] = useState('All Regions')
  const [explorerSearch, setExplorerSearch] = useState('')
  const [selectedFoodDetail, setSelectedFoodDetail] = useState(null)

  // Fetch initial nutrition data
  useEffect(() => {
    let active = true

    async function fetchNutritionData() {
      try {
        setLoadingToday(true)
        const todayData = await apiRequest('/student/nutrition/today')
        if (active && todayData?.totals) {
          setTodayTotals(todayData.totals)
        }
      } catch (err) {
        console.warn('Could not load today nutrition totals:', err.message)
      } finally {
        if (active) setLoadingToday(false)
      }

      try {
        setLoadingMeals(true)
        const mealsData = await apiRequest('/student/nutrition/meals')
        if (active && Array.isArray(mealsData?.meals)) {
          setRecentMeals(mealsData.meals)
        }
      } catch (err) {
        console.warn('Could not load recent meals:', err.message)
      } finally {
        if (active) setLoadingMeals(false)
      }
    }

    fetchNutritionData()

    return () => {
      active = false
    }
  }, [])

  // Cleanup object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  // Refresh data after meal logging
  const refreshNutritionData = async () => {
    try {
      const [todayData, mealsData] = await Promise.all([
        apiRequest('/student/nutrition/today'),
        apiRequest('/student/nutrition/meals'),
      ])
      if (todayData?.totals) setTodayTotals(todayData.totals)
      if (Array.isArray(mealsData?.meals)) setRecentMeals(mealsData.meals)
    } catch (err) {
      console.warn('Failed to refresh nutrition data:', err.message)
    }
  }

  const visibleMeals = useMemo(() => {
    if (mealHistoryPeriod === 'all') return recentMeals
    const days = mealHistoryPeriod === 'day' ? 1 : 7
    const since = Date.now() - days * 24 * 60 * 60 * 1000
    return recentMeals.filter((meal) => meal.analyzedAt && new Date(meal.analyzedAt).getTime() >= since)
  }, [mealHistoryPeriod, recentMeals])

  // =========================================================
  // HANDLERS FOR METHOD 1: 📷 UPLOAD PHOTO
  // =========================================================
  const handleFileChange = (file) => {
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setPhotoError('Please select a valid image file (JPG, PNG, or WEBP).')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Image file size must be less than 5MB.')
      return
    }

    setPhotoError('')
    setPhotoResult(null)
    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
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

  const handleResetPhoto = () => {
    setSelectedFile(null)
    setPreviewUrl('')
    setPhotoResult(null)
    setPhotoError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleAnalyzePhoto = async () => {
    if (!selectedFile) {
      setPhotoError('Please choose or drop an image of your meal first.')
      return
    }

    try {
      setAnalyzingPhoto(true)
      setPhotoError('')
      setPhotoResult(null)

      const formData = new FormData()
      formData.append('image', selectedFile)

      const response = await apiRequest('/student/nutrition/analyze', {
        method: 'POST',
        body: formData,
      })

      if (response) {
        setPhotoResult(response)
        if (response.isIdentified) {
          refreshNutritionData()
        }
      }
    } catch (err) {
      console.error('Scan meal failed:', err)
      setPhotoError(
        err.message || 'AI food scanning failed. Please retry with a clearer photo.'
      )
    } finally {
      setAnalyzingPhoto(false)
    }
  }

  // =========================================================
  // HANDLERS FOR METHOD 2: ✍️ DESCRIBE FOOD
  // =========================================================
  const handleAnalyzeText = async () => {
    if (!mealDescription.trim()) {
      setTextError('Please write what you ate before analyzing.')
      return
    }

    try {
      setAnalyzingText(true)
      setTextError('')
      setTextResult(null)

      const response = await apiRequest('/student/nutrition/describe', {
        method: 'POST',
        body: { description: mealDescription.trim() },
      })

      if (response) {
        setTextResult(response)
        if (response.isIdentified) {
          refreshNutritionData()
        }
      }
    } catch (err) {
      console.error('Describe food failed:', err)
      setTextError(
        err.message || 'Failed to analyze meal description. Please try again.'
      )
    } finally {
      setAnalyzingText(false)
    }
  }

  const handleResetText = () => {
    setMealDescription('')
    setTextResult(null)
    setTextError('')
  }

  // =========================================================
  // HANDLERS FOR METHOD 3: 🍛 CHOOSE A MEAL
  // =========================================================
  const getServings = (id) => servingsMap[id] || 1

  const handleServingChange = (id, delta) => {
    setServingsMap((prev) => {
      const current = prev[id] || 1
      const updated = Math.max(1, Math.min(10, current + delta))
      return { ...prev, [id]: updated }
    })
  }

  const handleLogCuratedMeal = async (food) => {
    const servings = getServings(food.id)
    try {
      setLoggingCuratedId(food.id)
      setCuratedSuccessMsg('')

      const payload = {
        name: food.name,
        estimatedPortion: food.estimatedPortion,
        servings,
        nutrition: food.nutrition,
        region: food.region,
        diet: food.diet,
      }

      const res = await apiRequest('/student/nutrition/log-curated', {
        method: 'POST',
        body: payload,
      })

      if (res && res.meal) {
        setCuratedSuccessMsg(
          `Logged ${servings}x ${food.name} (~${res.meal.totalEstimatedCalories} kcal) directly to Today's Meals!`
        )
        refreshNutritionData()
        setTimeout(() => setCuratedSuccessMsg(''), 4500)
      }
    } catch (err) {
      console.error('Log curated meal failed:', err)
      alert(err.message || 'Could not log curated meal. Please try again.')
    } finally {
      setLoggingCuratedId(null)
    }
  }

  // Filter curated meals for "Choose a Meal"
  const filteredCuratedMeals = useMemo(() => {
    return INDIAN_REGIONAL_FOODS.filter((dish) => {
      const matchesRegion =
        chooseRegion === 'All Regions' || dish.region === chooseRegion
      const matchesDiet =
        chooseDiet === 'All' ||
        (chooseDiet === 'Vegetarian' && (dish.diet === 'Vegetarian' || dish.diet === 'Vegan')) ||
        (chooseDiet === 'Vegan' && dish.diet === 'Vegan') ||
        (chooseDiet === 'Non-Vegetarian' && dish.diet === 'Non-Vegetarian')
      const query = chooseSearch.trim().toLowerCase()
      const matchesQuery =
        !query ||
        dish.name.toLowerCase().includes(query) ||
        dish.state.toLowerCase().includes(query) ||
        dish.shortDescription.toLowerCase().includes(query)
      return matchesRegion && matchesDiet && matchesQuery
    })
  }, [chooseRegion, chooseDiet, chooseSearch])

  // Filter Indian Regional Foods for "Explorer" section
  const filteredExplorerFoods = useMemo(() => {
    return INDIAN_REGIONAL_FOODS.filter((dish) => {
      const matchesRegion =
        explorerRegion === 'All Regions' || dish.region === explorerRegion
      const query = explorerSearch.trim().toLowerCase()
      const matchesQuery =
        !query ||
        dish.name.toLowerCase().includes(query) ||
        dish.state.toLowerCase().includes(query) ||
        dish.shortDescription.toLowerCase().includes(query) ||
        (dish.tags && dish.tags.some((t) => t.toLowerCase().includes(query)))
      return matchesRegion && matchesQuery
    })
  }, [explorerRegion, explorerSearch])

  // Contextual nutrition suggestions
  const suggestions = useMemo(() => {
    const list = []
    const { calories, protein, carbs, mealsCount } = todayTotals

    if (mealsCount === 0) {
      list.push({
        title: 'Start Tracking Your Daily Fuel',
        desc: 'No meals logged yet today. Use Photo, Describe, or Choose a Meal above to monitor your athletic energy balance.',
        icon: Sparkles,
      })
      list.push({
        title: 'Hydration Foundation',
        desc: 'Begin training sessions well-hydrated. Aim for 400-500ml of water 1-2 hours before intense physical activity.',
        icon: HeartPulse,
      })
      return list
    }

    if (calories > 400 && protein < 35) {
      list.push({
        title: 'Boost Athletic Protein Intake',
        desc: "Your protein intake today is relatively low compared to your energy intake. Consider adding a protein-dense food (sprouts, dal, eggs, paneer, or fish) to your next meal.",
        icon: Dumbbell,
      })
    }

    const carbRatio = calories > 0 ? (carbs * 4) / calories : 0
    if (carbRatio > 0.65) {
      list.push({
        title: 'High Carbohydrate Distribution',
        desc: "You've logged several carbohydrate-rich foods today. Great for endurance glycogen replenishment, but consider pairing your next meal with quality protein and dietary fiber.",
        icon: Flame,
      })
    } else if (protein >= 50) {
      list.push({
        title: 'Strong Protein Foundation',
        desc: 'Great job maintaining muscle recovery fuel today! Keep hydrating to assist with amino acid cellular absorption.',
        icon: CheckCircle2,
      })
    }

    list.push({
      title: 'Post-Workout Nutrient Timing',
      desc: 'Aim to consume a 3:1 or 4:1 ratio of complex carbs to lean protein within 45 minutes after intense athletic conditioning.',
      icon: Clock,
    })

    return list
  }, [todayTotals])

  return (
    <StudentAppLayout
      pageTitle="Nutrition & Athletic Fueling"
      pageSubtitle="Log meals via photo, description, or curated Indian foods, track daily macros, and explore regional athletic nutrition."
      eyebrow="ATHLETICA NUTRITION SUITE"
    >
      <div className="nutrition-container">
        {/* =========================================================
            SECTION 1: TODAY'S NUTRITION SUMMARY CARDS
            ========================================================= */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Today&apos;s Nutrition
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <Link to="/student/diet-plans" className="ath-btn ath-btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 12px', fontSize: '0.78rem' }}>
                <PenLine size={14} /> Create Your Own Diet Plan
              </Link>
              <div className="nutrition-estimate-pill">
                <Info size={13} />
                <span>Calculated from saved meal analyses</span>
              </div>
            </div>
          </div>

          <div className="nutrition-stats-grid">
            {/* Calories Card */}
            <div className="nutrition-stat-card">
              <div className="nutrition-stat-header">
                <span className="nutrition-stat-label">Energy</span>
                <div className="nutrition-stat-icon-wrap orange">
                  <Flame size={18} />
                </div>
              </div>
              <div className="nutrition-stat-value">
                {loadingToday ? '...' : `~${todayTotals.calories}`}
                <span style={{ fontSize: '1rem', fontWeight: 600, color: '#94a3b8', marginLeft: '4px' }}>
                  kcal
                </span>
              </div>
              <p className="nutrition-stat-sub">
                <Info size={12} /> Estimated energy intake
              </p>
            </div>

            {/* Protein Card */}
            <div className="nutrition-stat-card blue">
              <div className="nutrition-stat-header">
                <span className="nutrition-stat-label">Protein</span>
                <div className="nutrition-stat-icon-wrap blue">
                  <Dumbbell size={18} />
                </div>
              </div>
              <div className="nutrition-stat-value">
                {loadingToday ? '...' : `${todayTotals.protein}`}
                <span style={{ fontSize: '1rem', fontWeight: 600, color: '#94a3b8', marginLeft: '4px' }}>
                  g
                </span>
              </div>
              <p className="nutrition-stat-sub">
                Muscle recovery & repair
              </p>
            </div>

            {/* Carbs Card */}
            <div className="nutrition-stat-card amber">
              <div className="nutrition-stat-header">
                <span className="nutrition-stat-label">Carbohydrates</span>
                <div className="nutrition-stat-icon-wrap amber">
                  <Layers size={18} />
                </div>
              </div>
              <div className="nutrition-stat-value">
                {loadingToday ? '...' : `${todayTotals.carbs}`}
                <span style={{ fontSize: '1rem', fontWeight: 600, color: '#94a3b8', marginLeft: '4px' }}>
                  g
                </span>
              </div>
              <p className="nutrition-stat-sub">
                Glycogen & stamina fuel
              </p>
            </div>

            {/* Fat Card */}
            <div className="nutrition-stat-card">
              <div className="nutrition-stat-header">
                <span className="nutrition-stat-label">Healthy Fats</span>
                <div className="nutrition-stat-icon-wrap">
                  <HeartPulse size={18} />
                </div>
              </div>
              <div className="nutrition-stat-value">
                {loadingToday ? '...' : `${todayTotals.fat}`}
                <span style={{ fontSize: '1rem', fontWeight: 600, color: '#94a3b8', marginLeft: '4px' }}>
                  g
                </span>
              </div>
              <p className="nutrition-stat-sub">
                Hormonal & cellular balance
              </p>
            </div>
          </div>
        </div>

        {/* =========================================================
            SECTION 2: LOG FOOD (THREE OPTIONS)
            1. 📷 Upload Photo
            2. ✍️ Describe Food
            3. 🍛 Choose a Meal
            ========================================================= */}
        <div className="nutrition-card">
          <div className="nutrition-card-header">
            <div>
              <h2 className="nutrition-card-title">
                <Sparkles size={20} style={{ color: '#0f766e' }} />
                Log Your Meal
              </h2>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                Choose the fastest way to log your nutrition today
              </span>
            </div>
          </div>

          {/* THREE LOGGING TABS */}
          <div className="log-method-tabs">
            <button
              type="button"
              className={`log-method-btn ${activeLogTab === 'photo' ? 'active' : ''}`}
              onClick={() => setActiveLogTab('photo')}
            >
              <Camera size={17} />
              📷 Upload Photo
            </button>

            <button
              type="button"
              className={`log-method-btn ${activeLogTab === 'describe' ? 'active' : ''}`}
              onClick={() => setActiveLogTab('describe')}
            >
              <PenLine size={17} />
              ✍️ Describe Food
            </button>

            <button
              type="button"
              className={`log-method-btn ${activeLogTab === 'choose' ? 'active' : ''}`}
              onClick={() => setActiveLogTab('choose')}
            >
              <Utensils size={17} />
              🍛 Choose a Meal
            </button>
          </div>

          {/* =======================================================
              OPTION 1: 📷 UPLOAD PHOTO (AI Multimodal Vision)
              ======================================================= */}
          {activeLogTab === 'photo' && (
            <div>
              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleFileChange(e.target.files?.[0])}
                accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
              />

              {/* UPLOAD / DROPZONE STATE (When no preview) */}
              {!previewUrl && (
                <div
                  className={`scanner-dropzone ${dragActive ? 'drag-active' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="scanner-icon-circle">
                    <Upload size={26} />
                  </div>
                  <div className="scanner-prompt">
                    <h3>Take or upload a photo of your meal</h3>
                    <p>Drag and drop, or click to browse. Supports JPG, PNG, WEBP (Max 5MB).</p>
                  </div>
                </div>
              )}

              {/* PREVIEW STATE (Before/During analysis) */}
              {previewUrl && (
                <div className="food-preview-wrap">
                  <div className="food-preview-img-box">
                    <img src={previewUrl} alt="Meal preview" className="food-preview-img" />
                  </div>

                  <div className="food-preview-actions">
                    <button
                      type="button"
                      className="ath-btn ath-btn-secondary"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={analyzingPhoto}
                    >
                      <ImageIcon size={16} />
                      Change Photo
                    </button>

                    <button
                      type="button"
                      className="ath-btn ath-btn-secondary"
                      onClick={handleResetPhoto}
                      disabled={analyzingPhoto}
                    >
                      <RotateCcw size={16} />
                      Clear
                    </button>

                    <button
                      type="button"
                      className="ath-btn ath-btn-primary"
                      onClick={handleAnalyzePhoto}
                      disabled={analyzingPhoto}
                      style={{ minWidth: '170px' }}
                    >
                      <Sparkles size={16} />
                      {analyzingPhoto ? 'Scanning Photo...' : 'Analyze Photo'}
                    </button>
                  </div>
                </div>
              )}

              {/* LOADING STATE */}
              {analyzingPhoto && (
                <div className="scanner-loading-state">
                  <div className="scanner-spinner" />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                    Analyzing meal ingredients...
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, maxWidth: '500px' }}>
                    Gemini AI is identifying regional Indian foods, estimating portion sizes, and computing caloric and macronutrient density.
                  </p>
                </div>
              )}

              {/* ERROR ALERT */}
              {photoError && !analyzingPhoto && (
                <div
                  style={{
                    marginTop: '18px',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#991b1b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <AlertTriangle size={20} style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{photoError}</span>
                  </div>
                  <button
                    type="button"
                    className="ath-btn ath-btn-primary"
                    onClick={handleAnalyzePhoto}
                    style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                  >
                    Retry Analysis
                  </button>
                </div>
              )}

              {/* UNIDENTIFIED / UNCLEAR IMAGE RESPONSE */}
              {photoResult && !photoResult.isIdentified && !analyzingPhoto && (
                <div
                  style={{
                    marginTop: '20px',
                    padding: '20px',
                    borderRadius: '14px',
                    background: '#fffbeb',
                    border: '1px solid #fde68a',
                    color: '#92400e',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ShieldAlert size={22} style={{ flexShrink: 0 }} />
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
                      Food Could Not Be Identified Confidently
                    </h4>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.5 }}>
                    {photoResult.message || 'Food could not be identified confidently. Try a clearer image.'}
                  </p>
                  <div style={{ marginTop: '4px' }}>
                    <button
                      type="button"
                      className="ath-btn ath-btn-primary"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImageIcon size={16} /> Try Another Image
                    </button>
                  </div>
                </div>
              )}

              {/* SUCCESSFUL FOOD ANALYSIS RESULT */}
              {photoResult && photoResult.isIdentified && photoResult.meal && !analyzingPhoto && (
                <div style={{ marginTop: '24px' }}>
                  <div className="analysis-result-header">
                    <h3 className="analysis-result-title">
                      <CheckCircle2 size={20} style={{ color: '#34d399' }} />
                      Food Detected
                    </h3>
                    <div className="badge-estimated">
                      <Info size={13} />
                      <span>Estimated from image</span>
                    </div>
                  </div>

                  <div className="analysis-result-body">
                    <div className="detected-foods-container">
                      {photoResult.meal.foods.map((food, idx) => (
                        <div key={idx} className="detected-food-row">
                          <div className="detected-food-info">
                            <span className="detected-food-name">{food.name}</span>
                            <span className="detected-food-portion">
                              {food.estimatedPortion} • ~{food.estimatedCalories} kcal
                            </span>
                          </div>

                          <div className="detected-food-macros">
                            <span className="macro-tag calories">
                              ~{food.estimatedCalories} kcal
                            </span>
                            <span className="macro-tag protein">
                              Protein {food.proteinGrams}g
                            </span>
                            <span className="macro-tag carbs">
                              Carbs {food.carbsGrams}g
                            </span>
                            <span className="macro-tag fat">
                              Fat {food.fatGrams}g
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="analysis-total-card">
                      <div>
                        <span style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Estimated Total
                        </span>
                        <div className="analysis-total-calories">
                          ~{photoResult.meal.totalEstimatedCalories} kcal
                        </div>
                      </div>

                      <div className="analysis-total-macros">
                        <div className="analysis-macro-item">
                          <span>Protein</span>
                          <span>{photoResult.meal.totalProteinGrams}g</span>
                        </div>
                        <div className="analysis-macro-item">
                          <span>Carbs</span>
                          <span>{photoResult.meal.totalCarbsGrams}g</span>
                        </div>
                        <div className="analysis-macro-item">
                          <span>Fat</span>
                          <span>{photoResult.meal.totalFatGrams}g</span>
                        </div>
                      </div>
                    </div>

                    {photoResult.meal.summary && (
                      <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569', lineHeight: 1.5 }}>
                        {photoResult.meal.summary}
                      </p>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        Confidence:{' '}
                        <strong style={{ textTransform: 'capitalize', color: '#0f766e' }}>
                          {photoResult.meal.confidence || 'Medium'}
                        </strong>
                      </span>

                      <button
                        type="button"
                        className="ath-btn ath-btn-secondary"
                        onClick={handleResetPhoto}
                        style={{ fontSize: '0.82rem', padding: '6px 14px' }}
                      >
                        Scan Another Photo
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =======================================================
              OPTION 2: ✍️ DESCRIBE FOOD (AI Natural Language Text)
              ======================================================= */}
          {activeLogTab === 'describe' && (
            <div className="describe-box">
              <p style={{ margin: '0 0 4px', fontSize: '0.88rem', color: '#475569' }}>
                Describe what you ate with portions or serving sizes. Gemini AI will identify individual dishes and estimate macronutrients.
              </p>

              <textarea
                className="describe-textarea"
                placeholder="E.g. 2 neer dosa with coconut chutney, 1 glass of badam milk, and 1 boiled egg..."
                value={mealDescription}
                onChange={(e) => setMealDescription(e.target.value)}
                disabled={analyzingText}
              />

              {/* Quick suggestions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Quick suggestions:</span>
                <button
                  type="button"
                  className="quick-chip"
                  onClick={() => setMealDescription('2 Rotis with Dal Tadka, Cucumber Salad, and 1 cup Curd')}
                >
                  2 Rotis + Dal + Curd
                </button>
                <button
                  type="button"
                  className="quick-chip"
                  onClick={() => setMealDescription('2 Neer Dosa with Vegetable Stew and Coconut Chutney')}
                >
                  Neer Dosa + Veg Stew
                </button>
                <button
                  type="button"
                  className="quick-chip"
                  onClick={() => setMealDescription('1 bowl Moong Dal Khichdi with Mixed Veggies and Ghee')}
                >
                  Khichdi + Mixed Veg
                </button>
                <button
                  type="button"
                  className="quick-chip"
                  onClick={() => setMealDescription('3 Idlis with Sambar and 1 cup tender coconut water')}
                >
                  3 Idlis + Sambar
                </button>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '4px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="ath-btn ath-btn-primary"
                  onClick={handleAnalyzeText}
                  disabled={analyzingText || !mealDescription.trim()}
                  style={{ minWidth: '180px' }}
                >
                  <Sparkles size={16} />
                  {analyzingText ? 'Analyzing Description...' : 'Analyze & Log Meal'}
                </button>

                {mealDescription && (
                  <button
                    type="button"
                    className="ath-btn ath-btn-secondary"
                    onClick={handleResetText}
                    disabled={analyzingText}
                  >
                    Clear Text
                  </button>
                )}
              </div>

              {/* Loading State */}
              {analyzingText && (
                <div className="scanner-loading-state">
                  <div className="scanner-spinner" />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                    Parsing meal description...
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, maxWidth: '500px' }}>
                    Gemini AI is parsing ingredients, estimating portion weights, and calculating athletic nutritional macros.
                  </p>
                </div>
              )}

              {/* Error Alert */}
              {textError && !analyzingText && (
                <div
                  style={{
                    marginTop: '14px',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#991b1b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <AlertTriangle size={20} style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{textError}</span>
                  </div>
                  <button
                    type="button"
                    className="ath-btn ath-btn-primary"
                    onClick={handleAnalyzeText}
                    style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Unclear Description Response */}
              {textResult && !textResult.isIdentified && !analyzingText && (
                <div
                  style={{
                    marginTop: '16px',
                    padding: '18px',
                    borderRadius: '12px',
                    background: '#fffbeb',
                    border: '1px solid #fde68a',
                    color: '#92400e',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ShieldAlert size={20} style={{ flexShrink: 0 }} />
                    <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700 }}>
                      Description Could Not Be Confidently Understood
                    </h4>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.86rem', lineHeight: 1.5 }}>
                    {textResult.message || 'Food could not be identified confidently from description. Try adding specific dish and portion details.'}
                  </p>
                </div>
              )}

              {/* Successful Description Result */}
              {textResult && textResult.isIdentified && textResult.meal && !analyzingText && (
                <div style={{ marginTop: '20px' }}>
                  <div className="analysis-result-header">
                    <h3 className="analysis-result-title">
                      <CheckCircle2 size={20} style={{ color: '#34d399' }} />
                      Food Detected & Logged
                    </h3>
                    <div className="badge-estimated">
                      <Info size={13} />
                      <span>Estimated from description</span>
                    </div>
                  </div>

                  <div className="analysis-result-body">
                    <div className="detected-foods-container">
                      {textResult.meal.foods.map((food, idx) => (
                        <div key={idx} className="detected-food-row">
                          <div className="detected-food-info">
                            <span className="detected-food-name">{food.name}</span>
                            <span className="detected-food-portion">
                              {food.estimatedPortion} • ~{food.estimatedCalories} kcal
                            </span>
                          </div>

                          <div className="detected-food-macros">
                            <span className="macro-tag calories">
                              ~{food.estimatedCalories} kcal
                            </span>
                            <span className="macro-tag protein">
                              Protein {food.proteinGrams}g
                            </span>
                            <span className="macro-tag carbs">
                              Carbs {food.carbsGrams}g
                            </span>
                            <span className="macro-tag fat">
                              Fat {food.fatGrams}g
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="analysis-total-card">
                      <div>
                        <span style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Estimated Total
                        </span>
                        <div className="analysis-total-calories">
                          ~{textResult.meal.totalEstimatedCalories} kcal
                        </div>
                      </div>

                      <div className="analysis-total-macros">
                        <div className="analysis-macro-item">
                          <span>Protein</span>
                          <span>{textResult.meal.totalProteinGrams}g</span>
                        </div>
                        <div className="analysis-macro-item">
                          <span>Carbs</span>
                          <span>{textResult.meal.totalCarbsGrams}g</span>
                        </div>
                        <div className="analysis-macro-item">
                          <span>Fat</span>
                          <span>{textResult.meal.totalFatGrams}g</span>
                        </div>
                      </div>
                    </div>

                    {textResult.meal.summary && (
                      <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569', lineHeight: 1.5 }}>
                        {textResult.meal.summary}
                      </p>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        Logged to Recent Meals • Confidence:{' '}
                        <strong style={{ textTransform: 'capitalize', color: '#0f766e' }}>
                          {textResult.meal.confidence || 'High'}
                        </strong>
                      </span>

                      <button
                        type="button"
                        className="ath-btn ath-btn-secondary"
                        onClick={handleResetText}
                        style={{ fontSize: '0.82rem', padding: '6px 14px' }}
                      >
                        Describe Another Meal
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =======================================================
              OPTION 3: 🍛 CHOOSE A MEAL (Curated Dataset - Direct Save)
              ======================================================= */}
          {activeLogTab === 'choose' && (
            <div>
              <p style={{ margin: '0 0 14px', fontSize: '0.88rem', color: '#475569' }}>
                Select a verified dish from Athletica&apos;s curated Indian regional food database. Adjust servings to proportionally calculate calories and macronutrients, then add directly to your log without AI calls.
              </p>

              {/* SUCCESS TOAST BANNER */}
              {curatedSuccessMsg && (
                <div className="meal-logged-toast">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={18} style={{ color: '#059669', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{curatedSuccessMsg}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCuratedSuccessMsg('')}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#065f46' }}
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* SEARCH & FILTERS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '14px' }}>
                {/* Search */}
                <div style={{ position: 'relative', maxWidth: '400px' }}>
                  <input
                    type="text"
                    placeholder="Search curated Indian meals..."
                    value={chooseSearch}
                    onChange={(e) => setChooseSearch(e.target.value)}
                    className="explorer-search-input"
                  />
                </div>

                {/* Region Filter Strip */}
                <div className="region-tab-strip">
                  {REGIONAL_FOOD_CATEGORIES.map((region) => (
                    <button
                      key={region}
                      type="button"
                      className={`region-tab-btn ${chooseRegion === region ? 'active' : ''}`}
                      onClick={() => setChooseRegion(region)}
                    >
                      {region}
                    </button>
                  ))}
                </div>

                {/* Diet Filter Chips */}
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Diet:</span>
                  {['All', 'Vegetarian', 'Vegan', 'Non-Vegetarian'].map((diet) => (
                    <button
                      key={diet}
                      type="button"
                      className={`quick-chip ${chooseDiet === diet ? 'active' : ''}`}
                      style={
                        chooseDiet === diet
                          ? { background: '#0f766e', color: '#ffffff', borderColor: '#0f766e' }
                          : {}
                      }
                      onClick={() => setChooseDiet(diet)}
                    >
                      {diet}
                    </button>
                  ))}
                </div>
              </div>

              {/* CURATED DISHES GRID */}
              <div className="curated-meal-grid">
                {filteredCuratedMeals.map((dish) => {
                  const servings = getServings(dish.id)
                  const scaledCals = Math.round(dish.nutrition.calories * servings)
                  const scaledProtein = Math.round(dish.nutrition.protein * servings)
                  const scaledCarbs = Math.round(dish.nutrition.carbs * servings)
                  const scaledFat = Math.round(dish.nutrition.fat * servings)
                  const isLoggingThis = loggingCuratedId === dish.id

                  return (
                    <div key={dish.id} className="curated-meal-card">
                      <div>
                        <div className="curated-meal-header">
                          <div>
                            <span className="regional-card-region">{dish.region}</span>
                            <h3 className="curated-meal-title">{dish.name}</h3>
                            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                              Origin: {dish.state}
                            </span>
                          </div>
                          <span
                            className={`diet-pill ${
                              dish.diet === 'Vegan'
                                ? 'vegan'
                                : dish.diet === 'Non-Vegetarian'
                                ? 'non-veg'
                                : 'veg'
                            }`}
                          >
                            {dish.diet}
                          </span>
                        </div>

                        <p style={{ margin: '8px 0 0', fontSize: '0.82rem', color: '#475569', lineHeight: 1.4 }}>
                          {dish.shortDescription}
                        </p>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {/* Scaled Serving Control [ - ] 1 [ + ] */}
                        <div className="curated-serving-row">
                          <div>
                            <span style={{ fontSize: '0.76rem', color: '#64748b', display: 'block' }}>
                              Base: {dish.estimatedPortion}
                            </span>
                            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>
                              Servings
                            </span>
                          </div>

                          <div className="serving-counter">
                            <button
                              type="button"
                              className="serving-btn"
                              onClick={() => handleServingChange(dish.id, -1)}
                              disabled={servings <= 1 || isLoggingThis}
                              aria-label="Decrease serving"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="serving-val">{servings}</span>
                            <button
                              type="button"
                              className="serving-btn"
                              onClick={() => handleServingChange(dish.id, 1)}
                              disabled={servings >= 10 || isLoggingThis}
                              aria-label="Increase serving"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Scaled Macro Pills */}
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <span className="macro-tag calories" style={{ fontSize: '0.75rem', padding: '3px 8px' }}>
                            ~{scaledCals} kcal
                          </span>
                          <span className="macro-tag protein" style={{ fontSize: '0.75rem', padding: '3px 8px' }}>
                            P: {scaledProtein}g
                          </span>
                          <span className="macro-tag carbs" style={{ fontSize: '0.75rem', padding: '3px 8px' }}>
                            C: {scaledCarbs}g
                          </span>
                          <span className="macro-tag fat" style={{ fontSize: '0.75rem', padding: '3px 8px' }}>
                            F: {scaledFat}g
                          </span>
                        </div>

                        {/* Add to Today's Meals Button */}
                        <button
                          type="button"
                          className="curated-add-btn"
                          onClick={() => handleLogCuratedMeal(dish)}
                          disabled={isLoggingThis}
                        >
                          <Check size={16} />
                          {isLoggingThis ? 'Adding...' : "Add to Today's Meals"}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* =========================================================
            SECTION 3: RECENT MEALS
            ========================================================= */}
        <div className="nutrition-card">
          <div className="nutrition-card-header">
            <div>
              <h2 className="nutrition-card-title">
                <Clock size={20} style={{ color: '#0f766e' }} />
                Recent Meals
              </h2>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                Your logged visual and dietary food history
              </span>
            </div>
            {recentMeals.length > 0 && (
              <span className="ath-badge" style={{ background: '#f0fdfa', color: '#0f766e' }}>
                {visibleMeals.length} logged
              </span>
            )}
          </div>

          <div className="ath-tabs" style={{ marginBottom: '16px' }}>
            {[
              ['all', 'All'],
              ['day', 'Last 24 hours'],
              ['week', 'Last 7 days'],
            ].map(([period, label]) => (
              <button key={period} type="button" className={`ath-tab ${mealHistoryPeriod === period ? 'active' : ''}`} onClick={() => setMealHistoryPeriod(period)}>
                {label}
              </button>
            ))}
          </div>

          {loadingMeals ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
              Loading your recent meals...
            </div>
          ) : visibleMeals.length === 0 ? (
            /* EMPTY STATE - NO FAKE RECORDS */
            <div className="empty-state-box">
              <div className="empty-state-icon">
                <Calendar size={22} />
              </div>
              <h3 className="empty-state-title">No meals analyzed yet.</h3>
              <p className="empty-state-desc">
                Use &ldquo;Upload Photo&rdquo;, &ldquo;Describe Food&rdquo;, or &ldquo;Choose a Meal&rdquo; above to log your breakfast, lunch, or snack and compute macros.
              </p>
            </div>
          ) : (
            <div className="recent-meals-grid">
              {visibleMeals.map((meal) => {
                const dateStr = meal.analyzedAt
                  ? new Date(meal.analyzedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Recent'

                const foodNames = meal.foods?.map((f) => f.name).join(', ') || 'Mixed Meal'

                return (
                  <div key={meal.id} className="recent-meal-card">
                    <div>
                      <div className="recent-meal-header">
                        <div>
                          <div className="recent-meal-type">{meal.mealType || 'Meal'}</div>
                          <div className="recent-meal-date">{dateStr}</div>
                        </div>
                        <div className="recent-meal-calories">
                          ~{meal.totalEstimatedCalories} kcal
                        </div>
                      </div>

                      <p className="recent-meal-items" style={{ marginTop: '10px' }}>
                        {foodNames}
                      </p>
                    </div>

                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <span className="macro-tag protein" style={{ fontSize: '0.72rem', padding: '2px 6px' }}>
                          P: {meal.totalProteinGrams}g
                        </span>
                        <span className="macro-tag carbs" style={{ fontSize: '0.72rem', padding: '2px 6px' }}>
                          C: {meal.totalCarbsGrams}g
                        </span>
                        <span className="macro-tag fat" style={{ fontSize: '0.72rem', padding: '2px 6px' }}>
                          F: {meal.totalFatGrams}g
                        </span>
                      </div>
                      <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                        Estimated from entry
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* =========================================================
            SECTION 4: INDIAN FOOD EXPLORER
            ========================================================= */}
        <div className="nutrition-card">
          <div className="nutrition-card-header">
            <div>
              <h2 className="nutrition-card-title">
                <Layers size={20} style={{ color: '#0f766e' }} />
                Indian Food Explorer
              </h2>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                Discover traditional regional foods across India and their athletic fueling benefits
              </span>
            </div>
          </div>

          <div className="explorer-controls">
            {/* Horizontal Region Tabs */}
            <div className="region-tab-strip">
              {REGIONAL_FOOD_CATEGORIES.map((region) => (
                <button
                  key={region}
                  type="button"
                  className={`region-tab-btn ${explorerRegion === region ? 'active' : ''}`}
                  onClick={() => setExplorerRegion(region)}
                >
                  {region}
                </button>
              ))}
            </div>

            {/* Quick Search Bar */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search regional dishes, ingredients, or benefits..."
                value={explorerSearch}
                onChange={(e) => setExplorerSearch(e.target.value)}
                className="explorer-search-input"
              />
            </div>
          </div>

          {/* Regional Foods Grid */}
          <div className="indian-food-grid">
            {filteredExplorerFoods.map((dish) => (
              <div key={dish.id} className="regional-food-card">
                <div>
                  <div className="regional-card-header">
                    <div>
                      <span className="regional-card-region">{dish.region}</span>
                      <div className="regional-card-state">{dish.state}</div>
                      <h3 className="regional-card-title">{dish.name}</h3>
                    </div>
                    <span
                      className={`diet-pill ${
                        dish.diet === 'Vegan'
                          ? 'vegan'
                          : dish.diet === 'Non-Vegetarian'
                          ? 'non-veg'
                          : 'veg'
                      }`}
                    >
                      {dish.diet}
                    </span>
                  </div>

                  <p className="regional-card-desc" style={{ marginTop: '8px' }}>
                    {dish.shortDescription}
                  </p>

                  <div className="regional-athletic-box" style={{ marginTop: '10px' }}>
                    <strong>Athletic Fuel:</strong> {dish.athleticBenefit}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                    <span className="macro-tag calories">~{dish.nutrition.calories} kcal</span>
                    <span className="macro-tag protein">P: {dish.nutrition.protein}g</span>
                    <span className="macro-tag carbs">C: {dish.nutrition.carbs}g</span>
                    <span className="macro-tag fat">F: {dish.nutrition.fat}g</span>
                  </div>

                  <div className="regional-card-footer">
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {dish.estimatedPortion}
                    </span>
                    <button
                      type="button"
                      className="ath-btn ath-btn-secondary"
                      style={{ fontSize: '0.78rem', padding: '5px 12px' }}
                      onClick={() => setSelectedFoodDetail(dish)}
                    >
                      Learn More
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* =========================================================
            SECTION 5: PERSONALIZED NUTRITION SUGGESTIONS
            ========================================================= */}
        <div className="nutrition-card">
          <div className="nutrition-card-header">
            <div>
              <h2 className="nutrition-card-title">
                <HeartPulse size={20} style={{ color: '#0f766e' }} />
                Nutrition Suggestions
              </h2>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                Contextual wellness recommendations based on your athletic goals
              </span>
            </div>
          </div>

          <div className="suggestions-grid">
            {suggestions.map((item, idx) => {
              const Icon = item.icon
              return (
                <div key={idx} className="suggestion-item-card">
                  <div className="suggestion-icon-circle">
                    <Icon size={18} />
                  </div>
                  <div>
                    <h4 className="suggestion-title">{item.title}</h4>
                    <p className="suggestion-desc">{item.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Strict Non-Medical Wellness Disclaimer */}
          <div className="disclaimer-banner">
            <Info size={16} style={{ flexShrink: 0, color: '#0f766e' }} />
            <span>
              <strong>Wellness Notice:</strong> Nutrition suggestions and calorie evaluations are general athletic wellness guidelines based on dietary intake estimations. They do not constitute medical, clinical, or diagnostic advice.
            </span>
          </div>
        </div>

        {/* =========================================================
            MODAL: REGIONAL FOOD DETAILS
            ========================================================= */}
        {selectedFoodDetail && (
          <div
            className="food-modal-backdrop"
            onClick={() => setSelectedFoodDetail(null)}
          >
            <div
              className="food-modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="food-modal-header">
                <div>
                  <span className="regional-card-region">{selectedFoodDetail.region}</span>
                  <h3 style={{ margin: '4px 0 2px', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                    {selectedFoodDetail.name}
                  </h3>
                  <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    Origin: {selectedFoodDetail.state}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFoodDetail(null)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748b',
                    padding: '6px',
                  }}
                  aria-label="Close details"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="food-modal-body">
                <div>
                  <h4 style={{ margin: '0 0 6px', fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>
                    Culinary Heritage & Preparation
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569', lineHeight: 1.55 }}>
                    {selectedFoodDetail.details}
                  </p>
                </div>

                <div className="regional-athletic-box" style={{ padding: '14px', borderRadius: '10px' }}>
                  <h4 style={{ margin: '0 0 4px', fontSize: '0.9rem', fontWeight: 750, color: '#0f766e' }}>
                    Athletic & Metabolic Rationale
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#134e4a', lineHeight: 1.45 }}>
                    {selectedFoodDetail.athleticBenefit}
                  </p>
                </div>

                <div>
                  <h4 style={{ margin: '0 0 10px', fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>
                    Nutritional Breakdown ({selectedFoodDetail.estimatedPortion})
                  </h4>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <span className="macro-tag calories" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
                      ~{selectedFoodDetail.nutrition.calories} kcal
                    </span>
                    <span className="macro-tag protein" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
                      Protein: {selectedFoodDetail.nutrition.protein}g
                    </span>
                    <span className="macro-tag carbs" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
                      Carbs: {selectedFoodDetail.nutrition.carbs}g
                    </span>
                    <span className="macro-tag fat" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
                      Fat: {selectedFoodDetail.nutrition.fat}g
                    </span>
                  </div>
                </div>

                {selectedFoodDetail.tags && selectedFoodDetail.tags.length > 0 && (
                  <div>
                    <h4 style={{ margin: '0 0 6px', fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>
                      Highlights
                    </h4>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {selectedFoodDetail.tags.map((t, idx) => (
                        <span
                          key={idx}
                          style={{
                            background: '#f1f5f9',
                            color: '#475569',
                            fontSize: '0.75rem',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontWeight: 600,
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button
                    type="button"
                    className="ath-btn ath-btn-primary"
                    onClick={() => setSelectedFoodDetail(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </StudentAppLayout>
  )
}