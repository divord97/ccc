package mysql

import (
	"context"
	"database/sql"

	"github.com/divord97/ccc/internal/domain/ai"
	"github.com/jmoiron/sqlx"
)

// ─── CommAgent ───

type CommAgentRepo struct{ db *sqlx.DB }

func NewCommAgentRepo(db *sqlx.DB) *CommAgentRepo { return &CommAgentRepo{db: db} }

func (r *CommAgentRepo) Create(ctx context.Context, a *ai.CommAgent) error {
	_, err := r.db.ExecContext(ctx,
		`INSERT INTO comm_agents (id,tenant_id,digital_employee_id,name,mode,system_prompt,max_turns,transfer_skill_group_id,llm_model_id,is_active,created_at,updated_at)
		 VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
		a.ID, a.TenantID, a.DigitalEmployeeID, a.Name, a.Mode, a.SystemPrompt, a.MaxTurns,
		a.TransferSkillGroupID, a.LLMModelID, a.IsActive, a.CreatedAt, a.UpdatedAt)
	return err
}

func (r *CommAgentRepo) GetByID(ctx context.Context, tenantID, id int64) (*ai.CommAgent, error) {
	var a ai.CommAgent
	err := r.db.GetContext(ctx, &a, "SELECT * FROM comm_agents WHERE tenant_id=? AND id=?", tenantID, id)
	if err != nil {
		return nil, err
	}
	return &a, nil
}

func (r *CommAgentRepo) List(ctx context.Context, tenantID int64) ([]ai.CommAgent, error) {
	var items []ai.CommAgent
	err := r.db.SelectContext(ctx, &items, "SELECT * FROM comm_agents WHERE tenant_id=? ORDER BY created_at DESC", tenantID)
	return items, err
}

func (r *CommAgentRepo) Update(ctx context.Context, a *ai.CommAgent) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE comm_agents SET name=?,mode=?,system_prompt=?,max_turns=?,transfer_skill_group_id=?,llm_model_id=?,is_active=?,updated_at=?
		 WHERE tenant_id=? AND id=?`,
		a.Name, a.Mode, a.SystemPrompt, a.MaxTurns, a.TransferSkillGroupID, a.LLMModelID, a.IsActive, a.UpdatedAt,
		a.TenantID, a.ID)
	return err
}

func (r *CommAgentRepo) Delete(ctx context.Context, tenantID, id int64) error {
	_, err := r.db.ExecContext(ctx, "DELETE FROM comm_agents WHERE tenant_id=? AND id=?", tenantID, id)
	return err
}

// ─── CommAgentSession ───

type CommAgentSessionRepo struct{ db *sqlx.DB }

func NewCommAgentSessionRepo(db *sqlx.DB) *CommAgentSessionRepo {
	return &CommAgentSessionRepo{db: db}
}

func (r *CommAgentSessionRepo) Create(ctx context.Context, s *ai.CommAgentSession) error {
	_, err := r.db.ExecContext(ctx,
		`INSERT INTO comm_agent_sessions (id,tenant_id,comm_agent_id,call_id,status,turn_count,transcript,summary,transferred_to,started_at,ended_at)
		 VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
		s.ID, s.TenantID, s.CommAgentID, s.CallID, s.Status, s.TurnCount, s.Transcript, s.Summary, s.TransferredTo, s.StartedAt, s.EndedAt)
	return err
}

func (r *CommAgentSessionRepo) GetByID(ctx context.Context, tenantID, id int64) (*ai.CommAgentSession, error) {
	var s ai.CommAgentSession
	err := r.db.GetContext(ctx, &s, "SELECT * FROM comm_agent_sessions WHERE tenant_id=? AND id=?", tenantID, id)
	if err != nil {
		return nil, err
	}
	return &s, nil
}

func (r *CommAgentSessionRepo) ListByAgent(ctx context.Context, tenantID, agentID int64) ([]ai.CommAgentSession, error) {
	var items []ai.CommAgentSession
	err := r.db.SelectContext(ctx, &items,
		"SELECT * FROM comm_agent_sessions WHERE tenant_id=? AND comm_agent_id=? ORDER BY started_at DESC", tenantID, agentID)
	return items, err
}

func (r *CommAgentSessionRepo) Update(ctx context.Context, s *ai.CommAgentSession) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE comm_agent_sessions SET status=?,turn_count=?,transcript=?,summary=?,transferred_to=?,ended_at=?
		 WHERE tenant_id=? AND id=?`,
		s.Status, s.TurnCount, s.Transcript, s.Summary, s.TransferredTo, s.EndedAt, s.TenantID, s.ID)
	return err
}

