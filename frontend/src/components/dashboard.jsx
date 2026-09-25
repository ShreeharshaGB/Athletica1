import { useState } from "react";

import {
  LayoutDashboard,
  ClipboardCheck,
  Dumbbell,
  Apple,
  HeartPulse,
  TrendingUp,
  Sparkles,
  Trophy,
  Users,
  Settings,
  Search,
  Bell,
  Play,
  ArrowRight,
  Flame,
  Footprints,
  Clock,
  Activity,
  ChevronRight,
  Menu,
  X,
  Target
} from "lucide-react";

import "./App.css";

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [mobileMenu, setMobileMenu] = useState(false);

  const menuItems = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard size={19} />
    },
    {
      name: "Assessment",
      icon: <ClipboardCheck size={19} />
    },
    {
      name: "Workout Plan",
      icon: <Dumbbell size={19} />
    },
    {
      name: "Nutrition",
      icon: <Apple size={19} />
    },
    {
      name: "Wellness",
      icon: <HeartPulse size={19} />
    },
    {
      name: "Progress",
      icon: <TrendingUp size={19} />
    },
    {
      name: "Talent Discovery",
      icon: <Sparkles size={19} />
    },
    {
      name: "Gamification",
      icon: <Trophy size={19} />
    },
    {
      name: "Institution",
      icon: <Users size={19} />
    }
  ];

  const changePage = (page) => {
    setActivePage(page);
    setMobileMenu(false);
  };

  return (
    <div className="app">

      {/* Mobile menu button */}
      <button
        className="mobile-menu-btn"
        onClick={() => setMobileMenu(!mobileMenu)}
      >
        {mobileMenu ? <X /> : <Menu />}
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${mobileMenu ? "show-sidebar" : ""}`}>

        <div className="logo-area">
          <div className="logo-icon">F</div>

          <div>
            <h2>FITLOOP</h2>
            <span>Fitness & Wellness</span>
          </div>
        </div>

        <nav className="sidebar-nav">

          {menuItems.map((item) => (
            <button
              key={item.name}
              className={`nav-item ${
                activePage === item.name ? "active" : ""
              }`}
              onClick={() => changePage(item.name)}
            >
              {item.icon}
              <span>{item.name}</span>
            </button>
          ))}

        </nav>

        <div className="sidebar-bottom">

          <button className="nav-item">
            <Settings size={19} />
            <span>Settings</span>
          </button>

          <div className="language">
            <span>🌐</span>
            English
          </div>

        </div>

      </aside>

      {/* Main */}
      <main className="main">

        {/* Top bar */}
        <header className="topbar">

          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search..."
            />
          </div>

          <div className="top-actions">

            <button className="icon-button">
              <Bell size={20} />
            </button>

            <div className="profile">
              <div className="profile-avatar">
                A
              </div>

              <div className="profile-info">
                <strong>Ananya</strong>
                <span>Student</span>
              </div>
            </div>

          </div>

        </header>

        {/* Page */}
        <section className="content">

          {activePage === "Dashboard" && (
            <Dashboard setActivePage={changePage} />
          )}

          {activePage === "Assessment" && <Assessment />}

          {activePage === "Workout Plan" && <WorkoutPlan />}

          {activePage === "Nutrition" && <Nutrition />}

          {activePage === "Wellness" && <Wellness />}

          {activePage === "Progress" && <Progress />}

          {activePage === "Talent Discovery" && <TalentDiscovery />}

          {activePage === "Gamification" && <Gamification />}

          {activePage === "Institution" && <Institution />}

        </section>

      </main>

    </div>
  );
}


/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard({ setActivePage }) {

  return (
    <>

      <div className="welcome-banner">

        <div>
          <p className="small-label">STUDENT DASHBOARD</p>

          <h1>
            Good morning, Ananya! ☀️
          </h1>

          <p>
            Small steps today, big changes tomorrow.
          </p>
        </div>

        <div className="banner-character">
          🏃
        </div>

      </div>


      {/* Statistics */}

      <div className="stats-grid">

        <div className="stat-card score-card">

          <div className="card-heading">
            <span>Fitness Score</span>
            <Activity size={20} />
          </div>

          <div className="score-container">

            <div className="score-circle">
              <strong>82</strong>
              <span>/100</span>
            </div>

            <div>
              <span className="status-good">
                Good
              </span>

              <p>
                ↑ 8% from last month
              </p>
            </div>

          </div>

        </div>


        <div className="stat-card">

          <div className="card-heading">
            <span>XP Points</span>
            <Sparkles size={20} />
          </div>

          <h2>1,250</h2>

          <p>Level 3</p>

          <div className="progress-line">
            <span style={{ width: "68%" }}></span>
          </div>

          <small>+200 today</small>

        </div>


        <div className="stat-card">

          <div className="card-heading">
            <span>Workout Streak</span>
            <Flame size={20} />
          </div>

          <h2>7 Days</h2>

          <p>🔥 Keep it up!</p>

        </div>

      </div>


      <div className="two-column">

        {/* Today's workout */}

        <div className="panel">

          <div className="panel-header">

            <div>
              <h2>Today&apos;s Workout</h2>
              <p>Recommended based on your fitness level</p>
            </div>

            <button
              className="link-button"
              onClick={() => setActivePage("Workout Plan")}
            >
              View Plan <ArrowRight size={16} />
            </button>

          </div>


          <div className="workout-highlight">

            <div className="exercise-icon">
              🏋️
            </div>

            <div className="exercise-info">

              <h3>Full Body HIIT</h3>

              <div className="exercise-meta">
                <span>
                  <Clock size={15} />
                  30 min
                </span>

                <span>
                  <Activity size={15} />
                  Moderate
                </span>
              </div>

              <p>
                A quick and effective workout to boost
                your energy and endurance.
              </p>

            </div>

            <button className="primary-btn">
              <Play size={16} />
              Start
            </button>

          </div>

        </div>


        {/* Quick Actions */}

        <div className="panel">

          <div className="panel-header">
            <div>
              <h2>Quick Actions</h2>
              <p>Manage your fitness journey</p>
            </div>
          </div>

          <div className="quick-actions">

            <button
              onClick={() => setActivePage("Assessment")}
            >
              <ClipboardCheck size={18} />
              Take Assessment
              <ChevronRight size={17} />
            </button>

            <button
              onClick={() => setActivePage("Workout Plan")}
            >
              <Dumbbell size={18} />
              View Workout Plan
              <ChevronRight size={17} />
            </button>

            <button
              onClick={() => setActivePage("Wellness")}
            >
              <HeartPulse size={18} />
              Check Wellness
              <ChevronRight size={17} />
            </button>

            <button
              onClick={() => setActivePage("Progress")}
            >
              <TrendingUp size={18} />
              Track Progress
              <ChevronRight size={17} />
            </button>

          </div>

        </div>

      </div>


      {/* Bottom cards */}

      <div className="section-title">
        <div>
          <h2>Your Wellness Overview</h2>
          <p>Keep track of your daily health indicators.</p>
        </div>
      </div>


      <div className="wellness-grid">

        <MiniCard
          icon={<Footprints />}
          title="Steps"
          value="6,240"
          subtitle="Today"
        />

        <MiniCard
          icon={<Clock />}
          title="Active Time"
          value="42 min"
          subtitle="Today"
        />

        <MiniCard
          icon={<HeartPulse />}
          title="Heart Rate"
          value="78 BPM"
          subtitle="Normal"
        />

        <MiniCard
          icon={<Target />}
          title="Goal"
          value="82%"
          subtitle="Completed"
        />

      </div>

    </>
  );
}


/* =========================================================
   ASSESSMENT
========================================================= */

function Assessment() {

  const [step, setStep] = useState(1);

  return (
    <PageTitle
      title="Fitness Assessment"
      subtitle="Complete your fitness assessment to create your personalized plan."
    >

      <div className="steps">

        <div className={step >= 1 ? "step active-step" : "step"}>
          1. Basic Details
        </div>

        <div className={step >= 2 ? "step active-step" : "step"}>
          2. Fitness Tests
        </div>

        <div className={step >= 3 ? "step active-step" : "step"}>
          3. Results
        </div>

      </div>


      <div className="form-panel">

        {step === 1 && (

          <>
            <h2>Basic Details</h2>

            <div className="form-grid">

              <Input label="Age" placeholder="18" />

              <Input label="Height (cm)" placeholder="165" />

              <Input label="Weight (kg)" placeholder="55" />

            </div>


            <label>Gender</label>

            <div className="radio-group">

              <label>
                <input type="radio" name="gender" />
                Male
              </label>

              <label>
                <input type="radio" name="gender" defaultChecked />
                Female
              </label>

              <label>
                <input type="radio" name="gender" />
                Other
              </label>

            </div>


            <label>Activity Level</label>

            <select>
              <option>Moderate</option>
              <option>Low</option>
              <option>High</option>
            </select>


            <button
              className="primary-btn next-btn"
              onClick={() => setStep(2)}
            >
              Next <ArrowRight size={16} />
            </button>

          </>

        )}


        {step === 2 && (

          <>

            <h2>Fitness Tests</h2>

            <div className="form-grid">

              <Input label="Push-ups" placeholder="15" />

              <Input label="Squats" placeholder="20" />

              <Input label="Plank (seconds)" placeholder="45" />

              <Input label="Running (minutes)" placeholder="10" />

            </div>

            <button
              className="primary-btn next-btn"
              onClick={() => setStep(3)}
            >
              Calculate Result
            </button>

          </>

        )}


        {step === 3 && (

          <div className="result-center">

            <div className="large-score">
              82
            </div>

            <h2>Your Fitness Score</h2>

            <span className="status-good">
              Good
            </span>

            <p>
              Your results indicate a good fitness level.
              FitLoop will now create a personalized plan
              for you.
            </p>

            <button
              className="primary-btn"
              onClick={() => setStep(1)}
            >
              Retake Assessment
            </button>

          </div>

        )}

      </div>

    </PageTitle>
  );
}


/* =========================================================
   WORKOUT PLAN
========================================================= */

function WorkoutPlan() {

  const workouts = [
    ["Day 1", "Full Body HIIT", "30 min", "Moderate", "🏃"],
    ["Day 2", "Lower Body Strength", "25 min", "Easy", "🦵"],
    ["Day 3", "Core & Stability", "20 min", "Moderate", "💪"],
    ["Day 4", "Upper Body Strength", "25 min", "Moderate", "🏋️"],
    ["Day 5", "Cardio & Endurance", "30 min", "High", "🏃"]
  ];

  return (
    <PageTitle
      title="Your Personalized Workout Plan"
      subtitle="AI-generated exercises based on your fitness assessment."
    >

      <div className="tabs">

        <button className="tab active-tab">
          Weekly Plan
        </button>

        <button className="tab">
          All Workouts
        </button>

        <button className="tab">
          Tips
        </button>

      </div>


      <div className="workout-list">

        {workouts.map((workout, index) => (

          <div className="workout-row" key={index}>

            <div className="day-icon">
              {workout[4]}
            </div>

            <div className="day-info">

              <span>{workout[0]}</span>

              <h3>{workout[1]}</h3>

              <p>
                {workout[2]} • {workout[3]}
              </p>

            </div>

            <button className="primary-btn small-btn">
              Start
            </button>

          </div>

        ))}

      </div>

    </PageTitle>
  );
}


/* =========================================================
   NUTRITION
========================================================= */

function Nutrition() {

  const meals = [
    ["Breakfast", "Vegetable Upma + Egg", "420 kcal", "🥗"],
    ["Mid Morning", "Fruit + Greek Yogurt", "180 kcal", "🍎"],
    ["Lunch", "Rice + Dal + Vegetables", "520 kcal", "🍛"],
    ["Evening Snack", "Sprouts Salad", "160 kcal", "🥗"],
    ["Dinner", "Chapati + Paneer", "420 kcal", "🍽️"]
  ];

  return (
    <PageTitle
      title="Your Personalized Nutrition Plan"
      subtitle="Fuel your body, support your goals."
    >

      <div className="nutrition-summary">

        <div>
          <span>Daily Calories</span>
          <strong>1,700</strong>
          <small>kcal recommended</small>
        </div>

        <div>
          <span>Protein</span>
          <strong>25%</strong>
        </div>

        <div>
          <span>Carbs</span>
          <strong>50%</strong>
        </div>

        <div>
          <span>Fat</span>
          <strong>25%</strong>
        </div>

      </div>


      <div className="meal-list">

        {meals.map((meal, index) => (

          <div className="meal-card" key={index}>

            <div className="meal-image">
              {meal[3]}
            </div>

            <div>
              <span>{meal[0]}</span>
              <h3>{meal[1]}</h3>
            </div>

            <strong>
              {meal[2]}
            </strong>

          </div>

        ))}

      </div>

    </PageTitle>
  );
}


/* =========================================================
   WELLNESS
========================================================= */

function Wellness() {

  return (
    <PageTitle
      title="Your Wellness"
      subtitle="Monitor your overall physical and mental wellbeing."
    >

      <div className="wellness-grid">

        <MiniCard
          icon={<Footprints />}
          title="Steps"
          value="6,240"
          subtitle="Goal 8,000"
        />

        <MiniCard
          icon={<Clock />}
          title="Sleep"
          value="7h 20m"
          subtitle="Good"
        />

        <MiniCard
          icon={<HeartPulse />}
          title="Heart Rate"
          value="78 BPM"
          subtitle="Normal"
        />

        <MiniCard
          icon={<Activity />}
          title="Activity"
          value="82%"
          subtitle="Good"
        />

      </div>


      <div className="panel">

        <div className="panel-header">

          <div>
            <h2>Wellness Check-in</h2>
            <p>How are you feeling today?</p>
          </div>

        </div>


        <div className="mood-grid">

          <button>😊<span>Great</span></button>
          <button>🙂<span>Good</span></button>
          <button>😐<span>Okay</span></button>
          <button>😟<span>Low</span></button>

        </div>

      </div>

    </PageTitle>
  );
}


/* =========================================================
   PROGRESS
========================================================= */

function Progress() {

  return (
    <PageTitle
      title="Your Progress"
      subtitle="Track your improvement over time."
    >

      <div className="progress-stats">

        <div className="progress-stat">
          <span>Fitness Score</span>
          <strong>78 → 82</strong>
          <small>↑ 4 points</small>
        </div>

        <div className="progress-stat">
          <span>Steps</span>
          <strong>58 → 65</strong>
          <small>↑ 7%</small>
        </div>

        <div className="progress-stat">
          <span>Workouts</span>
          <strong>15 → 20</strong>
          <small>↑ 5 sessions</small>
        </div>

      </div>


      <div className="panel chart-panel">

        <h2>Fitness Score Trend</h2>

        <div className="fake-chart">

          <div className="chart-line"></div>

          <span className="chart-point p1">78</span>
          <span className="chart-point p2">80</span>
          <span className="chart-point p3">79</span>
          <span className="chart-point p4">81</span>
          <span className="chart-point p5">82</span>

        </div>

      </div>


      <div className="panel">

        <h2>Achievements</h2>

        <div className="achievement-list">

          <div>
            🔥
            <span>
              <strong>7 Day Streak</strong>
              <small>Completed successfully</small>
            </span>
          </div>

          <div>
            🏆
            <span>
              <strong>Fitness Milestone</strong>
              <small>Reached score 80+</small>
            </span>
          </div>

          <div>
            🥗
            <span>
              <strong>Nutrition Goal</strong>
              <small>Completed weekly target</small>
            </span>
          </div>

        </div>

      </div>

    </PageTitle>
  );
}


/* =========================================================
   TALENT DISCOVERY
========================================================= */

function TalentDiscovery() {

  const talents = [
    ["🏃", "Speed & Endurance", "High potential"],
    ["💪", "Strength", "Good potential"],
    ["🤸", "Flexibility", "Excellent potential"],
    ["⚡", "Agility", "Good potential"]
  ];

  return (
    <PageTitle
      title="Your Talent Insights"
      subtitle="AI-based insights from your fitness performance."
    >

      <div className="panel">

        <h2>Top Potential Areas</h2>

        <div className="talent-grid">

          {talents.map((talent, index) => (

            <div className="talent-card" key={index}>

              <div className="talent-icon">
                {talent[0]}
              </div>

              <h3>{talent[1]}</h3>

              <p>{talent[2]}</p>

            </div>

          ))}

        </div>

      </div>

    </PageTitle>
  );
}


/* =========================================================
   GAMIFICATION
========================================================= */

function Gamification() {

  return (
    <PageTitle
      title="Your Fitness Journey"
      subtitle="Complete activities, earn XP and unlock achievements."
    >

      <div className="level-card">

        <div className="level-icon">
          ⭐
        </div>

        <div className="level-info">

          <span>Current Level</span>

          <h2>Level 3</h2>

          <div className="level-progress">
            <span></span>
          </div>

          <small>
            1,250 / 2,000 XP
          </small>

        </div>

      </div>


      <div className="panel">

        <h2>Achievements</h2>

        <div className="achievement-grid">

          <div>🔥<strong>7 Day Streak</strong></div>
          <div>🏆<strong>Fitness Master</strong></div>
          <div>🥗<strong>Healthy Week</strong></div>
          <div>💪<strong>Workout Hero</strong></div>

        </div>

      </div>

    </PageTitle>
  );
}


/* =========================================================
   INSTITUTION
========================================================= */

function Institution() {

  return (
    <PageTitle
      title="Institution Overview"
      subtitle="Monitor student fitness and wellness."
    >

      <div className="stats-grid">

        <div className="stat-card">
          <span>Total Students</span>
          <h2>248</h2>
        </div>

        <div className="stat-card">
          <span>Active Students</span>
          <h2>189</h2>
        </div>

        <div className="stat-card">
          <span>Assessments</span>
          <h2>32</h2>
        </div>

      </div>


      <div className="panel">

        <h2>Student Fitness Overview</h2>

        <div className="institution-bars">

          <div>
            <span>Excellent</span>
            <div><span style={{ width: "75%" }}></span></div>
            <strong>75%</strong>
          </div>

          <div>
            <span>Good</span>
            <div><span style={{ width: "62%" }}></span></div>
            <strong>62%</strong>
          </div>

          <div>
            <span>Needs Improvement</span>
            <div><span style={{ width: "35%" }}></span></div>
            <strong>35%</strong>
          </div>

        </div>

      </div>

    </PageTitle>
  );
}


/* =========================================================
   REUSABLE COMPONENTS
========================================================= */

function PageTitle({ title, subtitle, children }) {

  return (

    <>

      <div className="page-title">

        <div>

          <p className="small-label">
            FITLOOP
          </p>

          <h1>{title}</h1>

          <p>{subtitle}</p>

        </div>

        <div className="page-title-icon">
          💚
        </div>

      </div>

      {children}

    </>

  );
}


function MiniCard({ icon, title, value, subtitle }) {

  return (

    <div className="mini-card">

      <div className="mini-icon">
        {icon}
      </div>

      <div>

        <span>{title}</span>

        <h3>{value}</h3>

        <small>{subtitle}</small>

      </div>

    </div>

  );
}


function Input({ label, placeholder }) {

  return (

    <div className="input-group">

      <label>{label}</label>

      <input
        type="text"
        placeholder={placeholder}
      />

    </div>

  );
}

export default App;

