import {
  Home,
  ClipboardCheck,
  Dumbbell,
  Apple,
  HeartPulse,
  Trophy,
  UserRound,
  ShieldCheck,
  Bell,
  Search,
  Flame,
  Star,
  Play,
  TrendingUp,
  ChevronRight,
} from "lucide-react";

import "./dashboard.css";

const menuItems = [
  { label: "Dashboard", icon: Home, active: true },
  { label: "Assessment", icon: ClipboardCheck },
  { label: "Workout Plan", icon: Dumbbell },
  { label: "Nutrition", icon: Apple },
  { label: "Wellness", icon: HeartPulse },
  { label: "Progress", icon: Trophy },
  { label: "Talent Discovery", icon: UserRound },
  { label: "Gamification", icon: ShieldCheck },
];

const quickActions = [
  {
    title: "Take Assessment",
    icon: ClipboardCheck,
  },
  {
    title: "View Nutrition Plan",
    icon: Apple,
  },
  {
    title: "Check Wellness",
    icon: HeartPulse,
  },
  {
    title: "Track Progress",
    icon: TrendingUp,
  },
];

function StudentDashboard({ onWorkoutPlan, onNutrition, onWellness, onProgress, onTalent, onGamification }) {
  const navigation = {
    "Workout Plan": onWorkoutPlan,
    Nutrition: onNutrition,
    Wellness: onWellness,
    Progress: onProgress,
    "Talent Discovery": onTalent,
    Gamification: onGamification,
  };

  return (
    <div className="dashboard-app">

      {/* ================= SIDEBAR ================= */}
      <aside className="dashboard-sidebar">

        <div className="dashboard-brand">
          <div className="brand-mark">A</div>

          <div>
            <h2>ATHLETICA</h2>
            <span>Fitness • Wellness • Lifestyle</span>
          </div>
        </div>

        <nav className="dashboard-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                type="button"
                onClick={navigation[item.label]}
                className={`dashboard-nav-item ${
                  item.active ? "dashboard-active" : ""
                }`}
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="dashboard-language">
          <span>◉</span>
          English
        </div>
      </aside>

      {/* ================= MAIN ================= */}
      <main className="dashboard-main">

        {/* HEADER */}
        <header className="dashboard-header">

          <div className="dashboard-search">
            <Search size={16} />
            <span>Search...</span>
          </div>

          <div className="header-right">
            <Bell size={19} />

            <div className="user-avatar">
              A
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <div className="dashboard-content">

          {/* ================= WELCOME BANNER ================= */}
          <section className="welcome-banner">

            <div className="welcome-text">
              <p className="small-label">
                STUDENT DASHBOARD
              </p>

              <h1>
                Good morning, Ananya! ☀️
              </h1>

              <p>
                Small steps today, big changes tomorrow.
              </p>
            </div>

            <div className="welcome-illustration">
              <div className="sun"></div>

              <div className="runner">
                🏃‍♀️
              </div>

              <div className="grass"></div>
            </div>

            <div className="welcome-message">
              <strong>Stay consistent,</strong>
              <span>keep growing!</span>
            </div>

          </section>


          {/* ================= STAT CARDS ================= */}
          <section className="stats-grid">

            {/* Fitness Score */}
            <div className="stat-card fitness-card">

              <div className="stat-header">
                <div className="stat-title">
                  <div className="stat-icon green">
                    <HeartPulse size={18} />
                  </div>

                  <span>Fitness Score</span>
                </div>

                <span className="trend">
                  ↑ 5%
                </span>
              </div>

              <div className="fitness-score">
                <div className="score-circle">
                  <strong>82</strong>
                  <span>Good</span>
                </div>

                <div className="score-details">
                  <span>+5</span>
                  <small>vs last week</small>
                </div>
              </div>

            </div>


            {/* XP */}
            <div className="stat-card xp-card">

              <div className="stat-title">
                <div className="stat-icon purple">
                  <Star size={18} />
                </div>

                <span>XP</span>
              </div>

              <div className="xp-number">
                1,250
              </div>

              <div className="level">
                Level 3
              </div>

              <div className="xp-bottom">
                <span>+200 today</span>
              </div>

            </div>


            {/* Streak */}
            <div className="stat-card streak-card">

              <div className="stat-title">
                <div className="stat-icon orange">
                  <Flame size={18} />
                </div>

                <span>Streak</span>
              </div>

              <div className="streak-number">
                5 <span>days</span>
              </div>

              <div className="streak-message">
                🔥 Keep it up!
              </div>

            </div>

          </section>


          {/* ================= LOWER CONTENT ================= */}
          <section className="dashboard-lower">

            {/* TODAY'S WORKOUT */}
            <div className="workout-section">

              <div className="section-heading">
                <h2>Today&apos;s Workout</h2>

                <button className="view-all">
                  View Plan
                  <ChevronRight size={15} />
                </button>
              </div>

              <div className="workout-card">

                <div className="workout-image">
                  🏋️‍♀️
                </div>

                <div className="workout-info">

                  <div className="workout-top">
                    <h3>Full Body HIIT</h3>

                    <span className="difficulty">
                      ● Moderate
                    </span>
                  </div>

                  <p>
                    A quick and effective workout to boost
                    your strength and endurance.
                  </p>

                  <div className="workout-meta">

                    <span>
                      <TimerIcon />
                      30 min
                    </span>

                    <span>
                      <Flame size={14} />
                      250 kcal
                    </span>

                  </div>

                </div>

                <button className="start-workout">
                  <Play size={14} fill="currentColor" />
                  Start Workout
                </button>

              </div>

            </div>


            {/* QUICK ACTIONS */}
            <div className="quick-section">

              <div className="section-heading">
                <h2>Quick Actions</h2>
              </div>

              <div className="quick-actions">

                {quickActions.map((action) => {
                  const Icon = action.icon;

                  return (
                    <button
                      className="quick-action"
                      key={action.title}
                    >
                      <div className="quick-icon">
                        <Icon size={16} />
                      </div>

                      <span>{action.title}</span>

                      <ChevronRight
                        size={14}
                        className="quick-arrow"
                      />
                    </button>
                  );
                })}

              </div>

            </div>

          </section>

        </div>
      </main>
    </div>
  );
}


/* Small timer icon component */
function TimerIcon() {
  return <span className="timer-icon">◷</span>;
}

export default StudentDashboard;