VOLT SUBSCRIPTION SYSTEM DOCUMENTATION
1. Overview
Volt operates on a freemium-trial-to-paid subscription model:
Pricing
Monthly Plan: ₦500/month
Annual Plan: ₦5,800/year
Free Trial: 30 days
Requirement: Card details required at signup
Billing: Auto-renewal after trial unless cancelled
2. Subscription Model Type
Model
“Card-on-file Free Trial Subscription (Auto-Renewing)”
This is similar to:
Netflix trial system
Spotify subscription model
Notion paid trial structure
3. Core Subscription Rules
Rule 1: Trial Activation
User must enter valid card details at registration
Trial starts immediately after onboarding completion
No payment is charged initially
Rule 2: Trial Duration
30 calendar days from activation timestamp
Rule 3: Auto-Renewal
On day 31:
Charge ₦500 automatically (monthly plan default)
OR ₦5,800 if user selected annual plan
Rule 4: Cancellation
Users can cancel anytime:
During trial → No charge
Before renewal → No charge
After renewal → Active until end of billing period
Rule 5: Upgrade / Switch Plan
Users can:
Switch Monthly → Annual (pro-rated optional future feature)
Switch Annual → Monthly (applies next cycle)
4. Subscription States (VERY IMPORTANT)
TRIALING → ACTIVE → PAST_DUE → CANCELLED → EXPIRED

State Definitions
TRIALING
User has not been charged
Full access granted
ACTIVE
Payment successful
Subscription running
PAST_DUE
Payment failed
Retry billing
CANCELLED
User cancelled subscription
Access continues until period ends
EXPIRED
Subscription ended with no renewal

5. Place in App Flow (UX DESIGN INTEGRATION)
Subscription is NOT a payment screen. It is a gate inside onboarding + app entry system.

5.1 Entry Flow (First-Time User)
Splash Screen
   ↓
Sign Up
   ↓
OTP Verification
   ↓
Electricity Profile Setup
   ↓
 PAYMENT SETUP (CRITICAL STEP)
   ↓
Start Free Trial
   ↓
Home Dashboard


5.2 Payment Setup Screen (Before Trial Starts)
Screen Title:
“Start Your 30-Day Free Trial”
Content:
₦500/month after trial
₦5,800/year option
Cancel anytime

Required Action:
Add Card

UX Principle:
User does NOT “buy subscription” here.
They are:
“unlocking access to Volt trial”

After Card Entry:
Validate card
Authorize ₦0 or small verification hold (₦50–₦100 optional)
Start trial

5.3 In-App Subscription Visibility
Inside app:
Profile Section → Subscription
Displays:
Trial days remaining
Current plan
Next billing date
Payment method
Cancel button

Home Dashboard Banner (Subtle)
Example:
“Your free trial ends in 12 days”

5.4 Cancellation Flow
Settings → Subscription → Cancel

Cancellation Screen Copy:
“You’ll still have access until your trial ends or billing cycle finishes.”
Options:
Cancel subscription
Switch to annual plan (discount incentive)

6. Renewal Flow
System Trigger (Day 30 → Day 31)
Backend job runs:
Check expiring subscriptions daily


Billing Attempt
If success:
Mark ACTIVE
Extend subscription
If failure:
Move to PAST_DUE
Retry 3–5 times over 7 days

7. Pricing Logic
Monthly Plan
amount = 500 NGN
billing_cycle = 30 days


Annual Plan
amount = 5800 NGN
billing_cycle = 365 days

Effective discount:
₦500 × 12 = ₦6,000
Annual saves ₦200 (~3.3%)

8. Recommended Technical Stack
Volt requires a secure, scalable subscription infrastructure with strong recurring billing support in Nigeria.

8.1 Payment Provider (CRITICAL)
PRIMARY RECOMMENDATION
Paystack Subscription Engine
OR
Flutterwave Subscriptions

Why Paystack is Preferred
Best Nigeria recurring billing support
Strong card authorization system
Subscription APIs built-in
Webhooks for billing events
Supports local + international cards

Final Recommendation:
Use Paystack Subscriptions API


Payment Module
Handles:
Subscription creation
Webhook processing
Payment retries
Plan upgrades

Payment Service Structure
payment-service/
 ├── subscription.controller
 ├── subscription.service
 ├── paystack.provider
 ├── webhook.handler
 └── billing.jobs


8.3 Database Schema (Subscription Layer)
subscriptions
id UUID PRIMARY KEY
user_id UUID

plan_type VARCHAR(20) -- monthly | annual

status VARCHAR(20) -- trialing, active, past_due, cancelled, expired

start_date TIMESTAMP
end_date TIMESTAMP

next_billing_date TIMESTAMP

payment_provider VARCHAR(50) -- paystack

provider_subscription_id TEXT

created_at TIMESTAMP
updated_at TIMESTAMP


payment_methods
id UUID PRIMARY KEY
user_id UUID

provider VARCHAR(50)

card_last4 VARCHAR(4)
card_brand VARCHAR(20)

authorization_code TEXT

is_default BOOLEAN

created_at TIMESTAMP


payment_transactions
id UUID PRIMARY KEY
user_id UUID

subscription_id UUID

amount NUMERIC

currency VARCHAR(10)

status VARCHAR(20) -- success, failed, pending

reference TEXT

provider_response JSONB

created_at TIMESTAMP


8.4 Webhook System (CRITICAL)
Paystack sends events:
Required Events
charge.success
subscription.create
subscription.disable
invoice.payment_failed

Webhook Flow
Paystack → Webhook Endpoint → Verify Signature → Update DB → Trigger App Notification


8.5 Notification Integration
Subscription system MUST integrate with Volt’s notification engine.

Examples
Trial Ending
Your free trial ends in 3 days. Continue enjoying Volt by subscribing.


Payment Successful
Subscription renewed successfully. You’re on the ₦500 monthly plan.


Payment Failed
We couldn’t process your payment. Please update your card.


Trial Started
Welcome to Volt! Your 30-day free trial has started.


8.6 Scheduler Jobs
Use:
BullMQ + Redis
Jobs:
Check trial expiry daily
Charge renewals
Retry failed payments
Send reminders

9. Security Requirements
Card Security
NEVER store raw card details
Store only:
authorization_code
last4 digits
card brand

API Security
Webhook signature verification
JWT authentication for user actions
Rate limiting on payment endpoints

PCI Compliance
Handled by Paystack/Flutterwave (NOT Volt backend)

10. Edge Cases
Case 1: User Cancels During Trial
No charge occurs
Access ends at trial expiration

Case 2: Payment Fails After Trial
Enter PAST_DUE state
Retry billing 3–5 times
Suspend premium features after grace period

Case 3: Card Added but Not Valid
Reject onboarding
Do not start trial

Case 4: User Reinstates Subscription
Restore ACTIVE state
Resume billing cycle

11. UX PRINCIPLES FOR PAYMENT FLOW
Principle 1: Invisible Billing
Users should feel:
“I am starting a trial”
NOT:
“I am being charged later”

Principle 2: Trust First
Clearly communicate:
No upfront payment
Cancel anytime
Transparent billing date

Principle 3: Minimal Friction
Card input = single step
No multi-page checkout

Principle 4: Always Visible Control
User must always see:
Subscription status
Cancel option
Next billing date



13. Strategic Insight (IMPORTANT)
This subscription model positions Volt as:
A behavioral utility SaaS, not a utility calculator app.
Your key advantage:
Daily usage habit (notifications)
High retention utility (energy dependency)
Predictive insights (future AI layer)



