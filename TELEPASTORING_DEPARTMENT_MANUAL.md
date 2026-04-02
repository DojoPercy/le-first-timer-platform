# TELEPASTORING DEPARTMENT MANUAL

## PLATFORM OVERVIEW

The First Timer Platform is a comprehensive web-based system designed to support the Telepastoring Department's mission of maintaining continuous contact with all members and first timers. The platform automates data management, streamlines follow-up processes, and provides real-time analytics for effective ministry oversight.

### **PLATFORM ARCHITECTURE**

**Technology Stack:**
- **Frontend:** Next.js 16 with React 19, TypeScript, and Tailwind CSS
- **Backend:** Next.js API routes with Supabase database
- **Authentication:** Role-based access control (Super Admin, Admin, Caller)
- **Database:** PostgreSQL via Supabase with real-time updates
- **Integration:** Google Sheets API for data synchronization

**User Roles & Permissions:**
- **Super Admin:** System-wide oversight, branch management, user administration
- **Admin:** Branch-level management, caller assignments, reporting, data synchronization
- **Caller:** Personal dashboard, assigned first timers, follow-up logging

---

## **CORE PLATFORM FEATURES**

### **1. DASHBOARD SYSTEM**

#### **Admin Dashboard (`/admin`)**
- **Real-time Statistics:**
  - Total first timers, assigned/unassigned counts
  - Follow-up completion rates and weekly accountability
  - Conversion tracking (fully joined, still deciding, not continuing)
  
- **Analytics Sections:**
  - **Top Cells:** Identifies which cells receive most first timers
  - **Inviter Analytics:** Tracks who brings first timers and conversion rates
  - **Caller Weekly Accountability:** Performance metrics by caller
  - **Quick Actions:** Direct access to key workflows

#### **Caller Dashboard (`/caller`)**
- **Personal Statistics:**
  - Assigned first timers count
  - Weekly follow-up progress
  - Personal conversion rates
  - Follow-up history and status

### **2. FIRST TIMER MANAGEMENT**

#### **Data Collection & Storage**
```typescript
// Core First Timer Data Structure
interface FirstTimer {
  id: string;
  full_name: string;
  contact?: string;
  place_of_residence?: string;
  invited_by?: string;
  cell_name?: string;
  visit_type?: "JOINING" | "VISITING" | "JOINING, VISITING";
  followup_outcome_status?: "pending" | "still_deciding" | "fully_joined" | "not_continuing";
  assigned_caller_id?: string;
  branch_id?: string;
  form_submitted_at?: string;
  created_at: string;
  updated_at: string;
}
```

#### **Features:**
- **Weekly View System:** Review first timers by ISO week numbers
- **Advanced Filtering:** All, Unassigned, Needs Follow-up, Followed This Week, Fully Joined, Still Deciding, Not Continuing
- **Search Functionality:** Search by name, contact, residence, inviter, or cell
- **Assignment Management:** Real-time caller assignment with dropdown selection
- **CSV Export:** Weekly data export for reporting and backup
- **Caller Statistics:** Per-week assignment distribution overview

### **3. FOLLOW-UP MANAGEMENT**

#### **Follow-Up Data Structure**
```typescript
interface Followup {
  id: string;
  first_timer_id: string;
  caller_id: string;
  date: string;
  notes?: string;
  status: "Contacted" | "Pending" | "Not Reachable";
  created_at: string;
  updated_at: string;
}
```

#### **Features:**
- **Weekly Follow-up Tracking:** ISO week-based follow-up management
- **Status Management:** Contacted, Pending, Not Reachable
- **Detailed Notes:** Rich text notes for each follow-up attempt
- **Caller Filtering:** View follow-ups by specific callers
- **CSV Export:** Follow-up data export for analysis
- **Reset Function:** Weekly follow-up reset for new cycles

### **4. CALLER MANAGEMENT**

#### **Caller Data Structure**
```typescript
interface Caller {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: string;
  branch_id?: string;
  active_month?: string;
  created_at: string;
  updated_at: string;
}
```

#### **Features:**
- **User Creation:** Add new callers with role assignment
- **Profile Management:** Update caller information and status
- **Assignment Tracking:** Monitor caller workload distribution
- **Performance Metrics:** Track individual caller effectiveness

