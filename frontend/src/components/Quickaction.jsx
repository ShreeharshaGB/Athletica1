import {
  ClipboardCheck,
  Dumbbell,
  HeartPulse,
  TrendingUp,
  ChevronRight
} from "lucide-react";

const actions = [
  {
    icon: ClipboardCheck,
    title: "Take Assessment"
  },
  {
    icon: Dumbbell,
    title: "View Workout Plan"
  },
  {
    icon: HeartPulse,
    title: "Check Wellness"
  },
  {
    icon: TrendingUp,
    title: "Track Progress"
  }
];

function QuickActions({ onAssessment, onWorkoutPlan, onWellness, onProgress }) {
  const handlers = [onAssessment, onWorkoutPlan, onWellness, onProgress]
  return (
    <div className="quick-section">

      <div className="section-heading">

        <h2>
          Quick Actions
        </h2>

      </div>


      <div className="quick-actions">

        {actions.map((item) => {

          const Icon = item.icon;

          return (

            <button
              className="quick-action"
              key={item.title}
              type="button"
              onClick={handlers[actions.indexOf(item)]}
            >

              <div className="quick-icon">
                <Icon size={17} />
              </div>

              <span>
                {item.title}
              </span>

              <ChevronRight
                size={16}
                className="arrow"
              />

            </button>

          );

        })}

      </div>

    </div>
  );
}

export default QuickActions;