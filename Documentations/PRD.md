#VOLT — PRODUCT REQUIREMENTS DOCUMENT (PRD)
1. Product Overview
Product Name: Volt
Category: Energy Intelligence / Utility Tracking
Platform: Mobile App (MVP)
Problem Statement
Electricity consumption in Nigeria is:
Unpredictable (inconsistent supply)
Expensive (especially Band A users)
Opaque (users don’t understand units vs cost)
Users cannot answer simple questions like:
“How many units will ₦5,000 give me?”
“Which appliance is draining my units?”
“Why does my unit finish fast?”

Solution

Volt provides:
Real-time electricity unit tracking
Smart estimation of usage
Tariff-aware calculations
Appliance-level insights

2. Key Objectives
Help users predict electricity units
Help users track usage daily
Help users optimize consumption
Build a data layer for Nigerian electricity behavior

3. Core Concepts 
3.1 Electricity Unit Definition
1 Unit = 1 kWh (Kilowatt-hour)
3.2 Tariff System (Nigeria - EKEDP Model)
Electricity pricing is based on Service Bands (A–E):
Band
Supply Hours
Avg Rate (₦/kWh)
A
20+ hrs
₦209.50
B
16+ hrs
₦61–64
C
12+ hrs
₦48–52
D
8+ hrs
₦32–43
E
4+ hrs
₦32–43


Important:
Higher band = more supply + higher cost
Rates may vary slightly by Disco (EKEDP, IKEDC, etc.)
VAT (~7.5%) is already embedded in many rates 

4. Core Features
4.1 Electricity Unit Calculator (CORE MVP)
Feature Description
User inputs:
Amount (₦)
Tariff Band
System outputs:
Estimated Units (kWh)
Calculation Formula
Units (kWh) = Amount Paid (₦) ÷ Tariff Rate (₦/kWh)

Example
₦5,000 on Band A (₦209.50/kWh):
Units = 5000 / 209.5 ≈ 23.87 kWh

Extended Calculation (With Charges)
Effective Rate = Base Tariff × (1 + VAT)

Units = Amount / Effective Rate

PRD Requirements
Meter number Input validation
Band selector (A–E)
Auto rate update 
Instant result display
4.2 Appliance-Based Consumption Tracker
Feature Description
Users add appliances and usage habits or hours.
Appliance Consumption Formula
Energy (kWh) = (Wattage × Hours Used) / 1000

Example
Fan: 75W × 12hrs
= (75 × 12) / 1000 = 0.9 kWh/day

Monthly Consumption
Monthly kWh = Daily kWh × 30
Cost Calculation
Cost = kWh × Tariff Rate

PRD Requirements
Appliance library (AC, fridge, TV, iron, etc.)
Editable wattage
Daily usage input
Auto cost estimation
4.3 Unit Burn Rate (Smart Tracking)
Feature Description
Tracks how fast units are depleting.
Formula
Burn Rate = Total Units Used ÷ Time (days)

Prediction
Remaining Days = Remaining Units ÷ Burn Rate
Example
20 kWh used in 5 days:
Burn Rate = 4 kWh/day

PRD Requirements

Daily tracking graph
Allow for manual calibration of remaining units for better prediction.
Predict “days remaining.”
Alerts when usage spikes
4.4 NEPA Supply Tracking (CRITICAL FOR NIGERIA)
Feature Description
Track power availability.
Inputs
Manual toggle (Light ON/OFF)
Future: IoT / smart meter
Metrics
Hours of supply per day
Compare with band expectation:
Band A → 20 hrs
Band D → 8 hrs
Insight Engine
Expected Supply vs Actual Supply

Use Case
Detect under-delivery by Disco
Validate tariff fairness
For future accurate predictions
4.5 Smart Alerts & Insights
Types of Alerts
“Your units will finish in 2 days”
“Your AC is consuming 45% of your electricity.”
“You are using more than last week.”
“Was the light on yesterday?”
“There is a general power outage from gtid collapse”
Insights (Future)
Suggest cheaper usage patterns
Suggest optimal purchase amount
4.6 Multi-Disco Support
Volt should support:
EKEDP
IKEDC
EEDC
Others
Data Model
Disco
- Name
- Tariff Bands
- Rates
- Last Updated

5. Factors Affecting Electricity in Nigeria (Must Be Modeled)
This is where Volt becomes powerful.
5.1 Tariff Band Allocation
Based on feeder, not user's choice
Determines cost + supply
5.2 Supply Instability
Power outages
Load shedding
5.3 Appliance Efficiency
Old appliances consume more
5.4 Voltage Fluctuation
Low voltage → higher consumption time
5.5 Behavioral Patterns
Night vs day usage
AC vs fan usage
5.6 Tariff Adjustments
Inflation
FX rates
Gas prices 
6. Data Model (Simplified)
User
id
Location
Meter _id
disco
tariff_band
Meter
meter_id
user_id
current_units
last_purchase_amount
Appliance
name
wattage
usage_hours
Usage Log
date
units_consumed
hours_of_supply


7. MVP Scope (Build This First)
Unit Calculator
Appliance Tracker
Burn Rate + Prediction
Basic Dashboard
8. Future Features
Bill Payment
Community outage map
AI energy advisor
Bill prediction engine
9. Success Metrics
Daily active users
Avg session time
% users tracking appliances
Prediction accuracy
Retention rate
10. Edge Cases to Handle
Tariff changes
Incorrect band selection
Shared meters
Estimated vs actual units mismatch
11. Technical Notes
Backend must support:
Meter number verification
Dynamic tariff updates
Regional configs
Offline-first capability (important in Nigeria)
Lightweight mobile optimization