// ─── VoiceProfile ───

type VoiceProfileRepo struct{ db *sqlx.DB }

func NewVoiceProfileRepo(db *sqlx.DB) *VoiceProfileRepo { return &VoiceProfileRepo{db: db} }

func (r *VoiceProfileRepo) Create(ctx context.Context, v *ai.VoiceProfile) error {
	_, err := r.db.ExecContext(ctx,
		`INSERT INTO voice_profiles (id,tenant_id,name,sample_audio_url,provider_voice_id,status,language,created_at,updated_at)
		 VALUES (?,?,?,?,?,?,?,?,?)`,
		v.ID, v.TenantID, v.Name, v.SampleAudioURL, v.ProviderVoiceID, v.Status, v.Language, v.CreatedAt, v.UpdatedAt)
	return err
}

func (r *VoiceProfileRepo) GetByID(ctx context.Context, tenantID, id int64) (*ai.VoiceProfile, error) {
	var v ai.VoiceProfile
	err := r.db.GetContext(ctx, &v, "SELECT * FROM voice_profiles WHERE tenant_id=? AND id=?", tenantID, id)
	if err != nil {
		return nil, err
	}
	return &v, nil
}

func (r *VoiceProfileRepo) List(ctx context.Context, tenantID int64) ([]ai.VoiceProfile, error) {
	var items []ai.VoiceProfile
	err := r.db.SelectContext(ctx, &items, "SELECT * FROM voice_profiles WHERE tenant_id=? ORDER BY created_at DESC", tenantID)
	return items, err
}

func (r *VoiceProfileRepo) Update(ctx context.Context, v *ai.VoiceProfile) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE voice_profiles SET name=?,sample_audio_url=?,provider_voice_id=?,status=?,language=?,updated_at=?
		 WHERE tenant_id=? AND id=?`,
		v.Name, v.SampleAudioURL, v.ProviderVoiceID, v.Status, v.Language, v.UpdatedAt, v.TenantID, v.ID)
	return err
}

func (r *VoiceProfileRepo) Delete(ctx context.Context, tenantID, id int64) error {
	_, err := r.db.ExecContext(ctx, "DELETE FROM voice_profiles WHERE tenant_id=? AND id=?", tenantID, id)
	return err
}

// ─── ConversationAnalysisTask ───

type ConversationAnalysisTaskRepo struct{ db *sqlx.DB }

func NewConversationAnalysisTaskRepo(db *sqlx.DB) *ConversationAnalysisTaskRepo {
	return &ConversationAnalysisTaskRepo{db: db}
}

func (r *ConversationAnalysisTaskRepo) Create(ctx context.Context, t *ai.ConversationAnalysisTask) error {
	_, err := r.db.ExecContext(ctx,
		`INSERT INTO conversation_analysis_tasks (id,tenant_id,name,type,date_from,date_to,total_calls,processed_calls,status,result_json,created_at,completed_at)
		 VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
		t.ID, t.TenantID, t.Name, t.Type, t.DateFrom, t.DateTo, t.TotalCalls, t.ProcessedCalls, t.Status, t.ResultJSON, t.CreatedAt, t.CompletedAt)
	return err
}

func (r *ConversationAnalysisTaskRepo) GetByID(ctx context.Context, tenantID, id int64) (*ai.ConversationAnalysisTask, error) {
	var t ai.ConversationAnalysisTask
	err := r.db.GetContext(ctx, &t, "SELECT * FROM conversation_analysis_tasks WHERE tenant_id=? AND id=?", tenantID, id)
	if err != nil {
		return nil, err
	}
	return &t, nil
}

