-- ============================================================================
-- CareScribe Innovative Features - Complete Database Schema
-- ============================================================================

-- ============================================================================
-- 1. TEAM PULSE - Real-Time Collaboration
-- ============================================================================

-- Team member status tracking
CREATE TABLE IF NOT EXISTS team_member_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'available', -- 'available', 'busy', 'with_participant', 'on_break', 'offline'
  current_location TEXT, -- Which facility/participant they're with
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  shift_id UUID REFERENCES shifts(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_status CHECK (status IN ('available', 'busy', 'with_participant', 'on_break', 'offline'))
);

-- Team messages for real-time collaboration
CREATE TABLE IF NOT EXISTS team_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES users(id),
  message_type TEXT NOT NULL DEFAULT 'chat', -- 'chat', 'alert', 'help_request', 'photo', 'voice_note'
  message_text TEXT,
  photo_url TEXT,
  voice_note_url TEXT,
  transcription TEXT,
  priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  metadata JSONB, -- For additional data like location, participant_id, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_message_type CHECK (message_type IN ('chat', 'alert', 'help_request', 'photo', 'voice_note')),
  CONSTRAINT valid_priority CHECK (priority IN ('low', 'normal', 'high', 'urgent'))
);

-- Help requests for "Need Help" emergency button
CREATE TABLE IF NOT EXISTS help_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requesting_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  location TEXT NOT NULL,
  participant_id UUID REFERENCES participants(id),
  urgency TEXT DEFAULT 'normal', -- 'normal', 'urgent', 'emergency'
  description TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'resolved', 'cancelled'
  accepted_by_user_id UUID REFERENCES users(id),
  accepted_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_urgency CHECK (urgency IN ('normal', 'urgent', 'emergency')),
  CONSTRAINT valid_help_status CHECK (status IN ('pending', 'accepted', 'resolved', 'cancelled'))
);

-- ============================================================================
-- 2. SMART TASKS - AI-Powered Daily Workflow
-- ============================================================================

CREATE TABLE IF NOT EXISTS smart_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assigned_to_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES participants(id),
  shift_id UUID REFERENCES shifts(id),

  task_type TEXT NOT NULL, -- 'medication', 'activity', 'hygiene', 'meal', 'behavior_support', 'documentation', 'other'
  title TEXT NOT NULL,
  description TEXT,

  -- Scheduling
  due_date DATE,
  due_time TIME,
  recurrence TEXT, -- 'once', 'daily', 'weekly', 'custom'
  recurrence_pattern JSONB,

  -- Priority & Status
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'skipped', 'overdue'

  -- Completion tracking
  completed_at TIMESTAMPTZ,
  completed_by_user_id UUID REFERENCES users(id),
  completion_notes TEXT,
  photo_evidence TEXT[],

  -- AI-generated metadata
  ai_generated BOOLEAN DEFAULT FALSE,
  ai_confidence FLOAT,
  ai_reasoning TEXT,

  -- Checklist items
  checklist_items JSONB, -- Array of {id, text, completed, completed_at}

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_task_type CHECK (task_type IN ('medication', 'activity', 'hygiene', 'meal', 'behavior_support', 'documentation', 'other')),
  CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  CONSTRAINT valid_task_status CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped', 'overdue'))
);

-- Activity tracking for participants
CREATE TABLE IF NOT EXISTS participant_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'meal', 'hygiene', 'social', 'exercise', 'medication', 'sleep', 'behavior'
  activity_name TEXT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  completed_by_user_id UUID REFERENCES users(id),
  duration_minutes INTEGER,
  notes TEXT,
  mood TEXT, -- 'happy', 'neutral', 'sad', 'anxious', 'angry', 'calm'
  photos TEXT[],
  location TEXT,
  metadata JSONB,

  CONSTRAINT valid_activity_type CHECK (activity_type IN ('meal', 'hygiene', 'social', 'exercise', 'medication', 'sleep', 'behavior'))
);

