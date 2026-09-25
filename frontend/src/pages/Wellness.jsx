import { useState } from "react";
import "./Wellness.css";

function SidebarItem({ icon, text, active, onClick }) {
  return (
    <button className={`sidebar-item ${active ? "active" : ""}`} onClick={onClick}>
      <span className="sidebar-icon">{icon}</span>
      <span>{text}</span>
    </button>
  );
}

function WellnessMetric({ icon, title, value, subtitle, type }) {
  return (
    <div className={`wellness-metric ${type}`}>
      <div className="metric-icon">{icon}</div>

      <div className="metric-content">
        <span className="metric-title">{title}</span>
        <strong>{value}</strong>
        <span className="metric-subtitle">{subtitle}</span>
      </div>
    </div>
  );
}

export default function Wellness({ onDashboard, onWorkoutPlan, onNutrition, onProgress, onTalent, onGamification }) {
  const [water, setWater] = useState("");
  const [sleep, setSleep] = useState("");
  const [meditation, setMeditation] = useState("");
  const [mood, setMood] = useState("");

  const handleSave = () => {
    if (!water || !sleep || !meditation) {
      alert("Please complete your wellness questions.");
      return;
    }

    alert("Your wellness information has been saved!");
  };

  return (
    <div className="wellness-layout">

      {/* ================= SIDEBAR ================= */}

      <aside className="wellness-sidebar">

        <div className="wellness-brand">
          <div className="wellness-logo">A</div>

          <div>
            <strong>ATHLETICA</strong>
          </div>
        </div>

        <nav className="wellness-navigation">

          <SidebarItem
            icon="⌂"
            text="Dashboard"
            onClick={onDashboard}
          />

          <SidebarItem
            icon="◉"
            text="Assessment"
          />

          <SidebarItem
            icon="▣"
            text="Workout Plan"
            onClick={onWorkoutPlan}
          />

          <SidebarItem
            icon="▤"
            text="Nutrition"
            onClick={onNutrition}
          />

          <SidebarItem
            icon="♡"
            text="Wellness"
            active
          />

          <SidebarItem
            icon="◔"
            text="Progress"
            onClick={onProgress}
          />

          <SidebarItem
            icon="✦"
            text="Talent Discovery"
            onClick={onTalent}
          />

          <SidebarItem
            icon="♛"
            text="Gamification"
            onClick={onGamification}
          />

        </nav>

        <div className="wellness-language">
          <span>◉</span>
          <span>English</span>
          <span className="language-arrow">⌄</span>
        </div>

      </aside>


      {/* ================= MAIN ================= */}

      <main className="wellness-main">

        {/* TOP BAR */}

        <header className="wellness-topbar">

          <div className="wellness-search">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search..."
            />
          </div>

          <div className="wellness-actions">

            <button className="notification-button">
              ♧
            </button>

            <div className="profile-circle">
              A
            </div>

          </div>

        </header>


        {/* ================= PAGE CONTENT ================= */}

        <section className="wellness-content">

          {/* PAGE HEADING */}

          <div className="wellness-heading">

            <div>
              <h1>Your Wellness</h1>

              <p>
                A balanced mind and body help you perform better.
              </p>
            </div>

            <span className="wellness-date">
              Mon, 22 Sep 2025
            </span>

          </div>


          {/* ================= METRIC CARDS ================= */}

          <div className="wellness-metrics">

            <WellnessMetric
              icon="💧"
              title="Hydration"
              value={water || "5 / 8"}
              subtitle="glasses"
              type="hydration"
            />

            <WellnessMetric
              icon="🌙"
              title="Sleep"
              value={sleep || "7h 20m"}
              subtitle="Good"
              type="sleep"
            />

            <WellnessMetric
              icon="😊"
              title="Mood"
              value="Good"
              subtitle=""
              type="mood"
            />

            <WellnessMetric
              icon="🪷"
              title="Stress"
              value="Moderate"
              subtitle=""
              type="stress"
            />

            <WellnessMetric
              icon="🍴"
              title="Nutrition"
              value="82%"
              subtitle="goal"
              type="nutrition"
            />

            <WellnessMetric
              icon="👟"
              title="Steps"
              value="6,240"
              subtitle="/10,000"
              type="steps"
            />

          </div>


          {/* ================= NEW WELLNESS QUESTIONS ================= */}

          <div className="wellness-check-section">

            <div className="section-heading">

              <div>
                <h2>Daily Wellness Check</h2>

                <p>
                  Tell us about your day to keep your wellness on track.
                </p>
              </div>

              <span className="daily-badge">
                Today
              </span>

            </div>


            <div className="wellness-questions">

              {/* WATER */}

              <div className="question-card">

                <div className="question-icon water-question">
                  💧
                </div>

                <div className="question-content">

                  <label htmlFor="water">
                    How much water did you drink today?
                  </label>

                  <select
                    id="water"
                    value={water}
                    onChange={(e) => setWater(e.target.value)}
                  >
                    <option value="">
                      Select water intake
                    </option>

                    <option value="1 Litre">
                      1 Litre
                    </option>

                    <option value="2 Litres">
                      2 Litres
                    </option>

                    <option value="3 Litres">
                      3 Litres
                    </option>

                    <option value="4 Litres">
                      4 Litres
                    </option>

                    <option value="5+ Litres">
                      5+ Litres
                    </option>
                  </select>

                </div>

              </div>


              {/* SLEEP */}

              <div className="question-card">

                <div className="question-icon sleep-question">
                  🌙
                </div>

                <div className="question-content">

                  <label htmlFor="sleep">
                    How many hours did you sleep last night?
                  </label>

                  <select
                    id="sleep"
                    value={sleep}
                    onChange={(e) => setSleep(e.target.value)}
                  >
                    <option value="">
                      Select sleep duration
                    </option>

                    <option value="Less than 4 hours">
                      Less than 4 hours
                    </option>

                    <option value="4 hours">
                      4 hours
                    </option>

                    <option value="5 hours">
                      5 hours
                    </option>

                    <option value="6 hours">
                      6 hours
                    </option>

                    <option value="7 hours">
                      7 hours
                    </option>

                    <option value="8 hours">
                      8 hours
                    </option>

                    <option value="9 hours">
                      9 hours
                    </option>

                    <option value="10+ hours">
                      10+ hours
                    </option>

                  </select>

                </div>

              </div>


              {/* MEDITATION */}

              <div className="question-card">

                <div className="question-icon meditation-question">
                  🧘
                </div>

                <div className="question-content">

                  <label htmlFor="meditation">
                    How much time did you meditate today?
                  </label>

                  <select
                    id="meditation"
                    value={meditation}
                    onChange={(e) => setMeditation(e.target.value)}
                  >

                    <option value="">
                      Select meditation time
                    </option>

                    <option value="No meditation">
                      No meditation
                    </option>

                    <option value="5 minutes">
                      5 minutes
                    </option>

                    <option value="10 minutes">
                      10 minutes
                    </option>

                    <option value="15 minutes">
                      15 minutes
                    </option>

                    <option value="20 minutes">
                      20 minutes
                    </option>

                    <option value="30 minutes">
                      30 minutes
                    </option>

                    <option value="45 minutes">
                      45 minutes
                    </option>

                    <option value="60+ minutes">
                      60+ minutes
                    </option>

                  </select>

                </div>

              </div>


              {/* MOOD */}

              <div className="question-card mood-question-card">

                <div className="question-icon mood-question">
                  😊
                </div>

                <div className="question-content">

                  <label htmlFor="mood">
                    How are you feeling today?
                  </label>

                  <select
                    id="mood"
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                  >

                    <option value="">
                      Select your mood
                    </option>

                    <option value="Great">
                      Great
                    </option>

                    <option value="Good">
                      Good
                    </option>

                    <option value="Okay">
                      Okay
                    </option>

                    <option value="Low">
                      Low
                    </option>

                  </select>

                </div>

              </div>

            </div>


            <button
              className="save-wellness-button"
              onClick={handleSave}
            >
              Save Wellness Check
            </button>

          </div>


          {/* ================= OLD WELLNESS CHECK + AI COACH ================= */}

          <div className="bottom-section">

            <div className="wellness-check-card">

              <div className="card-heading">
                <h2>Wellness Check-in</h2>

                <p>
                  How are you feeling today?
                </p>
              </div>

              <div className="mood-options">

                <button
                  className="mood-option great"
                  onClick={() => setMood("Great")}
                >
                  <span>😄</span>
                  <small>Great</small>
                </button>

                <button
                  className="mood-option good"
                  onClick={() => setMood("Good")}
                >
                  <span>🙂</span>
                  <small>Good</small>
                </button>

                <button
                  className="mood-option okay"
                  onClick={() => setMood("Okay")}
                >
                  <span>😐</span>
                  <small>Okay</small>
                </button>

                <button
                  className="mood-option low"
                  onClick={() => setMood("Low")}
                >
                  <span>😟</span>
                  <small>Low</small>
                </button>

              </div>

            </div>


            {/* AI COACH */}

            <div className="ai-coach-card">

              <div className="ai-coach-heading">

                <div className="ai-icon">
                  🤖
                </div>

                <h2>AI Coach</h2>

              </div>

              <p>
                Your activity level is good.
                Consider taking a short recovery break
                and maintaining hydration.
              </p>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}