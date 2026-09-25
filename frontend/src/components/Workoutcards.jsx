import {
  Clock,
  Activity
} from "lucide-react";

function WorkoutCard({ plan }) {
  const workout = plan?.workouts?.[0];
  return (
    <div className="workout-section">

      <div className="section-heading">

        <h2>
          Today&apos;s Workout
        </h2>

      </div>


      <div className="workout-card">

        <div className="workout-image">
          🏃‍♂️
        </div>


        <div className="workout-info">

          <h3>
            {workout?.title || 'No active workout plan'}
          </h3>


          <div className="workout-meta">

            <span>
              <Clock size={14} />
              {workout ? `${workout.durationMinutes} min` : '--'}
            </span>

            <span>
              <Activity size={14} />
              {plan?.goal || 'Create a plan to see today\'s workout'}
            </span>

          </div>


          <p>
            A quick and effective workout to boost
            your strength and endurance.
          </p>

        </div>


        <button className="start-button" type="button" disabled={!workout}>
          {workout ? 'Start Workout' : 'No workout available'}
        </button>

      </div>

    </div>
  );
}

export default WorkoutCard;