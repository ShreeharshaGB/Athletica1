import "./teacher_dashboard.css";

const TeacherDashboard = ({ onWorkoutPlan, onNutrition, onWellness, onProgress, onTalent, onGamification }) => {
  const students = [
    {
      name: "Ananya S.",
      score: 82,
      date: "Sep 21, 2025",
      status: "Improving",
    },
    {
      name: "Diya K.",
      score: 76,
      date: "Sep 20, 2025",
      status: "Improving",
    },
    {
      name: "Rohan M.",
      score: 69,
      date: "Sep 19, 2025",
      status: "On Track",
    },
  ];

  const talentAreas = [
    { name: "Endurance", value: 28, icon: "◉" },
    { name: "Strength", value: 24, icon: "▣" },
    { name: "Speed", value: 18, icon: "◌" },
    { name: "Flexibility", value: 14, icon: "♧" },
    { name: "Agility", value: 10, icon: "◇" },
  ];

  return (
    <div className="teacher-dashboard">

      {/* Sidebar */}
      <aside className="teacher-sidebar">

        <div className="teacher-logo">
          <div className="logo-mark">A</div>

          <div>
            <h2>ATHLETICA</h2>
          </div>
        </div>

        <nav className="teacher-nav">
          <button type="button" className="teacher-nav-item">
            <span className="nav-icon">⌂</span><span>Dashboard</span>
          </button>
          <button type="button" onClick={onWorkoutPlan} className="teacher-nav-item">
            <span className="nav-icon">▤</span><span>Workout Plan</span>
          </button>
          <button type="button" onClick={onNutrition} className="teacher-nav-item">
            <span className="nav-icon">▢</span><span>Nutrition</span>
          </button>
          <button type="button" onClick={onWellness} className="teacher-nav-item">
            <span className="nav-icon">♧</span><span>Wellness</span>
          </button>
          <button type="button" onClick={onProgress} className="teacher-nav-item">
            <span className="nav-icon">◒</span><span>Progress</span>
          </button>
          <button type="button" onClick={onTalent} className="teacher-nav-item">
            <span className="nav-icon">♙</span><span>Talent Discovery</span>
          </button>
          <button type="button" onClick={onGamification} className="teacher-nav-item">
            <span className="nav-icon">✧</span><span>Gamification</span>
          </button>

        </nav>

        <div className="sidebar-language">
          <span>◉</span>
          <span>English</span>
          <span className="language-arrow">⌄</span>
        </div>

      </aside>

      {/* Main Content */}
      <main className="teacher-main">

        {/* Top Header */}
        <header className="teacher-topbar">

          <div className="teacher-search">
            <span>⌕</span>
            <span>Search...</span>
          </div>

          <div className="teacher-top-actions">
            <button className="notification-button">
              ♧
            </button>

            <div className="profile-circle">
              T
            </div>
          </div>

        </header>

        {/* Page Heading */}
        <section className="teacher-heading">

          <div>
            <h1>Institution Overview</h1>

            <div className="institution-select">
              <span>◉</span>
              <span>Ramanarayan College, Ujre</span>
              <span>⌄</span>
            </div>
          </div>

          <div className="month-select">
            <span>Sep 2025</span>
            <span>⌄</span>
          </div>

        </section>

        {/* Summary Cards */}
        <section className="teacher-summary">

          <div className="summary-card">
            <p>Total Students</p>
            <h2>248</h2>
          </div>

          <div className="summary-card">
            <p>Active This Week</p>
            <h2>189</h2>
          </div>

          <div className="summary-card">
            <p>Talent Identified</p>
            <h2>32</h2>
          </div>

        </section>

        {/* Charts + Talent */}
        <section className="teacher-middle">

          {/* Fitness Score Chart */}
          <div className="fitness-chart-card">

            <h3>Fitness Score Trend (Average)</h3>

            <div className="chart-wrapper">

              <div className="y-axis">
                <span>100</span>
                <span>80</span>
                <span>60</span>
                <span>40</span>
                <span>20</span>
                <span>0</span>
              </div>

              <div className="chart-area">

                <div className="chart-grid">
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                </div>

                <svg
                  className="fitness-svg"
                  viewBox="0 0 600 220"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient
                      id="chartFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#36c99b"
                        stopOpacity="0.25"
                      />

                      <stop
                        offset="100%"
                        stopColor="#36c99b"
                        stopOpacity="0.02"
                      />
                    </linearGradient>
                  </defs>

                  <path
                    d="
                      M 10 150
                      L 100 135
                      L 190 115
                      L 280 112
                      L 370 113
                      L 460 90
                      L 550 55
                      L 550 200
                      L 10 200
                      Z
                    "
                    fill="url(#chartFill)"
                  />

                  <polyline
                    points="
                      10,150
                      100,135
                      190,115
                      280,112
                      370,113
                      460,90
                      550,55
                    "
                    fill="none"
                    stroke="#20a77d"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  <circle cx="10" cy="150" r="5" fill="#20a77d" />
                  <circle cx="100" cy="135" r="5" fill="#20a77d" />
                  <circle cx="190" cy="115" r="5" fill="#20a77d" />
                  <circle cx="280" cy="112" r="5" fill="#20a77d" />
                  <circle cx="370" cy="113" r="5" fill="#20a77d" />
                  <circle cx="460" cy="90" r="5" fill="#20a77d" />
                  <circle cx="550" cy="55" r="5" fill="#20a77d" />
                </svg>

                <div className="x-axis">
                  <span>Sep 15</span>
                  <span>Sep 16</span>
                  <span>Sep 17</span>
                  <span>Sep 18</span>
                  <span>Sep 19</span>
                  <span>Sep 20</span>
                  <span>Sep 21</span>
                </div>

              </div>

            </div>

          </div>

          {/* Talent Areas */}
          <div className="talent-card">

            <h3>Top Talent Areas</h3>

            <div className="talent-list">

              {talentAreas.map((talent) => (
                <div
                  className="talent-row"
                  key={talent.name}
                >
                  <div className="talent-name">
                    <span className="talent-icon">
                      {talent.icon}
                    </span>

                    <span>{talent.name}</span>
                  </div>

                  <strong>{talent.value}</strong>
                </div>
              ))}

            </div>

          </div>

        </section>

        {/* Recent Activity */}
        <section className="recent-activity-card">

          <h3>Recent Student Activity</h3>

          <div className="student-table">

            <div className="table-header">
              <span>Name</span>
              <span>Fitness Score</span>
              <span>Last Active</span>
              <span>Status</span>
            </div>

            {students.map((student, index) => (
              <div
                className="table-row"
                key={student.name}
              >

                <div className="student-name">

                  <div
                    className={`student-avatar avatar-${index}`}
                  >
                    {student.name.charAt(0)}
                  </div>

                  <span>{student.name}</span>

                </div>

                <span>{student.score}</span>

                <span>{student.date}</span>

                <span
                  className={`student-status ${
                    student.status === "On Track"
                      ? "on-track"
                      : "improving"
                  }`}
                >
                  {student.status}
                </span>

              </div>
            ))}

          </div>

        </section>

      </main>
    </div>
  );
};

export default TeacherDashboard;