### **5. REPORTING SYSTEM**

#### **Available Reports:**
- **Monthly Reports:** Total calls, first timer follow-ups, progress tracking
- **Attendance Analytics:** Improvement tracking and member engagement
- **Conversion Reports:** First timer to member conversion rates
- **Caller Performance:** Individual and team accountability metrics
- **Cell Analytics:** Top performing cells and areas needing attention

#### **Export Capabilities:**
- **CSV Export:** First timers and follow-ups data
- **PDF Reports:** Formatted monthly departmental reports
- **Real-time Analytics:** Dashboard-based live statistics

### **6. DATA INTEGRATION**

#### **Google Sheets Integration**
```typescript
interface BranchIntegration {
  id: string;
  branch_id: string;
  integration_type: "first_timer_intake";
  provider: string;
  sheet_id: string;
  sheet_range?: string;
  form_url?: string;
  status: "active" | "paused" | "error";
  last_synced_at?: string;
  last_success_at?: string;
  last_error?: string;
}
```

#### **Features:**
- **Automatic Sync:** Pull data from Google Forms/Sheets
- **Error Handling:** Sync status monitoring and error reporting
- **Template Management:** Version control for intake forms
- **Manual Sync:** On-demand data synchronization

---

## **WEEKLY WORKFLOW INTEGRATION**

### **MONDAY – PRAYER + DATA & REVIEW DAY**
**Platform Actions:**
- **Sync Google Sheets:** Import Sunday first timer data
- **Data Review:** Verify completeness and accuracy of new entries
- **Assignment Preparation:** Review unassigned first timers
- **Call All First Timers:** Access Sunday first timer list via platform

**Platform Features Used:**
- Google Sheets sync button on admin dashboard
- First timers table with weekly filtering
- Caller assignment dropdown
- Search and filter capabilities

### **TUESDAY – FIRST TIMER VISIT & CALLS**
**Platform Actions:**
- **Access Assigned List:** View assigned first timers for contact
- **Log Follow-ups:** Record call outcomes and notes
- **Update Status:** Mark contact attempts and results
- **Note Escalations:** Flag cases needing visitation or pastoral attention

**Platform Features Used:**
- Caller dashboard with assigned first timers
- Follow-up creation and status management
- Notes field for detailed observations
- Real-time status updates

### **WEDNESDAY – FIRST TIMER CALLS CONTINUED**
**Platform Actions:**
- **Continue Tuesday Work:** Complete remaining first timer contacts
- **Update Follow-up Logs:** Ensure all contacts are recorded
- **Review Progress:** Check weekly completion status
- **Prepare Saturday List:** Identify members needing Saturday calls

**Platform Features Used:**
- Follow-up progress tracking
- Weekly accountability metrics
- Caller performance dashboard
- Export capabilities for preparation

### **FRIDAY – GROUP PAGE & WHATSAPP ENGAGEMENT**
**Platform Actions:**
- **Identify Inactive Members:** Use platform data to find silent members
- **Track Engagement:** Monitor follow-up outcomes and responses
- **Prepare Sunday Reminders:** Use contact lists for communication
- **Update Member Status:** Record engagement levels

**Platform Features Used:**
- Member status filtering
- Contact information export
- Follow-up history review
- Analytics for engagement tracking

### **SATURDAY – MAJOR CALLING DAY**
**Platform Actions:**
- **Access Assigned Members:** View complete assignment list
- **Log Transport Needs:** Record special requirements
- **Update Call Logs:** Immediate recording of all contacts
- **Track Completion:** Monitor weekly follow-up progress

**Platform Features Used:**
- Caller dashboard with all assigned contacts
- Real-time follow-up logging
- Weekly progress tracking
- Notes field for special requirements

### **SUNDAY – SERVICE DAY OPERATIONS**
**Platform Actions:**
- **Identify First Timers:** Cross-reference with platform data
- **Collect Accurate Data:** Enter new first timer information
- **Welcome Process:** Use platform to guide welcome protocol
- **Hand Over Data:** Ensure electronic entry by end of day

**Platform Features Used:**
- Mobile-responsive interface for on-site data entry
- First timer creation forms
- Real-time data synchronization
- Search functionality to avoid duplicates

---

## **FIRST TIMER HANDLING PROTOCOL**

