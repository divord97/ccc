package ai

import (
	"context"
	"errors"
	"sync"
)

var errNotFound = errors.New("not found")

// ─── CommAgent Mock ───

type MockCommAgentRepo struct {
	mu    sync.RWMutex
	items map[int64]*CommAgent
}

func NewMockCommAgentRepo() *MockCommAgentRepo {
	return &MockCommAgentRepo{items: make(map[int64]*CommAgent)}
}

func (m *MockCommAgentRepo) Create(_ context.Context, a *CommAgent) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.items[a.ID] = a
	return nil
}

func (m *MockCommAgentRepo) GetByID(_ context.Context, tenantID, id int64) (*CommAgent, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	a, ok := m.items[id]
	if !ok || a.TenantID != tenantID {
		return nil, errNotFound
	}
	return a, nil
}

func (m *MockCommAgentRepo) List(_ context.Context, tenantID int64) ([]CommAgent, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	var result []CommAgent
	for _, a := range m.items {
		if a.TenantID == tenantID {
			result = append(result, *a)
		}
	}
	return result, nil
}

func (m *MockCommAgentRepo) Update(_ context.Context, a *CommAgent) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.items[a.ID] = a
	return nil
}

func (m *MockCommAgentRepo) Delete(_ context.Context, tenantID, id int64) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	a, ok := m.items[id]
	if !ok || a.TenantID != tenantID {
		return errNotFound
	}
	delete(m.items, id)
	return nil
}

// ─── CommAgentSession Mock ───

type MockCommAgentSessionRepo struct {
	mu    sync.RWMutex
	items map[int64]*CommAgentSession
}

func NewMockCommAgentSessionRepo() *MockCommAgentSessionRepo {
	return &MockCommAgentSessionRepo{items: make(map[int64]*CommAgentSession)}
}

func (m *MockCommAgentSessionRepo) Create(_ context.Context, s *CommAgentSession) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.items[s.ID] = s
	return nil
}

func (m *MockCommAgentSessionRepo) GetByID(_ context.Context, tenantID, id int64) (*CommAgentSession, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	s, ok := m.items[id]
	if !ok || s.TenantID != tenantID {
		return nil, errNotFound
	}
	return s, nil
}

func (m *MockCommAgentSessionRepo) ListByAgent(_ context.Context, tenantID, agentID int64) ([]CommAgentSession, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	var result []CommAgentSession
	for _, s := range m.items {
		if s.TenantID == tenantID && s.CommAgentID == agentID {
			result = append(result, *s)
		}
	}
	return result, nil
}

func (m *MockCommAgentSessionRepo) Update(_ context.Context, s *CommAgentSession) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.items[s.ID] = s
	return nil
}

// ─── VoiceProfile Mock ───

type MockVoiceProfileRepo struct {
	mu    sync.RWMutex
	items map[int64]*VoiceProfile
}

func NewMockVoiceProfileRepo() *MockVoiceProfileRepo {
	return &MockVoiceProfileRepo{items: make(map[int64]*VoiceProfile)}
}

func (m *MockVoiceProfileRepo) Create(_ context.Context, v *VoiceProfile) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.items[v.ID] = v
	return nil
}

func (m *MockVoiceProfileRepo) GetByID(_ context.Context, tenantID, id int64) (*VoiceProfile, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	v, ok := m.items[id]
	if !ok || v.TenantID != tenantID {
		return nil, errNotFound
	}
	return v, nil
}

func (m *MockVoiceProfileRepo) List(_ context.Context, tenantID int64) ([]VoiceProfile, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	var result []VoiceProfile
	for _, v := range m.items {
		if v.TenantID == tenantID {
			result = append(result, *v)
		}
	}
	return result, nil
}

func (m *MockVoiceProfileRepo) Update(_ context.Context, v *VoiceProfile) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.items[v.ID] = v
	return nil
}

func (m *MockVoiceProfileRepo) Delete(_ context.Context, tenantID, id int64) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	v, ok := m.items[id]
	if !ok || v.TenantID != tenantID {
		return errNotFound
	}
	delete(m.items, id)
	return nil
}

// ─── ConversationAnalysisTask Mock ───

type MockAnalysisTaskRepo struct {
	mu    sync.RWMutex
	items map[int64]*ConversationAnalysisTask
}

func NewMockAnalysisTaskRepo() *MockAnalysisTaskRepo {
	return &MockAnalysisTaskRepo{items: make(map[int64]*ConversationAnalysisTask)}
}

func (m *MockAnalysisTaskRepo) Create(_ context.Context, t *ConversationAnalysisTask) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.items[t.ID] = t
	return nil
}

func (m *MockAnalysisTaskRepo) GetByID(_ context.Context, tenantID, id int64) (*ConversationAnalysisTask, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	t, ok := m.items[id]
	if !ok || t.TenantID != tenantID {
		return nil, errNotFound
	}
	return t, nil
}

func (m *MockAnalysisTaskRepo) List(_ context.Context, tenantID int64) ([]ConversationAnalysisTask, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	var result []ConversationAnalysisTask
	for _, t := range m.items {
		if t.TenantID == tenantID {
			result = append(result, *t)
		}
	}
	return result, nil
}

func (m *MockAnalysisTaskRepo) Update(_ context.Context, t *ConversationAnalysisTask) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.items[t.ID] = t
	return nil
}

// ─── TrainingCourse Mock ───

type MockTrainingCourseRepo struct {
	mu    sync.RWMutex
	items map[int64]*TrainingCourse
}

func NewMockTrainingCourseRepo() *MockTrainingCourseRepo {
	return &MockTrainingCourseRepo{items: make(map[int64]*TrainingCourse)}
}

