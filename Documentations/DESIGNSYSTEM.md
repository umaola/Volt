VOLT DESIGN SYSTEM DOCUMENTATION

1. Design Philosophy
Volt is an electricity intelligence platform designed for everyday users.
The interface should feel:
Simple
Clean
Fast
Trustworthy
Data-driven
Easy to understand
Users should never feel overwhelmed by technical electricity terms.
Every screen should answer:
How much electricity do I have left?
How long will it last?
What should I do next?
2. Design Principles
Principle 1: Simplicity First
Avoid unnecessary design elements.
Use whitespace generously.
Prioritize content over decoration.
Principle 2: Information Hierarchy
The most important information should always appear first.
Order:
Current status
Predictions
Actions
Historical data

Principle 3: Consistency
Every component should behave the same way throughout the application.

Principle 4: Accessibility
Interfaces must remain readable in all lighting conditions.
Use high contrast.
Avoid tiny text.
3. Brand Foundation
Primary Color
Green
HEX:
#00BF63
Purpose:
Primary actions
Success states
Active navigation
Progress indicators
Accent Color
Gold
HEX:
#FFD700
Purpose:
Premium features
Subscription highlights
Special insights
Achievement indicator
4. Neutral Colors
Black
#121212
Primary text
Dark Gray
#4B5563
Secondary text
Light Gray
#E5E7EB
Borders
Surface Gray
#F8F9FA
Cards
White
#FFFFFF
Backgrounds
Error Red
#EF4444
Errors
Success Green
#16A34A
Success messages
Warning Orange
#F59E0B
Warnings
5. Typography
Font Family
Poppins
Fallback:
sans-serif
Type Scale
Display
32px
Weight: 700
Line Height: 40px
Usage:
Large hero numbers
Heading 1
24px
Weight: 700
Line Height: 32px
Heading 2
20px
Weight: 600
Line Height: 28px
Heading 3
18px
Weight: 600
Line Height: 24px
Body Large
16px
Weight: 400
Line Height: 24px
Body Regular
14px
Weight: 400
Line Height: 20px
Caption
12px
Weight: 400
Line Height: 16px
6. Layout System
Global Horizontal Padding
All screens:
Left Padding: 20px
Right Padding: 20px
Mandatory
No exceptions
Vertical Spacing
Small:
8px
Medium:
16px
Large:
24px
Extra Large:
32px
7. Border Radius
Small
8px
Inputs
Badges
Medium
12px
Cards
Bottom sheets
Large
16px
Feature cards
Modals
Extra Large
24px
Special containers
8. Elevation
Volt uses minimal shadows.
Avoid heavy neumorphism.
Card Shadow:
Y: 2
Blur: 8
Opacity: 8%
9. Buttons
Primary Button
Background:
#00BF63
Text:
White
Height:
48px
Radius:
12px
Font:
16px SemiBold
State: Default
Green background
State: Pressed
10% darker
State: Disabled
#D1D5DB
Text:
#9CA3AF
State: Loading
Show spinner
Secondary Button
Background:
Transparent
Border:
1px solid #00BF63
Text:
#00BF63
Height:
48px
Radius:
12px
Ghost Button
No border
No fill
Text:
#00BF63

10. Input Fields
Global Rules
Height:
Maximum 40px
Border Radius:
8px
Horizontal Padding:
12px
Font:
14px
Background:
White
Border:
1px solid #E5E7EB

Default State
Border:
#E5E7EB
Text:
#121212
Placeholder:
#9CA3AF
Focus State
Border:
#00BF63
Border Width:
2px

Hover State
Border:
#D1D5DB

Filled State
Border:
#E5E7EB
Text:
#121212
Success State
Border:
#00BF63
Success icon visible

Error State
Border:
#EF4444
Error text below field
12px
Disabled State
Background:
#F3F4F6
Text:
#9CA3AF
Border:
#E5E7EB

11. Dropdown Fields
Height:
40px
Radius:
8px
Chevron Right Aligned
Same states as inputs

12. Cards
Standard Card
Background:
White
Radius:
12px
Padding:
16px
Border:
1px solid #F3F4F6

Dashboard Card
Background:
White
Radius:
16px
Padding:
20px

13. Navigation
Bottom Navigation
Height:
72px
Background:
White
Border Top:
1px solid #F3F4F6

Active Icon:
#00BF63

Inactive Icon:
#9CA3AF

Active Label:
#00BF63

Inactive Label:
#6B7280

14. Status Indicators
Success
Green
#16A34A

Warning
Orange
#F59E0B

Error
Red
#EF4444

Information
Primary Green
#00BF63

15. Dashboard Guidelines
The Home Dashboard is the most important screen.
Order of information:
Units Remaining
Days Remaining
Power Availability Today
Quick Actions
Consumption Trend
Insights
Consumption history

Primary KPI Card:
Large typography
Minimum height:
120px

16. Forms
Rules:
Maximum 5 fields visible at once
Avoid long forms
Use progressive disclosure

Labels always appear above fields
Never inside fields only

17. Empty States
Each empty state should contain:
Illustration
Title
Description
Action Button

Example:
No Appliances Added
Add appliances to improve consumption predictions.
Button:
Add Appliance
18. Notifications
In-app notification cards:
Radius:
12px
Padding:
16px

Priority Colors
Success:
Green
Warning:
Orange
Error:
Red

19. Subscription Screens
Use Accent Color:
#FFD700
for:
Annual Plan Badge
Premium Labels
Savings Indicators

Do not use gold as primary CTA color.
Primary CTA remains green.
20. Icons
Style:
Outlined
Rounded corners
Consistent stroke width
Recommended:
Material Symbols Rounded

21. Dark Mode (Future)
Not required for MVP.
Design all components with future dark-mode compatibility.

22. Component Naming Convention
Buttons:
PrimaryButton
SecondaryButton
GhostButton

Inputs:
TextField
DropdownField
SearchField

Cards:
DashboardCard
InsightCard
StatCard
Navigation:
BottomNavigation
TabBar

23. Design Quality Checklist
Before approving any screen:
✓ 20px horizontal padding maintained
✓ Poppins font used
✓ Input height ≤ 40px
✓ Proper spacing applied
✓ Clear hierarchy
✓ Primary actions use green
✓ Premium indicators use gold
✓ Consistent border radius
✓ Accessible contrast
✓ Simple and uncluttered layout
END OF VOLT DESIGN SYSTEM