func (r *ConversationAnalysisTaskRepo) List(ctx context.Context, tenantID int64) ([]ai.ConversationAnalysisTask, error) {
	var items []ai.ConversationAnalysisTask
	err := r.db.SelectContext(ctx, &items,
		"SELECT * FROM conversation_analysis_tasks WHERE tenant_id=? ORDER BY created_at DESC", tenantID)
	return items, err
}

func (r *ConversationAnalysisTaskRepo) Update(ctx context.Context, t *ai.ConversationAnalysisTask) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE conversation_analysis_tasks SET status=?,processed_calls=?,result_json=?,completed_at=?
		 WHERE tenant_id=? AND id=?`,
		t.Status, t.ProcessedCalls, t.ResultJSON, t.CompletedAt, t.TenantID, t.ID)
	return err
}

// ─── TrainingCourse ───

type TrainingCourseRepo struct{ db *sqlx.DB }

func NewTrainingCourseRepo(db *sqlx.DB) *TrainingCourseRepo { return &TrainingCourseRepo{db: db} }

func (r *TrainingCourseRepo) Create(ctx context.Context, c *ai.TrainingCourse) error {
	_, err := r.db.ExecContext(ctx,
		`INSERT INTO training_courses (id,tenant_id,title,description,content_json,pass_score,status,created_at,updated_at)
		 VALUES (?,?,?,?,?,?,?,?,?)`,
		c.ID, c.TenantID, c.Title, c.Description, c.ContentJSON, c.PassScore, c.Status, c.CreatedAt, c.UpdatedAt)
	return err
}

func (r *TrainingCourseRepo) GetByID(ctx context.Context, tenantID, id int64) (*ai.TrainingCourse, error) {
	var c ai.TrainingCourse
	err := r.db.GetContext(ctx, &c, "SELECT * FROM training_courses WHERE tenant_id=? AND id=?", tenantID, id)
	if err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *TrainingCourseRepo) List(ctx context.Context, tenantID int64) ([]ai.TrainingCourse, error) {
	var items []ai.TrainingCourse
	err := r.db.SelectContext(ctx, &items, "SELECT * FROM training_courses WHERE tenant_id=? ORDER BY created_at DESC", tenantID)
	return items, err
}

func (r *TrainingCourseRepo) Update(ctx context.Context, c *ai.TrainingCourse) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE training_courses SET title=?,description=?,content_json=?,pass_score=?,status=?,updated_at=?
		 WHERE tenant_id=? AND id=?`,
		c.Title, c.Description, c.ContentJSON, c.PassScore, c.Status, c.UpdatedAt, c.TenantID, c.ID)
	return err
}

func (r *TrainingCourseRepo) Delete(ctx context.Context, tenantID, id int64) error {
	_, err := r.db.ExecContext(ctx, "DELETE FROM training_courses WHERE tenant_id=? AND id=?", tenantID, id)
	return err
}

// ─── TrainingExam ───

type TrainingExamRepo struct{ db *sqlx.DB }

func NewTrainingExamRepo(db *sqlx.DB) *TrainingExamRepo { return &TrainingExamRepo{db: db} }

func (r *TrainingExamRepo) Create(ctx context.Context, e *ai.TrainingExam) error {
	_, err := r.db.ExecContext(ctx,
		`INSERT INTO training_exams (id,tenant_id,course_id,agent_id,score,max_score,status,answers_json,created_at)
		 VALUES (?,?,?,?,?,?,?,?,?)`,
		e.ID, e.TenantID, e.CourseID, e.AgentID, e.Score, e.MaxScore, e.Status, e.AnswersJSON, e.CreatedAt)
	return err
}

