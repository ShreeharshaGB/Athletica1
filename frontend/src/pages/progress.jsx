import { useState } from "react";
import "./progress.css";

function Progress({ onDashboard, onWorkoutPlan, onNutrition, onWellness, onTalent, onGamification }) {
  const [activePeriod, setActivePeriod] = useState("Week");

  const progressData = {
    Week: {
      fitness: "78 → 82",
      fitnessChange: "↑ 4",
      weight: "58 → 55",
      weightChange: "↓ 3",
      endurance: "15 → 20",
      enduranceChange: "↑ 5",
      chartValues: [76, 79, 83, 85, 85, 90, 92],
      chartLabels: [
        "Sep 15",
        "Sep 16",
        "Sep 17",
        "Sep 18",
        "Sep 19",
        "Sep 20",
        "Sep 21",
      ],
    },

    Month: {
      fitness: "72 → 82",
      fitnessChange: "↑ 10",
      weight: "60 → 55",
      weightChange: "↓ 5",
      endurance: "12 → 20",
      enduranceChange: "↑ 8",
      chartValues: [70, 73, 76, 78, 80, 81, 82],
      chartLabels: [
        "Week 1",
        "Week 2",
        "Week 3",
        "Week 4",
        "Week 5",
        "Week 6",
        "Week 7",
      ],
    },

    "3 Months": {
      fitness: "65 → 82",
      fitnessChange: "↑ 17",
      weight: "63 → 55",
      weightChange: "↓ 8",
      endurance: "10 → 20",
      enduranceChange: "↑ 10",
      chartValues: [65, 69, 72, 76, 78, 80, 82],
      chartLabels: [
        "Jul",
        "Aug",
        "Sep",
        "Week 4",
        "Week 5",
        "Week 6",
        "Week 7",
      ],
    },

    "6 Months": {
      fitness: "58 → 82",
      fitnessChange: "↑ 24",
      weight: "68 → 55",
      weightChange: "↓ 13",
      endurance: "8 → 20",
      enduranceChange: "↑ 12",
      chartValues: [58, 63, 67, 72, 76, 80, 82],
      chartLabels: [
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Now",
      ],
    },
  };

  const currentData = progressData[activePeriod];

  return (
    <div className="progress-page">

      {/* ================= SIDEBAR ================= */}
      <aside className="progress-sidebar">

        <div className="progress-logo">
          <div className="logo-mark">A</div>

          <div>
            <h2>ATHLETICA</h2>
          </div>
        </div>

        <nav className="progress-navigation">

          <button type="button" onClick={onDashboard} className="progress-nav-item">
            <span className="nav-icon">⌂</span>
            <span>Dashboard</span>
          </button>

          <button type="button" onClick={onWorkoutPlan} className="progress-nav-item">
            <span className="nav-icon">▣</span>
            <span>Workout Plan</span>
          </button>

          <button type="button" onClick={onNutrition} className="progress-nav-item">
            <span className="nav-icon">◉</span>
            <span>Nutrition</span>
          </button>

          <button type="button" onClick={onWellness} className="progress-nav-item">
            <span className="nav-icon">♧</span>
            <span>Wellness</span>
          </button>

          <button type="button" className="progress-nav-item active">
            <span className="nav-icon">▥</span>
            <span>Progress</span>
          </button>

          <button type="button" onClick={onTalent} className="progress-nav-item">
            <span className="nav-icon">♟</span>
            <span>Talent Discovery</span>
          </button>

          <button type="button" onClick={onGamification} className="progress-nav-item">
            <span className="nav-icon">✧</span>
            <span>Gamification</span>
          </button>

        </nav>

        <div className="progress-language">
          <span>◉</span>
          <span>English</span>
          <span>⌄</span>
        </div>

      </aside>


      {/* ================= MAIN CONTENT ================= */}

      <main className="progress-main">

        {/* Top bar */}
        <div className="progress-topbar">

          <div className="progress-search">
            <span>⌕</span>
            <span>Search...</span>
          </div>

          <div className="progress-top-actions">
            <span className="notification-icon">♧</span>

            <div className="profile-circle">
              A
            </div>
          </div>

        </div>


        {/* Page Header */}
        <section className="progress-header">

          <div>
            <h1>Your Progress</h1>

            <p>
              See your improvement over time.
            </p>
          </div>

        </section>


        {/* ================= PERIOD FILTER ================= */}

        <div className="period-tabs">

          {["Week", "Month", "3 Months", "6 Months"].map(
            (period) => (
              <button
                key={period}
                className={
                  activePeriod === period
                    ? "period-tab active"
                    : "period-tab"
                }
                onClick={() => setActivePeriod(period)}
              >
                {period}
              </button>
            )
          )}

        </div>


        {/* ================= SUMMARY CARDS ================= */}

        <section className="progress-summary">

          {/* Fitness */}
          <div className="summary-card fitness-card">

            <div className="summary-title">
              Fitness Score
            </div>

            <div className="summary-value">
              {currentData.fitness}
            </div>

            <div className="summary-change fitness-change">
              {currentData.fitnessChange}
            </div>

          </div>


          {/* Weight */}
          <div className="summary-card weight-card">

            <div className="summary-title">
              Weight (kg)
            </div>

            <div className="summary-value">
              {currentData.weight}
            </div>

            <div className="summary-change weight-change">
              {currentData.weightChange}
            </div>

          </div>


          {/* Endurance */}
          <div className="summary-card endurance-card">

            <div className="summary-title">
              Endurance (min)
            </div>

            <div className="summary-value">
              {currentData.endurance}
            </div>

            <div className="summary-change endurance-change">
              {currentData.enduranceChange}
            </div>

          </div>

        </section>


        {/* ================= CHART + ACHIEVEMENTS ================= */}

        <section className="progress-lower">

          {/* Fitness Chart */}

          <div className="chart-card">

            <h2>Fitness Score Trend</h2>

            <div className="chart-wrapper">

              <div className="y-axis">

                <span>100</span>
                <span>90</span>
                <span>80</span>
                <span>70</span>
                <span>60</span>
                <span>0</span>

              </div>

              <div className="chart-area">

                <div className="horizontal-line line-1"></div>
                <div className="horizontal-line line-2"></div>
                <div className="horizontal-line line-3"></div>
                <div className="horizontal-line line-4"></div>
                <div className="horizontal-line line-5"></div>

                <svg
                  className="progress-chart"
                  viewBox="0 0 700 280"
                  preserveAspectRatio="none"
                >

                  {/* Area */}
                  <polygon
                    points={`
                      0,195
                      115,175
                      230,140
                      345,125
                      460,125
                      575,80
                      690,60
                      690,250
                      0,250
                    `}
                    className="chart-area-fill"
                  />

                  {/* Line */}
                  <polyline
                    points={`
                      0,195
                      115,175
                      230,140
                      345,125
                      460,125
                      575,80
                      690,60
                    `}
                    className="chart-line"
                  />

                  {/* Points */}
                  <circle cx="0" cy="195" r="5" />
                  <circle cx="115" cy="175" r="5" />
                  <circle cx="230" cy="140" r="5" />
                  <circle cx="345" cy="125" r="5" />
                  <circle cx="460" cy="125" r="5" />
                  <circle cx="575" cy="80" r="5" />
                  <circle cx="690" cy="60" r="5" />

                </svg>


                {/* X axis labels */}
                <div className="x-axis">

                  {currentData.chartLabels.map(
                    (label, index) => (
                      <span key={index}>
                        {label}
                      </span>
                    )
                  )}

                </div>

              </div>

            </div>

          </div>


          {/* ================= ACHIEVEMENTS ================= */}

          <div className="achievements-card">

            <h2>Achievements</h2>


            <div className="achievement-item">

              <div className="achievement-icon fire">
                🔥
              </div>

              <div className="achievement-content">

                <h3>5 Day Streak</h3>

                <p>
                  Completed 5 days in a row!
                </p>

              </div>

            </div>


            <div className="achievement-item">

              <div className="achievement-icon trophy">
                🏆
              </div>

              <div className="achievement-content">

                <h3>Fitness Milestone</h3>

                <p>
                  Score increased by 5%.
                </p>

              </div>

            </div>


            <div className="achievement-item">

              <div className="achievement-icon nutrition">
                🥗
              </div>

              <div className="achievement-content">

                <h3>Nutrition Goal</h3>

                <p>
                  Met 4/7 days
                </p>

              </div>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Progress;