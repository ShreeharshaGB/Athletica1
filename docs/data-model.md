# Athletica — Data Model Architecture & Specifications (Step 4)

## 1. Purpose of the Data Model

Athletica is an AI-powered fitness, wellness, and talent-discovery platform designed to democratize health tracking and athletic potential identification for students—especially across regional and rural educational ecosystems.

The primary purpose of this data model design is to establish a robust, privacy-respecting, and scalable foundation that directly supports the platform's three core pillars:
1. **Personalized Fitness & Wellness Recommendations:** Generating dynamic workout routines and culturally relevant dietary guidance tailored to student biometrics, preferences, and available facilities.
2. **Longitudinal Fitness Tracking:** Maintaining consistent historical telemetry across physical performance assessments to measure authentic growth, fitness adaptation, and habit consistency over time.
3. **Rural/Local Student Talent Discovery:** Analyzing longitudinal performance trajectories and comparative age/gender benchmarks to highlight natural athletic inclinations and potential strength disciplines, without reductive or deterministic labels.

### Core Architectural Principles
- **Separation of Raw Telemetry and Derived Indicators:** Raw assessment data (e.g., push-up counts, sprint seconds) must be captured immutably, distinct from calculated scores or percentiles, ensuring scoring algorithms can evolve without historical data distortion.
- **Privacy by Design:** Storing general regional granularity (state/district) rather than precise GPS coordinates.
- **Stateless/Derivable Progress:** Calculating progress, delta improvements, and streaks on-the-fly or through aggregation pipelines rather than storing redundant, denormalized progress records.
- **External Object Storage for Media:** Storing lightweight URLs and metadata in the database; binary media is strictly relegated to specialized cloud storage.
- **Ethical & Non-Diagnostic AI:** Physique analysis is strictly non-medical, assistive, and optional. Talent discovery surfaces directional areas of strength rather than defining absolute athletic capability.

---

## 2. Planned Collections

### 2.1 Core Collections Overview

| Collection | Description | Primary Key / Indexing |
| :--- | :--- | :--- |
| `users` | User credentials, roles, and static/semi-static biometrics & preferences | `_id`, unique `email`, index on `role` |
| `assessments` | Timestamped physical test batteries containing raw measurements & computed indices | `_id`, compound index on `{ userId: 1, date: -1 }` |
| `physiqueImages` | Metadata, storage references, and AI observations of optional physique submissions | `_id`, index on `{ userId: 1, uploadedAt: -1 }` |
| `workoutPlans` | Assigned or AI-generated training regimens, routines, and scheduled exercises | `_id`, index on `{ userId: 1, status: 1 }` |
| `workoutLogs` | Real-time daily session tracking, completion status, duration, and user feedback | `_id`, index on `{ userId: 1, date: -1 }` |
| `dietPlans` | Tailored nutrition plans emphasizing local, accessible, and regional foods | `_id`, index on `{ userId: 1, status: 1 }` |

### 2.2 Potential Future Collections
- **`challenges`**: School-wide, district-level, or peer group fitness milestones and participatory events.
- **`notifications`**: System reminders, teacher announcements, workout alerts, and milestone celebrations.
- **`chatSessions`**: Conversational history with the AI fitness assistant for contextual continuity.
- **`recommendations`**: Audit log of AI-generated insights and plan variations (evaluating whether to persist or generate ephemerally).

---

## 3. Entity & Field Specifications

### 3.1 `users`
Represents student athletes, teachers/coaches, and administrative users.

```json
{
  "_id": "ObjectId",
  "name": "String (Required)",
  "email": "String (Required, Unique, Lowercase)",
  "passwordHash": "String (Required, Hashed)",
  "role": "String (Enum: ['student', 'teacher', 'admin'], Default: 'student')",
  "profile": {
    "age": "Number (Optional/Required for benchmark evaluation)",
    "gender": "String (Enum: ['male', 'female', 'other', 'prefer_not_to_say'])",
    "heightCm": "Number (Positive float)",
    "weightKg": "Number (Positive float)",
    "dietPreference": "String (Enum: ['vegetarian', 'non_vegetarian', 'eggetarian', 'vegan', 'jain'])",
    "fitnessGoal": "String (Enum: ['general_fitness', 'strength', 'endurance', 'speed_agility', 'flexibility', 'weight_management'])",
    "activityLevel": "String (Enum: ['sedentary', 'lightly_active', 'moderately_active', 'very_active'])",
    "region": {
      "state": "String (Optional, e.g., 'Karnataka', 'Maharashtra')",
      "district": "String (Optional, e.g., 'Dharwad', 'Pune')"
    }
  },
  "createdAt": "ISODate (Timestamp)",
  "updatedAt": "ISODate (Timestamp)"
}
```
*Note on Privacy:* Under no circumstances will precise geolocation (latitude, longitude, street addresses) be collected or persisted.