### **Step-by-Step Platform Integration**

#### **1. Welcome warmly at church**
- **Platform Support:** Mobile access to first timer history
- **Data Check:** Search for previous visits or connections

#### **2. Introduce yourself and offer refreshment/gift**
- **Platform Support:** Caller identification and role display
- **Assignment Tracking:** Automatic caller assignment recording

#### **3. Collect full and accurate data**
- **Platform Entry:** Direct data entry into system
- **Validation:** Real-time data completeness checks
- **Fields Required:** Name, contact, residence, inviter, cell, visit type

#### **4. Enter data electronically the same day**
- **Platform Feature:** Immediate data availability
- **Sync Capability:** Real-time updates across all user levels
- **Quality Control:** Data validation and duplicate prevention

#### **5. Call within 24–48 hours**
- **Platform Reminder:** Automated follow-up scheduling
- **Assignment System:** Caller workload distribution
- **Tracking:** Follow-up deadline monitoring

#### **6. Take them through new convert guide briefly**
- **Platform Notes:** Record guide completion and responses
- **Status Updates:** Update follow-up outcome status
- **Next Steps:** Schedule subsequent contacts

#### **7. Encourage joining Church Schools, LC Live and other programs**
- **Platform Tracking:** Program interest and participation records
- **Follow-up Notes:** Document responses and commitments
- **Integration:** Connect with other ministry systems

#### **8. Follow up consistently for one month**
- **Platform Scheduling:** Automated follow-up reminders
- **Progress Tracking:** Weekly completion monitoring
- **History:** Complete contact history maintenance

#### **9. Visit when needed**
- **Platform Escalation:** Flag cases for visitation team
- **Coordination:** Assign visitation tasks and track outcomes
- **Documentation:** Record visit results and recommendations

#### **10. Ensure integration into the River (cells/groups)**
- **Platform Integration:** Cell assignment and tracking
- **Follow-up:** Monitor cell attendance and integration
- **Status Updates:** Update to "fully joined" when appropriate

---

## **DATA MANAGEMENT REQUIREMENTS**

### **Electronic Data Standards**
- **All data must be electronic:** No paper-based first timer records
- **Real-time updates:** Data available immediately across all levels
- **Weekly maintenance:** Regular data review and cleanup
- **Backup procedures:** Automated data export and storage

### **Call Log Requirements**
Each follow-up must record:
- **Name:** First timer identification
- **Date & Time:** Precise contact timestamps
- **Purpose of Call:** Reason for contact (welcome, follow-up, reminder)
- **Outcome:** Contacted, Pending, Not Reachable
- **Member Needs/Concerns:** Detailed notes from conversation
- **Next Action Required:** Scheduled follow-up or escalation
- **Attendance Status:** Sunday service attendance confirmation
- **Weekly Review:** Data Officer review and validation

### **Data Quality Standards**
- **Completeness:** All required fields must be filled
- **Accuracy:** Regular validation and correction processes
- **Timeliness:** Same-day data entry requirement
- **Consistency:** Standardized data entry protocols

---

## **REPORTING REQUIREMENTS**

### **Monthly Report Components**
The platform automatically generates monthly reports including:

#### **Quantitative Metrics**
- **Total Number of Calls Made:** All caller activities
- **First Timer Follow-up:** New contact completion rates
- **Progress of Established Members:** Ongoing disciple tracking
- **Attendance Improvements:** Week-over-week growth metrics

#### **Qualitative Analysis**
- **Challenges Faced:** System-reported obstacles and blockers
- **Innovative Solutions:** Successful strategies and approaches
- **Visitation Reports:** Home visit outcomes and recommendations
- **Team Performance:** Caller effectiveness and accountability

#### **Automated Features**
- **Real-time Dashboards:** Live statistics and progress tracking
- **Export Capabilities:** CSV and PDF report generation
- **Historical Tracking:** Month-over-month trend analysis
- **Comparative Analytics:** Branch and caller performance comparison

---

## **TELEPASTORING ARMY MANAGEMENT**

### **Recruitment & Onboarding**
- **Minimum Five Callers:** Platform supports unlimited caller accounts
- **Consistency & Spirituality:** Performance tracking and accountability
- **Order & Records:** Automated assignment and follow-up tracking
- **Punctuality:** Real-time activity monitoring and reporting

