import "./gamification.css";

const Gamification = ({ onDashboard, onWorkoutPlan, onNutrition, onWellness, onProgress, onTalent }) => {
  return (
    <div className="gamification-page">

      {/* ================= SIDEBAR ================= */}
      <aside className="gamification-sidebar">

        <div className="gamification-logo">
          <div className="logo-symbol">A</div>
          <span>ATHLETICA</span>
        </div>

        <nav className="gamification-nav">

          <button type="button" onClick={onDashboard} className="g-nav-item">
            <span className="g-icon">⌂</span>
            <span>Dashboard</span>
          </button>

          <button type="button" onClick={onWorkoutPlan} className="g-nav-item">
            <span className="g-icon">▤</span>
            <span>Workout Plan</span>
          </button>

          <button type="button" onClick={onNutrition} className="g-nav-item">
            <span className="g-icon">◉</span>
            <span>Nutrition</span>
          </button>

          <button type="button" onClick={onWellness} className="g-nav-item">
            <span className="g-icon">♡</span>
            <span>Wellness</span>
          </button>

          <button type="button" onClick={onProgress} className="g-nav-item">
            <span className="g-icon">◒</span>
            <span>Progress</span>
          </button>

          <button type="button" onClick={onTalent} className="g-nav-item">
            <span className="g-icon">♙</span>
            <span>Talent Discovery</span>
          </button>

          <button type="button" className="g-nav-item active">
            <span className="g-icon">✧</span>
            <span>Gamification</span>
          </button>

        </nav>

        <div className="g-language">
          <span>◉</span>
          <span>English</span>
          <span>⌄</span>
        </div>

      </aside>


      {/* ================= MAIN CONTENT ================= */}
      <main className="gamification-main">

        {/* Top Bar */}
        <header className="g-topbar">

          <div className="g-search">
            <span className="search-icon">⌕</span>
            <span>Search...</span>
          </div>

          <div className="g-top-right">

            <button className="g-notification">
              ♧
            </button>

            <div className="g-profile">
              S
            </div>

          </div>

        </header>


        {/* Page Header */}
        <section className="journey-header">

          <div>
            <h1>Your Journey</h1>

            <p>
              Complete challenges, earn XP and unlock rewards!
            </p>
          </div>

          <div className="xp-total">
            <span className="xp-star">★</span>
            <strong>1,250 XP</strong>
          </div>

        </section>


        {/* ================= LEVEL CARD ================= */}
        <section className="level-card">

          <div className="level-badge">
            ★
          </div>

          <div className="level-information">

            <div className="level-top">

              <div>
                <h3>Level 3</h3>
                <p>Next level at 1,500 XP</p>
              </div>

              <span className="xp-progress-text">
                250 / 500 XP
              </span>

            </div>

            <div className="level-progress-background">
              <div className="level-progress"></div>
            </div>

          </div>

        </section>


        {/* ================= DAILY CHALLENGES ================= */}
        <section className="challenges-section">

          <h2>Daily Challenges</h2>

          <div className="challenge-grid">

            {/* Challenge 1 */}
            <div className="challenge-card">

              <div className="challenge-icon green">
                ♧
              </div>

              <div className="challenge-content">
                <h3>Complete Workout</h3>
                <p>+100 XP</p>
              </div>

              <div className="challenge-status completed">
                Done
              </div>

            </div>


            {/* Challenge 2 */}
            <div className="challenge-card">

              <div className="challenge-icon mint">
                ♧
              </div>

              <div className="challenge-content">
                <h3>Log Nutrition</h3>
                <p>+50 XP</p>
              </div>

              <div className="challenge-status completed">
                Done
              </div>

            </div>


            {/* Challenge 3 */}
            <div className="challenge-card">

              <div className="challenge-icon purple">
                ◉
              </div>

              <div className="challenge-content">
                <h3>Stay Hydrated</h3>
                <p>+75 XP</p>
              </div>

              <div className="challenge-status in-progress">
                ◉ In Progress
              </div>

            </div>

          </div>

        </section>


        {/* ================= ACHIEVEMENTS ================= */}
        <section className="achievements-section">

          <h2>Achievements</h2>

          <div className="achievement-grid">

            {/* Achievement 1 */}
            <div className="achievement-card">

              <div className="achievement-badge orange">
                ✹
              </div>

              <div>
                <h3>5 Day Streak</h3>
                <p>+200 XP</p>
              </div>

            </div>


            {/* Achievement 2 */}
            <div className="achievement-card">

              <div className="achievement-badge blue">
                ◇
              </div>

              <div>
                <h3>First Assessment</h3>
                <p>+100 XP</p>
              </div>

            </div>


            {/* Achievement 3 */}
            <div className="achievement-card">

              <div className="achievement-badge red">
                ★
              </div>

              <div>
                <h3>Consistency Champ</h3>
                <p>+150 XP</p>
              </div>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
};

export default Gamification;