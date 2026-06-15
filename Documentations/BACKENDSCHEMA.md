VOLT Backend Database Schema
High-Level Architecture
Users
 ├── Electricity Profiles
 ├── Meters
 ├── Recharges
 ├── Appliances
 ├── Appliance Usage Logs
 ├── Power Supply Logs
 ├── Consumption Logs
 ├── Predictions
 ├── Notifications
 └── Analytics Events


1. Users
Stores account information.
users
id UUID PRIMARY KEY
phone VARCHAR(20) UNIQUE
email VARCHAR(255)
full_name VARCHAR(255)

auth_provider VARCHAR(50)

profile_image TEXT

is_active BOOLEAN

created_at TIMESTAMP
updated_at TIMESTAMP


2. Electricity Profile
A user may change location, disco, or tariff band over time.
electricity_profiles
id UUID PRIMARY KEY

user_id UUID

disco_id UUID

tariff_band VARCHAR(5)

meter_type VARCHAR(20)

household_size INTEGER

state VARCHAR(100)

city VARCHAR(100)

created_at TIMESTAMP
updated_at TIMESTAMP


3. Distribution Companies
Supports all Nigerian discos.
discos
id UUID PRIMARY KEY

name VARCHAR(100)

short_name VARCHAR(20)

website TEXT

created_at TIMESTAMP

Example:
EKEDP
IKEDC
EEDC
AEDC
IBEDC
JEDC
KEDCO


4. Tariff Rates
Tariffs change frequently.
Never hardcode them.
tariff_rates
id UUID PRIMARY KEY

disco_id UUID

band VARCHAR(5)

rate_per_kwh NUMERIC(10,2)

effective_date DATE

is_active BOOLEAN

created_at TIMESTAMP

Example:
EKEDP
Band A
209.50


5. Meters
Many households may have multiple meters.
meters
id UUID PRIMARY KEY

user_id UUID

meter_number VARCHAR(50)

meter_type VARCHAR(20)

nickname VARCHAR(100)

current_units NUMERIC(10,2)

created_at TIMESTAMP
updated_at TIMESTAMP

Examples:
Home Meter
Shop Meter
Office Meter


6. Recharge History
Core Volt dataset.
recharges
id UUID PRIMARY KEY

user_id UUID

meter_id UUID

amount_paid NUMERIC(10,2)

units_received NUMERIC(10,2)

tariff_rate NUMERIC(10,2)

purchase_date TIMESTAMP

source VARCHAR(50)

created_at TIMESTAMP

Source:
Manual
Bank App
USSD
Disco Portal

7. Appliance Library
Master list.
appliance_catalog
id UUID PRIMARY KEY

name VARCHAR(255)

category VARCHAR(100)

default_wattage INTEGER

created_at TIMESTAMP

Examples:
Fan
Air Conditioner
Refrigerator
TV
Microwave

8. User Appliances
Customized appliance data.
user_appliances
id UUID PRIMARY KEY

user_id UUID

appliance_id UUID

custom_wattage INTEGER

quantity INTEGER

hours_per_day NUMERIC(5,2)

is_active BOOLEAN

created_at TIMESTAMP
updated_at TIMESTAMP


9. Appliance Usage Logs
Daily tracking.
appliance_usage_logs
id UUID PRIMARY KEY

user_appliance_id UUID

usage_date DATE

hours_used NUMERIC(5,2)

estimated_kwh NUMERIC(10,2)

created_at TIMESTAMP


10. Power Supply Logs
One of Volt's most valuable datasets.
power_supply_logs
id UUID PRIMARY KEY

user_id UUID

power_on TIMESTAMP

power_off TIMESTAMP

duration_hours NUMERIC(5,2)

source VARCHAR(50)

created_at TIMESTAMP

Source:
Manual
Smart Meter
Community Detection


11. Daily Consumption
Stores calculated usage.
daily_consumption
id UUID PRIMARY KEY

user_id UUID

date DATE

units_used NUMERIC(10,2)

remaining_units NUMERIC(10,2)

burn_rate NUMERIC(10,2)

created_at TIMESTAMP


12. Remaining Unit Forecasts
Prediction engine output.
predictions
id UUID PRIMARY KEY

user_id UUID

prediction_type VARCHAR(100)

predicted_value NUMERIC(10,2)

confidence_score NUMERIC(5,2)

prediction_date TIMESTAMP

expires_at TIMESTAMP

Examples:
Days Remaining
Monthly Cost
Recommended Recharge


13. Notifications
Critical because Volt will send millions.
notifications
id UUID PRIMARY KEY

user_id UUID

title VARCHAR(255)

body TEXT

notification_type VARCHAR(50)

status VARCHAR(20)

sent_at TIMESTAMP

opened_at TIMESTAMP

created_at TIMESTAMP

Status:
Queued
Sent
Opened
Failed

14. Notification Preferences
notification_preferences
id UUID PRIMARY KEY

user_id UUID

daily_reminders BOOLEAN

low_unit_alerts BOOLEAN

weekly_reports BOOLEAN

prediction_alerts BOOLEAN

quiet_hours_start TIME

quiet_hours_end TIME

updated_at TIMESTAMP


15. Community Outages (Future)
Power users community feature.
outage_reports
id UUID PRIMARY KEY

user_id UUID

state VARCHAR(100)

city VARCHAR(100)

latitude NUMERIC(10,6)

longitude NUMERIC(10,6)

outage_start TIMESTAMP

outage_end TIMESTAMP

created_at TIMESTAMP


16. Analytics Events
This table feeds machine learning.
analytics_events
id UUID PRIMARY KEY

user_id UUID

event_name VARCHAR(100)

event_properties JSONB

occurred_at TIMESTAMP

Examples:
{
  "event":"recharge_created",
  "amount":5000
}

{
  "event":"notification_opened",
  "type":"low_unit_alert"
}


17. AI Feature Store (Future)
Do not build now.
Prepare for it.
user_features
id UUID PRIMARY KEY

user_id UUID

average_daily_usage NUMERIC(10,2)

average_supply_hours NUMERIC(10,2)

average_monthly_spend NUMERIC(10,2)

recharge_frequency_days NUMERIC(10,2)

prediction_accuracy NUMERIC(10,2)

updated_at TIMESTAMP


Entity Relationships
USER
 │
 ├── ELECTRICITY PROFILE
 │
 ├── METER
 │      │
 │      └── RECHARGES
 │
 ├── USER APPLIANCES
 │      │
 │      └── APPLIANCE USAGE LOGS
 │
 ├── POWER SUPPLY LOGS
 │
 ├── DAILY CONSUMPTION
 │
 ├── PREDICTIONS
 │
 ├── NOTIFICATIONS
 │
 ├── NOTIFICATION PREFERENCES
 │
 └── ANALYTICS EVENTS

Additional Tables I Strongly Recommend
For a production-ready Volt MVP, also add:
audit_logs
Track sensitive changes.
app_versions
Force app upgrades when tariffs change.
tariff_update_history
Maintain a complete tariff history for all DisCos.
device_tokens
Store FCM tokens separately from users.
id UUID PRIMARY KEY
user_id UUID
device_token TEXT
platform VARCHAR(20)
last_active TIMESTAMP

This schema gives Volt a solid foundation for:
Recharge tracking
Appliance-based consumption estimation
Outage monitoring
Daily engagement notifications
Machine-learning predictions
Community power intelligence
Multi-meter households
Multi-DisCo support across Nigeria
without needing a major database redesign as the product grows.

