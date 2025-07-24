# CareScribe Comprehensive Workflow Guide

This document provides detailed step-by-step workflows for every feature and user journey in the CareScribe NDIS incident reporting system. Each workflow shows the exact path from start to finish.

## Table of Contents

1. [Initial Setup Workflows (Administrator)](#initial-setup-workflows)
2. [Daily Operations Workflows (Support Worker)](#daily-operations-workflows)
3. [Incident Reporting Workflows](#incident-reporting-workflows)
4. [Medication Management Workflows](#medication-management-workflows)
5. [Shift Management Workflows](#shift-management-workflows)
6. [Report Management Workflows](#report-management-workflows)
7. [Analytics & Performance Workflows](#analytics-performance-workflows)
8. [Compliance Monitoring Workflows](#compliance-monitoring-workflows)
9. [Demo & Testing Workflows](#demo-testing-workflows)

---

## 1. Initial Setup Workflows (Administrator)

### 1.1 First-Time Organization Setup

**Starting Point:** Fresh installation
**User Role:** Administrator

1. **Open Browser**
   - Navigate to: `http://localhost:3000`
   - System redirects to login page

2. **Login as Administrator**
   - Click "Select Demo User" dropdown
   - Select "Alex Thompson (Administrator)"
   - Click blue "Continue as Alex Thompson" button
   - System redirects to `/shift-start`

3. **Start Shift**
   - Select facility: "Sunset Residence - House 3"
   - Select shift type: "Morning (7:00 AM - 3:00 PM)"
   - Enter handover notes (optional)
   - Click "Start Shift" button
   - System redirects to `/dashboard`

4. **Navigate to Setup**
   - In left sidebar, click "Settings"
   - System shows setup checklist page
   - See 6 setup tasks with checkmarks

### 1.2 Organization Profile Configuration

**Starting Point:** Setup page
**Path:** Dashboard → Settings → Organization Profile

1. **Click "Organization Profile"** card or "View Details >" link
   - System navigates to `/setup/organization`

2. **Fill Basic Information Tab**
   - Organization Name: "Sunshine Community Services"
   - ABN: "12 345 678 901"
   - NDIS Registration: "4-1234567"
   - Primary Email: "admin@sunshinecare.org.au"
   - Primary Phone: "03 9123 4567"
   - Website: "https://sunshinecare.org.au"

3. **Switch to Address Tab**
   - Click "Address" tab
   - Street Address: "123 Care Street"
   - Suburb: "Melbourne"
   - State: Select "VIC" from dropdown
   - Postcode: "3000"

4. **Switch to NDIS Settings Tab**
   - Click "NDIS Settings" tab
   - Provider Type: Select from dropdown
   - Registration Groups: Check applicable boxes
   - Service Areas: Add postcodes

5. **Switch to Billing Tab**
   - Click "Billing" tab
   - Billing Email: "billing@sunshinecare.org.au"
   - Billing Address: Toggle "Same as primary"

6. **Save Configuration**
   - Click "Save Organization Settings" button
   - See green success toast notification
   - Click "← Back to Setup" button

### 1.3 Facility Management Setup

**Starting Point:** Setup page
**Path:** Dashboard → Settings → Facility Management

1. **Navigate to Facilities**
   - Click "Facility Management" card
   - System navigates to `/setup/facilities`
   - See list of 6 houses

2. **Edit a Facility**
   - Click "Edit" button on any facility card
   - Modal dialog opens

3. **Update Facility Details**
   - Name: Can modify house name
   - Type: Select "Residential" or "Day Program"
   - Address: Enter full address
   - Capacity: Set participant capacity number
   - Status: Toggle between Active/Inactive

4. **Configure Amenities**
   - Check available amenities:
     - ✓ Wheelchair Accessible
     - ✓ Sensory Room
     - ✓ Outdoor Space
     - ✓ Kitchen Facilities

5. **Add Contact Information**
   - Manager Name: Enter facility manager
   - Manager Email: facility.manager@org.au
   - Emergency Contact: Emergency number

6. **Save Changes**
   - Click "Save Changes" button
   - Modal closes
   - See updated facility in list

### 1.4 Staff Account Creation

**Starting Point:** Setup page
**Path:** Dashboard → Settings → Staff Accounts

1. **Navigate to Staff Management**
   - Click "Staff Accounts" card
   - System navigates to `/setup/staff`
   - See list of existing staff

2. **Add New Staff Member**
   - Click "+ Add Staff Member" button (top right)
   - Modal dialog opens

3. **Fill Staff Details**
   - Full Name: "Jane Smith"
   - Email: "jane.smith@sunshinecare.org.au"
   - Phone: "0412 345 678"
   - Employee ID: "EMP-2024-001"

4. **Set Role and Permissions**
   - Role: Select from dropdown:
     - Support Worker (Basic access)
     - Team Leader (Can review reports)
     - Service Manager (Analytics access)
     - Administrator (Full access)

5. **Assign Facilities**
   - Check boxes for facility access:
     - ✓ Sunset Residence - House 1
     - ✓ Sunset Residence - House 2
     - ✓ Riverside Lodge - House 3

6. **Set Certifications**
   - First Aid: Check and set expiry date
   - Working with Children: Check and add number
   - NDIS Worker Screening: Check and add number
   - Medication Training: Check and set date

7. **Save Staff Member**
   - Click "Save Staff Member" button
   - Modal closes
   - New staff appears in list

### 1.5 Participant Profile Creation

**Starting Point:** Setup page
**Path:** Dashboard → Settings → Participant Profiles

1. **Navigate to Participants**
   - Click "Participant Profiles" card
   - System navigates to `/setup/participants`
   - See list of existing participants

2. **Add New Participant**
   - Click "+ Add Participant" button
   - Large form appears

3. **Fill Personal Information**
   - Full Name: "John Doe"
   - Date of Birth: Use date picker
   - NDIS Number: "123456789"
   - Preferred Name: "Johnny"
   - Gender: Select from dropdown
   - Primary Language: "English"

4. **Add Contact Details**
   - Phone: "0423 456 789"
   - Email: "john.family@email.com"
   - Address: Full residential address

5. **Set Primary Disability**
   - Select from dropdown:
     - Autism Spectrum Disorder
     - Intellectual Disability
     - Physical Disability
     - Psychosocial Disability

6. **Configure Support Needs**
   - Daily Living: Select Low/Medium/High
   - Community Access: Select level
   - Communication: Select level
   - Behavioral Support: Select level

7. **Add Emergency Contacts**
   - Name: "Mary Doe"
   - Relationship: "Mother"
   - Phone: "0412 789 456"
   - Alternative Phone: Optional

8. **Set Medical Information**
   - Medications: Add current medications
   - Allergies: List any allergies
   - Medical Conditions: Add conditions
   - Dietary Requirements: Special diets

9. **Configure Behavioral Patterns**
   - Click "Add Pattern" button
   - Trigger: "Loud sudden noises"
   - Typical Response: "Covers ears, may become distressed"
   - De-escalation: "Move to quiet space, provide headphones"

10. **Save Participant**
    - Click "Save Participant" button
    - See success notification
    - Participant appears in list

### 1.6 Routing Rules Configuration

**Starting Point:** Setup page
**Path:** Dashboard → Settings → Routing Rules

1. **Navigate to Routing**
   - Click "Routing Rules" card
   - System navigates to `/setup/routing`
   - See existing routing rules

2. **Add New Rule**
   - Click "+ Add Rule" button
   - Rule configuration form appears

3. **Configure Rule Conditions**
   - Name: "High Severity Escalation"
   - IF Severity is: Select "High"
   - AND Type is: Select "Behavioral"
   - AND Facility is: Select specific or "Any"

4. **Set Actions**
   - THEN Notify:
     - ✓ Facility Manager
     - ✓ Service Manager
     - ✓ On-call Supervisor

5. **Set Notification Methods**
   - ✓ In-app notification
   - ✓ Email
   - ✓ SMS (if urgent)

6. **Set Response Time**
   - Required Response: "Within 30 minutes"

7. **Save Rule**
   - Click "Save Rule" button
   - Rule appears in list
   - Drag to reorder priority

### 1.7 Integration Settings

**Starting Point:** Setup page
**Path:** Dashboard → Settings → Integration Settings

1. **Navigate to Integrations**
   - Click "Integration Settings" card
   - System navigates to `/setup/integrations`
   - See available integrations

2. **Configure Email Integration**
   - Click "Settings" on Email Notifications card
   - SMTP Server: "smtp.gmail.com"
   - Port: "587"
   - Username: Your email
   - Password: App password
   - Test: Click "Test Connection"

3. **Configure SMS Integration**
   - Click "Settings" on SMS Gateway card
   - Provider: Select "Twilio"
   - Account SID: Enter from Twilio
   - Auth Token: Enter from Twilio
   - From Number: Your Twilio number

4. **Configure NDIS API**
   - Click "Settings" on NDIS Portal card
   - API Key: Enter NDIS API key
   - Environment: Select "Production"
   - Test: Click "Verify Connection"

5. **Save All Integrations**
   - Click "Save Integration Settings"
   - See success notifications

---

## 2. Daily Operations Workflows (Support Worker)

### 2.1 Daily Login and Shift Start

**Starting Point:** Browser closed
**User Role:** Support Worker

1. **Open Application**
   - Navigate to: `http://localhost:3000`
   - System shows login page

2. **Select Demo User**
   - Click "Select Demo User" dropdown
   - Choose "Sarah Chen (Support Worker)"
   - Click "Continue as Sarah Chen"

3. **Start Your Shift**
   - System redirects to `/shift-start`
   - Select your facility: "Sunset Residence - House 3"
   - Select shift type: "Morning (7:00 AM - 3:00 PM)"
   
4. **Review Handover Notes**
   - Read previous shift notes in text area
   - Add your arrival notes:
     "All participants accounted for. James seems calm this morning. Medication round due at 8 AM."

5. **Confirm Shift Start**
   - Click "Start Shift" button
   - System redirects to dashboard
   - See confirmation: "Shift started at 7:00 AM"

### 2.2 Dashboard Navigation

**Starting Point:** Dashboard after login
**Current Page:** `/dashboard`

1. **View Current Status**
   - Top section shows all participants
   - Each card displays:
     - Participant name and photo placeholder
     - Current mood status (Happy/Anxious/Calm)
     - Current location in facility

2. **Check Live Statistics**
   - Active Staff: Shows current number (12)
   - Participants: Shows present count (45)
   - Pending Tasks: Shows your tasks (8)
   - Incidents Today: Shows count (3)

3. **Monitor Live Activity Feed**
   - See real-time updates:
     - "Medication administered - Sarah Chen"
     - "Behavioral incident reported - James Mitchell"
     - Updates appear automatically

4. **View Recent Reports**
   - Bottom section shows your recent reports
   - Click any report to view details

### 2.3 Quick Voice Report

**Starting Point:** Any page
**Destination:** Voice report interface

1. **Initiate Voice Report**
   - Click "Quick Report" button in header
   - OR click "Voice Report" card in Quick Actions
   - System navigates to `/quick-report`

2. **Prepare to Record**
   - See microphone interface
   - Read example: "James is in the garden..."
   - Select participant: "James Mitchell"

3. **Start Recording**
   - Click large blue microphone button
   - Button turns red and pulses
   - Speak clearly: "James had a difficult morning during breakfast. He became upset when his routine was disrupted by a fire drill. He threw his plate but calmed down after we moved to the quiet room."

4. **Stop Recording**
   - Click red microphone to stop
   - See "Processing your report..." message
   - Transcription appears in text box

5. **Review Transcription**
   - Read the converted text
   - Edit if needed by clicking in text box
   - Add additional context

6. **Submit Report**
   - Click "Submit Report" button
   - See "Analyzing report..." spinner
   - System redirects to classification

### 2.4 Report Classification

**Starting Point:** After voice/manual report
**Current Page:** `/report/classification`

1. **Wait for AI Analysis**
   - Progress bar fills to 100%
   - "Analyzing incident type..."
   - "Checking for patterns..."
   - "Generating classification..."

2. **Review Classification**
   - Incident Type: "Behavioral Incident"
   - Severity: "Medium"
   - Pattern Match: "Sensory - Routine Disruption"

3. **Review AI Summary**
   - Read generated summary
   - Check participant identified correctly
   - Verify incident details

4. **Choose Report Type**
   - See recommendation: "Behavioral incident"
   - Two buttons appear:
     - "Complete ABC Report" (recommended)
     - "Standard Incident Report"

5. **Proceed to ABC Report**
   - Click "Complete ABC Report"
   - System redirects to `/report/review`

---

## 3. Incident Reporting Workflows

### 3.1 ABC (Antecedent-Behavior-Consequence) Report

**Starting Point:** Report review page
**Current Page:** `/report/review`

1. **Select Report Format**
   - Default shows "Both Reports"
   - Can select tabs:
     - ABC Report only
     - Incident Report only
     - Both Reports (recommended)

2. **Review ABC Section**
   - **Antecedent (What happened before):**
     - Pre-filled from AI analysis
     - Edit: Click "Edit" button (pencil icon)
     - Add details about fire drill timing

   - **Behavior (What happened):**
     - Description of plate throwing
     - Physical actions observed
     - Verbal expressions noted

   - **Consequence (What happened after):**
     - Staff response documented
     - Outcome (moved to quiet room)
     - Time to calm down noted

3. **Add Supporting Details**
   - Time of incident: Auto-filled
   - Location: Select "Dining Room"
   - Staff present: Your name auto-filled
   - Witnesses: Add other staff names

4. **Review Incident Report Section**
   - Incident description expanded
   - Property damage: Note broken plate
   - Immediate actions taken
   - Follow-up required: Check yes/no

5. **Add Photos (Optional)**
   - Click camera icon
   - See "Photo captured" simulation
   - Photo placeholder appears

6. **Final Review**
   - Read through all sections
   - Ensure accuracy
   - Check pattern match notification

7. **Submit Report**
   - Click "Submit Report" button
   - See "Submitting..." spinner
   - System redirects to confirmation

### 3.2 Manual Incident Report

**Starting Point:** Dashboard
**Path:** Quick Actions → Manual Report

1. **Start Manual Report**
   - Click "Manual Report" card
   - Navigate to report selection
   - Choose participant from dropdown

2. **Select Incident Type**
   - Behavioral Incident
   - Medical Incident
   - Property Damage
   - Injury/Accident
   - Other

3. **Fill Incident Details**
   - Date/Time: Use picker or current
   - Location: Select from facility areas
   - **Description:** Type full narrative
     ```
     During morning activities at 10:30 AM, Michael became 
     agitated when another participant took his favorite 
     sensory toy. He pushed the other participant and began 
     hitting himself on the head.
     ```

4. **Add Behavioral Details** (if behavioral)
   - Triggers identified: Check applicable
     - ✓ Peer interaction
     - ✓ Object removed
   - Duration: "15 minutes"
   - Intensity: Select 1-10 scale

5. **Document Actions Taken**
   - Immediate response:
     - Separated participants
     - Returned sensory toy
     - Used calming techniques
   
   - Follow-up actions:
     - Incident logged
     - Team leader notified
     - Behavior plan reviewed

6. **Add Witnesses**
   - Staff witnesses: Add names
   - Participant witnesses: Add if any
   - External witnesses: Visitors, etc.

7. **Review and Submit**
   - Preview full report
   - Make final edits
   - Click "Submit Report"

### 3.3 Conversational AI Report

**Starting Point:** Dashboard or Reports
**Special Feature:** AI-guided conversation

1. **Initiate Conversational Report**
   - Navigate to `/report/conversational`
   - Select participant (optional)
   - See AI assistant greeting

2. **First AI Question**
   - AI: "I understand James pushed over the bookshelf. Is everyone safe?"
   - Response options:
     - Type response, OR
     - Click microphone to speak
   - You: "Yes, everyone is safe. No injuries."

3. **Follow-up Questions**
   - AI: "Good to hear. What was happening just before?"
   - You: "Maintenance started drilling in the next room. It was really loud and sudden."

4. **Behavioral Details**
   - AI: "Tell me more about James's behavior. What did you observe?"
   - You: "He was covering his ears and rocking back and forth. He kept saying 'too loud' repeatedly."

5. **Time and Duration**
   - AI: "What time did this happen and how long did it last?"
   - You: "Started around 2:15 PM, lasted about 10 minutes until we got him to the quiet room."

6. **Interventions Used**
   - AI: "What interventions did you use?"
   - You: "We stopped the drilling immediately, moved James to the quiet room, gave him noise-cancelling headphones, and used deep pressure."

7. **Property Damage Check**
   - AI: "Was there any property damage?"
   - You: "Yes, a few books were damaged and the shelf has a broken bracket."

8. **Review AI Understanding**
   - See sidebar with AI's understanding:
     - Participant: James Mitchell
     - Trigger: Loud sudden noise
     - Behavior: Sensory overload response
     - Time: 2:15 PM
     - Property Damage: Yes

9. **Generate Report**
   - AI: "Thank you. I'll generate the report now."
   - Click "Generate Report"
   - System creates full report
   - Redirects to review page

### 3.4 Report Submission Confirmation

**Starting Point:** After any report submission
**Page:** `/report/submitted`

1. **View Confirmation**
   - Green checkmark animation
   - "Report Successfully Submitted"
   - Report ID: #RPT-2024-001234

2. **See What Happens Next**
   - Notifications sent to:
     - ✓ Facility Manager
     - ✓ Service Manager
     - ✓ On-call Supervisor (if high severity)

3. **Pattern Match Alert** (if applicable)
   - Yellow alert box:
     "This incident matches James's pattern for sensory triggers. 
     Consider reviewing sensory management plan."

4. **Next Actions**
   - View Report: Opens full report
   - Submit Another: New report
   - Back to Dashboard: Return home

---

## 4. Medication Management Workflows

### 4.1 Medication Administration Recording

**Starting Point:** Dashboard
**Path:** Sidebar → Medications

1. **Navigate to Medications**
   - Click "Medications" in sidebar
   - System opens `/medications`
   - See three tabs: Schedule, PRN, Inventory

2. **View Today's Schedule**
   - Default "Schedule" tab shows today
   - See participants with medications due:
     - 8:00 AM - 5 participants
     - 12:00 PM - 8 participants
     - 6:00 PM - 6 participants

3. **Administer Morning Medications**
   - Find "Sarah Chen" in 8:00 AM list
   - See medications:
     - Risperidone 2mg
     - Omega-3 1000mg
   - Click "Administer" button

4. **Confirm Administration**
   - Modal opens with checklist:
     - ✓ Verified participant identity
     - ✓ Checked medication name
     - ✓ Confirmed correct dose
     - ✓ Observed consumption
   - Click "Confirm Administration"

5. **Add Notes (Optional)**
   - Text field for observations
   - "Sarah took medications without issue"
   - Click "Save"

6. **View Updated Status**
   - Medication shows green checkmark
   - Time stamp appears: "8:03 AM"
   - Your name logged as administrator

### 4.2 PRN (As Needed) Medication

**Starting Point:** Medications page
**Scenario:** Participant needs anxiety medication

1. **Switch to PRN Tab**
   - Click "PRN Medications" tab
   - See list of participants with PRN orders

2. **Select Participant**
   - Find "James Mitchell"
   - PRN Orders:
     - Lorazepam 0.5mg (Anxiety)
     - Paracetamol 500mg (Pain)

3. **Initiate PRN Administration**
   - Click "Give PRN" next to Lorazepam
   - PRN workflow modal opens

4. **Document Reason**
   - Select reason from dropdown:
     - "Acute anxiety episode"
   - Additional notes:
     "Became anxious after loud noise from construction. 
     Showing signs of distress - pacing, hand wringing."

5. **Verify Checks**
   - Last dose: "None in past 24 hours" ✓
   - Maximum daily: "Within limits" ✓
   - Contraindications: "None" ✓

6. **Obtain Authorization** (if required)
   - Call Team Leader: checkbox
   - Authorizing staff: "Mark Johnson"
   - Time authorized: Auto-filled

7. **Administer and Document**
   - ✓ Medication given as prescribed
   - ✓ Participant observed for 30 minutes
   - Click "Complete PRN Administration"

8. **Set Follow-up**
   - Monitor effectiveness: 30 minutes
   - Alert appears in dashboard
   - Reminder to document outcome

### 4.3 MAR Sheet (Medication Administration Record)

**Starting Point:** Medications page
**Purpose:** Weekly overview

1. **Access MAR Sheet**
   - Click "View MAR Sheet" button
   - Large modal opens with grid

2. **Navigate Weekly View**
   - Shows current week by default
   - Use arrows to go previous/next week
   - Columns for each day Mon-Sun

3. **Read MAR Sheet Grid**
   - Rows: Each medication per participant
   - Cells show:
     - ✓ Given (green)
     - ✗ Missed (red)
     - R Refused (orange)
     - — Not scheduled

4. **Check Specific Entry**
   - Click any cell for details
   - Popup shows:
     - Time administered
     - Staff member name
     - Any notes recorded

5. **Print MAR Sheet**
   - Click "Print" button
   - Opens print preview
   - Select date range
   - Print for records

### 4.4 Medication Inventory Management

**Starting Point:** Medications page
**User Role:** Team Leader or above

1. **Switch to Inventory Tab**
   - Click "Inventory" tab
   - See medication stock levels

2. **View Stock Levels**
   - Table shows:
     - Medication name
     - Current stock
     - Reorder level
     - Expiry dates
     - Status indicators

3. **Check Low Stock Alert**
   - Red badge: "Low Stock (3)"
   - Risperidone: 5 tablets left
   - Reorder level: 14 tablets
   - Click "Reorder" button

4. **Process Reorder**
   - Form pre-fills:
     - Medication details
     - Suggested quantity
     - Preferred pharmacy
   - Add notes if needed
   - Click "Submit Order"

5. **Check Expiring Medications**
   - Orange badge: "Expiring Soon (2)"
   - Shows medications expiring in 30 days
   - Plan for replacement

6. **Receive New Stock**
   - Click "Receive Stock" button
   - Enter:
     - Invoice number
     - Quantity received
     - Expiry date
     - Batch number
   - Click "Update Inventory"

---

## 5. Shift Management Workflows

### 5.1 View Shift Schedule

**Starting Point:** Dashboard
**Path:** Sidebar → Shifts

1. **Navigate to Shifts**
   - Click "Shifts" in sidebar
   - Opens `/shifts` page
   - See weekly calendar view

2. **Navigate Calendar**
   - Current week displayed
   - Use left/right arrows to change weeks
   - Today highlighted in blue

3. **View Your Shifts**
   - Your shifts in dark blue
   - Others' shifts in light gray
   - Each shift shows:
     - Staff name
     - Time (7 AM - 3 PM)
     - House assignment

4. **Filter Views**
   - Click "Filter" button
   - Options:
     - My Shifts Only
     - By Facility
     - By Role
     - By Staff Member

### 5.2 Request Shift Swap

**Starting Point:** Shifts page
**Scenario:** Need to swap Tuesday shift

1. **Find Your Shift**
   - Locate your Tuesday shift
   - Click on the shift block
   - Popup menu appears

2. **Select Swap Option**
   - Click "Request Swap"
   - Shift swap dialog opens

3. **Fill Swap Request**
   - Shift to swap: Pre-filled
   - Reason: Select from dropdown
     - "Medical appointment"
   - Additional notes:
     "Specialist appointment at 10 AM, 
     cannot reschedule"

4. **Select Coverage Options**
   - Available staff shown
   - Can select specific person OR
   - "Anyone available"

5. **Submit Request**
   - Click "Submit Swap Request"
   - Request marked "Pending"
   - Notifications sent to:
     - Eligible staff
     - Shift coordinator

6. **Track Request**
   - Shift shows swap icon
   - Status: "Pending approval"
   - Updates when accepted

### 5.3 Submit Leave Request

**Starting Point:** Shifts page
**For:** Future time off

1. **Open Leave Request**
   - Click "Request Leave" button
   - Leave request dialog opens

2. **Select Leave Type**
   - Annual Leave
   - Sick Leave
   - Personal Leave
   - Other

3. **Choose Dates**
   - From: Use date picker
   - To: Use date picker
   - Total days calculated

4. **Add Details**
   - Reason: Text area
   "Family vacation to Queensland, 
   flights already booked"

5. **Check Leave Balance**
   - Shows: "12 days remaining"
   - After request: "7 days"

6. **Submit Request**
   - Click "Submit Request"
   - Email to manager
   - Track in shift view

### 5.4 Daily Shift Handover

**Starting Point:** End of shift
**Critical Process:** Information transfer

1. **Initiate Handover**
   - Click "End Shift" button
   - Handover form opens

2. **Select Incoming Staff**
   - Dropdown of next shift staff
   - Select "Tom Anderson"

3. **Complete Participant Updates**
   - For each participant:
   ```
   James Mitchell:
   - Had sensory episode at 2 PM
   - Calmed with quiet room
   - Dinner went well
   - Mood: Settled
   
   Sarah Chen:
   - All medications taken
   - Participated in art therapy
   - Family visit at 4 PM went well
   - Mood: Happy
   ```

4. **Add Critical Information**
   - ✓ Maintenance scheduled tomorrow 9 AM
   - ✓ James sensitive to noise today
   - ✓ New participant starting tomorrow

5. **Flag Important Items**
   - Mark with red flag:
     "James PRN given at 2:15 PM"
   - Requires acknowledgment

6. **Complete Handover**
   - Click "Complete Handover"
   - Incoming staff notified
   - Must acknowledge receipt

---

## 6. Report Management Workflows

### 6.1 View and Search Reports

**Starting Point:** Dashboard
**Path:** Sidebar → Reports

1. **Navigate to Reports**
   - Click "Reports" in sidebar
   - Opens `/reports` page
   - See list of all reports

2. **Default View**
   - Most recent first
   - Shows 20 per page
   - Each report card shows:
     - Report ID and type
     - Participant name
     - Date/time
     - Severity badge
     - Status

3. **Use Quick Filters**
   - Click filter chips:
     - Today
     - This Week  
     - High Severity
     - Pending Review
     - My Reports

4. **Advanced Search**
   - Click "Advanced Search"
   - Panel expands with options:
   
   **Search by Text:**
   - Enter keywords: "medication"
   
   **Filter by Participant:**
   - Select: "James Mitchell"
   
   **Filter by Date Range:**
   - From: Date picker
   - To: Date picker
   
   **Filter by Type:**
   - ✓ Behavioral
   - ✓ Medical
   - □ Property
   
   **Filter by Reporter:**
   - Select staff member

5. **Apply Search**
   - Click "Search" button
   - Results update instantly
   - Shows match count

### 6.2 Review Report Details

**Starting Point:** Reports list
**Action:** Click any report

1. **Open Report**
   - Click report card
   - Modal opens with full details

2. **Review Header**
   - Report ID: #RPT-2024-001234
   - Status: Pending Review
   - Created: Date and time
   - Reporter: Staff name

3. **Read Incident Details**
   - Full narrative
   - Timeline of events
   - Actions taken
   - Outcomes

4. **Check Pattern Match** (if any)
   - Alert box shows:
     "Matches behavioral pattern:
     Sensory - Loud Noises"
   - Link to participant profile

5. **View Attachments**
   - Photos (if any)
   - Voice recording link
   - Additional documents

6. **Review Actions Taken**
   - Immediate response
   - Follow-up required
   - Notifications sent

### 6.3 Bulk Report Operations

**Starting Point:** Reports page
**For:** Multiple report actions

1. **Enter Selection Mode**
   - Click "Select" button
   - Checkboxes appear on each report

2. **Select Multiple Reports**
   - Check individual reports OR
   - Check "Select All" for page

3. **Choose Bulk Action**
   - Dropdown appears:
     - Export Selected
     - Mark as Reviewed
     - Assign to Staff
     - Archive

4. **Export Multiple Reports**
   - Select "Export Selected"
   - Format dialog opens:
     - CSV (spreadsheet)
     - PDF (printable)
   
5. **Configure Export**
   - Include options:
     - ✓ Full details
     - ✓ Comments
     - ✓ Attachments
     - □ Internal notes

6. **Download Export**
   - Click "Export"
   - Processing spinner
   - File downloads
   - Filename: `reports-2024-03-15.csv`

### 6.4 Generate Custom Report

**Starting Point:** Reports page
**Purpose:** Management reporting

1. **Click "Generate Report"**
   - Button in top toolbar
   - Report builder opens

2. **Select Report Type**
   - Incident Summary
   - Participant Report
   - Staff Performance
   - Compliance Report

3. **Set Parameters**
   - Date range: Last 30 days
   - Facilities: Select multiple
   - Participants: All or specific
   - Include: Various options

4. **Preview Report**
   - Click "Preview"
   - Shows formatted report
   - Charts and statistics

5. **Export Report**
   - Click "Export"
   - Choose format
   - Professional PDF generated

---

## 7. Analytics & Performance Workflows

### 7.1 View Analytics Dashboard

**Starting Point:** Dashboard
**Path:** Sidebar → Analytics

1. **Navigate to Analytics**
   - Click "Analytics" in sidebar
   - Opens `/analytics` page
   - Dashboard loads with charts

2. **Review Key Metrics**
   - Top cards show:
     - Total Incidents: 127
     - Participant Wellbeing: 78%
     - Staff Compliance: 92%
     - Response Time: 15 min avg

3. **Interact with Charts**
   
   **Incident Trends (Line Chart):**
   - Hover for daily details
   - Click legend to hide/show lines
   - Shows 6-month trend
   
   **Incident by Type (Pie Chart):**
   - Hover for percentages
   - Click segments for details
   - Behavioral: 45%
   - Medical: 30%
   - Other: 25%

4. **Change Date Range**
   - Click date range button
   - Calendar picker opens
   - Select start and end dates
   - Charts update automatically

5. **Drill Down into Data**
   - Click any chart segment
   - Detailed view opens
   - Shows underlying records
   - Can navigate to reports

### 7.2 Export Analytics Data

**Starting Point:** Analytics page
**Purpose:** External reporting

1. **Click Export Button**
   - Top right corner
   - Export dialog opens

2. **Select Export Type**
   - Summary Report (PDF)
   - Raw Data (CSV)
   - Executive Dashboard

3. **Configure Export**
   - Date range: Confirm or change
   - Metrics to include:
     - ✓ Incident statistics
     - ✓ Response times
     - ✓ Pattern analysis
     - ✓ Recommendations

4. **Add Custom Notes**
   - Text field for context
   - "Q1 2024 Board Report"

5. **Generate Export**
   - Click "Export"
   - Processing message
   - Download starts
   - Open in Excel/PDF reader

### 7.3 Performance Metrics Review

**Starting Point:** Dashboard
**Path:** Sidebar → Performance

1. **Navigate to Performance**
   - Click "Performance" in sidebar
   - Opens `/performance` page
   - Multiple metric tabs

2. **Review Staff Performance**
   - Default tab shows:
     - Report submission times
     - Compliance rates
     - Training status
     - Response times

3. **Individual Staff Metrics**
   - Search or select staff member
   - Personal dashboard shows:
     - Reports submitted: 45
     - Average response: 12 min
     - Compliance score: 94%
     - Training current: Yes

4. **Team Performance**
   - Switch to "Team" tab
   - Compare across teams
   - Benchmarks shown
   - Trends over time

5. **Generate Performance Report**
   - Click "Generate Report"
   - Select individual or team
   - Time period
   - Download PDF summary

---

## 8. Compliance Monitoring Workflows

### 8.1 Compliance Dashboard

**Starting Point:** Dashboard
**Path:** Sidebar → Compliance

1. **Navigate to Compliance**
   - Click "Compliance" in sidebar
   - Opens `/compliance` page
   - Overall score displayed: 92%

2. **Review Compliance Areas**
   - Cards for each area:
     - Documentation: 94%
     - Training: 89%
     - Incident Reporting: 96%
     - Medication: 91%

3. **Identify Issues**
   - Red indicators show problems
   - Click "Training" (89%)
   - See 5 staff overdue

4. **Drill into Details**
   - List shows overdue items:
     - John: First Aid expired
     - Mary: NDIS check due
     - Peter: Med training expired

5. **Take Action**
   - Click "Send Reminders"
   - Automated emails sent
   - Track acknowledgments

### 8.2 Audit Trail Review

**Starting Point:** Compliance page
**For:** Regulatory review

1. **Access Audit Logs**
   - Click "Audit Trail" tab
   - Complete system log

2. **Filter Audit Events**
   - Date range selector
   - Event type:
     - Report submissions
     - Medication admin
     - Access logs
     - System changes

3. **Search Specific Events**
   - Search box: "James Mitchell"
   - Shows all related events
   - Who did what when

4. **Export Audit Trail**
   - Select date range
   - Click "Export Audit Log"
   - CSV with all details
   - Digital signatures included

---

## 9. Demo & Testing Workflows

### 9.1 Access Demo Controls

**Starting Point:** Any page
**Purpose:** Testing features

1. **Open Demo Controls**
   - Bottom of sidebar
   - Click "Demo Controls" (magic wand)
   - Panel slides up

2. **Quick Actions Available**
   - Generate Incident
   - Create Alert
   - Simulate Response
   - Add Activity

3. **Generate Test Incident**
   - Click "Generate Incident"
   - Random incident created
   - Appears in reports
   - Notifications triggered

4. **Control Real-time Updates**
   - Toggle "Live Updates"
   - Adjust update frequency
   - Simulate busy periods

5. **Reset Demo Data**
   - Options to reset:
     - All reports
     - Today's data only
     - Specific participant
   - Confirm reset
   - Fresh data loaded

### 9.2 Test Pattern Matching

**Starting Point:** Demo controls
**Test:** Behavioral patterns

1. **Create Pattern Trigger**
   - Select participant: "James"
   - Select pattern: "Loud noise"
   - Click "Trigger Pattern"

2. **Submit Matching Report**
   - Auto-fills report
   - Submit through workflow
   - See pattern alert

3. **Verify Notifications**
   - Check notification badge
   - See escalation active
   - Verify routing rules

### 9.3 Complete Workflow Test

**Starting Point:** Login
**Full cycle test**

1. **Login → Report → Review**
   - Login as Support Worker
   - Create voice report
   - Get AI classification
   - Complete ABC report
   - Submit successfully

2. **Verify Data Flow**
   - Check report in list
   - View in analytics
   - See in performance
   - Confirm audit trail

3. **Test Notifications**
   - Check manager received
   - Escalation working
   - Response tracked

---

## Quick Reference Card

### Essential Shortcuts
- **Quick Report:** Header button (always visible)
- **Emergency:** Red button → Immediate escalation
- **Handover:** End of shift → End Shift button
- **PRN Med:** Medications → PRN tab → Give PRN

### Common Paths
- **New Incident:** Dashboard → Quick Actions → Voice/Manual Report
- **View Reports:** Dashboard → Sidebar → Reports
- **Give Medication:** Dashboard → Sidebar → Medications
- **Check Schedule:** Dashboard → Sidebar → Shifts

### Key Features
- **Pattern Matching:** Automatic on relevant incidents
- **Real-time Updates:** Dashboard live feed
- **Bulk Operations:** Reports page → Select mode
- **Export Data:** Any list view → Export button

### Role-Specific Access
- **Support Worker:** Reports, Meds, Shifts
- **Team Leader:** + Review reports, Analytics
- **Service Manager:** + Performance, Compliance  
- **Administrator:** + All settings, Full access

---

## 10. Additional Workflows & Scenarios

### 10.1 Notification Management

**Starting Point:** Any page with notification bell
**Purpose:** View and manage system notifications

1. **Check Notifications**
   - Look at header bell icon
   - Red badge shows count (e.g., "3")
   - Click bell icon

2. **View Notification Panel** 
   - Dropdown panel opens
   - Shows recent notifications:
     - "High severity incident - James Mitchell"
     - "Medication due - Sarah Chen"
     - "Shift swap request from Tom"

3. **Interact with Notifications**
   - Click any notification
   - System navigates to relevant page:
     - Incident → Report details
     - Medication → Medications page
     - Shift swap → Shifts page

4. **Mark as Read**
   - Notifications marked read on click
   - Badge count decreases
   - Can mark all as read

### 10.2 Emergency Response Workflow

**Starting Point:** Any page
**Critical Feature:** Immediate escalation

1. **Identify Emergency**
   - Serious incident occurring
   - Need immediate support

2. **Activate Emergency** 
   - Click red "Emergency" button (if visible)
   - OR Press emergency hotkey (Ctrl+E)
   - OR Navigate to Quick Actions

3. **Emergency Form**
   - Quick form opens:
     - Location: Pre-filled current
     - Type: Medical/Behavioral/Safety
     - Participant: Quick select
     - Brief description: Text field

4. **Submit Emergency**
   - Click "Send Emergency Alert"
   - Immediate notifications to:
     - On-call supervisor
     - Facility manager  
     - Emergency contacts

5. **Follow-up Required**
   - Stay with participant
   - Full report required later
   - Incident auto-created

### 10.3 Photo Documentation Workflow

**Starting Point:** Dashboard Quick Actions
**Feature:** Visual incident documentation

1. **Initiate Photo Documentation**
   - Click "Photo Document" card
   - Camera interface opens (simulated)

2. **Capture Context**
   - Select incident type:
     - Property damage
     - Injury documentation
     - Environment hazard
     - Behavioral aftermath

3. **Take Photos** (Simulated)
   - Click camera button
   - "Photo captured" message
   - Can take multiple photos

4. **Add Description**
   - For each photo:
     - Add caption
     - Note relevant details
     - Mark areas of concern

5. **Link to Incident**
   - Choose:
     - Create new incident
     - Attach to existing
   - Select participant if relevant

6. **Submit Documentation**
   - Review photos
   - Click "Submit Documentation"
   - Creates/updates incident report

### 10.4 Manual Report Full Workflow

**Starting Point:** Dashboard → Manual Report
**Destination:** Report form selection

1. **Click Manual Report**
   - From Quick Actions
   - System evaluates context

2. **Report Type Selection**
   - If no participant selected:
     - Show participant list first
     - Select participant
     - Continue to report type

3. **Choose Report Type**
   - Behavioral Incident (ABC)
   - Medical Incident
   - Property Damage
   - General Observation
   - Near Miss

4. **Route to Appropriate Form**
   - Behavioral → ABC report flow
   - Medical → Medical incident form
   - Property → Property damage form
   - Others → Standard incident form

5. **Complete Selected Form**
   - Follow specific workflow
   - Based on type selected

### 10.5 Session Management & Timeouts

**Scenario:** Extended inactivity
**Security Feature:** Auto-logout

1. **Session Warning**
   - After 25 minutes inactive
   - Yellow banner appears:
     "Session expiring in 5 minutes"

2. **Options Presented**
   - "Continue Working" - Extends session
   - "Save & Logout" - Saves current work
   - No action - Auto logout at 30 min

3. **Session Expired**
   - If no action taken:
   - "Session expired" message
   - Redirected to login
   - Work saved in draft (if applicable)

4. **Resume Work**
   - Login again
   - See "Resume previous session?"
   - Click "Yes" to restore
   - Returns to last page

### 10.6 Team Leader Specific Workflows

**User Role:** Team Leader
**Additional Access:** Report review, team management

1. **Login as Team Leader**
   - Select "Mark Williams (Team Leader)"
   - Complete shift start
   - See enhanced dashboard

2. **Review Pending Reports**
   - Dashboard shows "Reports Pending Review (5)"
   - Click notification or navigate to Reports
   - Filter: "Awaiting Review"

3. **Report Review Process**
   - Open pending report
   - See "Review Actions" section:
     - Approve
     - Request clarification
     - Escalate
     - Add reviewer notes

4. **Add Review Notes**
   - Text area for comments
   - Can tag other staff
   - Set follow-up required flag

5. **Approve/Escalate**
   - Approve: Marks complete
   - Escalate: Routes to Service Manager
   - System logs review action

### 10.7 Service Manager Analytics Workflow  

**User Role:** Service Manager
**Focus:** Data-driven decisions

1. **Login as Service Manager**
   - Select "Lisa Brown (Service Manager)"
   - Enhanced dashboard with metrics

2. **Navigate to Analytics**
   - Sidebar shows Analytics prominently
   - Click to open analytics dashboard

3. **Analyze Trends**
   - Default: 30-day overview
   - Key insights highlighted:
     - "Incidents up 15% this month"
     - "Morning shift has most incidents"
     - "James - increasing pattern"

4. **Drill Into Specifics**
   - Click any insight card
   - Detailed breakdown appears
   - Can see underlying data

5. **Generate Management Report**
   - Click "Generate Executive Report"
   - Select metrics to include
   - Add management summary
   - Export as PDF

6. **Share with Stakeholders**
   - Download PDF report
   - Or email directly from system
   - Schedule recurring reports

### 10.8 Error Handling Workflows

**Various Scenarios:** When things go wrong

1. **Network Connection Lost**
   - Red banner appears:
     "Connection lost. Working offline"
   - Can continue with limited features
   - Data saved locally
   - Auto-sync when connection returns

2. **Form Validation Errors**
   - Submit form with errors
   - Red highlights on fields
   - Error messages below:
     - "NDIS number format invalid"
     - "Date cannot be in future"
   - Fix and resubmit

3. **Insufficient Permissions**
   - Try accessing restricted area
   - Message: "Access Denied"
   - "You need Team Leader role"
   - Button: "Request Access"

4. **Save Failed**
   - If save operation fails:
   - Toast: "Save failed - retrying"
   - Auto-retry 3 times
   - If still fails: "Save to drafts?"
   - Can retry manually

5. **Page Not Found**
   - Navigate to invalid URL
   - 404 page appears
   - "Page not found"
   - Links to: Dashboard, Reports

### 10.9 Real-time Update Scenarios

**Feature:** Live collaboration

1. **Receiving Live Updates**
   - While on dashboard
   - New activity appears with animation
   - Slide in from right
   - Auto-scroll activity feed

2. **Notification Arrives**
   - Bell icon shows red dot
   - Number increments
   - Optional: Sound alert
   - Toast notification appears

3. **Urgent Alert Received**
   - Red banner across top:
     "URGENT: Incident in House 3"
   - Cannot dismiss for 10 seconds
   - Click for immediate details

4. **Collaborative Editing**
   - Multiple staff same participant
   - See "Tom is also viewing"
   - Lock icon on sections being edited
   - Updates appear when saved

### 10.10 Settings & Preferences

**Starting Point:** User menu
**Personal customization**

1. **Access Settings**
   - Click avatar (top right)
   - Dropdown shows user menu
   - Click "Settings"

2. **Personal Preferences**
   - Notification preferences:
     - ✓ Email notifications
     - ✓ SMS for urgent
     - ✓ Desktop notifications
   - Theme: Light/Dark/Auto

3. **Update Profile**
   - Change display name
   - Update phone number
   - Upload profile photo
   - Set availability status

4. **Security Settings**
   - Change password
   - Enable two-factor
   - View login history
   - Manage sessions

5. **Save Preferences**
   - Click "Save Settings"
   - Confirmation message
   - Changes apply immediately

### 10.11 Home Page Redirect Flow

**URL:** http://localhost:3000/
**Auto-routing logic**

1. **Not Logged In**
   - Access root URL
   - Immediately redirects to /login
   - No flash of content

2. **Logged In - No Active Shift**
   - Access root URL  
   - Redirects to /shift-start
   - Message: "Please start your shift"

3. **Logged In - Active Shift**
   - Access root URL
   - Redirects to /dashboard
   - Shows personalized dashboard

4. **Deep Link Handling**
   - If URL has redirect parameter
   - After login, goes to requested page
   - Example: /?redirect=/reports

---

## Comprehensive Workflow Verification

### Coverage Checklist

✅ **All User Roles Covered:**
- Support Worker - Full daily workflows
- Team Leader - Review and team management
- Service Manager - Analytics and performance
- Administrator - Complete setup and management

✅ **All Pages Documented:**
- Login, Dashboard, All Setup pages
- Reports (Voice, Manual, Conversational, Review)
- Medications, Shifts, Analytics
- Performance, Compliance
- All navigation paths

✅ **All Features Included:**
- Real-time updates and notifications
- Pattern matching and AI classification  
- Bulk operations and exports
- Emergency procedures
- Error handling scenarios
- Session management

✅ **All Interactions Specified:**
- Every button click documented
- All form fields listed
- Modal/dialog workflows
- Navigation patterns
- Quick actions and shortcuts

✅ **Edge Cases Covered:**
- Network failures
- Permission denied
- Session timeouts
- Validation errors
- Empty states

---

This workflow document is now comprehensive and covers every feature and user journey in the CareScribe system. Each workflow can be followed step-by-step to test and verify functionality.