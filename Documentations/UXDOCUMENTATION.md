Here is the comprehensive Markdown documentation formatted specifically for an AI development agent. It translates the UX strategies into structured logic, conditional triggers, and state management rules required for implementation.

You can copy and paste this directly into your agent's context window or your project repository.

---

# VOLT: Product Requirements & Logic Documentation

**Version:** 1.0.0
**Context:** Nigerian Electricity Grid Management App
**Core UX Strategy:** Context-Aware Adaptation & Social Utility Gamification

## System Architecture Overview

The system relies on transitioning users seamlessly between two primary states:

1. `GRID_ACTIVE` (Stable Power Mode)
2. `GRID_DOWN` (Survival/Outage Mode)

All push notifications, UI renders, and gamification loops are conditionally dependent on the user's localized grid state.

---

## Feature 1: Historical Data Export

**Objective:** Allow users to download their historical data (consumption, outage logs) in PDF format to aid in DisCo disputes or personal auditing.

### 1.1 Logic & Triggers

* **Endpoint / Action:** `GET /user/{id}/export`
* **Data Payload:** * `user_profile` (Name, Meter Number, Registered Address)
* `outage_history` (Timestamps of reported vs. actual grid downtime over the last 30/60/90 days)
* `community_impact` (Total reports validated, total neighbors warned)


* **Execution:** System compiles the payload into a structured PDF document, stores temporarily, and returns a secure download URI to the client.

---

## Feature 2: Transformer-Level Grid Monitoring

**Objective:** Gamify grid monitoring by relying on crowdsourced data to reduce individual logging friction.

### 2.1 Logic & Triggers (The Rule of Three)

* **State Variables:** `user_location` (GPS or registered neighborhood), `timestamp`
* **Event:** User presses "Report Outage" button.
* **Validation Logic:** ```text
IF system receives >= 3 'Outage' events
FROM distinct user_ids
WHERE location is within the same localized cluster (e.g., matching neighborhood ID or 1km radius)
AND time_window is <= 15 minutes
THEN update localized_grid_state = GRID_DOWN
```

```



### 2.2 Broadcast Logic

* **Event:** `localized_grid_state` changes to `GRID_DOWN`
* **Execution:** Trigger an asynchronous broadcast job.
```text
FIND users WHERE distance(user_location, outage_epicenter) <= 600km
AND user_id NOT IN (reporting_user_ids)
SEND push_notification: "Grid Failure Detected: Power has tripped in your region."

```


* *Implementation Note for Agent:* Expose the `600km` variable in the admin config so it can be dynamically adjusted downward (e.g., to 5km or 10km) if notification fatigue occurs.

---

## Feature 3: Community Hero Metrics

**Objective:** Replace guilt-driven daily streaks (Duolingo model) with social utility metrics (Waze model).

### 3.1 Logic & Triggers

* **State Variables:** `impact_score`, `neighbors_warned`
* **Event:** A user's manual outage report is validated by the "Rule of Three" (Section 2.1).
* **Execution:**
1. Calculate `affected_users` (number of users who received the broadcast within the radius).
2. Increment the reporting user's `neighbors_warned` metric by `affected_users`.
3. Delay push notification to the reporter by 5-10 minutes (to avoid interrupting their immediate physical response to the outage).
4. **Push Notification Payload:** `"Your report just notified {affected_users} people in {user_neighborhood} that the grid is down. You saved them from wasting fuel today."`



---

## Feature 4: Predictive Notifications

**Objective:** Use historical data to anticipate grid failures and send context-aware preparation alerts.

### 4.1 Logic & Triggers

* **Cron Job:** Run a daily analysis algorithm for each neighborhood cluster.
* **Validation Logic:**
```text
IF historical_outage_probability(neighborhood, day_of_week, time_of_day) > 75%
THEN schedule predictive_alert

```


* **Execution:** Send push notification 60 minutes prior to the high-probability trip time.
* **Push Notification Payload:** `"Historically, power in your zone trips around {predicted_time}. Charge your devices and pump water now."`

---

## Feature 5: The "Surge Checklist"

**Objective:** Pull users into the app the moment power is restored by leveraging the psychological need for task completion (urgency).

### 5.1 Logic & Triggers

* **State Variables:** `localized_grid_state` changes from `GRID_DOWN` to `GRID_ACTIVE` (triggered by community reports or smart meter API).
* **Execution:** Immediate push notification to users in that cluster.
* **Push Notification Payload:** `"Power is back. Maximize your window."`
* **UI Routing:** Tapping the notification must deep-link directly to the `Surge_Checklist_View`.

### 5.2 UI/UX Rules for Surge Checklist

* **Component:** Render a customizable list of high-draw appliances (Pump Water, Charge Inverter, Turn on Freezer, Iron Clothes).
* **Interaction:** Requires large, tactile toggle buttons.
* **Feedback:** System must provide immediate visual/haptic feedback upon checking an item (to trigger the task-completion dopamine hit).

---

## Feature 6: The "Grid Lifespan" Predictor

**Objective:** Leverage variable rewards by giving users a highly localized AI prediction of how long the current power session will last.

### 6.1 Logic & Triggers

* **Event:** `localized_grid_state` becomes `GRID_ACTIVE`.
* **Execution:** System calculates the `estimated_duration` based on a rolling average of the last 7 days of stable power windows for that specific neighborhood cluster.

### 6.2 UI/UX Rules for Grid Lifespan Predictor

* **Component:** Render a visual timer or progress bar on the `Home_Dashboard_View`.
* **Display Text:** `"Based on your neighborhood's history this week, you likely have {estimated_duration_hours} hours and {estimated_duration_minutes} minutes of stable power."`
* **State Updates (Visual):**
```text
IF time_remaining > 50% THEN progress_bar_color = Safe/Green
IF time_remaining <= 50% AND > 15% THEN progress_bar_color = Warning/Yellow
IF time_remaining <= 15% THEN progress_bar_color = Critical/Red

```


* **Behavior:** The countdown ticks down in real-time while the app is open to encourage frequent check-ins.