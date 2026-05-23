package llm

import "context"

// StubCommAgentProvider is a placeholder for autonomous conversation.
type StubCommAgentProvider struct{}

func NewStubCommAgentProvider() *StubCommAgentProvider { return &StubCommAgentProvider{} }

func (p *StubCommAgentProvider) GenerateReply(_ context.Context, _, _, userMessage string) (string, error) {
	return "[ai-reply] " + userMessage, nil
}

func (p *StubCommAgentProvider) ShouldTransfer(_ context.Context, _, _ string) (bool, string, error) {
	return false, "", nil
}

// StubVoiceCloningProvider is a placeholder for voice cloning.
type StubVoiceCloningProvider struct{}

func NewStubVoiceCloningProvider() *StubVoiceCloningProvider { return &StubVoiceCloningProvider{} }

func (p *StubVoiceCloningProvider) StartCloneTraining(_ context.Context, _ string) (string, error) {
	return "stub-job-001", nil
}

func (p *StubVoiceCloningProvider) CheckTrainingStatus(_ context.Context, jobID string) (bool, string, error) {
	return true, "stub-voice-" + jobID, nil
}

func (p *StubVoiceCloningProvider) SynthesizeWithClone(_ context.Context, text, _ string) ([]byte, error) {
	return []byte("[audio:" + text + "]"), nil
}

// StubConversationAnalyticsProvider is a placeholder for batch analysis.
type StubConversationAnalyticsProvider struct{}

func NewStubConversationAnalyticsProvider() *StubConversationAnalyticsProvider {
	return &StubConversationAnalyticsProvider{}
}

func (p *StubConversationAnalyticsProvider) MineIntents(_ context.Context, _ []string) (string, error) {
	return `[{"intent":"billing","count":100}]`, nil
}

func (p *StubConversationAnalyticsProvider) DiscoverSOPs(_ context.Context, _ []string) (string, error) {
	return `[{"sop":"greeting","steps":["greet","identify","resolve"]}]`, nil
}

func (p *StubConversationAnalyticsProvider) ExtractSalesScripts(_ context.Context, _ []string) (string, error) {
	return `[{"script":"objection_handling","effectiveness":0.85}]`, nil
}

func (p *StubConversationAnalyticsProvider) ClusterTopics(_ context.Context, _ []string) (string, error) {
	return `[{"topic":"billing","count":50},{"topic":"technical","count":30}]`, nil
}

// StubRingAnalysisProvider is a placeholder for ring detection.
type StubRingAnalysisProvider struct{}

func NewStubRingAnalysisProvider() *StubRingAnalysisProvider { return &StubRingAnalysisProvider{} }

func (p *StubRingAnalysisProvider) AnalyzeRingAudio(_ context.Context, _ []byte) (string, float64, error) {
	return "human", 0.92, nil
}

// StubFullDuplexProvider is a placeholder for full-duplex interaction.
type StubFullDuplexProvider struct{}

func NewStubFullDuplexProvider() *StubFullDuplexProvider { return &StubFullDuplexProvider{} }

func (p *StubFullDuplexProvider) DetectInterruption(_ context.Context, _ []byte, _ float64) (bool, error) {
	return false, nil
}

func (p *StubFullDuplexProvider) ContinueVoice(_ context.Context, _, interruptionPoint string) (string, error) {
	return "[continued from: " + interruptionPoint + "]", nil
}

// StubTrainingProvider is a placeholder for training AI.
type StubTrainingProvider struct{}

func NewStubTrainingProvider() *StubTrainingProvider { return &StubTrainingProvider{} }

func (p *StubTrainingProvider) EvaluateSimulatedCall(_ context.Context, _, _ string) (string, int, error) {
	return "Good performance overall. Consider improving empathy.", 75, nil
}

func (p *StubTrainingProvider) GenerateExamQuestions(_ context.Context, _ string, count int) (string, error) {
	return `[{"question":"What is the refund policy?","options":["A","B","C","D"],"answer":"A"}]`, nil
}
