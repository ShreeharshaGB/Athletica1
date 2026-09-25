function ProgressChart() {
  return (
    <div className="chart-container">

      <div className="chart-header">
        <div>
          <h3>Fitness Score Trend</h3>
          <p>Your fitness improvement</p>
        </div>

        <select>
          <option>Last 6 weeks</option>
          <option>Last 3 months</option>
        </select>
      </div>

      <div className="chart">

        <div className="y-axis">
          <span>100</span>
          <span>80</span>
          <span>60</span>
          <span>40</span>
          <span>20</span>
        </div>

        <div className="chart-area">

          <div className="grid-line"></div>
          <div className="grid-line"></div>
          <div className="grid-line"></div>
          <div className="grid-line"></div>
          <div className="grid-line"></div>

          <svg
            viewBox="0 0 600 220"
            preserveAspectRatio="none"
            className="line-chart"
          >

            <defs>
              <linearGradient
                id="areaGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#16a36a"
                  stopOpacity="0.25"
                />

                <stop
                  offset="100%"
                  stopColor="#16a36a"
                  stopOpacity="0"
                />
              </linearGradient>
            </defs>

            <path
              d="
              M0 175
              L100 155
              L200 135
              L300 120
              L400 105
              L500 90
              L600 65
              L600 220
              L0 220
              Z
              "
              fill="url(#areaGradient)"
            />

            <polyline
              points="
              0,175
              100,155
              200,135
              300,120
              400,105
              500,90
              600,65
              "
              fill="none"
              stroke="#16a36a"
              strokeWidth="4"
            />

            <circle cx="0" cy="175" r="5" fill="#16a36a" />
            <circle cx="100" cy="155" r="5" fill="#16a36a" />
            <circle cx="200" cy="135" r="5" fill="#16a36a" />
            <circle cx="300" cy="120" r="5" fill="#16a36a" />
            <circle cx="400" cy="105" r="5" fill="#16a36a" />
            <circle cx="500" cy="90" r="5" fill="#16a36a" />
            <circle cx="600" cy="65" r="5" fill="#16a36a" />

          </svg>

          <div className="x-axis">
            <span>Week 1</span>
            <span>Week 2</span>
            <span>Week 3</span>
            <span>Week 4</span>
            <span>Week 5</span>
            <span>Week 6</span>
          </div>

        </div>

      </div>

    </div>
  );
}

export default ProgressChart;