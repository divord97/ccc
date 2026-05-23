package llm

import "context"

// CommAgentProvider handles multi-turn autonomous conversations.
type CommAgentProvider interface {
	// GenerateReply produces a reply given system prompt, conversation history, and user message.
	GenerateReply(ctx context.Context, systemPrompt, conversationHistory, userMessage string) (string, error)
	// ShouldTransfer decides if the conversation should be transferred to a human agent.
	ShouldTransfer(ctx context.Context, systemPrompt, conversationHistory string) (bool, string, error)
}

// VoiceCloningProvider handles voice profile training and synthesis.
type VoiceCloningProvider interface {
	// StartCloneTraining initiates voice cloning from a sample audio.
	StartCloneTraining(ctx context.Context, sampleAudioURL string) (providerJobID string, err error)
	// CheckTrainingStatus checks if training is complete.
	CheckTrainingStatus(ctx context.Context, providerJobID string) (ready bool, providerVoiceID string, err error)
	// SynthesizeWithClone generates speech using a cloned voice.
	SynthesizeWithClone(ctx context.Context, text, providerVoiceID string) (audioData []byte, err error)
}

// ConversationAnalyticsProvider runs batch analysis over transcripts.
type ConversationAnalyticsProvider interface {
	// MineIntents discovers common customer intents from transcripts.
	MineIntents(ctx context.Context, transcripts []string) (resultJSON string, err error)
	// DiscoverSOPs extracts standard operating procedures from agent transcripts.
	DiscoverSOPs(ctx context.Context, transcripts []string) (resultJSON string, err error)
	// ExtractSalesScripts identifies effective sales scripts.
	ExtractSalesScripts(ctx context.Context, transcripts []string) (resultJSON string, err error)
	// ClusterTopics groups transcripts by topic.
	ClusterTopics(ctx context.Context, transcripts []string) (resultJSON string, err error)
}

// RingAnalysisProvider detects call answering patterns.
type RingAnalysisProvider interface {
	// AnalyzeRingAudio classifies early call audio (human, voicemail, busy, fax).
	AnalyzeRingAudio(ctx context.Context, audioData []byte) (result string, confidence float64, err error)
}

// FullDuplexProvider handles real-time full-duplex interaction.
type FullDuplexProvider interface {
	// DetectInterruption checks if the user is trying to interrupt.
	DetectInterruption(ctx context.Context, audioChunk []byte, sensitivity float64) (interrupted bool, err error)
	// ContinueVoice generates seamless continuation after interruption.
	ContinueVoice(ctx context.Context, previousText, interruptionPoint string) (continuationText string, err error)
}

// TrainingProvider generates AI feedback for simulated calls.
type TrainingProvider interface {
	// EvaluateSimulatedCall provides AI feedback and scoring for a practice call.
	EvaluateSimulatedCall(ctx context.Context, scenario, transcript string) (feedback string, score int, err error)
	// GenerateExamQuestions creates exam questions from course content.
	GenerateExamQuestions(ctx context.Context, courseContent string, count int) (questionsJSON string, err error)
}