func (r *TrainingExamRepo) GetByID(ctx context.Context, tenantID, id int64) (*ai.TrainingExam, error) {
	var e ai.TrainingExam
	err := r.db.GetContext(ctx, &e, "SELECT * FROM training_exams WHERE tenant_id=? AND id=?", tenantID, id)
	if err != nil {
		return nil, err
	}
	return &e, nil
}

func (r *TrainingExamRepo) ListByAgent(ctx context.Context, tenantID, agentID int64) ([]ai.TrainingExam, error) {
	var items []ai.TrainingExam
	err := r.db.SelectContext(ctx, &items,
		"SELECT * FROM training_exams WHERE tenant_id=? AND agent_id=? ORDER BY created_at DESC", tenantID, agentID)
	return items, err
}

func (r *TrainingExamRepo) ListByCourse(ctx context.Context, tenantID, courseID int64) ([]ai.TrainingExam, error) {
	var items []ai.TrainingExam
	err := r.db.SelectContext(ctx, &items,
		"SELECT * FROM training_exams WHERE tenant_id=? AND course_id=? ORDER BY created_at DESC", tenantID, courseID)
	return items, err
}

// ─── SimulatedCall ───

type SimulatedCallRepo struct{ db *sqlx.DB }

func NewSimulatedCallRepo(db *sqlx.DB) *SimulatedCallRepo { return &SimulatedCallRepo{db: db} }

func (r *SimulatedCallRepo) Create(ctx context.Context, s *ai.SimulatedCall) error {
	_, err := r.db.ExecContext(ctx,
		`INSERT INTO simulated_calls (id,tenant_id,agent_id,scenario_id,transcript,ai_feedback,score,duration_sec,created_at)
		 VALUES (?,?,?,?,?,?,?,?,?)`,
		s.ID, s.TenantID, s.AgentID, s.ScenarioID, s.Transcript, s.AIFeedback, s.Score, s.DurationSec, s.CreatedAt)
	return err
}

func (r *SimulatedCallRepo) GetByID(ctx context.Context, tenantID, id int64) (*ai.SimulatedCall, error) {
	var s ai.SimulatedCall
	err := r.db.GetContext(ctx, &s, "SELECT * FROM simulated_calls WHERE tenant_id=? AND id=?", tenantID, id)
	if err != nil {
		return nil, err
	}
	return &s, nil
}

func (r *SimulatedCallRepo) ListByAgent(ctx context.Context, tenantID, agentID int64) ([]ai.SimulatedCall, error) {
	var items []ai.SimulatedCall
	err := r.db.SelectContext(ctx, &items,
		"SELECT * FROM simulated_calls WHERE tenant_id=? AND agent_id=? ORDER BY created_at DESC", tenantID, agentID)
	return items, err
}

// ─── RingAnalysisConfig ───

type RingAnalysisConfigRepo struct{ db *sqlx.DB }

func NewRingAnalysisConfigRepo(db *sqlx.DB) *RingAnalysisConfigRepo {
	return &RingAnalysisConfigRepo{db: db}
}

func (r *RingAnalysisConfigRepo) Get(ctx context.Context, tenantID int64) (*ai.RingAnalysisConfig, error) {
	var c ai.RingAnalysisConfig
	err := r.db.GetContext(ctx, &c, "SELECT * FROM ring_analysis_configs WHERE tenant_id=?", tenantID)
	if err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *RingAnalysisConfigRepo) Upsert(ctx context.Context, c *ai.RingAnalysisConfig) error {
	_, err := r.db.ExecContext(ctx,
		`INSERT INTO ring_analysis_configs (id,tenant_id,enabled,detection_timeout_ms,hangup_on_voicemail,hangup_on_fax,created_at,updated_at)
		 VALUES (?,?,?,?,?,?,?,?)
		 ON DUPLICATE KEY UPDATE enabled=VALUES(enabled),detection_timeout_ms=VALUES(detection_timeout_ms),
		 hangup_on_voicemail=VALUES(hangup_on_voicemail),hangup_on_fax=VALUES(hangup_on_fax),updated_at=VALUES(updated_at)`,
		c.ID, c.TenantID, c.Enabled, c.DetectionTimeoutMs, c.HangUpOnVoicemail, c.HangUpOnFax, c.CreatedAt, c.UpdatedAt)
	return err
}