---

### 3.2 `assessments`
Captures periodic fitness evaluations conducted by teachers or self-reported by students under standard physical education protocols.

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (Ref: 'users', Required, Indexed)",
  "date": "ISODate (Required, Date of test)",
  "evaluatorId": "ObjectId (Ref: 'users', Optional: teacher/evaluator)",
  "rawMeasurements": {
    "pushUps": "Number (Count in 60s)",
    "sitUps": "Number (Count in 60s)",
    "runTimeSeconds": "Number (e.g., 50m sprint or 600m run/walk in seconds)",
    "runDistanceMeters": "Number (e.g., 50, 100, 600, 1600)",
    "flexibilityCm": "Number (Sit-and-reach test distance in cm)",
    "verticalJumpCm": "Number (Optional: explosive leg power in cm)",
    "shuttleRunSeconds": "Number (Optional: agility test in seconds)"
  },
  "fitnessScores": {
    "strength": "Number (Calculated 0-100 score)",
    "endurance": "Number (Calculated 0-100 score)",
    "speed": "Number (Calculated 0-100 score)",
    "flexibility": "Number (Calculated 0-100 score)",
    "overallComposite": "Number (Calculated 0-100 aggregate)"
  },
  "notes": "String (Qualitative teacher observations or environmental factors)",
  "createdAt": "ISODate (Timestamp)"
}
```
*Design Justification:* Keeping `rawMeasurements` strictly separated from `fitnessScores` guarantees that if normative tables (e.g., SAI/Khelo India or age-standardized percentiles) change, recalculations can be executed without corrupting source data.

---

### 3.3 `physiqueImages`
Manages references and AI perception outputs for optional physique check-ins.

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (Ref: 'users', Required, Indexed)",
  "imageUrl": "String (Secure CDN/Bucket URL)",
  "storageKey": "String (Object storage key/path)",
  "uploadedAt": "ISODate (Required)",
  "status": "String (Enum: ['pending', 'processing', 'analyzed', 'failed'], Default: 'pending')",
  "analysis": {
    "modelMetadata": {
      "provider": "String (e.g., 'gemini')",
      "modelVersion": "String",
      "processedAt": "ISODate"
    },
    "observations": [
      "String (e.g., 'Balanced posture observed; slight anterior shoulder roll; lean athletic frame')"
    ],
    "postureNotes": "String",
    "conditioningIndicators": {
      "apparentSymmetry": "String (Enum: ['balanced', 'minor_asymmetry_noted', 'unassessed'])",
      "visibleMuscularEnduranceTier": "String"
    },
    "disclaimer": "String (Explicit legal/medical disclaimer regarding non-diagnostic nature)"
  },
  "createdAt": "ISODate (Timestamp)"
}
```
*Strict Constraints:*
- **Zero binary storage:** MongoDB documents must store URIs and structured labels only.
- **Non-medical guardrail:** No diagnostic claims (e.g., BMI determination, body fat percentage precision, spinal curvature diagnosis) are permitted.

---

