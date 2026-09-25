import { useState } from "react";
import "./workout_plan.css";

const workoutDays = [
  {
    day: "Day 1",
    title: "Full Body HIIT",
    duration: "20 min",
    level: "Moderate",
    icon: "🏃",
    type: "normal",
  },
  {
    day: "Day 2",
    title: "Lower Body Strength",
    duration: "25 min",
    level: "Moderate",
    icon: "🏋️",
    type: "normal",
  },
  {
    day: "Day 3",
    title: "Core & Stability",
    duration: "20 min",
    level: "Easy",
    icon: "🧘",
    type: "highlight",
  },
  {
    day: "Day 4",
    title: "Upper Body Strength",
    duration: "25 min",
    level: "Moderate",
    icon: "💪",
    type: "normal",
  },
  {
    day: "Day 5",
    title: "Cardio & Endurance",
    duration: "30 min",
    level: "Moderate",
    icon: "🏃",
    type: "highlight",
  },
];

function SidebarItem({ icon, text, active, onClick }) {
  return (
    <button
      className={`sidebar-item ${active ? "active" : ""}`}
      onClick={onClick}
    >
      <span className="sidebar-icon">{icon}</span>
      <span>{text}</span>
    </button>
  );
}

function WorkoutCard({ workout, onStart }) {
  return (
    <div className="workout-card">
      <div
        className={`workout-icon ${
          workout.type === "highlight" ? "highlight-icon" : ""
        }`}
      >
        {workout.icon}
      </div>

      <div className="workout-info">
        <div className="workout-day">{workout.day}</div>

        <div className="workout-title">{workout.title}</div>

        <div className="workout-meta">
          <span>{workout.duration}</span>
          <span className="dot">•</span>
          <span>{workout.level}</span>
        </div>
      </div>

      <button className="start-button" onClick={() => onStart(workout)}>
        Start
      </button>
    </div>
  );
}

export default function WorkoutPlan({ onDashboard, onNutrition, onWellness, onProgress, onTalent, onGamification }) {
  const [activeTab, setActiveTab] = useState("Weekly Plan");

  const handleStart = (workout) => {
    alert(`Starting ${workout.title}`);
  };

  return (
    <div className="app-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">A</div>

          <div className="brand-name">
            <strong>ATHLETICA</strong>
          </div>
        </div>

        <nav className="sidebar-navigation">
          <SidebarItem icon="⌂" text="Dashboard" onClick={onDashboard} />
          <SidebarItem icon="◉" text="Assessment" />
          <SidebarItem
            icon="▣"
            text="Workout Plan"
            active
          />
          <SidebarItem icon="▤" text="Nutrition" onClick={onNutrition} />
          <SidebarItem icon="♡" text="Wellness" onClick={onWellness} />
          <SidebarItem icon="◔" text="Progress" onClick={onProgress} />
          <SidebarItem icon="✦" text="Talent Discovery" onClick={onTalent} />
          <SidebarItem icon="♛" text="Gamification" onClick={onGamification} />
        </nav>

        <div className="sidebar-bottom">
          <span>◉</span>
          <span>English</span>
          <span className="language-arrow">⌄</span>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        {/* TOP BAR */}
        <header className="topbar">
          <div className="search-box">
            <span>⌕</span>
            <input placeholder="Search..." />
          </div>

          <div className="topbar-actions">
            <button className="notification-button">♧</button>
            <div className="profile-circle">A</div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <section className="page-content">
          <div className="page-heading">
            <div>
              <h1>Your Personalized Workout Plan</h1>
              <p>Based on your fitness assessment results</p>
            </div>
          </div>

          {/* TABS */}
          <div className="tabs">
            <button
              className={activeTab === "Weekly Plan" ? "tab active" : "tab"}
              onClick={() => setActiveTab("Weekly Plan")}
            >
              Weekly Plan
            </button>

            <button
              className={activeTab === "All Workouts" ? "tab active" : "tab"}
              onClick={() => setActiveTab("All Workouts")}
            >
              All Workouts
            </button>

            <button
              className={activeTab === "Tips" ? "tab active" : "tab"}
              onClick={() => setActiveTab("Tips")}
            >
              Tips
            </button>
          </div>

          {/* WEEKLY PLAN */}
          {activeTab === "Weekly Plan" && (
            <div className="workout-list">
              {workoutDays.map((workout) => (
                <WorkoutCard
                  key={workout.day}
                  workout={workout}
                  onStart={handleStart}
                />
              ))}
            </div>
          )}

          {/* ALL WORKOUTS */}
          {activeTab === "All Workouts" && (
            <div className="empty-section">
              <div className="empty-icon">🏋️</div>
              <h2>All Workouts</h2>
              <p>
                Explore different workouts based on your fitness goals.
              </p>
            </div>
          )}

          {/* TIPS */}
          {activeTab === "Tips" && (
            <div className="tips-section">
              <div className="tip-card">
                <span>💧</span>
                <div>
                  <h3>Stay Hydrated</h3>
                  <p>Drink enough water before and after your workout.</p>
                </div>
              </div>

              <div className="tip-card">
                <span>🔥</span>
                <div>
                  <h3>Warm Up</h3>
                  <p>Spend a few minutes warming up before exercising.</p>
                </div>
              </div>

              <div className="tip-card">
                <span>😴</span>
                <div>
                  <h3>Recover Well</h3>
                  <p>Give your body enough time to recover between workouts.</p>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}