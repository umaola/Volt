# VOLT IMPLEMENTATION PLAN





# DEVELOPMENT RULES

## Rule 1

Never build UI without corresponding models.

---

## Rule 2

Never build screens before defining navigation.

---

## Rule 3

Never build API endpoints before database schema.

---

## Rule 4

Every feature must include:

* Database schema
* API endpoints
* State management
* UI
* Validation
* Error handling

---

## Rule 5

Every module must be tested before moving forward.






# PHASE 1

## PROJECT FOUNDATION

## Step 1

Create Design System

Implement:

* Colors
* Typography
* Buttons
* Inputs
* Cards
* Navigation

Using Volt Design System Documentation.

Deliverable:

Reusable component library

---

## Step 2

Setup Routing

Create:

```text
Splash
Login
Onboarding
Subscription
Dashboard
Calculator
Insights
Profile
```

Deliverable:

Navigation working

---


# PHASE 2

## AUTHENTICATION


## Build

Phone Authentication

Using Firebase OTP

## Screens

* Login
* Verify OTP


## Backend

User creation endpoint

---

## Deliverable

User can register and login

---

# PHASE 3

## ONBOARDING FLOW

## Screen 1

Select Distribution Company

Options:

* EKEDP
* IKEDC
* AEDC
* EEDC
* Others

---

## Screen 2

Select Tariff Band

Band A-E

---

## Screen 3

Meter Type

* Prepaid
* Postpaid

---


## Screen 4

Current Credit Unit


---

## Deliverable

Electricity profile saved

---

# PHASE 4

## SUBSCRIPTION SYSTEM

## Build Paystack Integration

---

## Create Plans

Monthly:

₦500

Annual:

₦5,800

---

## Trial

30 Days

Requires card collection

---

## Screens

### Subscription Intro

Explain:

* Free trial
* Cancel anytime
* Billing date

---

### Payment Method Screen

Collect card

---

### Trial Started Screen

Success state

---

## Backend

Tables:

```text
subscriptions
payment_methods
payment_transactions
```

---

## Webhooks

Handle:

* Payment success
* Payment failure
* Subscription cancellation

---

## Deliverable

Trial activation works

---

# PHASE 5

## HOME DASHBOARD

## Build Dashboard

Sections:

### Electricity Summary

* Units Remaining
* Days Remaining

---

### Today's Supply

Hours available

---

### Quick Actions

* Add Recharge
* Log Outage
* Calculator

---

### Recent Activity

---

Deliverable

Functional dashboard

---

# PHASE 6

## UNIT CALCULATOR

## Inputs

Amount

---

## Outputs

Units

Estimated Duration

---

## Formula

```text
Units = Amount ÷ Tariff Rate
```

---

## Deliverable

Calculator works

---

# PHASE 7

## RECHARGE LOGGING

## Build

Add Recharge

Fields:

* Amount
* Units Received
* Date

---

## Backend

Create recharge records

---

## Deliverable

Recharge history working

---

# PHASE 8

## APPLIANCE TRACKING

## Appliance Catalog

Preload:

* Fan
* TV
* Refrigerator
* AC
* Iron

---

## Features

Add Appliance

Edit Appliance

Delete Appliance

---

## Consumption Formula

```text
(wattage × hours) ÷ 1000
```

---

## Deliverable

Consumption estimates working

---

# PHASE 9

## POWER SUPPLY TRACKING

## Features

Power On

Power Off

---

## Data

Track:

* Start time
* End time
* Duration

---

## Deliverable

Daily supply hours visible

---

# PHASE 10

## NOTIFICATION SYSTEM

## Infrastructure

Firebase

## Notification Types

Trial Ending

Recharge Reminder when unit is less than 11 units.

Low Units when unit is less than 20 units.

Bi- Weekly Summary of usage

Prediction Alerts

---

## Deliverable

Push notifications functioning

---

# PHASE 11

## HISTORY MODULE


## Tabs

Recharge History

Power History

Usage History

---

## Deliverable

Historical records visible

---

# PHASE 12

## INSIGHTS ENGINE V1

## Build

Daily Usage

Weekly Usage

Monthly Usage

## Generate

Simple insights

Example:

"You used 15% more electricity this week."

---

## Deliverable

Insights page functional

---

# PHASE 13

## PROFILE MODULE

## Features

Edit Profile: Phone Number, Meter Number, Tarriff Band, Meter Type

Subscription Management

Notification Preferences

Logout

---

## Deliverable

Profile complete

---

# PHASE 14

## ANALYTICS

## Track

Signups

Trial Starts

Subscriptions

Calculator Usage

Recharge Logs

Notifications Opened

---


## Deliverable

Analytics dashboard receiving events

---

# PHASE 15

## TESTING

## Unit Tests

Core calculations

---

## Integration Tests

Authentication

Payments

Notifications

---

## UI Tests

Critical flows

---

## Deliverable

Stable release candidate

---

# PHASE 16

## APP STORE PREPARATION


## Configure

Android Release Build

iOS Release Build

---

## Deliverable

Store-ready application

---

# MVP RELEASE CHECKLIST

Before launch verify:

✓ Authentication works

✓ Onboarding works

✓ Subscription works

✓ Trial works

✓ Auto-renewal works

✓ Dashboard loads

✓ Calculator works

✓ Recharge logging works

✓ Appliance tracking works

✓ Outage tracking works

✓ Notifications work

✓ Analytics work

✓ Crash reporting works

✓ Payment webhooks work

✓ Profile management works