### 3.4 `workoutPlans`
Represents an ongoing multi-week or multi-day structured fitness schedule.

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (Ref: 'users', Required, Indexed)",
  "source": "String (Enum: ['ai_generated', 'teacher_assigned', 'self_created'])",
  "goal": "String (Targeted adaptation: e.g., 'Sprint Agility & Core Strength')",
  "startDate": "ISODate (Required)",
  "endDate": "ISODate (Optional)",
  "status": "String (Enum: ['active', 'completed', 'superseded', 'abandoned'], Default: 'active')",
  "workouts": [
    {
      "dayOfWeek": "String (Enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])",
      "title": "String (e.g., 'Lower Body Explosiveness & Mobility')",
      "durationMinutes": "Number",
      "exercises": [
        {
          "name": "String (e.g., 'Bodyweight Squats')",
          "sets": "Number",
          "reps": "Number",
          "durationSeconds": "Number (Optional)",
          "restSeconds": "Number",
          "equipment": "String (Default: 'none / bodyweight')",
          "notes": "String"
        }
      ]
    }
  ],
  "createdAt": "ISODate (Timestamp)",
  "updatedAt": "ISODate (Timestamp)"
}
```

---

### 3.5 `workoutLogs`
Records daily adherence, effort, and actual performance metrics.

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (Ref: 'users', Required, Indexed)",
  "workoutPlanId": "ObjectId (Ref: 'workoutPlans', Optional)",
  "date": "ISODate (Required)",
  "status": "String (Enum: ['completed', 'partially_completed', 'skipped'], Required)",
  "durationMinutes": "Number",
  "rpe": "Number (Rate of Perceived Exertion 1-10, Optional)",
  "exercisesCompleted": [
    {
      "name": "String",
      "setsCompleted": "Number",
      "repsCompleted": "Number",
      "loadKg": "Number (Optional)"
    }
  ],
  "notes": "String (User subjective notes, fatigue, soreness)",
  "createdAt": "ISODate (Timestamp)"
}
```

---

### 3.6 `dietPlans`
Provides tailored, accessible nutrition protocols respecting regional Indian food habits and affordability.

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (Ref: 'users', Required, Indexed)",
  "goal": "String (e.g., 'Muscle Recovery & Energy for Sports')",
  "dietPreference": "String (Enum: ['vegetarian', 'non_vegetarian', 'eggetarian', 'vegan', 'jain'])",
  "status": "String (Enum: ['active', 'archived'], Default: 'active')",
  "startDate": "ISODate",
  "endDate": "ISODate",
  "dailyTargetGuidance": {
    "approximateCalories": "Number",
    "primaryProteinSources": ["String (e.g., 'Moong dal', 'Sattu', 'Eggs', 'Sprouts', 'Paneer')"],
    "hydrationLiters": "Number"
  },
  "meals": [
    {
      "mealType": "String (Enum: ['breakfast', 'mid_morning', 'lunch', 'evening_snack', 'dinner'])",
      "suggestedItems": [
        {
          "dishName": "String (e.g., 'Sprouted moong with lemon and jaggery')",
          "portion": "String (e.g., '1 small bowl')",
          "nutritionalBenefit": "String (e.g., 'High bioavailability plant protein and complex carbs')"
        }
      ]
    }
  ],
  "regionalAdaptationNotes": "String (e.g., 'Emphasizes seasonal local millets and legumes common in Karnataka')",
  "createdAt": "ISODate (Timestamp)",
  "updatedAt": "ISODate (Timestamp)"
}
```

---

## 4. Entity Relationships

```
+-------------------------------------------------------------+
|                            USER                             |
|  (_id, name, email, passwordHash, role, profile, createdAt) |
+-------------------------------------------------------------+
       | 1
       |
       +------------+---------------------+-------------------+---------------------+
       | 1..*       | 1..*                | 1..*              | 1..*                | 1..*
       v            v                     v                   v                     v
+-------------+ +----------------+ +---------------+ +---------------+ +---------------+
| Assessment  | | PhysiqueImage  | |  WorkoutPlan  | |  WorkoutLog   | |   DietPlan    |
| (userId...) | |  (userId...)   | |  (userId...)  | |  (userId...)  | |  (userId...)  |
+-------------+ +----------------+ +---------------+ +---------------+ +---------------+
                                          | 1                 ^
                                          |                   |
                                          +------- 0..* ------+
                                            (workoutPlanId)
