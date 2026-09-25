import {
  Award,
  Star,
  Flame
} from "lucide-react";

function StatCards({ assessment }) {
  const score = assessment?.overallScore ?? (assessment ? Math.round((assessment.pushUps + assessment.sitUps) / 2) : null);
  return (
    <section className="stats-container">

      {/* FITNESS SCORE */}

      <div className="stat-card fitness-card">

        <div className="stat-heading">

          <Award size={22} />

          <span>
            Fitness Score
          </span>

        </div>


        <div className="fitness-content">

          <div className="score-ring">

            <div className="score-inner">

              <strong>
                {score ?? '--'}
              </strong>

              <small>
                /100
              </small>

              <span>
                Good
              </span>

            </div>

          </div>


          <div className="score-change">

            <strong>
                {assessment ? `${assessment.fitnessLevel || 'Recorded'}` : 'No assessment'}
            </strong>

            <span>
              vs last month
            </span>

          </div>

        </div>

      </div>


      {/* XP */}

      <div className="stat-card xp-card">

        <div className="stat-heading purple">

          <Star size={21} />

          <span>
            XP
          </span>

        </div>


        <h2>
              --
        </h2>

        <p>
              Sign in data sync pending
        </p>

        <div className="xp-today">
          Fitness data comes from your account
        </div>

      </div>


      {/* STREAK */}

      <div className="stat-card streak-card">

        <div className="stat-heading orange">

          <Flame size={22} />

          <span>
            Streak
          </span>

        </div>


        <h2>
          --
        </h2>

        <p>
          Complete workouts to build a streak
        </p>

      </div>

    </section>
  );
}

export default StatCards;