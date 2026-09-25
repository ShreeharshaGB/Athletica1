import { useState } from "react";
import "./Nutrition.css";

const mealData = [
  {
    meal: "Breakfast",
    time: "8:00 AM",
    title: "Vegetable Upma",
    description: "Upma with vegetables + a glass of milk",
    calories: "320 kcal",
    icon: "🍲",
  },
  {
    meal: "Mid-Morning Snack",
    time: "11:00 AM",
    title: "Fresh Fruit",
    description: "One seasonal fruit + handful of almonds",
    calories: "180 kcal",
    icon: "🍎",
  },
  {
    meal: "Lunch",
    time: "1:30 PM",
    title: "Balanced Indian Meal",
    description: "Rice, dal, vegetables, curd and salad",
    calories: "520 kcal",
    icon: "🍛",
  },
  {
    meal: "Evening Snack",
    time: "4:30 PM",
    title: "Healthy Snack",
    description: "Sprouts chaat + lemon water",
    calories: "160 kcal",
    icon: "🥗",
  },
  {
    meal: "Dinner",
    time: "8:00 PM",
    title: "Light Dinner",
    description: "Roti, mixed vegetables and dal",
    calories: "420 kcal",
    icon: "🥘",
  },
];

function SidebarItem({ icon, text, active, onClick }) {
  return (
    <button type="button" onClick={onClick} className={`sidebar-item ${active ? "active" : ""}`}>
      <span className="sidebar-icon">{icon}</span>
      <span>{text}</span>
    </button>
  );
}

function MealCard({ meal }) {
  return (
    <div className="meal-card">
      <div className="meal-icon">{meal.icon}</div>

      <div className="meal-content">
        <div className="meal-top">
          <div>
            <p className="meal-name">{meal.meal}</p>
            <p className="meal-time">{meal.time}</p>
          </div>

          <span className="calories">{meal.calories}</span>
        </div>

        <h3>{meal.title}</h3>

        <p className="meal-description">
          {meal.description}
        </p>
      </div>
    </div>
  );
}

export default function Nutrition({ onDashboard, onWorkoutPlan, onWellness, onProgress, onTalent, onGamification }) {
  const [activeTab, setActiveTab] = useState("Today's Plan");

  return (
    <div className="nutrition-layout">

      {/* SIDEBAR */}
      <aside className="nutrition-sidebar">

        <div className="nutrition-brand">
          <div className="nutrition-logo">A</div>

          <span>ATHLETICA</span>
        </div>

        <nav className="nutrition-navigation">

          <SidebarItem icon="⌂" text="Dashboard" onClick={onDashboard} />

          <SidebarItem icon="◉" text="Assessment" />

          <SidebarItem icon="▣" text="Workout Plan" onClick={onWorkoutPlan} />

          <SidebarItem
            icon="▤"
            text="Nutrition"
            active
          />

          <SidebarItem icon="♡" text="Wellness" onClick={onWellness} />

          <SidebarItem icon="◔" text="Progress" onClick={onProgress} />

          <SidebarItem icon="✦" text="Talent Discovery" onClick={onTalent} />

          <SidebarItem icon="♛" text="Gamification" onClick={onGamification} />

        </nav>

        <div className="nutrition-language">
          <span>◉</span>
          <span>English</span>
          <span className="language-arrow">⌄</span>
        </div>

      </aside>


      {/* MAIN CONTENT */}
      <main className="nutrition-main">

        {/* TOP BAR */}
        <header className="nutrition-topbar">

          <div className="nutrition-search">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search..."
            />
          </div>

          <div className="nutrition-profile">

            <button className="notification">
              ♧
            </button>

            <div className="profile">
              A
            </div>

          </div>

        </header>


        {/* PAGE CONTENT */}
        <section className="nutrition-content">

          {/* HEADING */}
          <div className="nutrition-heading">

            <div>
              <h1>Nutrition Plan</h1>

              <p>
                Personalized nutrition guidance to support your fitness goals
              </p>
            </div>

          </div>


          {/* DAILY SUMMARY */}
          <div className="nutrition-summary">

            <div className="summary-text">
              <span className="summary-label">
                Today&apos;s Nutrition
              </span>

              <h2>1,600 kcal</h2>

              <p>
                Balanced meals planned for your fitness journey
              </p>
            </div>

            <div className="summary-progress">

              <div className="progress-circle">
                <span>72%</span>
              </div>

              <span>Daily Goal</span>

            </div>

          </div>


          {/* TABS */}
          <div className="nutrition-tabs">

            <button
              className={
                activeTab === "Today's Plan"
                  ? "nutrition-tab active"
                  : "nutrition-tab"
              }
              onClick={() => setActiveTab("Today's Plan")}
            >
              Today&apos;s Plan
            </button>

            <button
              className={
                activeTab === "Meal Ideas"
                  ? "nutrition-tab active"
                  : "nutrition-tab"
              }
              onClick={() => setActiveTab("Meal Ideas")}
            >
              Meal Ideas
            </button>

            <button
              className={
                activeTab === "Nutrition Tips"
                  ? "nutrition-tab active"
                  : "nutrition-tab"
              }
              onClick={() => setActiveTab("Nutrition Tips")}
            >
              Nutrition Tips
            </button>

          </div>


          {/* TODAY'S PLAN */}
          {activeTab === "Today's Plan" && (

            <div className="meal-list">

              {mealData.map((meal) => (
                <MealCard
                  key={meal.meal}
                  meal={meal}
                />
              ))}

            </div>

          )}


          {/* MEAL IDEAS */}
          {activeTab === "Meal Ideas" && (

            <div className="alternative-section">

              <div className="alternative-card">
                <span>🥣</span>

                <div>
                  <h3>Healthy Breakfast</h3>

                  <p>
                    Choose oats, poha, upma, idli or vegetable
                    sandwiches.
                  </p>
                </div>
              </div>


              <div className="alternative-card">
                <span>🍛</span>

                <div>
                  <h3>Balanced Lunch</h3>

                  <p>
                    Combine grains, dal or another protein,
                    vegetables and curd.
                  </p>
                </div>
              </div>


              <div className="alternative-card">
                <span>🥗</span>

                <div>
                  <h3>Light Dinner</h3>

                  <p>
                    Prefer vegetables, dal and moderate portions
                    of grains.
                  </p>
                </div>
              </div>

            </div>

          )}


          {/* TIPS */}
          {activeTab === "Nutrition Tips" && (

            <div className="alternative-section">

              <div className="alternative-card">
                <span>💧</span>

                <div>
                  <h3>Stay Hydrated</h3>

                  <p>
                    Drink water regularly throughout the day.
                  </p>
                </div>
              </div>


              <div className="alternative-card">
                <span>🥦</span>

                <div>
                  <h3>Eat a Variety of Foods</h3>

                  <p>
                    Include vegetables, fruits, grains and
                    protein-rich foods.
                  </p>
                </div>
              </div>


              <div className="alternative-card">
                <span>⏰</span>

                <div>
                  <h3>Maintain Regular Meals</h3>

                  <p>
                    Try to maintain consistent meal timings.
                  </p>
                </div>
              </div>

            </div>

          )}

        </section>

      </main>

    </div>
  );
}