-- ============================================================================
-- 3. TODAY'S BRIEFING - Intelligent Daily Summary
-- ============================================================================

CREATE TABLE IF NOT EXISTS daily_briefings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  shift_id UUID REFERENCES shifts(id),
  briefing_date DATE NOT NULL,

  -- AI-generated summary sections
  critical_alerts JSONB, -- Array of critical items
  participant_updates JSONB, -- Array of participant-specific updates
  medication_changes JSONB,
  appointments_today JSONB,
  visitors_today JSONB,
  weather_info JSONB,
  activity_suggestions JSONB,
  watch_out_alerts JSONB,

  -- Mood trends from last 24 hours
  mood_trends JSONB,

  -- Meta
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  ai_confidence FLOAT,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, briefing_date)
);

-- ============================================================================
-- 4. QUICK ACTIONS - Emergency & Fast Documentation
-- ============================================================================

CREATE TABLE IF NOT EXISTS quick_actions_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'emergency_call', 'sos_manager', 'photo_capture', 'voice_note', 'welfare_check'

  participant_id UUID REFERENCES participants(id),
  location TEXT,

  -- Emergency data
  emergency_type TEXT,
  emergency_services_called BOOLEAN DEFAULT FALSE,
  emergency_response_time INTEGER, -- seconds

  -- Media
  photo_url TEXT,
  voice_note_url TEXT,
  transcription TEXT,

  -- Context
  notes TEXT,
  metadata JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_action_type CHECK (action_type IN ('emergency_call', 'sos_manager', 'photo_capture', 'voice_note', 'welfare_check'))
);

-- Welfare checks
CREATE TABLE IF NOT EXISTS welfare_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  performed_by_user_id UUID REFERENCES users(id),
  check_time TIMESTAMPTZ DEFAULT NOW(),

  -- Check results
  participant_present BOOLEAN,
  participant_safe BOOLEAN,
  mood TEXT,
  concerns TEXT,
  follow_up_required BOOLEAN DEFAULT FALSE,
  follow_up_notes TEXT,

  -- Media evidence
  photo_url TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 5. TRAINING & CERTIFICATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS staff_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES staff(id),

  certification_type TEXT NOT NULL, -- 'cpr', 'first_aid', 'medication', 'behavior_support', 'manual_handling', 'food_safety', 'safeguarding', 'other'
  certification_name TEXT NOT NULL,

  -- Dates
  issued_date DATE,
  expiry_date DATE,
  renewal_reminder_date DATE,

  -- Issuer
  issuing_organization TEXT,
  certificate_number TEXT,

  -- Status
  status TEXT DEFAULT 'active', -- 'active', 'expiring_soon', 'expired', 'renewed'

  -- Documents
  certificate_url TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_cert_type CHECK (certification_type IN ('cpr', 'first_aid', 'medication', 'behavior_support', 'manual_handling', 'food_safety', 'safeguarding', 'other')),
  CONSTRAINT valid_cert_status CHECK (status IN ('active', 'expiring_soon', 'expired', 'renewed'))
);

CREATE TABLE IF NOT EXISTS training_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT, -- 'compliance', 'skills', 'policy', 'safety', 'wellbeing'
  duration_minutes INTEGER,
  content_type TEXT, -- 'video', 'article', 'quiz', 'interactive'
  content_url TEXT,
  is_mandatory BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS training_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  module_id UUID REFERENCES training_modules(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  score INTEGER, -- For quizzes
  passed BOOLEAN,
  time_spent_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, module_id)
);

CREATE TABLE IF NOT EXISTS policy_acknowledgments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  policy_name TEXT NOT NULL,
  policy_version TEXT,
  acknowledged_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  signature_data TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 6. MY PERFORMANCE - Gamified Staff Development
-- ============================================================================