### **Caller Performance Tracking**
- **Assignment Distribution:** Balanced workload allocation
- **Completion Rates:** Weekly follow-up accountability
- **Conversion Metrics:** First timer to member transition tracking
- **Activity Monitoring:** Real-time caller engagement statistics

### **Team Coordination**
- **Centralized Communication:** Platform-based messaging and notes
- **Shared Information:** Common access to first timer data
- **Collaborative Follow-up:** Multi-caller coordination capabilities
- **Performance Reviews:** Data-driven caller evaluations

---

## **ORDER & PRESENTATION STANDARDS**

### **Platform Organization**
- **Role-Based Access:** Clear permission boundaries and responsibilities
- **Consistent Interface:** Unified design and user experience
- **Professional Presentation:** Clean, modern, ministry-appropriate design
- **Mobile Responsiveness:** Access on any device for field work

### **Discipline & Excellence**
- **Data Integrity:** Maintained through validation and quality controls
- **Respect & Order:** Clear workflows and accountability structures
- **Excellence in Ministry:** Professional tools supporting spiritual work
- **Continuous Improvement:** Regular platform updates and enhancements

---

## **INNOVATION & CONTINUOUS IMPROVEMENT**

### **Current Platform Innovations**
- **Real-time Synchronization:** Instant data updates across all users
- **Mobile Accessibility:** Field work support with responsive design
- **Advanced Analytics:** Data-driven decision making capabilities
- **Automated Workflows:** Streamlined processes and reduced manual work

### **Future Enhancement Areas**
- **Communication Tools:** Integrated WhatsApp/SMS messaging
- **Advanced Reporting:** AI-powered insights and recommendations
- **Mobile App:** Native mobile application for field work
- **Integration Expansion:** Connection with other ministry systems

### **Continuous Innovation Expectation**
- **Regular Updates:** Monthly platform improvements and new features
- **User Feedback:** Caller and admin input for system enhancements
- **Technology Advancement:** Staying current with digital ministry tools
- **Process Optimization:** Continuously improving follow-up effectiveness

---

## **PLATFORM SECURITY & MAINTENANCE**

### **Data Security**
- **Role-Based Access:** Secure authentication and authorization
- **Data Encryption:** Protected information storage and transmission
- **Regular Backups:** Automated data protection and recovery
- **Access Logging:** User activity monitoring and audit trails

### **System Maintenance**
- **Regular Updates:** Continuous platform improvements and security patches
- **Performance Monitoring:** System health and uptime tracking
- **User Support:** Technical assistance and training resources
- **Documentation:** Comprehensive user guides and best practices

---

## **TRAINING & SUPPORT**

### **New User Onboarding**
- **Role-Specific Training:** Tailored instruction for Admins and Callers
- **Platform Walkthrough:** Guided tour of features and workflows
- **Best Practices:** Department-specific usage guidelines
- **Ongoing Support:** Continuous assistance and troubleshooting

### **Resource Materials**
- **User Manuals:** Detailed documentation for all features
- **Video Tutorials:** Visual guides for common workflows
- **FAQ Section:** Quick answers to common questions
- **Support Contact:** Direct access to technical assistance

---

## **CONCLUSION**

The First Timer Platform is designed to fully support the Telepastoring Department's vision and mission. By providing comprehensive data management, streamlined workflows, and powerful analytics, the platform enables the department to achieve its core objective: **"Nobody should be left out."**

The system aligns perfectly with the department's weekly responsibilities and core values of **Love, Excellence, Accuracy, Order, Consistency, and Innovation**. Through continuous improvement and faithful implementation, the platform serves as a vital tool in building a spiritually vibrant and closely connected church family.

**Platform Success Metrics:**
- **100% First Timer Coverage:** No first timer left unassigned
- **Weekly Follow-up Completion:** All assigned contacts made weekly
- **Data Accuracy:** Complete and correct information maintained
- **Conversion Growth:** Increasing first timer to member transition rates
- **Caller Accountability:** Consistent performance and engagement

The platform is not just a tool—it's the digital backbone of the Telepastoring Department's mission to ensure every member is reached, strengthened, encouraged, discipled, and established through consistent communication, follow-up, and personal care.
