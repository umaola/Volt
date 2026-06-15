VOLT User App Flow Document

Product Vision
Volt helps electricity consumers understand, predict, and optimize their electricity usage.
The app transforms electricity from a confusing utility into a measurable and manageable resource.
1. Entry Points
Users can enter Volt through:
First-Time User
Install App
Open App
Returning User
Open App
Tap Notification
Open Widget
Acquisition Channels
App Store
Play Store

2. First-Time User Flow
Splash Screen
Goal
Introduce Volt's value.
Screen 1
Know Your Power
Track every electricity unit and understand where it goes.
Screen 2
Never Run Out Unexpectedly
Volt predicts how long your units will last before they finish.
Screen 3
Use Electricity Smarter
Get insights that help you save money and reduce waste.

Action:
Get Started

3. Authentication Flow
Sign Up
Options:
Phone Number
Email
Collect the full name and Password should be set. A password criterion should be displayed below the password input and should be checked upon entering a password.
OTP Verification
↓
Account Created
↓
Onboarding
4. Onboarding Flow
This is the most important flow because it determines prediction accuracy.

Step 1: Input Meter number and Meter Number Verification 
Input:
Input your Meter Number

When a meter number is imputed, the system automatically verifies the meter Number and shows the Name of the Meter Number below the input field.

Example:
0127217047315


Step 2: Select Distribution Company
Question:
Select your distribution company.

Examples:
EKEDP
IKEDC
EEDC
AEDC
IBEDC
Step 3: Select Tariff Band
Question:
What tariff band are you on?

Options:
Band A
Band B
Band C
Band D
Band E

Step 4: Meter Type
Question:
What type of meter do you use?

Options:
Prepaid
Postpaid
Step 5: Add Appliances
Users choose appliances.
Examples:
Refrigerator
Air Conditioner
Fan
TV
Iron
Microwave

For each appliance:
Users have the ability to calibrate the amount of watts different from the system's given watt measurement.
Step 6: Current Unit
Question:
What is your Current Remanining Unit?

Example:
300
5. Dashboard Flow (Home)
This becomes the most visited screen.
Top Section
Greeting
Good Morning, Amarachi
Electricity Health Card
Displays:
Units Remaining
18.4 kWh

Days Remaining
4 Days Left

Daily Consumption
4.3 kWh/day

Quick Actions
Buttons:
Units Calculator
Log Outage
Add Appliance
View Insights
Today's Electricity
Shows:
Power Available Today

Example:
13 Hours
Usage Trend
Graph:
Daily Consumption
Weekly Consumption
6. Recharge Flow
Users want to know:
How many units will I get?

User taps:
Calculator
Input:
Amount
Example:
₦10,000
System automatically knows:
Disco
Tariff Band

Output:
Estimated Units: 47.7 kWh

Secondary Insight:
This should last approximately 9 days.
Action:
Save Recharge
7. Recharge Logging Flow
After purchasing electricity.
User enters:
Amount
Units Received
Purpose:
Improve the prediction engine.
System updates:
Current units
Burn rate
Forecast
8. Power Availability Flow
One of Volt's unique features.
User taps:
Log Outage
State:
Power ON
User presses:
Light Came Back

Power OFF
User presses:
Light Went Off

Volt records:
Timestamp


System calculates:
Daily Supply Hours

Dashboard updates automatically.
9. Appliance Management Flow
Settings
↓
My Appliances
↓
Appliance List
Each appliance shows:
Name
Wattage
Hours Used
Actions:
Add Appliance
Edit Appliance
Delete Appliance
10. Consumption Analysis Flow
Dashboard
↓
Insights
Screen Displays:
Biggest Energy Consumer
Example:
Air Conditioner
48% of usage


Most Efficient Appliance
Example:
Standing Fan
5% of usage


Weekly Trend
Example:
+18% increase


11. Prediction Flow
This becomes Volt's "magic moment."
System continuously predicts:
Remaining Days
4 Days Left


Suggested Recharge
Recharge ₦8,000 this week

Monthly Projection
Expected Monthly Cost:
₦27,000

12. Notification Flow
Inspired by FLO's engagement model.
Morning Notification
How many hours of light did you have yesterday?

Evening Notification
Don't forget to log your electricity usage.

Low Unit Alert
Your units may finish within 48 hours.

Prediction Alert
Based on your pattern, recharge by Thursday.

Weekly Summary
You used 14% less electricity this week.

13. History Flow
Dashboard
↓
History

Sections:
Recharge History
Date
Amount
May 2
₦5,000
May 15
₦10,000


Usage History
Daily consumption logs.
Outage History
Power availability logs.

14. Profile & Settings Flow
Contains:
Account
Name
Phone Number

Electricity Profile
Meter Number
Disco
Band
Meter Type

Notifications
User can enable:
Daily reminders
Low-unit alerts
Bi-Weekly reports
Privacy
Manage stored data.

15. Future Smart Features Flow
Community Outage Map
Users nearby report outages.
↓
Volt shows:
87 users near you currently have no power.


AI Energy Coach
Example:
Your AC consumes 52% of your electricity.

Reducing usage by 2 hours daily could save approximately ₦4,500 monthly.

Complete Navigation Structure
SPLASH
   ↓
AUTH
   ↓
ONBOARDING
   ↓
HOME DASHBOARD
   ├── Recharge Calculator
   ├── Log Recharge
   ├── Log Outage
   ├── Insights
   ├── History
   ├── Appliances
   └── Settings

North-Star User Journey
The ideal Volt user journey is:
Install App
    ↓
Add Electricity Profile
    ↓
Add Appliances
    ↓
Log Recharge
    ↓
Track Daily Usage
    ↓
Receive Smart Notifications
    ↓
Get Predictions
    ↓
Develop Better Energy Habits