CREATE TABLE IF NOT EXISTS staff_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Metrics
  total_shifts INTEGER DEFAULT 0,
  shifts_completed INTEGER DEFAULT 0,
  shifts_completion_rate FLOAT,

  average_incident_response_time INTEGER, -- seconds
  medication_accuracy_rate FLOAT,
  documentation_timeliness_rate FLOAT,

  tasks_completed INTEGER DEFAULT 0,
  tasks_on_time INTEGER DEFAULT 0,
  tasks_completion_rate FLOAT,

  participant_satisfaction_score FLOAT,
  peer_recognition_count INTEGER DEFAULT 0,

  -- Engagement
  training_modules_completed INTEGER DEFAULT 0,
  certifications_up_to_date INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, period_start, period_end)
);

CREATE TABLE IF NOT EXISTS badges_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  category TEXT, -- 'quality', 'safety', 'teamwork', 'learning', 'consistency'
  criteria JSONB, -- What needs to be achieved
  points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges_achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB,

  UNIQUE(user_id, badge_id)
);

CREATE TABLE IF NOT EXISTS peer_recognition (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recognition_type TEXT, -- 'great_teamwork', 'exceptional_care', 'problem_solver', 'positive_attitude', 'mentor', 'other'
  message TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  points_awarded INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 7. WELLNESS CHECK - Staff Wellbeing
-- ============================================================================

CREATE TABLE IF NOT EXISTS staff_wellness_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  checkin_date DATE NOT NULL,

  -- Mood tracking
  mood TEXT, -- 'great', 'good', 'okay', 'stressed', 'exhausted', 'overwhelmed'
  energy_level INTEGER, -- 1-10
  stress_level INTEGER, -- 1-10

  -- Work-related
  workload_feeling TEXT, -- 'manageable', 'busy', 'overwhelming'
  support_needed BOOLEAN DEFAULT FALSE,
  support_type TEXT[], -- Array: ['emotional', 'practical', 'training', 'time_off']

  -- Additional context
  notes TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, checkin_date)
);

CREATE TABLE IF NOT EXISTS fatigue_monitoring (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  monitoring_date DATE NOT NULL,

  -- Hours tracking
  hours_worked_today FLOAT,
  hours_worked_this_week FLOAT,
  consecutive_days_worked INTEGER,
  break_time_minutes INTEGER,

  -- Alerts
  fatigue_risk_level TEXT, -- 'low', 'medium', 'high', 'critical'
  alert_triggered BOOLEAN DEFAULT FALSE,
  alert_acknowledged BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, monitoring_date)
);

CREATE TABLE IF NOT EXISTS post_incident_support (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  incident_id UUID REFERENCES incidents(id),

  support_offered_at TIMESTAMPTZ DEFAULT NOW(),
  support_accepted BOOLEAN,
  support_type TEXT[], -- 'debrief', 'counseling', 'time_off', 'peer_support'

  debrief_completed BOOLEAN DEFAULT FALSE,
  debrief_date TIMESTAMPTZ,
  debrief_notes TEXT,

  follow_up_required BOOLEAN DEFAULT FALSE,
  follow_up_date DATE,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wellness_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT, -- 'mental_health', 'stress_management', 'work_life_balance', 'physical_health', 'financial', 'other'
  description TEXT,
  resource_type TEXT, -- 'article', 'video', 'hotline', 'app', 'service'
  url TEXT,
  phone_number TEXT,
  is_emergency BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 8. NOTIFICATIONS CENTER
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  notification_type TEXT NOT NULL, -- 'medication_due', 'appointment', 'incident_alert', 'shift_reminder', 'task_due', 'team_message', 'help_request', 'system'
  priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'critical'

  title TEXT NOT NULL,
  message TEXT,

  -- Related entities
  related_participant_id UUID REFERENCES participants(id),
  related_shift_id UUID REFERENCES shifts(id),
  related_task_id UUID REFERENCES smart_tasks(id),
  related_incident_id UUID REFERENCES incidents(id),

  -- Actions
  action_url TEXT,
  action_label TEXT,

  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  is_dismissed BOOLEAN DEFAULT FALSE,
  dismissed_at TIMESTAMPTZ,

  -- Delivery
  delivered_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_notification_type CHECK (notification_type IN ('medication_due', 'appointment', 'incident_alert', 'shift_reminder', 'task_due', 'team_message', 'help_request', 'system')),
  CONSTRAINT valid_notification_priority CHECK (priority IN ('low', 'normal', 'high', 'critical'))
);

