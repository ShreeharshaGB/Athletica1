import {
  LayoutDashboard,
  ClipboardCheck,
  Dumbbell,
  Apple,
  HeartPulse,
  TrendingUp,
  Trophy,
  Gamepad2,
  Languages
} from "lucide-react";

const menuItems = [
  {
    name: "Dashboard",
    icon: LayoutDashboard
  },
  {
    name: "Assessment",
    icon: ClipboardCheck
  },
  {
    name: "Workout Plan",
    icon: Dumbbell
  },
  {
    name: "Nutrition",
    icon: Apple
  },
  {
    name: "Wellness",
    icon: HeartPulse
  },
  {
    name: "Progress",
    icon: TrendingUp
  },
  {
    name: "Talent Discovery",
    icon: Trophy
  },
  {
    name: "Gamification",
    icon: Gamepad2
  }
];

function Sidebar({ onDashboard, onWorkoutPlan, onNutrition, onWellness, onProgress, onTalent, onGamification, onLogout }) {
  const navigation = { Dashboard: onDashboard, "Workout Plan": onWorkoutPlan, Nutrition: onNutrition, Wellness: onWellness, Progress: onProgress, "Talent Discovery": onTalent, Gamification: onGamification };
  return (
    <aside className="sidebar">

      {/* LOGO */}
      <div className="sidebar-logo">

        <div className="athletica-mark">
          A
        </div>

        <div>
          <div className="athletica-name">
            ATHLETICA
          </div>

          <div className="athletica-subtitle">
            Fitness & Wellness
          </div>
        </div>

      </div>


      {/* MENU */}
      <nav className="sidebar-nav">

        {menuItems.map((item, index) => {

          const Icon = item.icon;

          return (
            <button
              className={
                index === 0
                  ? "sidebar-item active"
                  : "sidebar-item"
              }
              key={item.name}
              type="button"
              onClick={navigation[item.name]}
            >

              <Icon size={17} strokeWidth={2} />

              <span>
                {item.name}
              </span>

            </button>
          );

        })}

      </nav>

      <button type="button" className="sidebar-item" onClick={onLogout}>Sign out</button>


      {/* LANGUAGE */}
      <div className="language">

        <Languages size={16} />

        <span>
          English
        </span>

      </div>

    </aside>
  );
}

export default Sidebar;