func (m *MockTrainingCourseRepo) Create(_ context.Context, c *TrainingCourse) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.items[c.ID] = c
	return nil
}

func (m *MockTrainingCourseRepo) GetByID(_ context.Context, tenantID, id int64) (*TrainingCourse, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	c, ok := m.items[id]
	if !ok || c.TenantID != tenantID {
		return nil, errNotFound
	}
	return c, nil
}

func (m *MockTrainingCourseRepo) List(_ context.Context, tenantID int64) ([]TrainingCourse, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	var result []TrainingCourse
	for _, c := range m.items {
		if c.TenantID == tenantID {
			result = append(result, *c)
		}
	}
	return result, nil
}

func (m *MockTrainingCourseRepo) Update(_ context.Context, c *TrainingCourse) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.items[c.ID] = c
	return nil
}

func (m *MockTrainingCourseRepo) Delete(_ context.Context, tenantID, id int64) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	c, ok := m.items[id]
	if !ok || c.TenantID != tenantID {
		return errNotFound
	}
	delete(m.items, id)
	return nil
}

// ─── TrainingExam Mock ───

type MockTrainingExamRepo struct {
	mu    sync.RWMutex
	items map[int64]*TrainingExam
}

func NewMockTrainingExamRepo() *MockTrainingExamRepo {
	return &MockTrainingExamRepo{items: make(map[int64]*TrainingExam)}
}

func (m *MockTrainingExamRepo) Create(_ context.Context, e *TrainingExam) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.items[e.ID] = e
	return nil
}

func (m *MockTrainingExamRepo) GetByID(_ context.Context, tenantID, id int64) (*TrainingExam, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	e, ok := m.items[id]
	if !ok || e.TenantID != tenantID {
		return nil, errNotFound
	}
	return e, nil
}

func (m *MockTrainingExamRepo) ListByAgent(_ context.Context, tenantID, agentID int64) ([]TrainingExam, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	var result []TrainingExam
	for _, e := range m.items {
		if e.TenantID == tenantID && e.AgentID == agentID {
			result = append(result, *e)
		}
	}
	return result, nil
}

func (m *MockTrainingExamRepo) ListByCourse(_ context.Context, tenantID, courseID int64) ([]TrainingExam, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	var result []TrainingExam
	for _, e := range m.items {
		if e.TenantID == tenantID && e.CourseID == courseID {
			result = append(result, *e)
		}
	}
	return result, nil
}

// ─── SimulatedCall Mock ───

type MockSimulatedCallRepo struct {
	mu    sync.RWMutex
	items map[int64]*SimulatedCall
}

func NewMockSimulatedCallRepo() *MockSimulatedCallRepo {
	return &MockSimulatedCallRepo{items: make(map[int64]*SimulatedCall)}
}

func (m *MockSimulatedCallRepo) Create(_ context.Context, s *SimulatedCall) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.items[s.ID] = s
	return nil
}

func (m *MockSimulatedCallRepo) GetByID(_ context.Context, tenantID, id int64) (*SimulatedCall, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	s, ok := m.items[id]
	if !ok || s.TenantID != tenantID {
		return nil, errNotFound
	}
	return s, nil
}

func (m *MockSimulatedCallRepo) ListByAgent(_ context.Context, tenantID, agentID int64) ([]SimulatedCall, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	var result []SimulatedCall
	for _, s := range m.items {
		if s.TenantID == tenantID && s.AgentID == agentID {
			result = append(result, *s)
		}
	}
	return result, nil
}

// ─── RingAnalysis Mocks ───

type MockRingAnalysisConfigRepo struct {
	mu    sync.RWMutex
	items map[int64]*RingAnalysisConfig
}

func NewMockRingAnalysisConfigRepo() *MockRingAnalysisConfigRepo {
	return &MockRingAnalysisConfigRepo{items: make(map[int64]*RingAnalysisConfig)}
}

func (m *MockRingAnalysisConfigRepo) Get(_ context.Context, tenantID int64) (*RingAnalysisConfig, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	c, ok := m.items[tenantID]
	if !ok {
		return nil, errNotFound
	}
	return c, nil
}

func (m *MockRingAnalysisConfigRepo) Upsert(_ context.Context, c *RingAnalysisConfig) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.items[c.TenantID] = c
	return nil
}

type MockRingAnalysisLogRepo struct {
	mu    sync.RWMutex
	items []RingAnalysisLog
}

func NewMockRingAnalysisLogRepo() *MockRingAnalysisLogRepo {
	return &MockRingAnalysisLogRepo{}
}

func (m *MockRingAnalysisLogRepo) Create(_ context.Context, l *RingAnalysisLog) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.items = append(m.items, *l)
	return nil
}

func (m *MockRingAnalysisLogRepo) ListByCall(_ context.Context, tenantID, callID int64) ([]RingAnalysisLog, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	var result []RingAnalysisLog
	for _, l := range m.items {
		if l.TenantID == tenantID && l.CallID == callID {
			result = append(result, l)
		}
	}
	return result, nil
}

// ─── FullDuplex Mock ───

type MockFullDuplexConfigRepo struct {
	mu    sync.RWMutex
	items map[int64]*FullDuplexConfig
}

func NewMockFullDuplexConfigRepo() *MockFullDuplexConfigRepo {
	return &MockFullDuplexConfigRepo{items: make(map[int64]*FullDuplexConfig)}
}

func (m *MockFullDuplexConfigRepo) Get(_ context.Context, tenantID int64) (*FullDuplexConfig, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	c, ok := m.items[tenantID]
	if !ok {
		return nil, errNotFound
	}
	return c, nil
}

func (m *MockFullDuplexConfigRepo) Upsert(_ context.Context, c *FullDuplexConfig) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.items[c.TenantID] = c
	return nil
}