-- User notification preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Preferences per notification type
  medication_due_enabled BOOLEAN DEFAULT TRUE,
  appointment_enabled BOOLEAN DEFAULT TRUE,
  incident_alert_enabled BOOLEAN DEFAULT TRUE,
  shift_reminder_enabled BOOLEAN DEFAULT TRUE,
  task_due_enabled BOOLEAN DEFAULT TRUE,
  team_message_enabled BOOLEAN DEFAULT TRUE,
  help_request_enabled BOOLEAN DEFAULT TRUE,
  system_enabled BOOLEAN DEFAULT TRUE,

  -- Delivery preferences
  push_enabled BOOLEAN DEFAULT TRUE,
  email_enabled BOOLEAN DEFAULT FALSE,
  sms_enabled BOOLEAN DEFAULT FALSE,

  -- Quiet hours
  quiet_hours_enabled BOOLEAN DEFAULT FALSE,
  quiet_hours_start TIME,
  quiet_hours_end TIME,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- ============================================================================
-- INDEXES for Performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_team_member_status_user_id ON team_member_status(user_id);
CREATE INDEX IF NOT EXISTS idx_team_member_status_staff_id ON team_member_status(staff_id);
CREATE INDEX IF NOT EXISTS idx_team_member_status_status ON team_member_status(status);

CREATE INDEX IF NOT EXISTS idx_team_messages_from_user ON team_messages(from_user_id);
CREATE INDEX IF NOT EXISTS idx_team_messages_to_user ON team_messages(to_user_id);
CREATE INDEX IF NOT EXISTS idx_team_messages_created_at ON team_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_team_messages_is_read ON team_messages(is_read);

CREATE INDEX IF NOT EXISTS idx_help_requests_status ON help_requests(status);
CREATE INDEX IF NOT EXISTS idx_help_requests_created_at ON help_requests(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_smart_tasks_assigned_to ON smart_tasks(assigned_to_user_id);
CREATE INDEX IF NOT EXISTS idx_smart_tasks_participant ON smart_tasks(participant_id);
CREATE INDEX IF NOT EXISTS idx_smart_tasks_status ON smart_tasks(status);
CREATE INDEX IF NOT EXISTS idx_smart_tasks_due_date ON smart_tasks(due_date);

CREATE INDEX IF NOT EXISTS idx_participant_activities_participant ON participant_activities(participant_id);
CREATE INDEX IF NOT EXISTS idx_participant_activities_completed_at ON participant_activities(completed_at DESC);

CREATE INDEX IF NOT EXISTS idx_daily_briefings_user_date ON daily_briefings(user_id, briefing_date);

CREATE INDEX IF NOT EXISTS idx_staff_certifications_user ON staff_certifications(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_certifications_expiry ON staff_certifications(expiry_date);

CREATE INDEX IF NOT EXISTS idx_training_completions_user ON training_completions(user_id);

CREATE INDEX IF NOT EXISTS idx_staff_performance_user ON staff_performance_metrics(user_id);

CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);

CREATE INDEX IF NOT EXISTS idx_wellness_checkins_user_date ON staff_wellness_checkins(user_id, checkin_date);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================================================
-- UPDATE TRIGGERS
-- ============================================================================

CREATE TRIGGER update_team_member_status_updated_at
  BEFORE UPDATE ON team_member_status
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_smart_tasks_updated_at
  BEFORE UPDATE ON smart_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_certifications_updated_at
  BEFORE UPDATE ON staff_certifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_performance_updated_at
  BEFORE UPDATE ON staff_performance_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- DONE! All innovative features schema ready
-- ============================================================================