```

### Cardinality Summary
- **User 1 : N Assessments**: A student logs periodic fitness check-ins (e.g., monthly/quarterly).
- **User 1 : N PhysiqueImages**: Optional visual physique check-ins over the course of training.
- **User 1 : N WorkoutPlans**: A student receives updated regimens as goals shift or performance adapts.
- **User 1 : N WorkoutLogs**: Daily or session-by-session execution logs.
- **WorkoutPlan 1 : N WorkoutLogs**: An active plan is tied to multiple execution sessions (nullable for ad-hoc sessions).
- **User 1 : N DietPlans**: New meal structures generated as nutritional demands or seasons change.

---

## 5. System Data Flow

```
[Student / Teacher Interaction]
        |
        +---> Registers Profile (Biometrics, Region, Preferences) ------> [users]
        |
        +---> Completes Field Tests (Push-ups, Sprint, Reach) ----------> [assessments]
        |
        +---> (Optional) Uploads Silhouette / Posture Image -----------> [physiqueImages]
        |                                                                      |
        v                                                                      v
+----------------------------------------------------------------------------------+
|                              RECOMMENDATION ENGINE                               |
|                     (Heuristic Benchmarks + Multimodal AI)                       |
+----------------------------------------------------------------------------------+
        |                                                  |
        v                                                  v
[Active Training Protocol]                       [Tailored Nutritional Plan]
        |                                                  |
        v                                                  v
 [workoutPlans]                                       [dietPlans]
        |
        v
[Daily Session Execution]
        |
        v
  [workoutLogs] ---------------------------------------------+
        |                                                    |
        v                                                    v
[Re-Assessment Phase (1-3 Mo)]                [Adaptive Feedback Loop]
        |                                                    |
        v                                                    |
  [assessments]                                              |
        |                                                    |
        +----------------------------------------------------+
        |
        v
+----------------------------------------------------------------------------------+
|                            TALENT-DISCOVERY PIPELINE                             |
|          (Longitudinal Slope, Comparative Peer Analysis, Strengths)              |
+----------------------------------------------------------------------------------+
        |
        v
[Student Potential Profile & Athletic Discipline Guidance]
```

---

## 6. AI Recommendation Data Flow

The recommendation cycle operates as an adaptive closed-loop system:

```
+---------------------------------------------------------------------+
|                          INPUT INGESTION                            |
| 1. Profile Context: Age, Gender, Region, Diet Preference, Goal     |
| 2. Recent Assessment: Raw stats (e.g., 50m sprint in 7.2s)          |
| 3. Longitudinal Logs: 4-week compliance % & reported fatigue (RPE)  |
| 4. Optional Physique Analysis: Structural symmetry & posture notes  |
+---------------------------------------------------------------------+
                                   |
                                   v
+---------------------------------------------------------------------+
|                         AI SYNTHESIS ENGINE                         |
| - Compares current metrics against physiological recovery curves    |
| - Identifies deficient movement patterns vs. explosive strengths    |
| - Selects affordable, locally accessible food substitutes (India)    |
| - Designs micro-cycles balancing progressive overload & rest        |
+---------------------------------------------------------------------+
                                   |
                                   v
+---------------------------------------------------------------------+
|                          OUTPUT ARTIFACTS                           |
| -> Generates/Updates WorkoutPlan (No-equipment or school-ground)    |
| -> Generates/Updates DietPlan (High-protein regional staples)       |
| -> Suggests corrective habit cues                                   |
+---------------------------------------------------------------------+
                                   |
                                   v
+---------------------------------------------------------------------+
|                            FEEDBACK LOOP                            |
| Student logs sessions -> Adherence tracked -> Engine recalibrates   |
+---------------------------------------------------------------------+
```

---

## 7. Talent-Discovery Data Flow

The talent-discovery engine is deliberately structured around **longitudinal velocity and adaptation rate**, rather than single-session test performance or genetic profiling.

```
       [Assessment T0]           [Assessment T1]           [Assessment T2]
         (Baseline)                 (Month 2)                 (Month 4)
              \                         |                         /
               \                        |                        /
                v                       v                       v
       +----------------------------------------------------------------+
       |               LONGITUDINAL TELEMETRY NORMALIZATION             |
       | - Normalizes against age, gender, and regional elevation/tier   |
       | - Extracts delta scores: ΔSpeed, ΔStrength, ΔFlexibility       |
       | - Evaluates training consistency from workoutLogs               |
       +----------------------------------------------------------------+
                                       |
                                       v
       +----------------------------------------------------------------+
       |                 TALENT INCLINATION EVALUATION                  |
       |                                                                |
       | Checks rate of adaptation (Velocity of Improvement):           |
       |  * High baseline + steep sprint slope   -> Fast-Twitch Profile |
       |  * High aerobic recovery + high stamina -> Endurance Profile   |
       |  * High flexibility + spatial agility   -> Coordination Profile|
       +----------------------------------------------------------------+
                                       |
                                       v
       +----------------------------------------------------------------+
       |                     NURTURING OUTPUTS                          |
       | (NO binary "talent=true"; strictly constructive indicators)    |
       |                                                                |
       | 1. Potential Strength Area: e.g., "Middle-Distance Athletics"   |
       | 2. Improvement Trajectory: e.g., "Top 8% progression in 600m"  |
       | 3. Sport Suitability Guidance: e.g., "Sprint events, Kho-Kho,   |
       |    Football Winger, Wrestling"                                 |
       +----------------------------------------------------------------+
