package ai

import (
	"context"
	"testing"
)

func TestCommAgent_Create_Success(t *testing.T) {
	svc := NewCommAgentService(NewMockCommAgentRepo(), NewMockCommAgentSessionRepo())
	a, err := svc.Create(context.Background(), CreateCommAgentInput{
		TenantID:          1,
		DigitalEmployeeID: 10,
		Name:              "Sales Bot",
		Mode:              AgentModeInbound,
		SystemPrompt:      "You are a sales assistant",
		MaxTurns:          20,
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if a.Name != "Sales Bot" || a.MaxTurns != 20 || !a.IsActive {
		t.Fatalf("unexpected agent: %+v", a)
	}
}

func TestCommAgent_Create_EmptyName(t *testing.T) {
	svc := NewCommAgentService(NewMockCommAgentRepo(), NewMockCommAgentSessionRepo())
	_, err := svc.Create(context.Background(), CreateCommAgentInput{
		TenantID:     1,
		SystemPrompt: "prompt",
		MaxTurns:     10,
	})
	if err != ErrCommAgentNameEmpty {
		t.Fatalf("expected ErrCommAgentNameEmpty, got %v", err)
	}
}

func TestCommAgent_Create_InvalidMaxTurns(t *testing.T) {
	svc := NewCommAgentService(NewMockCommAgentRepo(), NewMockCommAgentSessionRepo())
	_, err := svc.Create(context.Background(), CreateCommAgentInput{
		TenantID:     1,
		Name:         "Bot",
		SystemPrompt: "prompt",
		MaxTurns:     0,
	})
	if err != ErrCommAgentMaxTurns {
		t.Fatalf("expected ErrCommAgentMaxTurns, got %v", err)
	}
}

func TestCommAgent_Session_Lifecycle(t *testing.T) {
	svc := NewCommAgentService(NewMockCommAgentRepo(), NewMockCommAgentSessionRepo())
	a, _ := svc.Create(context.Background(), CreateCommAgentInput{
		TenantID:     1,
		Name:         "Bot",
		SystemPrompt: "prompt",
		MaxTurns:     3,
	})

	sess, err := svc.StartSession(context.Background(), 1, a.ID, 100)
	if err != nil {
		t.Fatalf("start session: %v", err)
	}
	if sess.Status != AgentSessionActive {
		t.Fatalf("expected active, got %s", sess.Status)
	}

	// Add turns
	if err := svc.AddTurn(context.Background(), sess, "hello", "hi there", 3); err != nil {
		t.Fatalf("add turn 1: %v", err)
	}
	if sess.TurnCount != 1 {
		t.Fatalf("expected 1 turn, got %d", sess.TurnCount)
	}

	if err := svc.AddTurn(context.Background(), sess, "question", "answer", 3); err != nil {
		t.Fatalf("add turn 2: %v", err)
	}
	if err := svc.AddTurn(context.Background(), sess, "more", "response", 3); err != nil {
		t.Fatalf("add turn 3: %v", err)
	}

	// Exceed max turns
	err = svc.AddTurn(context.Background(), sess, "too many", "overflow", 3)
	if err != ErrSessionMaxTurns {
		t.Fatalf("expected ErrSessionMaxTurns, got %v", err)
	}

	// End session
	err = svc.EndSession(context.Background(), sess, AgentSessionCompleted, "conversation complete", nil)
	if err != nil {
		t.Fatalf("end session: %v", err)
	}
	if sess.Status != AgentSessionCompleted {
		t.Fatalf("expected completed, got %s", sess.Status)
	}

	// Cannot add turn after ending
	err = svc.AddTurn(context.Background(), sess, "late", "msg", 3)
	if err != ErrSessionAlreadyEnded {
		t.Fatalf("expected ErrSessionAlreadyEnded, got %v", err)
	}
}

func TestCommAgent_Session_Transfer(t *testing.T) {
	svc := NewCommAgentService(NewMockCommAgentRepo(), NewMockCommAgentSessionRepo())
	a, _ := svc.Create(context.Background(), CreateCommAgentInput{
		TenantID:     1,
		Name:         "Bot",
		SystemPrompt: "prompt",
		MaxTurns:     10,
	})

	sess, _ := svc.StartSession(context.Background(), 1, a.ID, 200)
	transferTo := int64(42)
	err := svc.EndSession(context.Background(), sess, AgentSessionTransfer, "transferring to human", &transferTo)
	if err != nil {
		t.Fatalf("transfer: %v", err)
	}
	if sess.Status != AgentSessionTransfer {
		t.Fatalf("expected transferred, got %s", sess.Status)
	}
	if sess.TransferredTo == nil || *sess.TransferredTo != 42 {
		t.Fatalf("expected transfer to 42")
	}
}

func TestVoiceProfile_Lifecycle(t *testing.T) {
	svc := NewVoiceProfileService(NewMockVoiceProfileRepo())

	v, err := svc.Create(context.Background(), CreateVoiceProfileInput{
		TenantID:       1,
		Name:           "Custom Voice",
		SampleAudioURL: "https://example.com/sample.wav",
	})
	if err != nil {
		t.Fatalf("create: %v", err)
	}
	if v.Status != VoiceProfilePending || v.Language != "zh-CN" {
		t.Fatalf("unexpected profile: %+v", v)
	}

	// Start training
	v, err = svc.StartTraining(context.Background(), 1, v.ID)
	if err != nil {
		t.Fatalf("start training: %v", err)
	}
	if v.Status != VoiceProfileTraining {
		t.Fatalf("expected training, got %s", v.Status)
	}

	// Mark ready
	v, err = svc.MarkReady(context.Background(), 1, v.ID, "provider-voice-123")
	if err != nil {
		t.Fatalf("mark ready: %v", err)
	}
	if v.Status != VoiceProfileReady || v.ProviderVoiceID != "provider-voice-123" {
		t.Fatalf("unexpected profile: %+v", v)
	}
}

func TestVoiceProfile_Create_Validation(t *testing.T) {
	svc := NewVoiceProfileService(NewMockVoiceProfileRepo())

	_, err := svc.Create(context.Background(), CreateVoiceProfileInput{TenantID: 1, SampleAudioURL: "url"})
	if err != ErrVoiceProfileNameEmpty {
		t.Fatalf("expected ErrVoiceProfileNameEmpty, got %v", err)
	}

	_, err = svc.Create(context.Background(), CreateVoiceProfileInput{TenantID: 1, Name: "test"})
	if err != ErrVoiceSampleURLEmpty {
		t.Fatalf("expected ErrVoiceSampleURLEmpty, got %v", err)
	}
}

func TestConversationAnalysis_Lifecycle(t *testing.T) {
	svc := NewConversationAnalysisService(NewMockAnalysisTaskRepo())

	task, err := svc.Create(context.Background(), CreateAnalysisTaskInput{
		TenantID:   1,
		Name:       "Q4 Intent Mining",
		Type:       AnalysisTypeIntent,
		DateFrom:   "2025-10-01",
		DateTo:     "2025-12-31",
		TotalCalls: 5000,
	})
	if err != nil {
		t.Fatalf("create: %v", err)
	}
	if task.Status != AnalysisTaskPending {
		t.Fatalf("expected pending, got %s", task.Status)
	}

	// Mark running
	if err := svc.MarkRunning(context.Background(), task); err != nil {
		t.Fatalf("mark running: %v", err)
	}
	if task.Status != AnalysisTaskRunning {
		t.Fatalf("expected running, got %s", task.Status)
	}

	// Complete
	if err := svc.Complete(context.Background(), task, `[{"intent":"billing","count":1200}]`); err != nil {
		t.Fatalf("complete: %v", err)
	}
	if task.Status != AnalysisTaskCompleted || task.CompletedAt == nil {
		t.Fatalf("expected completed with timestamp")
	}
}

func TestConversationAnalysis_Validation(t *testing.T) {
	svc := NewConversationAnalysisService(NewMockAnalysisTaskRepo())

	_, err := svc.Create(context.Background(), CreateAnalysisTaskInput{TenantID: 1, DateFrom: "a", DateTo: "b"})
	if err != ErrAnalysisNameEmpty {
		t.Fatalf("expected ErrAnalysisNameEmpty, got %v", err)
	}

	_, err = svc.Create(context.Background(), CreateAnalysisTaskInput{TenantID: 1, Name: "test"})
	if err != ErrAnalysisDateRange {
		t.Fatalf("expected ErrAnalysisDateRange, got %v", err)
	}
}

func TestTraining_Course_ExamPass(t *testing.T) {
	svc := NewTrainingService(NewMockTrainingCourseRepo(), NewMockTrainingExamRepo(), NewMockSimulatedCallRepo())

	course, err := svc.CreateCourse(context.Background(), CreateCourseInput{
		TenantID:  1,
		Title:     "Product Knowledge",
		PassScore: 80,
	})
	if err != nil {
		t.Fatalf("create course: %v", err)
	}
	if course.Status != CourseStatusDraft {
		t.Fatalf("expected draft, got %s", course.Status)
	}

	// Publish
	course, err = svc.PublishCourse(context.Background(), 1, course.ID)
	if err != nil {
		t.Fatalf("publish: %v", err)
	}
	if course.Status != CourseStatusPublished {
		t.Fatalf("expected published, got %s", course.Status)
	}

	// Submit passing exam (85/100 = 85% >= 80%)
	exam, err := svc.SubmitExam(context.Background(), SubmitExamInput{
		TenantID: 1,
		CourseID: course.ID,
		AgentID:  10,
		Score:    85,
		MaxScore: 100,
	})
	if err != nil {
		t.Fatalf("submit exam: %v", err)
	}
	if exam.Status != ExamStatusPassed {
		t.Fatalf("expected passed, got %s", exam.Status)
	}
}

func TestTraining_Course_ExamFail(t *testing.T) {
	svc := NewTrainingService(NewMockTrainingCourseRepo(), NewMockTrainingExamRepo(), NewMockSimulatedCallRepo())

	course, _ := svc.CreateCourse(context.Background(), CreateCourseInput{
		TenantID:  1,
		Title:     "Hard Course",
		PassScore: 90,
	})

	// Submit failing exam (70/100 = 70% < 90%)
	exam, err := svc.SubmitExam(context.Background(), SubmitExamInput{
		TenantID: 1,
		CourseID: course.ID,
		AgentID:  10,
		Score:    70,
		MaxScore: 100,
	})
	if err != nil {
		t.Fatalf("submit exam: %v", err)
	}
	if exam.Status != ExamStatusFailed {
		t.Fatalf("expected failed, got %s", exam.Status)
	}
}

func TestTraining_SimulatedCall(t *testing.T) {
	svc := NewTrainingService(NewMockTrainingCourseRepo(), NewMockTrainingExamRepo(), NewMockSimulatedCallRepo())

	sc, err := svc.CreateSimulatedCall(context.Background(), CreateSimulatedCallInput{
		TenantID:    1,
		AgentID:     10,
		ScenarioID:  5,
		Transcript:  "Customer: I want to cancel\nAgent: Let me help you",
		AIFeedback:  "Good empathy, missed retention offer",
		Score:       75,
		DurationSec: 180,
	})
	if err != nil {
		t.Fatalf("create sim call: %v", err)
	}
	if sc.Score != 75 || sc.DurationSec != 180 {
		t.Fatalf("unexpected sim call: %+v", sc)
	}
}

func TestTraining_Course_Validation(t *testing.T) {
	svc := NewTrainingService(NewMockTrainingCourseRepo(), NewMockTrainingExamRepo(), NewMockSimulatedCallRepo())

	_, err := svc.CreateCourse(context.Background(), CreateCourseInput{TenantID: 1, PassScore: 80})
	if err != ErrCourseNameEmpty {
		t.Fatalf("expected ErrCourseNameEmpty, got %v", err)
	}

	_, err = svc.CreateCourse(context.Background(), CreateCourseInput{TenantID: 1, Title: "Test", PassScore: 0})
	if err != ErrCoursePassScore {
		t.Fatalf("expected ErrCoursePassScore, got %v", err)
	}
}

func TestRingAnalysis_LogAndQuery(t *testing.T) {
	svc := NewRingAnalysisService(NewMockRingAnalysisConfigRepo(), NewMockRingAnalysisLogRepo())

	// Upsert config
	cfg := &RingAnalysisConfig{
		TenantID:           1,
		Enabled:            true,
		DetectionTimeoutMs: 5000,
		HangUpOnVoicemail:  true,
	}
	if err := svc.UpsertConfig(context.Background(), cfg); err != nil {
		t.Fatalf("upsert config: %v", err)
	}

	// Log results
	l, err := svc.LogResult(context.Background(), 1, 100, RingDetectionHuman, 0.95, 1200)
	if err != nil {
		t.Fatalf("log result: %v", err)
	}
	if l.Result != RingDetectionHuman || l.Confidence != 0.95 {
		t.Fatalf("unexpected log: %+v", l)
	}

	// Query
	logs, err := svc.GetCallLogs(context.Background(), 1, 100)
	if err != nil {
		t.Fatalf("get logs: %v", err)
	}
	if len(logs) != 1 {
		t.Fatalf("expected 1 log, got %d", len(logs))
	}
}

func TestFullDuplex_Config(t *testing.T) {
	svc := NewFullDuplexService(NewMockFullDuplexConfigRepo())

	cfg := &FullDuplexConfig{
		TenantID:                1,
		Enabled:                 true,
		InterruptionEnabled:     true,
		SilenceThresholdMs:      500,
		InterruptionSensitivity: 0.7,
		VoiceContinuity:         true,
	}
	if err := svc.UpsertConfig(context.Background(), cfg); err != nil {
		t.Fatalf("upsert: %v", err)
	}

	got, err := svc.GetConfig(context.Background(), 1)
	if err != nil {
		t.Fatalf("get: %v", err)
	}
	if !got.InterruptionEnabled || got.InterruptionSensitivity != 0.7 {
		t.Fatalf("unexpected config: %+v", got)
	}
}

func TestFullDuplex_InvalidSensitivity(t *testing.T) {
	svc := NewFullDuplexService(NewMockFullDuplexConfigRepo())

	err := svc.UpsertConfig(context.Background(), &FullDuplexConfig{
		TenantID:                1,
		InterruptionSensitivity: 1.5,
	})
	if err != ErrFullDuplexSensitivity {
		t.Fatalf("expected ErrFullDuplexSensitivity, got %v", err)
	}
}
