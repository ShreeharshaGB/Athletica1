import "./talent_discovery.css";

function TalentDiscovery({ onDashboard, onWorkoutPlan, onNutrition, onWellness, onProgress, onGamification }) {
  return (
    <div className="talent-page">

      {/* ================= SIDEBAR ================= */}

      <aside className="talent-sidebar">

        <div className="talent-logo">
          <div className="talent-logo-mark">A</div>

          <div className="talent-logo-text">
            ATHLETICA
          </div>
        </div>


        <nav className="talent-navigation">

          <button type="button" onClick={onDashboard} className="talent-nav-item">
            <span className="talent-nav-icon">⌂</span>
            <span>Dashboard</span>
          </button>

          <button type="button" onClick={onWorkoutPlan} className="talent-nav-item">
            <span className="talent-nav-icon">▣</span>
            <span>Workout Plan</span>
          </button>

          <button type="button" onClick={onNutrition} className="talent-nav-item">
            <span className="talent-nav-icon">◉</span>
            <span>Nutrition</span>
          </button>

          <button type="button" onClick={onWellness} className="talent-nav-item">
            <span className="talent-nav-icon">♧</span>
            <span>Wellness</span>
          </button>

          <button type="button" onClick={onProgress} className="talent-nav-item">
            <span className="talent-nav-icon">▥</span>
            <span>Progress</span>
          </button>

          <button type="button" className="talent-nav-item active">
            <span className="talent-nav-icon">♢</span>
            <span>Talent Discovery</span>
          </button>

          <button type="button" onClick={onGamification} className="talent-nav-item">
            <span className="talent-nav-icon">✧</span>
            <span>Gamification</span>
          </button>

        </nav>


        {/* Language */}

        <div className="talent-language">
          <span>◉</span>
          <span>English</span>
          <span>⌄</span>
        </div>

      </aside>


      {/* ================= MAIN CONTENT ================= */}

      <main className="talent-main">

        {/* Top bar */}

        <div className="talent-topbar">

          <div className="talent-search">
            <span className="search-icon">⌕</span>
            <span>Search...</span>
          </div>


          <div className="talent-top-actions">

            <span className="talent-notification">
              ♧
            </span>

            <div className="talent-profile">
              A
            </div>

          </div>

        </div>


        {/* ================= HEADER ================= */}

        <section className="talent-header">

          <h1>Your Talent Insights</h1>

          <p>
            Based on your performance trends, we&apos;ve identified
            your potential areas.
          </p>

        </section>


        {/* ================= INSIGHTS AREA ================= */}

        <section className="talent-insights">


          {/* ================= TOP POTENTIAL AREAS ================= */}

          <div className="potential-card">

            <h2>Top Potential Areas</h2>


            {/* Speed & Endurance */}

            <div className="potential-item">

              <div className="potential-icon speed-icon">
                ✦
              </div>

              <div className="potential-info">

                <h3>
                  Speed &amp; Endurance
                </h3>

                <p className="high-potential">
                  High potential
                </p>

              </div>

            </div>


            {/* Strength */}

            <div className="potential-item">

              <div className="potential-icon strength-icon">
                ✦
              </div>

              <div className="potential-info">

                <h3>
                  Strength
                </h3>

                <p className="good-potential">
                  Good potential
                </p>

              </div>

            </div>


            {/* Flexibility */}

            <div className="potential-item">

              <div className="potential-icon flexibility-icon">
                ✦
              </div>

              <div className="potential-info">

                <h3>
                  Flexibility
                </h3>

                <p className="moderate-potential">
                  Moderate potential
                </p>

              </div>

            </div>


            {/* Agility */}

            <div className="potential-item">

              <div className="potential-icon agility-icon">
                ✦
              </div>

              <div className="potential-info">

                <h3>
                  Agility
                </h3>

                <p className="moderate-potential">
                  Moderate potential
                </p>

              </div>

            </div>

          </div>


          {/* ================= OTHER INSIGHTS ================= */}

          <div className="other-insights-card">

            <h2>Other Insights</h2>


            {/* Insight 1 */}

            <div className="other-insight">

              <div className="other-insight-icon">
                ♧
              </div>

              <p>
                You perform best in
                endurance activities.
              </p>

            </div>


            {/* Insight 2 */}

            <div className="other-insight">

              <div className="other-insight-icon">
                ◉
              </div>

              <p>
                Your lower body strength
                shows strong progress.
              </p>

            </div>


            {/* Insight 3 */}

            <div className="other-insight">

              <div className="other-insight-icon">
                ♢
              </div>

              <p>
                You have high potential
                in track &amp; field events.
              </p>

            </div>


            {/* Detailed report */}

            <button
              className="detailed-report-button"
              onClick={() =>
                alert(
                  "Detailed talent report will be available here."
                )
              }
            >
              View Detailed Report
            </button>

          </div>

        </section>


        {/* ================= TALENT SUMMARY ================= */}

        <section className="talent-summary">

          <div className="summary-heading">

            <div>
              <h2>Your Talent Profile</h2>

              <p>
                Your current strengths based on your
                fitness assessment and activity history.
              </p>
            </div>

          </div>


          <div className="talent-progress-grid">

            {/* Speed */}

            <div className="talent-progress-item">

              <div className="progress-item-header">
                <span>Speed &amp; Endurance</span>
                <strong>85%</strong>
              </div>

              <div className="progress-track">
                <div
                  className="progress-fill speed-fill"
                  style={{ width: "85%" }}
                ></div>
              </div>

              <small>
                High potential
              </small>

            </div>


            {/* Strength */}

            <div className="talent-progress-item">

              <div className="progress-item-header">
                <span>Strength</span>
                <strong>72%</strong>
              </div>

              <div className="progress-track">
                <div
                  className="progress-fill strength-fill"
                  style={{ width: "72%" }}
                ></div>
              </div>

              <small>
                Good potential
              </small>

            </div>


            {/* Flexibility */}

            <div className="talent-progress-item">

              <div className="progress-item-header">
                <span>Flexibility</span>
                <strong>58%</strong>
              </div>

              <div className="progress-track">
                <div
                  className="progress-fill flexibility-fill"
                  style={{ width: "58%" }}
                ></div>
              </div>

              <small>
                Moderate potential
              </small>

            </div>


            {/* Agility */}

            <div className="talent-progress-item">

              <div className="progress-item-header">
                <span>Agility</span>
                <strong>55%</strong>
              </div>

              <div className="progress-track">
                <div
                  className="progress-fill agility-fill"
                  style={{ width: "55%" }}
                ></div>
              </div>

              <small>
                Moderate potential
              </small>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default TalentDiscovery;