// ─── RingAnalysisLog ───

type RingAnalysisLogRepo struct{ db *sqlx.DB }

func NewRingAnalysisLogRepo(db *sqlx.DB) *RingAnalysisLogRepo {
	return &RingAnalysisLogRepo{db: db}
}

func (r *RingAnalysisLogRepo) Create(ctx context.Context, l *ai.RingAnalysisLog) error {
	_, err := r.db.ExecContext(ctx,
		`INSERT INTO ring_analysis_logs (id,tenant_id,call_id,result,confidence,duration_ms,created_at)
		 VALUES (?,?,?,?,?,?,?)`,
		l.ID, l.TenantID, l.CallID, l.Result, l.Confidence, l.DurationMs, l.CreatedAt)
	return err
}

func (r *RingAnalysisLogRepo) ListByCall(ctx context.Context, tenantID, callID int64) ([]ai.RingAnalysisLog, error) {
	var items []ai.RingAnalysisLog
	err := r.db.SelectContext(ctx, &items,
		"SELECT * FROM ring_analysis_logs WHERE tenant_id=? AND call_id=?", tenantID, callID)
	return items, err
}

// ─── FullDuplexConfig ───

type FullDuplexConfigRepo struct{ db *sqlx.DB }

func NewFullDuplexConfigRepo(db *sqlx.DB) *FullDuplexConfigRepo {
	return &FullDuplexConfigRepo{db: db}
}

func (r *FullDuplexConfigRepo) Get(ctx context.Context, tenantID int64) (*ai.FullDuplexConfig, error) {
	var c ai.FullDuplexConfig
	err := r.db.GetContext(ctx, &c, "SELECT * FROM full_duplex_configs WHERE tenant_id=?", tenantID)
	if err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *FullDuplexConfigRepo) Upsert(ctx context.Context, c *ai.FullDuplexConfig) error {
	_, err := r.db.ExecContext(ctx,
		`INSERT INTO full_duplex_configs (id,tenant_id,enabled,interruption_enabled,silence_threshold_ms,interruption_sensitivity,voice_continuity,created_at,updated_at)
		 VALUES (?,?,?,?,?,?,?,?,?)
		 ON DUPLICATE KEY UPDATE enabled=VALUES(enabled),interruption_enabled=VALUES(interruption_enabled),
		 silence_threshold_ms=VALUES(silence_threshold_ms),interruption_sensitivity=VALUES(interruption_sensitivity),
		 voice_continuity=VALUES(voice_continuity),updated_at=VALUES(updated_at)`,
		c.ID, c.TenantID, c.Enabled, c.InterruptionEnabled, c.SilenceThresholdMs,
		c.InterruptionSensitivity, c.VoiceContinuity, c.CreatedAt, c.UpdatedAt)
	return err
}

// Compile-time interface checks.
var (
	_ ai.CommAgentRepository              = (*CommAgentRepo)(nil)
	_ ai.CommAgentSessionRepository       = (*CommAgentSessionRepo)(nil)
	_ ai.VoiceProfileRepository           = (*VoiceProfileRepo)(nil)
	_ ai.ConversationAnalysisTaskRepository = (*ConversationAnalysisTaskRepo)(nil)
	_ ai.TrainingCourseRepository         = (*TrainingCourseRepo)(nil)
	_ ai.TrainingExamRepository           = (*TrainingExamRepo)(nil)
	_ ai.SimulatedCallRepository          = (*SimulatedCallRepo)(nil)
	_ ai.RingAnalysisConfigRepository     = (*RingAnalysisConfigRepo)(nil)
	_ ai.RingAnalysisLogRepository        = (*RingAnalysisLogRepo)(nil)
	_ ai.FullDuplexConfigRepository       = (*FullDuplexConfigRepo)(nil)
)

// sql import guard
var _ = sql.ErrNoRows