```

### Key Talent-Discovery Guardrails
1. **No Absolute Determinism:** The system does not classify candidates as "untalented". If improvement is slow, the engine adjusts recovery and nutrition recommendations rather than discouraging the student.
2. **Rural Normalization:** Recognizes that students without specialized track-and-field equipment or synthetics tracks may have untapped capacity; rate of improvement under standard exercises is prioritized over absolute scores.
3. **Teacher Verification:** Insights are provided to physical education instructors to facilitate official scouting or scholarship applications (e.g., Khelo India, sports academies).

---

## 8. Decisions Made

1. **Separation of Raw Measurements from Computed Scores:**
   - Raw measurements (`pushUps`, `runTimeSeconds`, `flexibilityCm`) are preserved indefinitely in `assessments`.
   - Scores (`strength`, `endurance`, etc.) are computed outputs. This avoids data obsolescence when scoring standards or age-graded percentile curves are updated in future releases.
2. **External Media Storage (No Large Binaries in MongoDB):**
   - Images will reside in dedicated object storage (e.g., S3-compatible, Cloudinary).
   - Only URLs, storage keys, and AI-derived observational summaries are stored in the database, avoiding MongoDB document bloat and memory pressure.
3. **Non-Medical Posture/Conditioning Assessment:**
   - Visual AI processing will explicitly avoid medical diagnostics, body fat percentages, or clinical disorder detection. It serves solely as an assistive feedback tool for posture and general conditioning.
4. **Omission of Redundant Progress Collections:**
   - Progress is a function of time across `assessments` and `workoutLogs`. Calculating deltas dynamically prevents desynchronization bugs and unnecessary schema maintenance.
5. **Privacy-Preserving Regional Geography:**
   - Location is bounded strictly to state and district level. Precise GPS coordinates are excluded to safeguard minor students' privacy and security.
6. **ES Modules & Modular Node.js Architecture:**
   - Retaining the native ES Module standard (`"type": "module"`) established in Step 3.

---

## 9. Open Architectural Questions & Future Considerations

1. **Cloud Object Storage Vendor Selection:**
   - *Consideration:* Which storage engine best aligns with cost constraints and regional latency in India? (AWS S3 AP-South-1, Cloudinary, Firebase Storage, or Supabase Storage).
2. **Offline-First Synchronization for Rural Schools:**
   - *Consideration:* Many rural school playgrounds lack continuous internet connectivity. How should local batch assessment records be queued on mobile/client devices before syncing with the central API?
3. **Institutional Multi-Tenancy (School & Teacher Hierarchies):**
   - *Consideration:* Should an explicit `schools` or `classes` collection be introduced in Step 5/6 to support teacher-led batch roster management, or can this initially be modeled through a simple `teacherId` / `institutionCode` field on `users`?
4. **Recommendation Persistence vs. Ephemeral Generation:**
   - *Consideration:* Should AI-generated workout and diet plans replace existing records in place, or maintain an immutable history in a dedicated `recommendations` audit table for ML model evaluation and retrospective review?
5. **AI API Rate Limiting & Cost Mitigation:**
   - *Consideration:* Because Gemini multimodal API calls carry latency and quota considerations, what caching or asynchronous queueing mechanism (e.g., BullMQ or MongoDB processing queues) should handle physique image batch analysis?
