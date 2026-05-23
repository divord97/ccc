package ai

import "context"

// CommAgentRepository persists communication agents.
type CommAgentRepository interface {
	Create(ctx context.Context, a *CommAgent) error
	GetByID(ctx context.Context, tenantID, id int64) (*CommAgent, error)
	List(ctx context.Context, tenantID int64) ([]CommAgent, error)
	Update(ctx context.Context, a *CommAgent) error
	Delete(ctx context.Context, tenantID, id int64) error
}

// CommAgentSessionRepository persists agent conversation sessions.
type CommAgentSessionRepository interface {
	Create(ctx context.Context, s *CommAgentSession) error
	GetByID(ctx context.Context, tenantID, id int64) (*CommAgentSession, error)
	ListByAgent(ctx context.Context, tenantID, agentID int64) ([]CommAgentSession, error)
	Update(ctx context.Context, s *CommAgentSession) error
}

// VoiceProfileRepository persists voice clone profiles.
type VoiceProfileRepository interface {
	Create(ctx context.Context, v *VoiceProfile) error
	GetByID(ctx context.Context, tenantID, id int64) (*VoiceProfile, error)
	List(ctx context.Context, tenantID int64) ([]VoiceProfile, error)
	Update(ctx context.Context, v *VoiceProfile) error
	Delete(ctx context.Context, tenantID, id int64) error
}

// ConversationAnalysisTaskRepository persists analysis tasks.
type ConversationAnalysisTaskRepository interface {
	Create(ctx context.Context, t *ConversationAnalysisTask) error
	GetByID(ctx context.Context, tenantID, id int64) (*ConversationAnalysisTask, error)
	List(ctx context.Context, tenantID int64) ([]ConversationAnalysisTask, error)
	Update(ctx context.Context, t *ConversationAnalysisTask) error
}

// TrainingCourseRepository persists training courses.
type TrainingCourseRepository interface {
	Create(ctx context.Context, c *TrainingCourse) error
	GetByID(ctx context.Context, tenantID, id int64) (*TrainingCourse, error)
	List(ctx context.Context, tenantID int64) ([]TrainingCourse, error)
	Update(ctx context.Context, c *TrainingCourse) error
	Delete(ctx context.Context, tenantID, id int64) error
}

// TrainingExamRepository persists exam attempts.
type TrainingExamRepository interface {
	Create(ctx context.Context, e *TrainingExam) error
	GetByID(ctx context.Context, tenantID, id int64) (*TrainingExam, error)
	ListByAgent(ctx context.Context, tenantID, agentID int64) ([]TrainingExam, error)
	ListByCourse(ctx context.Context, tenantID, courseID int64) ([]TrainingExam, error)
}

// SimulatedCallRepository persists simulated call practices.
type SimulatedCallRepository interface {
	Create(ctx context.Context, s *SimulatedCall) error
	GetByID(ctx context.Context, tenantID, id int64) (*SimulatedCall, error)
	ListByAgent(ctx context.Context, tenantID, agentID int64) ([]SimulatedCall, error)
}

// RingAnalysisConfigRepository persists ring analysis configs.
type RingAnalysisConfigRepository interface {
	Get(ctx context.Context, tenantID int64) (*RingAnalysisConfig, error)
	Upsert(ctx context.Context, c *RingAnalysisConfig) error
}

// RingAnalysisLogRepository persists ring analysis results.
type RingAnalysisLogRepository interface {
	Create(ctx context.Context, l *RingAnalysisLog) error
	ListByCall(ctx context.Context, tenantID, callID int64) ([]RingAnalysisLog, error)
}

// FullDuplexConfigRepository persists full-duplex configs.
type FullDuplexConfigRepository interface {
	Get(ctx context.Context, tenantID int64) (*FullDuplexConfig, error)
	Upsert(ctx context.Context, c *FullDuplexConfig) error
}
